from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import sqlite3

# Configure Centralized Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("rationlink_backend.log", encoding="utf-8")
    ]
)
logger = logging.getLogger("rationlink.main")

from database import init_db
from routes import beneficiaries, transactions, fraud, blockchain, face, predictions, ration, grain, auth, sync, services

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing RationLink local SQLite database...")
    init_db()
    logger.info("Database initialized successfully.")
    yield

app = FastAPI(
    title="RationLink API",
    description="Smart PDS — AI + Blockchain + Face Auth",
    version="2.0.0",
    lifespan=lifespan
)

# Exception Handlers
@app.exception_handler(sqlite3.Error)
async def sqlite_exception_handler(request: Request, exc: sqlite3.Error):
    logger.error(f"Database error at {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal database error. Transaction logs security audit pending."}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Input validation failure at {request.method} {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "message": "Input validation failed. Please check formatting rules."}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Pass HTTPExceptions through so specific status codes are preserved
    if isinstance(exc, HTTPException):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
        
    logger.error(f"Unhandled system error at {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please contact the administrator."}
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,          prefix="/api", tags=["Authentication"])
app.include_router(sync.router,          prefix="/api", tags=["Cloud Sync"])
app.include_router(beneficiaries.router, prefix="/api", tags=["Beneficiaries"])
app.include_router(transactions.router,  prefix="/api", tags=["Transactions"])
app.include_router(fraud.router,         prefix="/api", tags=["Fraud"])
app.include_router(blockchain.router,    prefix="/api", tags=["Blockchain"])
app.include_router(face.router,          prefix="/api", tags=["Face Auth"])
app.include_router(predictions.router,   prefix="/api", tags=["ML Predictions"])
app.include_router(ration.router,        prefix="/api", tags=["Ration Collection"])
app.include_router(grain.router,        prefix="/api", tags=["Grain Quality"])
app.include_router(services.router,     prefix="/api", tags=["Citizen Services"])

@app.get("/")
def root():
    return {"status": "RationLink API v2 running ✅"}

@app.get("/health")
def health():
    return {"status": "ok"}


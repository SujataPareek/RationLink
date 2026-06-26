# RationLink Backend — FastAPI

## Setup

```bash
cd rationlink-backend

# 1. Create virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy your existing DB (optional — will auto-create if missing)
#    Place PDS_Offline.db in this folder

# 4. Start server
uvicorn main:app --reload --port 8000
```

Server runs at: http://localhost:8000
API Docs (auto): http://localhost:8000/docs

## API Endpoints

| Method | URL                          | Description                    |
|--------|------------------------------|--------------------------------|
| POST   | /api/send-otp                | Send OTP to mobile             |
| POST   | /api/verify-otp              | Verify OTP                     |
| POST   | /api/register                | Register new beneficiary       |
| GET    | /api/beneficiary/{mobile}    | Get profile by mobile          |
| GET    | /api/beneficiaries           | List all (admin)               |
| POST   | /api/transaction             | Add ration transaction         |
| GET    | /api/transactions            | All transactions               |
| GET    | /api/transactions/{user_id}  | User's transactions            |
| GET    | /api/regional-stats          | Region-wise stock & alerts     |
| GET    | /api/fraud/scan              | Run AI fraud detection         |
| GET    | /api/blockchain/verify       | Verify chain integrity         |

## Project Structure

```
rationlink-backend/
├── main.py           ← FastAPI app entry
├── database.py       ← DB connection + init
├── schemas.py        ← Pydantic models
├── requirements.txt
├── core/
│   ├── blockchain.py ← SHA-256 hash chain
│   ├── fraud_ai.py   ← Isolation Forest AI
│   └── otp.py        ← OTP generate/verify
└── routes/
    ├── beneficiaries.py
    ├── transactions.py
    ├── fraud.py
    └── blockchain.py
```

## Demo OTP
Use `123456` as OTP bypass in development.

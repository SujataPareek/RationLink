from fastapi import APIRouter
from core.face_auth import enroll_face, verify_face, face_login

router = APIRouter()

@router.post("/face/enroll")
def enroll(payload: dict):
    """Called during registration after OTP verified."""
    return enroll_face(payload["mobile"], payload["descriptor"])

@router.post("/face/verify")
def verify(payload: dict):
    """Called during login — mobile provided."""
    return verify_face(payload["mobile"], payload["descriptor"])

@router.post("/face/login")
def scan_login(payload: dict):
    """Called at FPS terminal — scans all enrolled faces."""
    return face_login(payload["descriptor"])

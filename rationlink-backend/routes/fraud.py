from fastapi import APIRouter
from core.fraud_detection import full_fraud_scan
from core.fraud_ai import run_fraud_detection

router = APIRouter()

@router.get("/fraud/scan")
def fraud_scan():
    return full_fraud_scan()

@router.get("/fraud/quick")
def quick_scan():
    return run_fraud_detection()

from fastapi import APIRouter, HTTPException
from database import get_conn
from schemas import RegisterRequest, BeneficiaryOut
from core.otp import generate_otp, verify_otp
import sqlite3

router = APIRouter()

# ── Send OTP ────────────────────────────────────────────────────
@router.post("/send-otp")
def send_otp(payload: dict):
    mobile = payload.get("mobile", "").strip()
    if len(mobile) != 10 or not mobile.isdigit():
        raise HTTPException(400, "Invalid mobile number")
    otp = generate_otp(mobile)
    return {"message": f"OTP sent to +91-{mobile}", "demo_otp": otp}

# ── Verify OTP ──────────────────────────────────────────────────
@router.post("/verify-otp")
def check_otp(payload: dict):
    mobile = payload.get("mobile", "")
    otp    = payload.get("otp", "")
    if verify_otp(mobile, otp):
        return {"verified": True}
    raise HTTPException(400, "Invalid or expired OTP")

# ── Register ────────────────────────────────────────────────────
@router.post("/register")
def register(req: RegisterRequest):
    conn = get_conn()
    cur  = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO beneficiaries
            (user_id, full_name, dob, gender, aadhaar, address, state,
             district, pincode, mobile, scheme, ration_card,
             allotted_ration, used_ration, remaining_ration)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,35,0,35)
        """, (
            req.mobile, req.full_name, req.dob, req.gender,
            req.aadhaar, req.address, req.state, req.district,
            req.pincode, req.mobile, req.scheme, req.ration_card
        ))
        conn.commit()
    except sqlite3.IntegrityError as e:
        conn.close()
        if "aadhaar" in str(e):
            raise HTTPException(409, "Aadhaar already registered")
        if "mobile" in str(e):
            raise HTTPException(409, "Mobile number already registered")
        raise HTTPException(409, "User already exists")
    finally:
        conn.close()

    return {
        "message":        "Registration successful",
        "beneficiary_id": f"BNF-{req.mobile[-4:]}-{req.aadhaar[-4:]}"
    }

# ── Get profile by mobile ────────────────────────────────────────
@router.get("/beneficiary/{mobile}")
def get_beneficiary(mobile: str):
    conn = get_conn()
    cur  = conn.cursor()
    cur.execute("SELECT * FROM beneficiaries WHERE mobile = ?", (mobile,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(404, "Beneficiary not found")
    return dict(row)

# ── List all (admin) ─────────────────────────────────────────────
@router.get("/beneficiaries")
def list_beneficiaries(limit: int = 50, offset: int = 0):
    conn = get_conn()
    cur  = conn.cursor()
    cur.execute(
        "SELECT user_id, full_name, mobile, scheme, district, state, "
        "allotted_ration, used_ration, remaining_ration, created_at "
        "FROM beneficiaries ORDER BY created_at DESC LIMIT ? OFFSET ?",
        (limit, offset)
    )
    rows = [dict(r) for r in cur.fetchall()]
    cur.execute("SELECT COUNT(*) FROM beneficiaries")
    total = cur.fetchone()[0]
    conn.close()
    return {"total": total, "beneficiaries": rows}

# ── Update ration usage ──────────────────────────────────────────
@router.patch("/beneficiary/{mobile}/ration")
def update_ration(mobile: str, payload: dict):
    kg = float(payload.get("kg", 0))
    conn = get_conn()
    cur  = conn.cursor()
    cur.execute(
        "SELECT used_ration, remaining_ration FROM beneficiaries WHERE mobile = ?",
        (mobile,)
    )
    row = cur.fetchone()
    if not row:
        conn.close()
        raise HTTPException(404, "Beneficiary not found")
    new_used      = round(row["used_ration"] + kg, 2)
    new_remaining = round(row["remaining_ration"] - kg, 2)
    if new_remaining < 0:
        conn.close()
        raise HTTPException(400, "Insufficient ration balance")
    cur.execute(
        "UPDATE beneficiaries SET used_ration=?, remaining_ration=?, synced=0 WHERE mobile=?",
        (new_used, new_remaining, mobile)
    )
    conn.commit()
    conn.close()
    return {"message": "Ration updated", "used": new_used, "remaining": new_remaining}

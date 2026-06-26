from fastapi import APIRouter, HTTPException
from database import get_conn
from schemas import LoginRequest
from core.otp import verify_otp
from core.face_auth import verify_face, face_login
import bcrypt
import json

router = APIRouter()

@router.post("/auth/login")
def login(req: LoginRequest):
    conn = get_conn()
    cur  = conn.cursor()
    try:
        # ── ADMIN AUTHENTICATION ──
        if req.role == "admin":
            if not req.email or not req.password:
                raise HTTPException(400, "Email and password are required for admin login")
            
            cur.execute("SELECT * FROM admins WHERE email = ?", (req.email.strip(),))
            admin = cur.fetchone()
            if not admin:
                raise HTTPException(401, "Invalid administrator credentials")
            
            pw_hash = admin["password_hash"]
            if not bcrypt.checkpw(req.password.encode('utf-8'), pw_hash.encode('utf-8')):
                raise HTTPException(401, "Invalid administrator credentials")
            
            return {
                "user_id": admin["admin_id"],
                "full_name": admin["full_name"],
                "email": admin["email"],
                "role": "admin"
            }

        # ── DEALER AUTHENTICATION ──
        elif req.role == "dealer":
            if not req.email or not req.password:
                raise HTTPException(400, "Email and password are required for dealer login")
            
            cur.execute("SELECT * FROM dealers WHERE email = ?", (req.email.strip(),))
            dealer = cur.fetchone()
            if not dealer:
                raise HTTPException(401, "Invalid dealer credentials")
            
            pw_hash = dealer["password_hash"]
            if not bcrypt.checkpw(req.password.encode('utf-8'), pw_hash.encode('utf-8')):
                raise HTTPException(401, "Invalid dealer credentials")
            
            return {
                "user_id": dealer["dealer_id"],
                "full_name": dealer["full_name"],
                "email": dealer["email"],
                "area": dealer["area"] or "Delhi",
                "role": "dealer"
            }

        # ── BENEFICIARY AUTHENTICATION ──
        elif req.role == "beneficiary":
            if not req.mobile and not req.face_descriptor:
                raise HTTPException(400, "Mobile number or Face descriptor is required for beneficiary login")

            # 1. OTP Authentication
            if req.mobile and req.otp:
                mobile = req.mobile.strip()
                otp = req.otp.strip()
                
                # Check OTP verification
                if not verify_otp(mobile, otp):
                    raise HTTPException(401, "Invalid or expired OTP")
                
                # Fetch profile from DB
                cur.execute("SELECT * FROM beneficiaries WHERE mobile = ?", (mobile,))
                bene = cur.fetchone()
                if not bene:
                    # Sandbox demo fallback: return clean profile even if offline/unregistered
                    return {
                        "user_id": f"BNF-{mobile[-4:]}-DEMO",
                        "full_name": "Demo Beneficiary",
                        "mobile": mobile,
                        "scheme": "NFSA",
                        "allotted_ration": 35.0,
                        "used_ration": 0.0,
                        "remaining_ration": 35.0,
                        "area": "Delhi",
                        "role": "beneficiary"
                    }
                
                profile = dict(bene)
                profile.pop("face_descriptor", None)
                profile.pop("face_img", None)
                profile["role"] = "beneficiary"
                return profile

            # 2. Face Descriptor Authentication (with mobile)
            elif req.mobile and req.face_descriptor:
                mobile = req.mobile.strip()
                desc_list = req.face_descriptor
                if isinstance(desc_list, str):
                    try:
                        desc_list = json.loads(desc_list)
                    except Exception:
                        raise HTTPException(400, "Invalid face descriptor format")
                
                cur.execute("SELECT * FROM beneficiaries WHERE mobile = ?", (mobile,))
                bene = cur.fetchone()
                if not bene:
                    raise HTTPException(404, "Beneficiary profile not registered. Please register first.")
                
                if not bene["face_descriptor"]:
                    raise HTTPException(400, "No biometric face seal enrolled for this account. Please log in using Mobile OTP.")
                
                res = verify_face(mobile, desc_list)
                if not res.get("verified"):
                    raise HTTPException(401, f"Biometric verification failed: {res.get('reason')}")
                
                profile = dict(bene)
                profile.pop("face_descriptor", None)
                profile.pop("face_img", None)
                profile["role"] = "beneficiary"
                return profile

            # 3. One-Touch Face Scan (no mobile provided)
            elif req.face_descriptor:
                desc_list = req.face_descriptor
                if isinstance(desc_list, str):
                    try:
                        desc_list = json.loads(desc_list)
                    except Exception:
                        raise HTTPException(400, "Invalid face descriptor format")
                
                res = face_login(desc_list)
                if not res.get("verified"):
                    raise HTTPException(401, f"One-Touch Bio scan failed: {res.get('reason')}")
                
                cur.execute("SELECT * FROM beneficiaries WHERE mobile = ?", (res["mobile"],))
                bene = cur.fetchone()
                if not bene:
                    raise HTTPException(404, "Beneficiary not found")
                
                profile = dict(bene)
                profile.pop("face_descriptor", None)
                profile.pop("face_img", None)
                profile["role"] = "beneficiary"
                return profile

            else:
                raise HTTPException(400, "Missing credentials for beneficiary")
        
        else:
            raise HTTPException(400, f"Unsupported role: {req.role}")
            
    finally:
        conn.close()

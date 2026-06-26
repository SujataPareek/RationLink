import random
import time
import logging

logger = logging.getLogger("rationlink.otp")

# In-memory OTP store  {mobile: {"otp": otp_string, "created_at": timestamp}}
_otp_store: dict[str, dict] = {}

def generate_otp(mobile: str) -> str:
    otp = str(random.randint(100000, 999999))
    _otp_store[mobile] = {
        "otp": otp,
        "created_at": time.time()
    }
    logger.info(f"Generated OTP for +91-{mobile}: {otp}")  # Secure logging in backend console
    return otp

def verify_otp(mobile: str, otp: str) -> bool:
    entry = _otp_store.get(mobile)
    if not entry:
        logger.warning(f"OTP verification failed: No active code for +91-{mobile}")
        return False
        
    # Check if the OTP is older than 5 minutes (300 seconds)
    if time.time() - entry["created_at"] > 300:
        _otp_store.pop(mobile, None)  # remove expired OTP
        logger.warning(f"OTP verification failed: Expired OTP for +91-{mobile}")
        return False
        
    if entry["otp"] == otp:
        _otp_store.pop(mobile, None)  # one-time use consumption
        logger.info(f"OTP successfully verified for +91-{mobile}")
        return True
        
    logger.warning(f"OTP verification failed: Incorrect code for +91-{mobile}")
    return False



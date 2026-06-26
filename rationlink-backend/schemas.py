from pydantic import BaseModel, field_validator, Field
from typing import Optional, Union, List
import re

# Verhoeff Algorithm for Aadhaar Checksum Validation
VERHOEFF_MULTIPLIER = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 2, 7, 0, 6, 8, 1, 3, 5],
    [4, 0, 6, 8, 9, 1, 2, 3, 7, 5],
    [6, 3, 0, 2, 5, 7, 9, 4, 1, 8],
    [7, 6, 8, 1, 9, 3, 2, 5, 0, 4],
    [8, 7, 9, 1, 5, 3, 0, 4, 6, 2],
    [3, 0, 2, 8, 1, 4, 9, 7, 5, 6]
]

VERHOEFF_PERMUTATION = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [2, 6, 8, 1, 4, 7, 3, 5, 0, 9],
    [3, 8, 0, 9, 5, 2, 7, 4, 1, 6],
    [4, 9, 1, 5, 3, 0, 8, 2, 7, 6],
    [5, 0, 9, 7, 6, 1, 8, 3, 2, 4],
    [6, 7, 8, 3, 0, 9, 1, 5, 4, 2],
    [7, 9, 3, 0, 4, 8, 2, 5, 1, 6]
]

def validate_verhoeff(num: str) -> bool:
    try:
        digits = [int(x) for x in num][::-1]
        checksum = 0
        for i, digit in enumerate(digits):
            checksum = VERHOEFF_MULTIPLIER[checksum][VERHOEFF_PERMUTATION[i % 8][digit]]
        return checksum == 0
    except ValueError:
        return False

class RegisterRequest(BaseModel):
    full_name:   str
    dob:         Optional[str] = None
    gender:      Optional[str] = None
    aadhaar:     str
    address:     str
    state:       str
    district:    str
    pincode:     str
    mobile:      str
    scheme:      str
    ration_card: Optional[str] = None

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v):
        v = re.sub(r"\D", "", v)
        if len(v) != 10:
            raise ValueError("Mobile must be exactly 10 digits")
        if not v.startswith(("6", "7", "8", "9")):
            raise ValueError("Mobile number must start with 6, 7, 8, or 9")
        return v

    @field_validator("aadhaar")
    @classmethod
    def validate_aadhaar(cls, v):
        v = re.sub(r"\s", "", v)
        if len(v) != 12 or not v.isdigit():
            raise ValueError("Aadhaar must be exactly 12 digits")
        if not validate_verhoeff(v):
            raise ValueError("Aadhaar checksum is invalid (fails Verhoeff validation)")
        return v

    @field_validator("pincode")
    @classmethod
    def validate_pincode(cls, v):
        if len(v) != 6 or not v.isdigit():
            raise ValueError("Pincode must be exactly 6 digits")
        return v

    @field_validator("scheme")
    @classmethod
    def validate_scheme(cls, v):
        allowed = {"AAY", "PHH", "PMGKAY", "NFSA"}
        val = v.upper().strip()
        if val not in allowed:
            raise ValueError(f"Scheme must be one of: {', '.join(allowed)}")
        return val


class TransactionCreate(BaseModel):
    user_id: str
    area:    str
    weight:  float = Field(..., gt=0, description="Weight must be positive")
    item:    Optional[str] = "Rice"
    shop:    Optional[str] = "FPS Depot"


class BeneficiaryOut(BaseModel):
    user_id:          str
    full_name:        str
    mobile:           str
    scheme:           str
    address:          Optional[str]
    state:            Optional[str]
    district:         Optional[str]
    allotted_ration:  float
    used_ration:      float
    remaining_ration: float
    created_at:       Optional[str]


class LoginRequest(BaseModel):
    role: str
    email: Optional[str] = None
    password: Optional[str] = None
    mobile: Optional[str] = None
    otp: Optional[str] = None
    face_descriptor: Optional[Union[str, list]] = None

    @field_validator("mobile")
    @classmethod
    def validate_login_mobile(cls, v):
        if v is None or v.strip() == "":
            return None
        v = re.sub(r"\D", "", v)
        if len(v) != 10:
            raise ValueError("Mobile must be exactly 10 digits")
        return v



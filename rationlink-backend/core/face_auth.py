"""
Face Authentication using face descriptors (128D vectors from face-api.js).
Frontend sends the descriptor, backend stores & compares using cosine similarity.
No heavy Python dependency needed - pure math comparison.
"""
import json
import numpy as np
from database import get_conn
from fastapi import HTTPException


SIMILARITY_THRESHOLD = 0.82   # tune as needed (higher = stricter)


def cosine_similarity(a: list, b: list) -> float:
    a, b = np.array(a), np.array(b)
    denom = (np.linalg.norm(a) * np.linalg.norm(b))
    if denom == 0:
        return 0.0
    return float(np.dot(a, b) / denom)


def enroll_face(mobile: str, descriptor: list) -> dict:
    """Store face descriptor for a beneficiary."""
    if len(descriptor) != 128:
        raise HTTPException(400, "Invalid face descriptor — expected 128 values")

    conn = get_conn()
    cur  = conn.cursor()
    cur.execute("SELECT user_id FROM beneficiaries WHERE mobile = ?", (mobile,))
    if not cur.fetchone():
        conn.close()
        raise HTTPException(404, "Beneficiary not registered")

    cur.execute(
        "UPDATE beneficiaries SET face_descriptor = ? WHERE mobile = ?",
        (json.dumps(descriptor), mobile)
    )
    conn.commit()
    conn.close()
    return {"message": "Face enrolled successfully", "mobile": mobile}


def verify_face(mobile: str, descriptor: list) -> dict:
    """Verify a face descriptor against the stored one."""
    if len(descriptor) != 128:
        raise HTTPException(400, "Invalid descriptor length")

    conn = get_conn()
    cur  = conn.cursor()
    cur.execute(
        "SELECT face_descriptor FROM beneficiaries WHERE mobile = ?",
        (mobile,)
    )
    row = cur.fetchone()
    conn.close()

    if not row or not row["face_descriptor"]:
        return {"verified": False, "reason": "No face enrolled for this account", "score": 0}

    stored     = json.loads(row["face_descriptor"])
    similarity = cosine_similarity(descriptor, stored)
    verified   = similarity >= SIMILARITY_THRESHOLD

    return {
        "verified":   verified,
        "score":      round(similarity, 4),
        "threshold":  SIMILARITY_THRESHOLD,
        "reason":     "Face matched" if verified else "Face not recognised"
    }


def face_login(descriptor: list) -> dict:
    """
    Scan ALL enrolled faces to find a match — used when mobile is not provided
    (e.g., beneficiary walks up to FPS terminal and just shows face).
    Returns matched beneficiary profile or failure.
    """
    if len(descriptor) != 128:
        raise HTTPException(400, "Invalid descriptor length")

    conn = get_conn()
    cur  = conn.cursor()
    cur.execute(
        "SELECT mobile, full_name, scheme, face_descriptor, "
        "allotted_ration, used_ration, remaining_ration "
        "FROM beneficiaries WHERE face_descriptor IS NOT NULL"
    )
    rows = cur.fetchall()
    conn.close()

    best_score  = 0.0
    best_match  = None

    for row in rows:
        stored = json.loads(row["face_descriptor"])
        score  = cosine_similarity(descriptor, stored)
        if score > best_score:
            best_score = score
            best_match = row

    if best_match and best_score >= SIMILARITY_THRESHOLD:
        return {
            "verified":        True,
            "score":           round(best_score, 4),
            "mobile":          best_match["mobile"],
            "full_name":       best_match["full_name"],
            "scheme":          best_match["scheme"],
            "allotted_ration": best_match["allotted_ration"],
            "used_ration":     best_match["used_ration"],
            "remaining_ration":best_match["remaining_ration"]
        }

    return {
        "verified": False,
        "score":    round(best_score, 4),
        "reason":   "No matching face found in database"
    }

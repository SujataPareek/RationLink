from fastapi import APIRouter, HTTPException
from database import get_conn
from pydantic import BaseModel
import sqlite3

router = APIRouter()

class GrievanceCreate(BaseModel):
    user_id: str
    category: str
    message: str

@router.post("/grievances")
def create_grievance(req: GrievanceCreate):
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO grievances (user_id, category, message, status)
            VALUES (?, ?, ?, 'Submitted')
        """, (req.user_id, req.category, req.message))
        conn.commit()
    except Exception as e:
        raise HTTPException(500, f"Failed to record grievance: {str(e)}")
    finally:
        conn.close()
    return {"message": "Grievance submitted successfully"}

@router.get("/grievances/{user_id}")
def get_grievances(user_id: str):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, category, message, status, created_at
        FROM grievances
        WHERE user_id = ?
        ORDER BY created_at DESC
    """, (user_id,))
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return {"grievances": rows}

@router.get("/family/{parent_id}")
def get_family_members(parent_id: str):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, name, age, relationship, aadhaar_seeded
        FROM family_members
        WHERE parent_id = ?
    """, (parent_id,))
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return {"family_members": rows}

@router.get("/announcements")
def get_announcements():
    return {
        "announcements": [
            {
                "id": 1,
                "title": "Festival Special Allocation Active",
                "content": "Special allocation of additional 5 kg sugar and split pulses per family active for the upcoming festive cycle.",
                "date": "2026-06-24"
            },
            {
                "id": 2,
                "title": "Aadhaar Bio-Auth Mandatory Linkage",
                "content": "Beneficiaries must verify that all household member Aadhaar cards are seeded before July 15, 2026, to prevent allocation suspension.",
                "date": "2026-06-20"
            },
            {
                "id": 3,
                "title": "Depot Timings Updated (Monsoon Season)",
                "content": "FPS Depots in Dwarka and Central Delhi will operate from 08:00 AM to 04:00 PM to accommodate monsoon distribution guidelines.",
                "date": "2026-06-18"
            }
        ]
    }

@router.get("/grievances")
def get_all_grievances():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, user_id, category, message, status, created_at
        FROM grievances
        ORDER BY created_at DESC
    """)
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return {"grievances": rows}

class GrievanceUpdate(BaseModel):
    status: str

@router.post("/grievances/{grievance_id}/status")
def update_grievance_status(grievance_id: int, req: GrievanceUpdate):
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE grievances
            SET status = ?
            WHERE id = ?
        """, (req.status, grievance_id))
        conn.commit()
    except Exception as e:
        raise HTTPException(500, f"Failed to update grievance: {str(e)}")
    finally:
        conn.close()
    return {"message": "Grievance status updated successfully"}


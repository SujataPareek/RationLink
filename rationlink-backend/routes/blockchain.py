from fastapi import APIRouter
from core.blockchain import get_ledger, verify_chain
from database import get_conn

router = APIRouter()

@router.get("/blockchain/verify")
def verify():
    return verify_chain()

@router.get("/blockchain/ledger")
def ledger(limit: int = 100, user_id: str | None = None):
    return get_ledger(limit=limit, user_id=user_id)

@router.post("/blockchain/tamper")
def tamper_db():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT id, weight FROM transactions ORDER BY id DESC LIMIT 1")
    row = cur.fetchone()
    if not row:
        conn.close()
        return {"success": False, "message": "No transactions found to tamper."}
    
    original_id = row["id"]
    original_weight = row["weight"]
    new_weight = round(original_weight + 25.0, 2)
    
    cur.execute("UPDATE transactions SET weight = ? WHERE id = ?", (new_weight, original_id))
    conn.commit()
    conn.close()
    return {
        "success": True, 
        "message": f"Tampered Record #{original_id}: changed weight from {original_weight} kg to {new_weight} kg.",
        "tampered_id": original_id,
        "original_weight": original_weight,
        "new_weight": new_weight
    }

@router.post("/blockchain/restore")
def restore_db(payload: dict):
    record_id = payload.get("id")
    original_weight = payload.get("original_weight")
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("UPDATE transactions SET weight = ? WHERE id = ?", (original_weight, record_id))
    conn.commit()
    conn.close()
    return {"success": True, "message": f"Restored Record #{record_id} to original weight of {original_weight} kg."}

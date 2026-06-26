from datetime import datetime

from fastapi import APIRouter, HTTPException

from core.blockchain import generate_hash, get_last_hash
from database import get_conn
from schemas import TransactionCreate

router = APIRouter()


def _transaction_rows(cur, where="", params=(), limit=100):
    cur.execute(f"""
        SELECT id, user_id, area,
               COALESCE(item, 'Rice') AS item,
               COALESCE(shop, 'FPS Depot') AS shop,
               weight, timestamp, gap_time,
               COALESCE(status, 'Verified') AS status,
               prev_hash, current_hash, receipt_id
        FROM transactions
        {where}
        ORDER BY id DESC
        LIMIT ?
    """, (*params, limit))
    return [dict(r) for r in cur.fetchall()]


@router.post("/transaction")
def add_transaction(req: TransactionCreate):
    if req.weight <= 0:
        raise HTTPException(400, "Weight must be greater than zero")

    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        SELECT remaining_ration, area
        FROM beneficiaries
        WHERE mobile = ? OR user_id = ?
    """, (req.user_id, req.user_id))
    beneficiary = cur.fetchone()
    if not beneficiary:
        conn.close()
        raise HTTPException(404, "Beneficiary not found")
    if req.weight > beneficiary["remaining_ration"]:
        conn.close()
        raise HTTPException(400, f"Only {beneficiary['remaining_ration']} kg remaining")

    area = req.area or beneficiary["area"] or "Delhi"
    item = req.item or "Rice"
    shop = req.shop or f"FPS Depot - {area}"
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cur.execute(
        "SELECT timestamp FROM transactions WHERE user_id=? ORDER BY id DESC LIMIT 1",
        (req.user_id,)
    )
    last = cur.fetchone()
    gap = 0
    if last:
        try:
            last_dt = datetime.strptime(last["timestamp"], "%Y-%m-%d %H:%M:%S")
            gap = int((datetime.now() - last_dt).total_seconds())
        except Exception:
            gap = 0

    prev_hash = get_last_hash()
    current_hash = generate_hash(req.user_id, req.weight, prev_hash, area, item, shop, now)

    import uuid
    receipt_id = f"REC-{uuid.uuid4().hex[:8].upper()}"

    cur.execute("""
        INSERT INTO transactions
        (user_id, area, weight, item, shop, timestamp, gap_time, prev_hash, current_hash, status, receipt_id)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
    """, (req.user_id, area, req.weight, item, shop, now, gap, prev_hash, current_hash, 'Verified', receipt_id))
    txn_id = cur.lastrowid

    cur.execute("""
        UPDATE beneficiaries
        SET used_ration = used_ration + ?,
            remaining_ration = remaining_ration - ?
        WHERE (mobile = ? OR user_id = ?)
          AND remaining_ration >= ?
    """, (req.weight, req.weight, req.user_id, req.user_id, req.weight))
    if cur.rowcount == 0:
        conn.rollback()
        conn.close()
        raise HTTPException(400, "Could not update beneficiary quota")

    conn.commit()
    conn.close()

    return {
        "message": "Transaction recorded",
        "txn_id": txn_id,
        "prev_hash": prev_hash,
        "current_hash": current_hash,
        "gap_time": gap,
    }


@router.get("/transactions")
def get_transactions(limit: int = 100, area: str = ""):
    conn = get_conn()
    cur = conn.cursor()

    if area:
        rows = _transaction_rows(cur, "WHERE area = ?", (area,), limit)
    else:
        rows = _transaction_rows(cur, limit=limit)

    conn.close()
    return {"transactions": rows}


@router.get("/transactions/{user_id}")
def get_user_transactions(user_id: str, limit: int = 20):
    conn = get_conn()
    cur = conn.cursor()
    rows = _transaction_rows(cur, "WHERE user_id = ?", (user_id,), limit)
    conn.close()
    return {"transactions": rows}


@router.get("/regional-stats")
def regional_stats():
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        SELECT area,
               COUNT(*) AS txn_count,
               COALESCE(SUM(weight), 0) AS total_weight,
               COALESCE(AVG(weight), 0) AS avg_weight
        FROM transactions
        GROUP BY area
    """)
    rows = [dict(r) for r in cur.fetchall()]

    cur.execute("SELECT * FROM regional_stats")
    stock = {r["area"]: dict(r) for r in cur.fetchall()}
    conn.close()

    return [
        {
            **r,
            "stock_kg": stock.get(r["area"], {}).get("stock_kg", 5000),
            "fraud_alerts": stock.get(r["area"], {}).get("fraud_alerts", 0),
        }
        for r in rows
    ]


@router.post("/transactions/seed-demo")
def seed_demo():
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) FROM transactions WHERE user_id='9999999999'")
    if cur.fetchone()[0] > 0:
        conn.close()
        return {"message": "Demo data already exists"}

    prev_hash = get_last_hash()
    months = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05"]

    for i, month in enumerate(months):
        for item in ["Rice", "Wheat"]:
            weight = round(4.5 + (i * 0.15), 2)
            ts = f"{month}-{10 + i:02d} 10:{i * 5 + 10:02d}:00"
            area = "Delhi"
            shop = "FPS Depot - Delhi"
            curr = generate_hash("9999999999", weight, prev_hash, area, item, shop, ts)
            cur.execute("""
                INSERT INTO transactions
                (user_id, area, weight, item, shop, timestamp, gap_time, prev_hash, current_hash, status)
                VALUES (?,?,?,?,?,?,?,?,?,'Verified')
            """, ("9999999999", area, weight, item, shop, ts, 300, prev_hash, curr))
            prev_hash = curr

    conn.commit()
    conn.close()
    return {"message": "Demo transactions seeded successfully"}

from fastapi import APIRouter, HTTPException
from database import get_conn
from core.blockchain import get_last_hash, generate_hash
from datetime import datetime

router = APIRouter()

@router.post("/ration/collect")
def collect_ration(payload: dict):
    mobile     = payload.get("mobile", "").strip()
    items      = payload.get("items", [])
    otp_bypass = payload.get("otp_verified", False)

    if not mobile:
        raise HTTPException(400, "Mobile required")
    if not items:
        raise HTTPException(400, "No items selected")

    conn = get_conn()
    cur  = conn.cursor()

    # Get beneficiary
    cur.execute(
        "SELECT full_name, scheme, allotted_ration, used_ration, remaining_ration, area "
        "FROM beneficiaries WHERE mobile=? OR user_id=?",
        (mobile, mobile)
    )
    row = cur.fetchone()
    if not row:
        conn.close()
        raise HTTPException(404, "Beneficiary not found")

    try:
        total_kg = sum(float(i.get("kg", 0)) for i in items)
    except (TypeError, ValueError):
        conn.close()
        raise HTTPException(400, "Invalid item quantity")
    if total_kg <= 0:
        conn.close()
        raise HTTPException(400, "Invalid quantity")
    if total_kg > row["remaining_ration"]:
        conn.close()
        raise HTTPException(400, f"Only {row['remaining_ration']} kg remaining")

    import uuid
    receipt_id = f"REC-{uuid.uuid4().hex[:8].upper()}"
    area = payload.get("area") or row["area"] or "Delhi"
    shop = payload.get("shop") or f"FPS Depot - {area}"
    now  = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    recorded = []
    prev_hash = get_last_hash()

    cur.execute(
        "SELECT timestamp FROM transactions WHERE user_id=? ORDER BY id DESC LIMIT 1",
        (mobile,)
    )
    last = cur.fetchone()
    gap = 0
    if last:
        try:
            last_dt = datetime.strptime(last["timestamp"], "%Y-%m-%d %H:%M:%S")
            gap = int((datetime.now() - last_dt).total_seconds())
        except Exception:
            gap = 0

    for item in items:
        try:
            kg = float(item.get("kg", 0))
        except (TypeError, ValueError):
            conn.close()
            raise HTTPException(400, "Invalid item quantity")
        name = item.get("name", "Rice")
        if kg <= 0:
            continue

        current_hash = generate_hash(mobile, kg, prev_hash, area, name, shop, now)

        cur.execute("""
            INSERT INTO transactions
            (user_id, area, weight, item, shop, timestamp, 
             gap_time, prev_hash, current_hash, status, receipt_id)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)
        """, (
            mobile, area, kg, name, shop,
            now, gap, prev_hash, current_hash, 'Collected', receipt_id
        ))

        recorded.append({
            "txn_id": cur.lastrowid,
            "item": name,
            "kg":   kg,
            "hash": current_hash,
            "prev_hash": prev_hash,
        })
        prev_hash = current_hash
        gap = 0

    # Update balance
    cur.execute("""
        UPDATE beneficiaries 
        SET used_ration      = used_ration + ?,
            remaining_ration = remaining_ration - ?
        WHERE mobile=? OR user_id=?
    """, (total_kg, total_kg, mobile, mobile))

    if cur.rowcount == 0:
        conn.rollback()
        conn.close()
        raise HTTPException(400, "Could not update beneficiary quota")

    conn.commit()
    conn.close()

    return {
        "success":     True,
        "beneficiary": row["full_name"],
        "receipt_id":  receipt_id,
        "items":       recorded,
        "total_kg":    total_kg,
        "timestamp":   now,
        "allotted_ration": row["allotted_ration"],
        "used_ration": round(row["used_ration"] + total_kg, 2),
        "remaining_ration": round(row["remaining_ration"] - total_kg, 2),
    }

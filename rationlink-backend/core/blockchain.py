import hashlib
from database import get_conn

def get_last_hash() -> str:
    conn = get_conn()
    cur  = conn.cursor()
    cur.execute("SELECT current_hash FROM transactions ORDER BY id DESC LIMIT 1")
    row = cur.fetchone()
    conn.close()
    return row["current_hash"] if row else "0"   # "0" = genesis block

def generate_hash(
    user_id: str,
    weight: float,
    prev_hash: str,
    area: str = "",
    item: str = "",
    shop: str = "",
    timestamp: str = "",
) -> str:
    data = "|".join([
        str(user_id or ""),
        str(area or ""),
        f"{float(weight or 0):.3f}",
        str(item or ""),
        str(shop or ""),
        str(timestamp or ""),
        str(prev_hash or "0"),
    ])
    return hashlib.sha256(data.encode()).hexdigest()

def generate_legacy_hash(user_id: str, weight: float, prev_hash: str) -> str:
    data = f"{user_id}{weight}{prev_hash}"
    return hashlib.sha256(data.encode()).hexdigest()

def verify_chain() -> dict:
    conn = get_conn()
    cur  = conn.cursor()
    cur.execute(
        "SELECT id, user_id, area, weight, item, shop, timestamp, prev_hash, current_hash "
        "FROM transactions ORDER BY id ASC"
    )
    rows = cur.fetchall()
    conn.close()

    if not rows:
        return {"status": "empty", "message": "No transactions to verify.", "broken_at": None}

    expected_prev = "0"
    for row in rows:
        # Check chain link
        if row["prev_hash"] != expected_prev:
            return {
                "status":     "broken",
                "message":    f"Chain broken at record #{row['id']} (User: {row['user_id']}). Link to previous transaction missing!",
                "broken_at":  row["id"]
            }
        # Re-compute hash
        recalc = generate_hash(
            row["user_id"],
            row["weight"],
            row["prev_hash"],
            row["area"],
            row["item"],
            row["shop"],
            row["timestamp"],
        )
        legacy_recalc = generate_legacy_hash(row["user_id"], row["weight"], row["prev_hash"])
        if recalc != row["current_hash"] and legacy_recalc != row["current_hash"]:
            return {
                "status":    "tampered",
                "message":   f"Tampering detected at record #{row['id']} (User: {row['user_id']}). Data does not match digital seal.",
                "broken_at": row["id"]
            }
        expected_prev = row["current_hash"]

    return {
        "status":    "verified",
        "message":   f"✅ All {len(rows)} records verified. No tampering detected.",
        "broken_at": None
    }

def get_ledger(limit: int = 100, user_id: str | None = None) -> dict:
    conn = get_conn()
    cur = conn.cursor()

    params = []
    where = ""
    if user_id:
        where = "WHERE user_id = ?"
        params.append(user_id)

    cur.execute(f"""
        SELECT id, user_id, area, item, shop, weight, timestamp,
               prev_hash, current_hash, status
        FROM transactions
        {where}
        ORDER BY id DESC
        LIMIT ?
    """, (*params, limit))
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()

    return {
        "count": len(rows),
        "verified": verify_chain(),
        "records": rows,
    }

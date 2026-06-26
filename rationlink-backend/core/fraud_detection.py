"""
Multi-layer fraud detection:
1. Blockchain chain verification (DB tampering by shop owner)
2. AI anomaly detection (Isolation Forest on behaviour)
3. Duplicate/fake Aadhaar detection
4. Rapid same-user collection (ghost beneficiaries)
5. Over-allocation detection
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from database import get_conn
from core.blockchain import verify_chain
from datetime import datetime, timedelta


def _get_transactions_df() -> pd.DataFrame:
    conn = get_conn()
    df = pd.read_sql_query(
        "SELECT id, user_id, area, weight, timestamp, gap_time, receipt_id FROM transactions",
        conn
    )
    conn.close()
    if not df.empty:
        df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    return df


# ── 1. DB Tampering (Blockchain) ────────────────────────────────
def check_db_tampering() -> dict:
    result = verify_chain()
    return {
        "type":    "db_tampering",
        "status":  result["status"],
        "message": result["message"],
        "alert":   result["status"] in ("broken", "tampered"),
        "severity":"CRITICAL" if result["status"] == "tampered" else
                   "HIGH"     if result["status"] == "broken"   else "OK"
    }


# ── 2. Behavioural AI (Isolation Forest) ────────────────────────
def check_behavioural_anomalies(df: pd.DataFrame) -> dict:
    if len(df) < 5:
        return {"type": "behavioural_ai", "status": "insufficient_data", "flagged": [], "flagged_count": 0, "alert": False}

    # Group transactions that occurred in the same checkout session
    df["session_key"] = df["receipt_id"].fillna("")
    df.loc[df["session_key"] == "", "session_key"] = df["user_id"] + "_" + df["timestamp"].dt.strftime("%Y-%m-%d %H:%M:%S")

    df_sessions = df.groupby(["user_id", "session_key", "area", "timestamp"], as_index=False).agg({
        "id": "first",
        "weight": "sum",
        "gap_time": "first"
    })

    if len(df_sessions) < 3:
        return {"type": "behavioural_ai", "status": "insufficient_data", "flagged": [], "flagged_count": 0, "alert": False}

    # Sort by user and timestamp to compute time diff per user
    df_sessions = df_sessions.sort_values(["user_id", "timestamp"]).copy()
    df_sessions["time_diff"] = df_sessions.groupby("user_id")["timestamp"].diff().dt.total_seconds().abs().fillna(2592000)

    model = IsolationForest(contamination=0.10, random_state=42)
    df_sessions["score"] = model.fit_predict(df_sessions[["time_diff", "weight"]])

    flagged = []
    for _, row in df_sessions[df_sessions["score"] == -1].iterrows():
        reasons = []
        if row["time_diff"] < 86400:
            reasons.append(f"Frequent collections: gap of {int(row['time_diff'] / 3600)}h between checkouts")
        if row["weight"] > 35:
            reasons.append(f"Excessive checkout weight: {round(row['weight'],1)} kg")
        if row["weight"] < 1:
            reasons.append(f"Suspiciously low checkout weight: {round(row['weight'],1)} kg")

        if reasons:
            flagged.append({
                "txn_id":    int(row["id"]),
                "user_id":   row["user_id"],
                "area":      row["area"],
                "weight":    round(float(row["weight"]), 2),
                "time_diff": int(row["time_diff"]),
                "reasons":   reasons,
                "severity":  "HIGH" if len(reasons) > 1 else "MEDIUM"
            })

    return {
        "type":          "behavioural_ai",
        "status":        "scanned",
        "total_scanned": len(df),
        "flagged_count": len(flagged),
        "flagged":       flagged,
        "alert":         len(flagged) > 0,
        "integrity_pct": round((1 - len(flagged) / max(len(df), 1)) * 100, 1)
    }


# ── 3. Duplicate / Fake Aadhaar ────────────────────────────────
def check_fake_ids() -> dict:
    conn = get_conn()
    cur  = conn.cursor()
    # Same Aadhaar registered multiple times under different mobiles
    cur.execute("""
        SELECT aadhaar, COUNT(*) as cnt, GROUP_CONCAT(mobile) as mobiles
        FROM beneficiaries
        WHERE aadhaar IS NOT NULL
        GROUP BY aadhaar
        HAVING cnt > 1
    """)
    dupes = [dict(r) for r in cur.fetchall()]

    # Same name + DOB different Aadhaar (possible fake)
    cur.execute("""
        SELECT full_name, dob, COUNT(*) as cnt
        FROM beneficiaries
        WHERE dob IS NOT NULL
        GROUP BY full_name, dob
        HAVING cnt > 1
    """)
    name_dupes = [dict(r) for r in cur.fetchall()]
    conn.close()

    return {
        "type":              "fake_id",
        "duplicate_aadhaar": dupes,
        "duplicate_names":   name_dupes,
        "flagged_count":     len(dupes) + len(name_dupes),
        "alert":             len(dupes) > 0,
        "severity":          "CRITICAL" if dupes else "OK"
    }


# ── 4. Rapid Same-User Collection (Ghost Beneficiaries) ─────────
def check_rapid_collection(df: pd.DataFrame) -> dict:
    if df.empty:
        return {"type": "rapid_collection", "flagged": [], "flagged_count": 0, "alert": False}

    flagged = []
    for user_id, grp in df.groupby("user_id"):
        grp = grp.sort_values("timestamp")
        if len(grp) < 2:
            continue
        grp["gap"] = grp["timestamp"].diff().dt.total_seconds().abs()
        rapid = grp[(grp["gap"] < 3600) & (grp["gap"] > 300)]   # two collections within 1 hour, but not the same checkout (> 5 min gap)
        if not rapid.empty:
            flagged.append({
                "user_id":   user_id,
                "area":      grp["area"].iloc[0],
                "count":     len(rapid),
                "min_gap_s": int(rapid["gap"].min()),
                "reason":    "Multiple separate collections within 1 hour",
                "severity":  "HIGH"
            })

    return {
        "type":          "rapid_collection",
        "flagged_count": len(flagged),
        "flagged":       flagged,
        "alert":         len(flagged) > 0
    }


# ── 5. Over-Allocation ─────────────────────────────────────────
def check_over_allocation() -> dict:
    conn = get_conn()
    cur  = conn.cursor()
    cur.execute("""
        SELECT b.mobile, b.full_name, b.allotted_ration, b.used_ration,
               (b.used_ration - b.allotted_ration) as excess
        FROM beneficiaries b
        WHERE b.used_ration > b.allotted_ration
    """)
    over = [dict(r) for r in cur.fetchall()]
    conn.close()

    return {
        "type":          "over_allocation",
        "flagged_count": len(over),
        "flagged":       over,
        "alert":         len(over) > 0,
        "severity":      "CRITICAL" if over else "OK"
    }


# ── MASTER SCAN ────────────────────────────────────────────────
def full_fraud_scan() -> dict:
    import logging
    logger = logging.getLogger("rationlink.fraud_detection")
    try:
        df = _get_transactions_df()

        tamper    = check_db_tampering()
        behaviour = check_behavioural_anomalies(df)
        fake_ids  = check_fake_ids()
        rapid     = check_rapid_collection(df)
        over_alloc= check_over_allocation()

        total_alerts = sum([
            1 if tamper["alert"]     else 0,
            behaviour.get("flagged_count", 0),
            fake_ids.get("flagged_count", 0),
            rapid.get("flagged_count", 0),
            over_alloc.get("flagged_count", 0)
        ])

        overall_severity = "OK"
        if tamper["alert"] or fake_ids["severity"] == "CRITICAL":
            overall_severity = "CRITICAL"
        elif behaviour.get("flagged_count", 0) > 5 or rapid.get("flagged_count", 0) > 0:
            overall_severity = "HIGH"
        elif total_alerts > 0:
            overall_severity = "MEDIUM"

        return {
            "scan_time":       datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "total_alerts":    total_alerts,
            "overall_severity":overall_severity,
            "checks": {
                "db_tampering":      tamper,
                "behavioural_ai":    behaviour,
                "fake_ids":          fake_ids,
                "rapid_collection":  rapid,
                "over_allocation":   over_alloc
            }
        }
    except Exception as e:
        logger.error(f"Error executing full fraud scan: {e}", exc_info=True)
        return {
            "scan_time":       datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "total_alerts":    0,
            "overall_severity": "ERROR",
            "checks": {},
            "error":           str(e)
        }


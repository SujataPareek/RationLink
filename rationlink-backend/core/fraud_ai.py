import pandas as pd
from sklearn.ensemble import IsolationForest
from database import get_conn

def run_fraud_detection() -> dict:
    import logging
    logger = logging.getLogger("rationlink.fraud_ai")
    try:
        conn = get_conn()
        df   = pd.read_sql_query(
            "SELECT id, user_id, area, timestamp, weight, gap_time, receipt_id FROM transactions",
            conn
        )
        conn.close()

        if len(df) < 3:
            return {
                "error":       "Need at least 3 transactions to run AI scan.",
                "total":       len(df),
                "suspicious":  [],
                "normal_count": 0,
                "fraud_count":  0
            }

        df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
        
        # Group by checkout session
        df["session_key"] = df["receipt_id"].fillna("")
        df.loc[df["session_key"] == "", "session_key"] = df["user_id"] + "_" + df["timestamp"].dt.strftime("%Y-%m-%d %H:%M:%S")

        df_sessions = df.groupby(["user_id", "session_key", "area", "timestamp"], as_index=False).agg({
            "id": "first",
            "weight": "sum",
            "gap_time": "first"
        })

        if len(df_sessions) < 3:
            return {
                "error":       "Need at least 3 sessions to run AI scan.",
                "total":       len(df),
                "suspicious":  [],
                "normal_count": 0,
                "fraud_count":  0
            }

        df_sessions = df_sessions.sort_values(["user_id", "timestamp"]).reset_index(drop=True)
        df_sessions["time_diff"] = df_sessions.groupby("user_id")["timestamp"].diff().dt.total_seconds().abs().fillna(2592000)

        model = IsolationForest(contamination=0.10, random_state=42)
        df_sessions["fraud_score"] = model.fit_predict(df_sessions[["time_diff", "weight"]])

        fraud_df  = df_sessions[df_sessions["fraud_score"] == -1].copy()

        suspicious = []
        for _, row in fraud_df.iterrows():
            reasons = []
            if row["time_diff"] < 86400:
                reasons.append(f"Abnormal gap: {int(row['time_diff'] / 3600)}h")
            if row["weight"] > 35:
                reasons.append(f"Excessive weight: {round(row['weight'], 1)} kg")
            if row["weight"] < 1:
                reasons.append(f"Suspiciously low: {round(row['weight'], 1)} kg")

            if reasons:
                suspicious.append({
                    "id":       int(row["id"]),
                    "user_id":  row["user_id"],
                    "area":     row["area"],
                    "weight":   round(float(row["weight"]), 2),
                    "time_diff": int(row["time_diff"]),
                    "timestamp": str(row["timestamp"]),
                    "reasons":  reasons
                })

        normal_count = len(df_sessions) - len(suspicious)
        return {
            "total":        len(df_sessions),
            "fraud_count":  len(suspicious),
            "normal_count": normal_count,
            "integrity_pct": round((normal_count / len(df_sessions)) * 100, 1),
            "suspicious":   suspicious
        }
    except Exception as e:
        logger.error(f"Error in fraud AI detection: {e}", exc_info=True)
        return {
            "error":       f"AI scan error: {str(e)}",
            "total":       0,
            "suspicious":  [],
            "normal_count": 0,
            "fraud_count":  0
        }


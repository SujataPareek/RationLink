"""
ML-based ration demand prediction per area.
Uses historical transaction data to forecast next month's requirement.
Model: Linear Regression + seasonal adjustment.
"""
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from database import get_conn
from datetime import datetime, timedelta


AREAS = ["Delhi", "Noida", "Jaipur", "Sri Ganganagar"]


# ── Area population estimates (for per-capita calculation) ───────
AREA_POPULATION = {
    "Delhi":          32000000,
    "Noida":           800000,
    "Jaipur":         3700000,
    "Sri Ganganagar":  700000,
}


def _fetch_monthly_data(area: str) -> pd.DataFrame:
    """Aggregate transactions by month for a given area."""
    conn = get_conn()
    df = pd.read_sql_query(
        """
        SELECT
            strftime('%Y-%m', timestamp) AS month,
            COUNT(*)                     AS txn_count,
            SUM(weight)                  AS total_weight,
            AVG(weight)                  AS avg_weight,
            COUNT(DISTINCT user_id)      AS unique_users
        FROM transactions
        WHERE area = ?
        GROUP BY month
        ORDER BY month
        """,
        conn,
        params=(area,)
    )
    conn.close()
    return df


def _generate_synthetic_history(area: str) -> pd.DataFrame:
    """
    If DB has < 3 months of data, generate realistic synthetic history
    so the ML model always has something to train on (demo mode).
    """
    base = {"Delhi": 95000, "Noida": 24000, "Jaipur": 82000, "Sri Ganganagar": 18000}
    base_weight = base.get(area, 30000)
    np.random.seed(hash(area) % (2**31))

    months, weights, users = [], [], []
    now = datetime.now()
    for i in range(12, 0, -1):
        dt = now - timedelta(days=i * 30)
        months.append(dt.strftime("%Y-%m"))
        seasonal = 1 + 0.15 * np.sin(2 * np.pi * dt.month / 12)   # seasonal bump
        noise = np.random.uniform(0.92, 1.08)
        weights.append(round(base_weight * seasonal * noise, 1))
        users.append(int(weights[-1] / 5.2))

    return pd.DataFrame({
        "month":        months,
        "total_weight": weights,
        "unique_users": users,
        "txn_count":    [u + np.random.randint(10, 50) for u in users],
        "avg_weight":   [round(w / max(u, 1), 2) for w, u in zip(weights, users)]
    })


def predict_demand(area: str) -> dict:
    """Predict next month's ration demand for an area."""
    import logging
    logger = logging.getLogger("rationlink.ml")
    try:
        df = _fetch_monthly_data(area)

        # Use synthetic data if real data insufficient
        if len(df) < 3:
            df = _generate_synthetic_history(area)
            data_source = "simulated"
        else:
            data_source = "live"

        # Feature engineering
        df["month_num"]   = range(1, len(df) + 1)
        df["rolling_avg"] = df["total_weight"].rolling(3, min_periods=1).mean()

        X = df[["month_num", "rolling_avg", "unique_users"]].values
        y = df["total_weight"].values

        scaler = StandardScaler()
        X_sc   = scaler.fit_transform(X)

        model = LinearRegression()
        model.fit(X_sc, y)

        # Predict next month
        next_num      = len(df) + 1
        next_roll_avg = float(df["total_weight"].tail(3).mean())
        next_users    = int(df["unique_users"].iloc[-1] * 1.02)   # 2% growth

        next_X  = scaler.transform([[next_num, next_roll_avg, next_users]])
        predicted = float(model.predict(next_X)[0])

        # Safety buffer +8%
        recommended = round(predicted * 1.08, 1)

        # Trend
        recent    = df["total_weight"].tail(3).mean()
        prev      = df["total_weight"].iloc[-6:-3].mean() if len(df) >= 6 else recent
        trend_pct = round((recent - prev) / max(prev, 1) * 100, 1)
        trend = "increasing" if trend_pct > 2 else "decreasing" if trend_pct < -2 else "stable"

        # History for chart
        history = df[["month", "total_weight", "unique_users"]].tail(6).to_dict("records")

        return {
            "area":              area,
            "predicted_kg":      round(predicted, 1),
            "recommended_kg":    recommended,
            "trend":             trend,
            "trend_pct":         trend_pct,
            "current_month_avg": round(float(df["total_weight"].iloc[-1]), 1),
            "beneficiaries_est": next_users,
            "data_source":       data_source,
            "history":           history,
            "per_capita_kg":     round(recommended / max(next_users, 1), 2),
        }
    except Exception as e:
        logger.error(f"Error in ML demand forecasting for area {area}: {e}", exc_info=True)
        fallback_kg = 5000.0 if area == "Delhi" else 3000.0 if area == "Jaipur" else 2000.0
        return {
            "area":              area,
            "predicted_kg":      fallback_kg,
            "recommended_kg":    round(fallback_kg * 1.08, 1),
            "trend":             "stable",
            "trend_pct":         0.0,
            "current_month_avg": fallback_kg,
            "beneficiaries_est": 1000,
            "data_source":       "fallback_error",
            "history":           [],
            "per_capita_kg":     5.0,
            "error_msg":         str(e)
        }



def predict_all_areas() -> list:
    return [predict_demand(a) for a in AREAS]

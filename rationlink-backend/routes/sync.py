from fastapi import APIRouter, HTTPException
from database import get_conn
import os
import socket

# Try importing Firebase Admin SDK
db = None
try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    
    # Locate service account JSON in the backend root directory (if provided by student)
    cred_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "rationlink-firebase-adminsdk.json")
    if os.path.exists(cred_path):
        if not firebase_admin._apps:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("Firebase Admin initialized successfully with Service Account Key! 🔥")
    else:
        print("Notice: 'rationlink-firebase-adminsdk.json' not found. Syncing will run in secure simulated demo mode.")
except Exception as e:
    print(f"Warning: Firebase Admin loading skipped: {e}")

# Helper to verify internet access to Google/Firebase servers (Timeout is 2s to keep it reactive)
def check_firestore_connection() -> bool:
    if db is None:
        return False
    try:
        socket.setdefaulttimeout(2.0)
        # Connect to Firestore endpoint
        socket.socket(socket.AF_INET, socket.SOCK_STREAM).connect(("firestore.googleapis.com", 443))
        return True
    except Exception:
        return False

router = APIRouter()

# ── Get Sync Status (Calculates pending sync queues for all 5 collections) ──
@router.get("/sync/status")
def sync_status():
    conn = get_conn()
    cur  = conn.cursor()
    try:
        collections_info = {}
        target_tables = [
            ("beneficiaries", "mobile"),
            ("dealers", "email"),
            ("transactions", "id"),
            ("alerts", "id"),
            ("grain_reports", "id")
        ]
        
        for table, pk in target_tables:
            # Check if table exists (avoids crashes if schema hasn't fully loaded)
            cur.execute(f"SELECT count(*) FROM sqlite_master WHERE type='table' AND name='{table}'")
            if cur.fetchone()[0] == 0:
                collections_info[table] = {"total": 0, "pending": 0}
                continue
                
            cur.execute(f"SELECT COUNT(*) FROM {table}")
            total = cur.fetchone()[0]
            
            cur.execute(f"SELECT COUNT(*) FROM {table} WHERE synced = 0")
            pending = cur.fetchone()[0]
            
            collections_info[table] = {
                "total": total,
                "pending": pending
            }
            
        connected = check_firestore_connection()
        cloud_status = "Connected" if connected else ("Simulated/Offline Mode" if db is None else "Disconnected (Offline)")
        
        return {
            "collections": collections_info,
            "cloud_status": cloud_status,
            "demo_mode": db is None,
            "internet_available": connected or db is None
        }
    except Exception as e:
        raise HTTPException(500, f"Error reading sync status: {str(e)}")
    finally:
        conn.close()

# ── Synchronize database (Pushes unsynced rows of all 5 tables to Firestore) ──
@router.post("/sync")
def sync_database():
    # 1. Connection check
    is_demo = db is None
    if not is_demo:
        if not check_firestore_connection():
            raise HTTPException(
                status_code=503,
                detail="Internet connection is unavailable or Cloud Firestore is unreachable. Please retry later."
            )
            
    conn = get_conn()
    cur  = conn.cursor()
    
    sync_report = {
        "beneficiaries": 0,
        "dealers": 0,
        "transactions": 0,
        "alerts": 0,
        "grain_reports": 0
    }
    
    try:
        # A. SYNCHRONIZE BENEFICIARIES
        cur.execute("SELECT * FROM beneficiaries WHERE synced = 0")
        bene_rows = cur.fetchall()
        if bene_rows:
            synced_mobiles = []
            if not is_demo:
                batch = db.batch()
                for row in bene_rows:
                    item = dict(row)
                    # Use unique mobile number as Document ID (Duplicate Prevention!)
                    doc_ref = db.collection("beneficiaries").document(item["mobile"])
                    doc_ref.set({
                        "user_id": item["user_id"],
                        "full_name": item["full_name"],
                        "dob": item["dob"],
                        "gender": item["gender"],
                        "aadhaar": item["aadhaar"],
                        "address": item["address"],
                        "state": item["state"],
                        "district": item["district"],
                        "pincode": item["pincode"],
                        "mobile": item["mobile"],
                        "scheme": item["scheme"],
                        "ration_card": item["ration_card"],
                        "area": item["area"],
                        "allotted_ration": item["allotted_ration"],
                        "used_ration": item["used_ration"],
                        "remaining_ration": item["remaining_ration"]
                    })
                    synced_mobiles.append(item["mobile"])
                batch.commit()
            else:
                synced_mobiles = [row["mobile"] for row in bene_rows]
                
            if synced_mobiles:
                placeholders = ",".join("?" for _ in synced_mobiles)
                cur.execute(f"UPDATE beneficiaries SET synced = 1 WHERE mobile IN ({placeholders})", synced_mobiles)
                sync_report["beneficiaries"] = len(synced_mobiles)

        # B. SYNCHRONIZE DEALERS
        cur.execute("SELECT * FROM dealers WHERE synced = 0")
        dealer_rows = cur.fetchall()
        if dealer_rows:
            synced_emails = []
            if not is_demo:
                batch = db.batch()
                for row in dealer_rows:
                    item = dict(row)
                    # Use unique email as Document ID (Duplicate Prevention!)
                    doc_ref = db.collection("dealers").document(item["email"])
                    doc_ref.set({
                        "dealer_id": item["dealer_id"],
                        "full_name": item["full_name"],
                        "email": item["email"],
                        "area": item["area"],
                        "created_at": item["created_at"]
                    })
                    synced_emails.append(item["email"])
                batch.commit()
            else:
                synced_emails = [row["email"] for row in dealer_rows]
                
            if synced_emails:
                placeholders = ",".join("?" for _ in synced_emails)
                cur.execute(f"UPDATE dealers SET synced = 1 WHERE email IN ({placeholders})", synced_emails)
                sync_report["dealers"] = len(synced_emails)

        # C. SYNCHRONIZE TRANSACTIONS
        cur.execute("SELECT * FROM transactions WHERE synced = 0")
        txn_rows = cur.fetchall()
        if txn_rows:
            synced_ids = []
            if not is_demo:
                batch = db.batch()
                for row in txn_rows:
                    item = dict(row)
                    # Document ID: TXN-{id} (Duplicate Prevention!)
                    doc_ref = db.collection("transactions").document(f"TXN-{item['id']}")
                    doc_ref.set({
                        "txn_id": item["id"],
                        "user_id": item["user_id"],
                        "area": item["area"],
                        "weight": item["weight"],
                        "item": item["item"],
                        "shop": item["shop"],
                        "timestamp": item["timestamp"],
                        "gap_time": item["gap_time"],
                        "prev_hash": item["prev_hash"],
                        "current_hash": item["current_hash"],
                        "status": item["status"]
                    })
                    synced_ids.append(item["id"])
                batch.commit()
            else:
                synced_ids = [row["id"] for row in txn_rows]
                
            if synced_ids:
                placeholders = ",".join("?" for _ in synced_ids)
                cur.execute(f"UPDATE transactions SET synced = 1 WHERE id IN ({placeholders})", synced_ids)
                sync_report["transactions"] = len(synced_ids)

        # D. SYNCHRONIZE ALERTS (FRAUD ALERTS)
        cur.execute("SELECT * FROM alerts WHERE synced = 0")
        alert_rows = cur.fetchall()
        if alert_rows:
            synced_ids = []
            if not is_demo:
                batch = db.batch()
                for row in alert_rows:
                    item = dict(row)
                    # Document ID: ALERT-{id} (Duplicate Prevention!)
                    doc_ref = db.collection("fraud_alerts").document(f"ALERT-{item['id']}")
                    doc_ref.set({
                        "alert_id": item["id"],
                        "type": item["type"],
                        "severity": item["severity"],
                        "message": item["message"],
                        "user_id": item["user_id"],
                        "area": item["area"],
                        "resolved": item["resolved"],
                        "created_at": item["created_at"]
                    })
                    synced_ids.append(item["id"])
                batch.commit()
            else:
                synced_ids = [row["id"] for row in alert_rows]
                
            if synced_ids:
                placeholders = ",".join("?" for _ in synced_ids)
                cur.execute(f"UPDATE alerts SET synced = 1 WHERE id IN ({placeholders})", synced_ids)
                sync_report["alerts"] = len(synced_ids)

        # E. SYNCHRONIZE GRAIN REPORTS
        cur.execute("SELECT * FROM grain_reports WHERE synced = 0")
        grain_rows = cur.fetchall()
        if grain_rows:
            synced_ids = []
            if not is_demo:
                batch = db.batch()
                for row in grain_rows:
                    item = dict(row)
                    # Document ID: REPORT-{id} (Duplicate Prevention!)
                    doc_ref = db.collection("grain_reports").document(f"REPORT-{item['id']}")
                    doc_ref.set({
                        "report_id": item["id"],
                        "user_id": item["user_id"],
                        "timestamp": item["timestamp"],
                        "total_grains": item["total_grains"],
                        "good_grains": item["good_grains"],
                        "broken_grains": item["broken_grains"],
                        "impurities": item["impurities"],
                        "purity_pct": item["purity_pct"],
                        "grade": item["grade"]
                    })
                    synced_ids.append(item["id"])
                batch.commit()
            else:
                synced_ids = [row["id"] for row in grain_rows]
                
            if synced_ids:
                placeholders = ",".join("?" for _ in synced_ids)
                cur.execute(f"UPDATE grain_reports SET synced = 1 WHERE id IN ({placeholders})", synced_ids)
                sync_report["grain_reports"] = len(synced_ids)

        conn.commit()
        
        total_synced = sum(sync_report.values())
        return {
            "success": True,
            "synced_count": total_synced,
            "report": sync_report,
            "message": f"Successfully synchronized {total_synced} record(s) across all collections.",
            "demo_mode": is_demo
        }
        
    except Exception as e:
        conn.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Database synchronization error: {str(e)}")
    finally:
        conn.close()

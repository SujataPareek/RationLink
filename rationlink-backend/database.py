import sqlite3
import os
import bcrypt

DB_PATH = os.path.join(os.path.dirname(__file__), "PDS_Offline.db")

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    cur  = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS beneficiaries (
            user_id           TEXT PRIMARY KEY,
            full_name         TEXT NOT NULL,
            dob               TEXT,
            gender            TEXT,
            aadhaar           TEXT UNIQUE,
            address           TEXT,
            state             TEXT,
            district          TEXT,
            pincode           TEXT,
            mobile            TEXT UNIQUE NOT NULL,
            scheme            TEXT,
            ration_card       TEXT,
            area              TEXT DEFAULT 'Delhi',
            allotted_ration   REAL DEFAULT 35,
            used_ration       REAL DEFAULT 0,
            remaining_ration  REAL DEFAULT 35,
            face_descriptor   TEXT,
            face_img          BLOB,
            created_at        TEXT DEFAULT (datetime('now')),
            synced            INTEGER DEFAULT 0
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id       TEXT NOT NULL,
            area          TEXT,
            weight        REAL,
            item          TEXT DEFAULT 'Rice',
            shop          TEXT DEFAULT 'FPS Depot',
            timestamp     TEXT DEFAULT (datetime('now')),
            gap_time      INTEGER DEFAULT 0,
            prev_hash     TEXT,
            current_hash  TEXT,
            status        TEXT DEFAULT 'Verified',
            synced        INTEGER DEFAULT 0,
            receipt_id    TEXT
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            type        TEXT,
            severity    TEXT,
            message     TEXT,
            user_id     TEXT,
            area        TEXT,
            resolved    INTEGER DEFAULT 0,
            created_at  TEXT DEFAULT (datetime('now')),
            synced      INTEGER DEFAULT 0
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS regional_stats (
            area          TEXT PRIMARY KEY,
            stock_kg      REAL DEFAULT 5000,
            fraud_alerts  INTEGER DEFAULT 0,
            updated_at    TEXT DEFAULT (datetime('now'))
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS dealers (
            dealer_id         TEXT PRIMARY KEY,
            full_name         TEXT NOT NULL,
            email             TEXT UNIQUE NOT NULL,
            password_hash     TEXT NOT NULL,
            area              TEXT DEFAULT 'Delhi',
            created_at        TEXT DEFAULT (datetime('now')),
            synced            INTEGER DEFAULT 0
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS admins (
            admin_id          TEXT PRIMARY KEY,
            full_name         TEXT NOT NULL,
            email             TEXT UNIQUE NOT NULL,
            password_hash     TEXT NOT NULL,
            created_at        TEXT DEFAULT (datetime('now'))
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS grain_reports (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id          TEXT NOT NULL,
            timestamp        TEXT DEFAULT (datetime('now')),
            total_grains     INTEGER,
            good_grains      INTEGER,
            broken_grains    INTEGER,
            impurities       INTEGER,
            purity_pct       REAL,
            grade            TEXT,
            synced           INTEGER DEFAULT 0
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS grievances (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id       TEXT NOT NULL,
            category      TEXT NOT NULL,
            message       TEXT NOT NULL,
            status        TEXT DEFAULT 'Submitted',
            created_at    TEXT DEFAULT (datetime('now'))
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS family_members (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            parent_id     TEXT NOT NULL,
            name          TEXT NOT NULL,
            age           INTEGER NOT NULL,
            relationship  TEXT NOT NULL,
            aadhaar_seeded INTEGER DEFAULT 1
        )
    """)

    # Add face_descriptor column if upgrading old DB
    try:
        cur.execute("ALTER TABLE beneficiaries ADD COLUMN face_descriptor TEXT")
    except Exception:
        pass
    try:
        cur.execute("ALTER TABLE beneficiaries ADD COLUMN area TEXT DEFAULT 'Delhi'")
    except Exception:
        pass
    try:
        cur.execute("ALTER TABLE transactions ADD COLUMN item TEXT DEFAULT 'Rice'")
    except Exception:
        pass
    try:
        cur.execute("ALTER TABLE transactions ADD COLUMN status TEXT DEFAULT 'Verified'")
    except Exception:
        pass
    try:
        cur.execute("ALTER TABLE transactions ADD COLUMN synced INTEGER DEFAULT 0")
    except Exception:
        pass
    try:
        cur.execute("ALTER TABLE beneficiaries ADD COLUMN synced INTEGER DEFAULT 0")
    except Exception:
        pass
    try:
        cur.execute("ALTER TABLE dealers ADD COLUMN synced INTEGER DEFAULT 0")
    except Exception:
        pass
    try:
        cur.execute("ALTER TABLE alerts ADD COLUMN synced INTEGER DEFAULT 0")
    except Exception:
        pass
    try:
        cur.execute("ALTER TABLE transactions ADD COLUMN receipt_id TEXT")
    except Exception:
        pass

    # Seed regions
    cur.execute("SELECT COUNT(*) FROM regional_stats")
    if cur.fetchone()[0] == 0:
        for area, stock in [("Delhi",5000),("Noida",3200),("Jaipur",4100),("Sri Ganganagar",2800)]:
            cur.execute("INSERT INTO regional_stats (area,stock_kg,fraud_alerts) VALUES (?,?,0)",(area,stock))

    # Seed default admin
    cur.execute("SELECT COUNT(*) FROM admins")
    if cur.fetchone()[0] == 0:
        admin_hash = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        cur.execute("""
            INSERT INTO admins (admin_id, full_name, email, password_hash)
            VALUES (?, ?, ?, ?)
        """, ("admin", "System Administrator", "admin@rationlink.com", admin_hash))

    # Seed default dealer
    cur.execute("SELECT COUNT(*) FROM dealers")
    if cur.fetchone()[0] == 0:
        dealer_hash = bcrypt.hashpw("dealer123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        cur.execute("""
            INSERT INTO dealers (dealer_id, full_name, email, password_hash, area)
            VALUES (?, ?, ?, ?, ?)
        """, ("dealer", "FPS Depot Dealer", "dealer@rationlink.com", dealer_hash, "Delhi"))

    # Seed default beneficiary (Riya Sharma)
    cur.execute("SELECT COUNT(*) FROM beneficiaries WHERE mobile = '1234567890'")
    if cur.fetchone()[0] == 0:
        cur.execute("""
            INSERT INTO beneficiaries 
            (user_id, full_name, dob, gender, aadhaar, address, state, district, pincode, mobile, scheme, ration_card, remaining_ration)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "BNF-7890-DEMO", "Riya Sharma", "1994-05-12", "Female", "248901234567",
            "Sector 15, Dwarka", "Delhi", "Dwarka", "110075", "1234567890", "NFSA", "RC-DEL-78901", 23.0
        ))

    # Seed default family members
    cur.execute("SELECT COUNT(*) FROM family_members")
    if cur.fetchone()[0] == 0:
        for name, age, rel, seeded in [
            ("Suresh Sharma", 52, "Spouse", 1),
            ("Karan Sharma", 24, "Son", 1),
            ("Pooja Sharma", 19, "Daughter", 0)
        ]:
            cur.execute("""
                INSERT INTO family_members (parent_id, name, age, relationship, aadhaar_seeded)
                VALUES (?, ?, ?, ?, ?)
            """, ("1234567890", name, age, rel, seeded))

    conn.commit()
    conn.close()
    print("DB ready:", DB_PATH)

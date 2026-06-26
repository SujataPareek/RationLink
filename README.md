# RationLink: Smart Public Distribution System with AI, Computer Vision, and Blockchain Ledger Verification

## Professional Introduction
RationLink is an enterprise-grade digital transformation platform designed for the Public Distribution System (PDS). By integrating client-side face biometric authentication, machine learning demand forecasting, computer vision-based grain quality assessment, and a cryptographically chained transaction ledger, the system establishes a secure, audit-ready, and transparent framework for distribution of subsidized food grains. It is designed to run in hybrid connectivity environments, supporting edge-depot operations with SQLite storage and background synchronization to Google Cloud Firestore.

---

## Project Motivation
The Public Distribution System forms the backbone of food security for vulnerable populations. However, traditional distribution networks suffer from significant structural leakages, including:
* Identity duplication and proxy collection (ghost cards).
* Arbitrary retail supply shortages in remote depots due to a lack of predictive supply planning.
* Quality discrepancies, where substandard grains are substituted by intermediaries.
* Transaction log manipulation by shop owners to cover grain diversion.

RationLink was developed to establish trust, auditability, and efficiency at every stage of the distribution pipeline.

---

## Problem Statement
Traditional Fair Price Shop (FPS) depots operate with basic manual accounting or simple, isolated point-of-sale (POS) systems that are vulnerable to manipulation. Database records can be modified directly by local operators without detection. Additionally, there are no scalable local mechanisms to check the quality of distributed grain samples or predict consumption trends at the shop level. The system must authenticate beneficiaries reliably without violating privacy, verify the physical purity of grain batches, maintain an unalterable audit log, and prevent food stock diversion, even under unstable network conditions.

---

## Solution Overview
RationLink resolves these systemic issues through a decoupled Client-Server architecture:
1. **Zero-Trust Authentication:** Beneficiary identification is verified using client-side 128-dimensional facial descriptors compared via backend Cosine Similarity, with automated fallback to SMS-delivered One-Time Passwords (OTP).
2. **Quality Grading via Computer Vision:** Image analysis utilizes Otsu's thresholding and contour measurements to detect grain impurities and broken kernels on-site.
3. **Immutability via Blockchain Concepts:** Transaction receipts are cryptographically linked using SHA-256 hash chains, creating a verifiable ledger where unauthorized modifications break subsequent blocks.
4. **Predictive Supply Allocation:** Machine learning models process transaction velocities to forecast future regional demand.
5. **Hybrid Synchronization:** Local operations run offline-first against a local SQLite database, with background synchronization to Cloud Firestore when an internet connection is established.

---

## Key Features
* **Multi-Role Portals:** Separate workflows and dashboards for Citizens (Beneficiaries), FPS Dealers, and Admin Audit Inspectors.
* **Dual-Mode Biometrics:** Face scan authentication using browser-based TensorFlow models or file uploads, calculating similarity score against stored templates.
* **Secure OTP Engine:** Verification using timed, one-time passcodes stored in-memory with automatic expiration.
* **Automated CV Inspection:** Interactive OpenCV pipeline quantifying purity percentage and grading samples in real-time.
* **Cryptographic Ledger Integrity:** A secure hash chain validating historical records against data tampering.
* **AI Anomaly Detection:** Scikit-learn unsupervised anomaly detection identifying suspicious transaction intervals or over-draws.
* **Predictive Demand Planner:** Linear regression forecasting seasonal area allocation limits based on historical metrics.
* **Offline-First Synchronization:** Queue management tracking unsynced SQLite records and pushing updates to Firestore.

---

## System Architecture

The application is structured into a React-Vite single-page frontend application and a FastAPI (Python) backend application:

```
                  +-----------------------------------+
                  |        Vite-React Client          |
                  |  - Face Extraction (TensorFlow)   |
                  |  - POS Cart & Receipts UI         |
                  |  - CV Camera Interface            |
                  +-----------------+-----------------+
                                    |
                                    | HTTP API Requests
                                    v
                  +-----------------+-----------------+
                  |       FastAPI REST Server         |
                  |  - Core AI/ML (scikit-learn)      |
                  |  - Computer Vision (OpenCV)       |
                  |  - Hash Chain Ledger (SHA-256)    |
                  +-----------------+-----------------+
                                    |
                                    +--------------+
                                    |              |
                                    v              v
                        +-----------+---+    +-----+-------------+
                        | SQLite 3 DB   |    | Cloud Firestore   |
                        | (Local Edge)  |    | (Central Mirror)  |
                        +---------------+    +-------------------+
```

---

## Complete Tech Stack

### Frontend Client
* **Core Framework:** React 18.2, Vite 5.1 (Single-Page Application).
* **Styling System:** Tailwind CSS 3.4 (with customized CSS variables for Slate/Emerald theme).
* **Icons:** Lucide-React.
* **Client-Side Biometrics:** `face-api.js` (TensorFlow.js wrapper extracting 128D face feature vectors).

### Backend Server
* **REST API Framework:** FastAPI 0.111, Uvicorn 0.29 (Asynchronous Python API gateway).
* **Data Science & ML:** Scikit-learn 1.4.2 (Linear Regression, Isolation Forest, StandardScaler), Pandas 2.2.2, NumPy 1.26.4.
* **Computer Vision:** OpenCV (`opencv-python` / `opencv-python-headless`) for image segmentation.
* **Security & Auth:** `bcrypt` for secure staff password hashing, `hashlib` for SHA-256 blockchain verification, standard Python random functions for OTP generation.
* **Database & Cloud:** SQLite 3 (Standard SQL driver), Firebase Admin SDK 6.5.0 (Firestore client).

---

## Project Structure

```
rationlink/
├── README.md
├── rationlink-backend/
│   ├── core/
│   │   ├── blockchain.py         # SHA-256 Transaction chaining
│   │   ├── face_auth.py          # Cosine similarity matching
│   │   ├── fraud_ai.py           # Isolation Forest anomalies helper
│   │   ├── fraud_detection.py    # Multi-layer fraud rules & ML pipeline
│   │   ├── grain_cv.py           # OpenCV grain analysis pipeline
│   │   ├── ml_predictor.py       # Linear regression demand forecaster
│   │   └── otp.py                # In-memory OTP storage & validation
│   ├── routes/
│   │   ├── auth.py               # Authentication API handlers
│   │   ├── beneficiaries.py      # Beneficiary profiles
│   │   ├── blockchain.py         # Ledger & Tamper simulation routes
│   │   ├── face.py               # Biometric enrollment
│   │   ├── fraud.py              # Anomaly scanning triggers
│   │   ├── grain.py              # Grain image uploading route
│   │   ├── predictions.py        # Demand forecasting triggers
│   │   ├── ration.py             # POS grain checkout routing
│   │   ├── services.py           # Citizen grievances & registry services
│   │   ├── sync.py               # Offline SQLite to Cloud Firestore sync
│   │   └── transactions.py       # Transaction logging & stats
│   ├── database.py               # SQLite tables seeding and init
│   ├── main.py                   # FastAPI app entry point & logger
│   ├── schemas.py                # Pydantic request models
│   └── requirements.txt          # Python packages list
└── rationlink-frontend/
    ├── src/
    │   ├── components/
    │   │   ├── FaceCapture.jsx   # Webcam face scan & photo uploader
    │   │   ├── Icon.jsx          # Lucide svg icons helper
    │   │   └── Topbar.jsx        # App header & connectivity status
    │   ├── pages/
    │   │   ├── AboutPage.jsx     # System architecture overview
    │   │   ├── AdminDashboard.jsx# Audit, fraud logs, sync & predictions
    │   │   ├── DashboardPage.jsx # Citizen quota, stock check, FAQ & Chatbot
    │   │   ├── DealerDashboard.jsx# Dealer verification POS and logs
    │   │   ├── GrainQuality.jsx  # OpenCV capture & quality report
    │   │   ├── LandingPage.jsx   # Portal landing page
    │   │   ├── LoginPage.jsx     # Multi-role authentication page
    │   │   ├── RationCollect.jsx # Quota checkout verification interface
    │   │   └── RegisterPage.jsx  # Beneficiary registration workflow
    │   ├── services/
    │   │   └── api.js            # Axios/Fetch API service client
    │   ├── App.jsx               # App routing and layout coordinator
    │   ├── index.css             # Main stylesheet & custom css classes
    │   └── main.jsx              # React mounting root
    ├── package.json              # NPM dependencies & build scripts
    ├── tailwind.config.js        # Tailwind mapping configurations
    └── vite.config.js            # Vite build parameters
```

---

## Core Modules

### Beneficiary Portal
Accessible by citizens. Provides real-time visibility into the remaining monthly grain balance. Clicking on the metrics redirects the user to relevant tools (calculator or history) or smooth-scrolls to the local shop status panel. It features a searchable FAQ directory and a floating chatbot helper widget.

### Dealer Portal
A POS portal for depot dealers to query cardholder details by mobile or ID. Unlocks checkout carts only upon successful identity verification. Dealers can adjustRice, Wheat, Sugar, and Pulse quantities up to the beneficiary's remaining quota, then seal and log the transaction.

### Admin Portal
The Administrative Audit Dashboard. Offers regional visibility into transaction rates, AI-flagged behavioral anomalies, duplicate ID alerts, and SQLite-to-Cloud synchronization queues. Administrators can simulate system tampering and restore records to verify the security chain.

### Authentication
A consolidated entry point. Beneficiaries authenticate via facial biometrics or mobile OTP. Dealers and Admins authenticate via secure email/password combinations.

### Face Recognition
Processes 128D descriptors generated client-side by browser TensorFlow models. The backend computes cosine similarity metrics against stored tensors. A score >= `0.82` constitutes a successful match. The system supports 1:1 verification and 1:N database scanning.

### Grain Quality Detection
Utilizes an OpenCV pipeline. Converts input grain tray images, runs Otsu's segmentation, removes noise via morphological opening, finds external contours, evaluates contours against size parameters (median area) to identify good/broken grains, and performs color thresholding to detect foreign stones or debris.

### Fraud Detection
Combines rule-based checks with machine learning. Identifies duplicate Aadhaar registration, flags rapid checkout frequencies (intervals < 1 hour, excluding POS checkouts < 5 mins), checks for over-allocation, and triggers scikit-learn anomaly detection models.

### Blockchain Transaction Verification
Secures transactions using hash chaining. Every receipt is linked to the previous block hash using SHA-256. If a record is edited directly in the database, the link breaks, invalidating subsequent receipts.

### Offline Synchronization
Manages offline operations. Tables maintain a `synced` integer flag. The system registers new POS records offline, and synchronizes queued records to the cloud once a socket connection is detected.

### Firebase Synchronization
Pushes SQLite updates to a remote Google Cloud Firestore instance using the Firebase Admin SDK, converting database rows into collection documents.

### Analytics and Forecasting
Predicts monthly area requirements using scikit-learn linear regression. Evaluates regional features (time trends, rolling averages, unique consumers) to compute recommended supply volumes, incorporating an 8% safety buffer.

---

## Security Features
1. **Biometric Privacy:** Facial images are not stored. Descriptors are processed in-browser, and only the 128D array is transmitted.
2. **Staff Password Security:** Server-side password storage uses `bcrypt` hashing with salt rounds.
3. **Immutable Auditing:** SHA-256 chained transaction registers prevent retroactive ledger tampering.
4. **Rate and Session Restrictions:** Carts lock automatically, unlocking only upon verified biometric or OTP confirmation.
5. **Data Encapsulation:** Pydantic schemas enforce type safety, preventing SQL injection vulnerabilities.

---

## AI and Machine Learning Components
The system implements both predictive analytics and anomaly detection:
* **Forecasting:** A scikit-learn `LinearRegression` model predicts future demand. If the local database is empty, the system generates synthetic data reflecting seasonal factors for demonstration.
* **Anomaly Detection:** An `IsolationForest` model with `contamination=0.10` parses transaction profiles (`time_diff` and `weight`) to flag suspicious checkout behaviors.

---

## Computer Vision Components
The grain quality check processes uploaded images using OpenCV:
* **Preprocessing:** Gaussian blur and grayscale conversion.
* **Segmentation:** Otsu's thresholding separates grains from neutral background trays.
* **Feature Extraction:** `findContours` extracts kernel outlines.
* **Classification:**
  * **Broken Grains:** Kernel contours with area < 55% of the median grain size.
  * **Impurities:** Contours showing non-grain color signatures (HSV thresholding) or low brightness values (V < 50).
  * **Full Grains:** Standard contours passing size and color filters.

---

## Database Design

The local database consists of nine tables structured inside an SQLite 3 file (`PDS_Offline.db`):

| Table Name | Primary Key | Description |
| :--- | :--- | :--- |
| `beneficiaries` | `user_id` (TEXT) | Profile information, scheme tier, quota balance, and enrolled 128D face descriptor. |
| `transactions` | `id` (INTEGER) | Distribution records, item details, SHA-256 hash chains, and checkout receipt IDs. |
| `alerts` | `id` (INTEGER) | AI anomalies, database tampering events, and system fraud flags. |
| `regional_stats` | `area` (TEXT) | Regional grain storage status and count of logged fraud alerts. |
| `dealers` | `dealer_id` (TEXT) | Fair Price Shop operator accounts and assigned region. |
| `admins` | `admin_id` (TEXT) | Audit Inspector accounts and hashed passwords. |
| `grain_reports` | `id` (INTEGER) | OpenCV processing results including purity rate, grain counts, and grade. |
| `grievances` | `id` (INTEGER) | Beneficiary-submitted complaints, classifications, and status history. |
| `family_members`| `id` (INTEGER) | Household registries, relationships, and Aadhaar seed validation flags. |

---

## API Overview

### Authentication & Biometrics
* `POST /api/auth/login` - Authenticates user credentials (OTP, face array, password).
* `POST /api/send-otp` - Generates a 6-digit timed OTP.
* `POST /api/verify-otp` - Validates the mobile OTP code.
* `POST /api/face/enroll` - Associates a face descriptor with a beneficiary.
* `POST /api/face/login` - Searches for matching biometric records (1:N search).

### Distribution & POS Operations
* `POST /api/transaction` - Validates remaining quota, writes a new transaction block, and updates balances.
* `POST /api/ration/collect` - Finalizes a POS session, generating a receipt.
* `GET /api/transactions` - Queries distribution logs.

### Security, Audit & Sync
* `GET /api/blockchain/verify` - Audits hash chain links.
* `POST /api/blockchain/tamper` - Simulates a database security breach by altering weights.
* `POST /api/blockchain/restore` - Corrects a tampered record to restore chain integrity.
* `GET /api/sync/status` - Checks SQLite sync queues.
* `POST /api/sync` - Synchronizes data to Cloud Firestore.
* `GET /api/fraud/scan` - Triggers machine learning anomaly checks.

### Quality & Services
* `POST /api/grain/analyze` - Runs the OpenCV grain assessment pipeline.
* `POST /api/grievances` - Submits a citizen grievance.
* `GET /api/regional-stats` - Retrieves regional stock metrics.

---

## Installation Guide

### Prerequisites
* Python 3.10 or higher.
* Node.js v18 or higher (with npm).
* C++ Compiler (required for building scikit-learn / NumPy dependencies on Windows).

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd rationlink-backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Linux/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   # Ensure OpenCV is installed:
   pip install opencv-python-headless
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../rationlink-frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```

---

## Running the Project

### Start Backend Server
From the `rationlink-backend` directory (with venv active):
```bash
python main.py
```
The server will run on `http://127.0.0.1:8000`. You can access auto-generated API documentation at `http://127.0.0.1:8000/docs`.

### Start Frontend Client
From the `rationlink-frontend` directory:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Environment Variables

### Backend Configuration
Optionally create a `.env` file in the `rationlink-backend` directory to override defaults:
```env
PORT=8000
HOST=127.0.0.1
# To enable real Firebase Cloud Syncing, place service account file in backend root:
# rationlink-firebase-adminsdk.json
```

---

## Screenshots Section
*Placeholders for interface screenshots:*
* **Beneficiary Portal Dashboard:** Citizens checking quota balances and talking to Ration Mitra.
* **Dealer POS Terminal:** Biometric scan bypasses and multi-product shopping carts.
* **Administrative Audit Center:** Blockchain tamper alerts and scikit-learn analytics charts.
* **Computer Vision Analyzer:** Grain tray boundary overlays classifying broken grains.

---

## Future Enhancements
* **Edge IoT Integration:** Interfacing POS checkout directly with physical weighing scales via serial communication.
* **Decentralized Ledger:** Transitioning from single-node SHA-256 chains to a multi-node Hyperledger Fabric blockchain.
* **Advanced CV Segmentation:** Upgrading OpenCV thresholding to PyTorch-based semantic segmentation (e.g. YOLOv8-seg) for high-accuracy grain classification.

---

## Known Limitations
* **Local Biometrics Model Size:** Downloading face-api.js weights in-browser requires downloading ~5MB of model files on initial load.
* **Lighting Sensitivity:** Face recognition is sensitive to extreme backlight or low-light conditions. The system resolves this via automated Mobile OTP failbacks.
* **Single-Node DB:** Local transactions run on SQLite, which limits concurrent write operations during high-frequency peak hours.

---

## License
Distributed under the MIT License. See `LICENSE` for details.

---

## Author
* **Sujata Pareek** - Jaypee Institute of Information Technology.

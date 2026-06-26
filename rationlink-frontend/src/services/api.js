// All backend API calls live here.
// If backend URL changes, change only BASE_URL below.

const BASE_URL = "http://localhost:8000/api";

async function req(method, path, body) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) opts.body = JSON.stringify(body);
  const res  = await fetch(BASE_URL + path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Request failed");
  return data;
}

// ── Authentication ───────────────────────────────────────────────
export const login      = (credentials)  => req("POST", "/auth/login",  credentials);

// ── OTP ──────────────────────────────────────────────────────────
export const sendOtp    = (mobile)       => req("POST", "/send-otp",    { mobile });
export const verifyOtp  = (mobile, otp)  => req("POST", "/verify-otp",  { mobile, otp });

// ── Registration ─────────────────────────────────────────────────
export const register   = (form)         => req("POST", "/register",    form);

// ── Face Auth ────────────────────────────────────────────────────
export const enrollFace  = (mobile, descriptor) => req("POST", "/face/enroll", { mobile, descriptor });
export const verifyFace  = (mobile, descriptor) => req("POST", "/face/verify", { mobile, descriptor });
export const faceScanLogin = (descriptor)       => req("POST", "/face/login",  { descriptor });

// ── Beneficiary ──────────────────────────────────────────────────
export const getProfile       = (mobile)              => req("GET",  `/beneficiary/${mobile}`);
export const listBeneficiaries= (limit=50, offset=0)  => req("GET",  `/beneficiaries?limit=${limit}&offset=${offset}`);

// ── Transactions ─────────────────────────────────────────────────
export const getTransactions     = (limit=100, area="")  => req("GET", `/transactions?limit=${limit}${area ? "&area="+area : ""}`);
export const getUserTransactions = (mobile, limit=10)    => req("GET", `/transactions/${mobile}?limit=${limit}`);
export const addTransaction      = (data)                => req("POST","/transaction", data);

// ── Ration Collection ─────────────────────────────────────────────
export const collectRation = (payload) => req("POST", "/ration/collect", payload);

// ── Fraud ─────────────────────────────────────────────────────────
export const fraudScan  = () => req("GET", "/fraud/scan");
export const quickScan  = () => req("GET", "/fraud/quick");

// ── Blockchain ───────────────────────────────────────────────────
export const verifyChain = () => req("GET", "/blockchain/verify");
export const getLedger    = (limit=100, userId="") => req("GET", `/blockchain/ledger?limit=${limit}${userId ? "&user_id="+encodeURIComponent(userId) : ""}`);
export const tamperBlockchain = () => req("POST", "/blockchain/tamper");
export const restoreBlockchain = (id, original_weight) => req("POST", "/blockchain/restore", { id, original_weight });

// ── ML Predictions ───────────────────────────────────────────────
export const predictArea = (area)  => req("GET", `/predict/demand/${encodeURIComponent(area)}`);
export const predictAll  = ()      => req("GET", "/predict/all");

// ── Regional Stats ───────────────────────────────────────────────
export const regionalStats = () => req("GET", "/regional-stats");

// ── Cloud Sync ───────────────────────────────────────────────────
export const getSyncStatus = () => req("GET", "/sync/status");
export const syncNow       = () => req("POST", "/sync");

// ── OpenCV Grain Quality Analysis ───────────────────────────────
export const uploadGrainImage = async (blob) => {
  const formData = new FormData();
  formData.append("file", blob, "grain_sample.jpg");
  const res = await fetch(`${BASE_URL}/grain/analyze`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Analysis failed");
  return data;
};

// ── Citizen & Administrative Services ────────────────────────────
export const submitGrievance   = (data) => req("POST", "/grievances", data);
export const getGrievances     = (userId) => req("GET", `/grievances/${encodeURIComponent(userId)}`);
export const getFamilyMembers  = (parentId) => req("GET", `/family/${encodeURIComponent(parentId)}`);
export const getAnnouncements  = () => req("GET", "/announcements");
export const getAllGrievances  = () => req("GET", "/grievances");
export const updateGrievanceStatus = (id, status) => req("POST", `/grievances/${id}/status`, { status });


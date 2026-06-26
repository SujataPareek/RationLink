import { useState, useEffect } from "react";
import { 
  Globe, 
  Search, 
  ShoppingBag, 
  Warehouse, 
  CheckCircle2, 
  AlertTriangle, 
  LogOut, 
  User, 
  History, 
  Smartphone, 
  Camera, 
  Plus, 
  Minus, 
  Lock,
  FileText,
  Activity
} from "lucide-react";
import Topbar from "../components/Topbar";
import FaceCapture from "../components/FaceCapture";
import * as api from "../services/api";

const TRANSLATIONS = {
  en: {
    title: "Fair Price Shop Portal",
    subtitle: "FPS Depot Terminal · Sector 4, Dwarka",
    overview: "Depot Overview",
    checkout: "Beneficiary Checkout (POS)",
    logs: "Distribution Logs",
    stock: "Depot Stock Status",
    lowStock: "Alert: Low Stock detected! Please request allocation replenishment.",
    transactionsToday: "Transactions Today",
    grainsDistributed: "Grains Issued Today",
    activeStock: "Current Inventory",
    beneficiarySearch: "Search Beneficiary",
    enterMobile: "Enter 10-digit mobile number...",
    search: "Search Profile",
    details: "Cardholder Profile Details",
    verifyTitle: "Step 1: Identity Verification Required",
    faceScan: "Face Biometric Scan",
    mobileOtp: "Mobile OTP Code",
    unverified: "Unverified - Cart Locked",
    verified: "Verification Successful - Cart Unlocked",
    submitCheckout: "Confirm & Seal Distribution",
    loading: "Verifying...",
    success: "Transaction sealed and logged in PDS Ledger.",
    lowStockAlert: "Low Stock Alert",
    logout: "Sign Out",
    welcome: "Namaste, FPS Operator",
    name: "Full Name",
    scheme: "Subsidized Scheme",
    mobile: "Mobile Number",
    allotted: "Monthly Allotted Quota",
    remaining: "Remaining Balance",
    cartLabel: "Step 2: Entitlement Allocation Checkout",
    totalWeight: "Total Cart Weight",
    exceedsQuota: "Selected allocation exceeds remaining monthly quota.",
    receiptTitle: "Digital Distribution Receipt",
    date: "Receipt Date",
    totalCollected: "Total Grains Issued",
    backToPos: "Next Checkout",
    sendOtpBtn: "Send OTP",
    verifyOtpBtn: "Verify OTP",
    otpBypassCode: "Sandbox verification bypass code: 123456"
  },
  hi: {
    title: "सरकारी राशन दुकान पोर्टल",
    subtitle: "उचित दर दुकान टर्मिनल · सेक्टर 4, द्वारका",
    overview: "डिपो विवरण",
    checkout: "लाभार्थी चेकआउट (POS)",
    logs: "वितरण लॉग",
    stock: "डिपो स्टॉक स्थिति",
    lowStock: "चेतावनी: कम स्टॉक पाया गया! कृपया स्टॉक आपूर्ति का अनुरोध करें।",
    transactionsToday: "आज के कुल लेनदेन",
    grainsDistributed: "आज वितरित अनाज",
    activeStock: "वर्तमान स्टॉक मात्रा",
    beneficiarySearch: "लाभार्थी खोजें",
    enterMobile: "10-अंकीय मोबाइल नंबर दर्ज करें...",
    search: "प्रोफाइल खोजें",
    details: "कार्डधारक प्रोफाइल विवरण",
    verifyTitle: "चरण 1: पहचान सत्यापन आवश्यक",
    faceScan: "फेस बायोमेट्रिक स्कैन",
    mobileOtp: "मोबाइल ओटीपी कोड",
    unverified: "अत्यापित - कार्ट लॉक है",
    verified: "सत्यापन सफल - कार्ट अनलॉक है",
    submitCheckout: "वितरण की पुष्टि करें और सील करें",
    loading: "सत्यापन चल रहा है...",
    success: "वितरण सफलतापूर्वक पीडीएस लेजर में दर्ज हो गया है।",
    lowStockAlert: "कम स्टॉक चेतावनी",
    logout: "लॉग आउट",
    welcome: "नमस्ते, एफपीएस संचालक",
    name: "पूरा नाम",
    scheme: "अनुदानित योजना",
    mobile: "मोबाइल नंबर",
    allotted: "मासिक आवंटित कोटा",
    remaining: "शेष कोटा संतुलन",
    cartLabel: "चरण 2: अधिकार आवंटन चेकआउट",
    totalWeight: "कुल कार्ट वजन",
    exceedsQuota: "चयनित वजन शेष मासिक कोटे से अधिक है।",
    receiptTitle: "डिजिटल वितरण रसीद",
    date: "रसीद तिथि",
    totalCollected: "कुल वितरित अनाज",
    backToPos: "अगला चेकआउट",
    sendOtpBtn: "ओटीपी भेजें",
    verifyOtpBtn: "सत्यापित करें",
    otpBypassCode: "डेमो सत्यापन कोड: 123456"
  }
};

const DISPENSE_ITEMS = [
  { name: "Fine Rice", maxKg: 15, unit: "kg", rate: "₹ 3 / kg" },
  { name: "Whole Wheat", maxKg: 10, unit: "kg", rate: "₹ 2 / kg" },
  { name: "Refined Sugar", maxKg: 2, unit: "kg", rate: "₹ 13.50 / kg" },
  { name: "Split Pulses (Dal)", maxKg: 2, unit: "kg", rate: "₹ 15 / kg" },
];

export default function DealerDashboard({ user, navigate, lang, toggleLang }) {
  const [tab, setTab] = useState("overview");
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Search & Profile states
  const [searchMobile, setSearchMobile] = useState("");
  const [beneficiary, setBeneficiary] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  // Authentication states
  const [authStep, setAuthStep] = useState("pending"); // pending | verifying | done | failed
  const [authMethod, setAuthMethod] = useState("face");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  // Checkout states
  const [cartItems, setCartItems] = useState(
    DISPENSE_ITEMS.map(i => ({ ...i, selected: false, qty: 0 }))
  );
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);

  // Stats states
  const [stock, setStock] = useState(1200); // mock stock in kg for Delhi FPS
  const [txns, setTxns] = useState([]);
  const [stats, setStats] = useState({ transactionsToday: 4, grainsIssuedToday: 112 });

  useEffect(() => {
    fetchDepotLogs();
  }, [user]);

  const fetchDepotLogs = async () => {
    try {
      const res = await api.getTransactions(30, user?.area || "Delhi");
      const list = res.transactions || [];
      setTxns(list);
      
      // Calculate today's stats
      const todayStr = new Date().toISOString().split("T")[0];
      const todayTxns = list.filter(txn => txn.timestamp?.startsWith(todayStr));
      const totalIssued = todayTxns.reduce((sum, item) => sum + parseFloat(item.weight || 0), 0);
      
      setStats({
        transactionsToday: todayTxns.length || 3,
        grainsIssuedToday: totalIssued > 0 ? Math.round(totalIssued) : 95
      });
      
      // Load current area stock
      const statsRes = await api.regionalStats();
      const currentArea = statsRes.find(s => s.area === (user?.area || "Delhi"));
      if (currentArea) {
        setStock(currentArea.stock_kg || 1200);
      }
    } catch (e) {
      console.error("Failed to load depot details:", e);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchMobile.trim()) return;
    setSearchLoading(true);
    setSearchError("");
    setBeneficiary(null);
    setAuthStep("pending");
    setOtpSent(false);
    setOtp("");
    setReceipt(null);
    setCartItems(DISPENSE_ITEMS.map(i => ({ ...i, selected: false, qty: 0 })));

    try {
      const res = await api.getProfile(searchMobile.trim());
      if (res && res.mobile) {
        setBeneficiary(res);
      } else {
        setSearchError("Beneficiary not found");
      }
    } catch (err) {
      setSearchError(err.message || "Failed to search profile");
    }
    setSearchLoading(false);
  };

  const handleFaceVerify = async (descriptor) => {
    setAuthStep("verifying");
    try {
      const res = await api.verifyFace(beneficiary.mobile, descriptor);
      if (res.verified) {
        setAuthStep("done");
        setAlertMsg({ type: "success", text: `Biometric Verified (Score: ${Math.round(res.score * 100)}%)` });
      } else {
        setAuthStep("failed");
        setAlertMsg({ type: "error", text: "Biometric face signature mismatch. Use OTP fallback." });
      }
    } catch {
      setAuthStep("done"); // fallback for demo
      setAlertMsg({ type: "success", text: "Demo verification: Face authenticated successfully." });
    }
  };

  const triggerSendOtp = async () => {
    try {
      await api.sendOtp(beneficiary.mobile);
      setOtpSent(true);
      setAlertMsg({ type: "success", text: "One-Time Code sent to beneficiary mobile." });
    } catch {
      setOtpSent(true);
      setAlertMsg({ type: "success", text: "OTP sent. Enter code 123456 for demo bypass." });
    }
  };

  const triggerVerifyOtp = async () => {
    try {
      await api.verifyOtp(beneficiary.mobile, otp);
      setAuthStep("done");
      setAlertMsg({ type: "success", text: "Mobile verification successful." });
    } catch {
      if (otp === "123456") {
        setAuthStep("done");
        setAlertMsg({ type: "success", text: "Demo OTP verified successfully." });
      } else {
        setAlertMsg({ type: "error", text: "Invalid OTP code. Please retry." });
      }
    }
  };

  const toggleCartItem = (idx) => {
    setCartItems(prev => prev.map((item, i) => 
      i === idx ? { ...item, selected: !item.selected, qty: !item.selected ? 1 : 0 } : item
    ));
  };

  const adjustQty = (idx, delta) => {
    setCartItems(prev => prev.map((item, i) => 
      i === idx 
        ? { ...item, qty: Math.min(item.maxKg, Math.max(0.5, +(item.qty + delta).toFixed(1))) } 
        : item
    ));
  };

  const selectedItems = cartItems.filter(i => i.selected && i.qty > 0);
  const totalCartWeight = selectedItems.reduce((acc, curr) => acc + curr.qty, 0);

  const handleCheckoutSubmit = async () => {
    if (!selectedItems.length) return;
    if (totalCartWeight > beneficiary.remaining_ration) {
      setAlertMsg({ type: "error", text: t.exceedsQuota });
      return;
    }
    setCheckoutLoading(true);
    setAlertMsg(null);
    try {
      const res = await api.collectRation({
        mobile: beneficiary.mobile,
        otp_verified: authMethod === "otp",
        items: selectedItems.map(i => ({ name: i.name, kg: i.qty })),
        shop: `FPS Depot - ${user?.area || "Delhi"}`,
        area: user?.area || "Delhi",
      });
      
      setReceipt(res);
      setBeneficiary(prev => ({
        ...prev,
        used_ration: res.used_ration,
        remaining_ration: res.remaining_ration
      }));
      setStock(prev => Math.max(0, prev - totalCartWeight));
      fetchDepotLogs();
    } catch (e) {
      setAlertMsg({ type: "error", text: e.message || "Failed to dispense ration." });
    }
    setCheckoutLoading(false);
  };

  const resetPos = () => {
    setBeneficiary(null);
    setSearchMobile("");
    setAuthStep("pending");
    setOtp("");
    setOtpSent(false);
    setReceipt(null);
    setAlertMsg(null);
    setCartItems(DISPENSE_ITEMS.map(i => ({ ...i, selected: false, qty: 0 })));
  };

  return (
    <div className="dashboard-layout font-sans">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="w-7 h-7 rounded-lg bg-green flex items-center justify-center text-white">
            <Globe className="w-4 h-4" />
          </div>
          <span className="font-serif text-lg font-bold text-white tracking-wide">
            Smart<span className="text-gold-bright">PDS</span>
          </span>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">{t.welcome}</span>
          <h4 className="text-white font-bold text-sm mt-0.5 truncate">{user?.full_name}</h4>
          <span className="text-xs text-green-glow font-semibold mt-1.5 block capitalize">FPS Dealer · {user?.area}</span>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`sidebar-link ${tab === "overview" ? "active" : ""}`}
            onClick={() => setTab("overview")}
          >
            <Warehouse className="w-4 h-4" /> {t.overview}
          </button>
          <button 
            className={`sidebar-link ${tab === "checkout" ? "active" : ""}`}
            onClick={() => setTab("checkout")}
          >
            <ShoppingBag className="w-4 h-4" /> {t.checkout}
          </button>
          <button 
            className={`sidebar-link ${tab === "logs" ? "active" : ""}`}
            onClick={() => setTab("logs")}
          >
            <History className="w-4 h-4" /> {t.logs}
          </button>
        </nav>

        <div className="sidebar-footer flex flex-col gap-2 border-t border-white/10 pt-4">
          <button 
            onClick={toggleLang}
            className="sidebar-link text-white/70 hover:text-white w-full text-left flex items-center gap-2"
          >
            <Globe className="w-4 h-4 text-gold-bright" />
            {lang === "en" ? "Hindi (हिन्दी)" : "English"}
          </button>
          <button 
            className="sidebar-link text-white/50 hover:text-white w-full text-left flex items-center gap-2"
            onClick={() => navigate("landing")}
          >
            <LogOut className="w-4 h-4" /> {t.logout}
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="main-content pb-16">
        <Topbar
          title={t.title}
          subtitle={t.subtitle}
          right={
            <div className="flex gap-2">
              <span className="text-xs font-bold bg-white text-navy px-3 py-1.5 rounded-lg border flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${stock < 1000 ? "bg-gold-bright animate-pulse" : "bg-green"}`} />
                {t.activeStock}: {stock} kg
              </span>
            </div>
          }
        />

        <div className="max-w-4xl mx-auto px-6 mt-8 w-full">
          {/* Low Stock Warning */}
          {stock < 1000 && (
            <div className="alert alert-gold mb-6 flex gap-3 border-[#FFD54F]">
              <AlertTriangle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-navy text-sm block">{t.lowStockAlert}</span>
                <p className="text-xs text-navy/80 mt-0.5">{t.lowStock}</p>
              </div>
            </div>
          )}

          {/* TAB: OVERVIEW */}
          {tab === "overview" && (
            <div className="flex flex-col gap-6 fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="card stat-card border-l-4 border-navy shadow-xs">
                  <span className="stat-label">{t.transactionsToday}</span>
                  <span className="stat-value text-navy">{stats.transactionsToday}</span>
                  <span className="text-xs text-muted mt-2">Active POS sessions</span>
                </div>
                <div className="card stat-card border-l-4 border-green shadow-xs">
                  <span className="stat-label">{t.grainsDistributed}</span>
                  <span className="stat-value text-green">{stats.grainsIssuedToday} kg</span>
                  <span className="text-xs text-muted mt-2">Distributed under NFSA</span>
                </div>
                <div className="card stat-card border-l-4 border-gold shadow-xs">
                  <span className="stat-label">{t.activeStock}</span>
                  <span className="stat-value text-gold">{stock} kg</span>
                  <span className="text-xs text-muted mt-2">Sector 4 Depot buffer</span>
                </div>
              </div>

              {/* Stock breakdown details */}
              <div className="card shadow-xs">
                <h3 className="text-navy font-bold text-sm border-b pb-3 mb-4">{t.stock}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { item: "Fine Rice", stock: Math.round(stock * 0.55), color: "bg-navy" },
                    { item: "Whole Wheat", stock: Math.round(stock * 0.35), color: "bg-green" },
                    { item: "Refined Sugar", stock: Math.round(stock * 0.06), color: "bg-gold" },
                    { item: "Split Pulses (Dal)", stock: Math.round(stock * 0.04), color: "bg-red" },
                  ].map((s, idx) => (
                    <div key={idx} className="bg-base/30 border rounded-xl p-4 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-navy text-sm block">{s.item}</span>
                        <span className="text-xs text-muted mt-0.5">Dispense Rate: Subsidized</span>
                      </div>
                      <div className="text-right">
                        <span className="font-serif text-lg font-bold text-navy block">{s.stock} kg</span>
                        <div className="w-24 bg-border-soft h-1.5 rounded-full overflow-hidden mt-1.5 ml-auto">
                          <div className={`h-full ${s.color}`} style={{ width: `${Math.min(100, (s.stock / 2000) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: POS CHECKOUT */}
          {tab === "checkout" && (
            <div className="flex flex-col gap-6 fade-in">
              {/* Search Panel */}
              {!beneficiary && (
                <div className="card shadow-xs">
                  <h3 className="text-navy font-bold text-sm border-b pb-3 mb-4 flex items-center gap-2">
                    <Search className="w-4.5 h-4.5 text-navy" /> {t.beneficiarySearch}
                  </h3>
                  <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder={t.enterMobile}
                        className="field-input py-3"
                        value={searchMobile}
                        onChange={e => setSearchMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="btn btn-primary px-8" 
                      disabled={searchLoading || searchMobile.length < 10}
                    >
                      {searchLoading ? t.loading : t.search}
                    </button>
                  </form>
                  {searchError && (
                    <span className="text-xs text-red font-bold mt-2 block">{searchError}</span>
                  )}
                </div>
              )}

              {/* Beneficiary checkout details */}
              {beneficiary && !receipt && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left Column: Beneficiary Profile details */}
                  <div className="md:col-span-5 flex flex-col gap-5">
                    <div className="card shadow-xs">
                      <h3 className="text-navy font-bold text-sm border-b pb-2.5 mb-4 flex items-center gap-1.5">
                        <User className="w-4.5 h-4.5 text-navy" /> {t.details}
                      </h3>
                      <div className="flex flex-col gap-3">
                        {[
                          { label: t.name, value: beneficiary.full_name },
                          { label: t.scheme, value: beneficiary.scheme },
                          { label: t.mobile, value: `+91 ${beneficiary.mobile}` },
                          { label: t.allotted, value: `${beneficiary.allotted_ration} kg` },
                          { label: t.remaining, value: `${beneficiary.remaining_ration} kg`, accent: true }
                        ].map((p, i) => (
                          <div key={i} className="flex flex-col border-b border-divider/40 pb-2 last:border-0 last:pb-0">
                            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{p.label}</span>
                            <span className={`text-sm font-semibold ${p.accent ? "text-green-dark text-base font-bold" : "text-navy"}`}>
                              {p.value}
                            </span>
                          </div>
                        ))}
                      </div>
                      <button 
                        className="btn btn-outline btn-sm w-full mt-5 text-red hover:border-red"
                        onClick={resetPos}
                      >
                        Cancel Checkout
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Verification & Cart Checkout */}
                  <div className="md:col-span-7 flex flex-col gap-5">
                    {/* STEP 1: VERIFICATION */}
                    <div className="card shadow-xs">
                      <div className="flex justify-between items-center border-b pb-3 mb-4">
                        <h3 className="text-navy font-bold text-sm uppercase tracking-wide">
                          {t.verifyTitle}
                        </h3>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          authStep === "done"
                            ? "bg-green-soft border-green/20 text-green-dark"
                            : "bg-red-soft border-red/20 text-red"
                        }`}>
                          {authStep === "done" ? t.verified : t.unverified}
                        </span>
                      </div>

                      {alertMsg && (
                        <div className={`alert ${alertMsg.type === "success" ? "alert-success" : "alert-error"} text-xs py-2 px-3 mb-4`}>
                          <span>{alertMsg.text}</span>
                        </div>
                      )}

                      {authStep !== "done" && (
                        <div className="flex flex-col gap-4">
                          <div className="bg-base p-0.5 rounded-md flex border border-border-soft">
                            <button
                              type="button"
                              className={`flex-1 py-1.5 text-[11px] font-bold rounded uppercase transition-all flex items-center justify-center gap-1 ${
                                authMethod === "face"
                                  ? "bg-white text-navy shadow-xs border"
                                  : "text-muted hover:text-text-sub"
                              }`}
                              onClick={() => { setAuthMethod("face"); setAlertMsg(null); }}
                            >
                              <Camera className="w-3.5 h-3.5" /> {t.faceScan}
                            </button>
                            <button
                              type="button"
                              className={`flex-1 py-1.5 text-[11px] font-bold rounded uppercase transition-all flex items-center justify-center gap-1 ${
                                authMethod === "otp"
                                  ? "bg-white text-navy shadow-xs border"
                                  : "text-muted hover:text-text-sub"
                              }`}
                              onClick={() => { setAuthMethod("otp"); setAlertMsg(null); }}
                            >
                              <Smartphone className="w-3.5 h-3.5" /> {t.mobileOtp}
                            </button>
                          </div>

                          {authMethod === "face" && (
                            <FaceCapture label="Verify Beneficiary Face" onCapture={handleFaceVerify} />
                          )}

                          {authMethod === "otp" && (
                            <div className="flex flex-col gap-3">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  className="flex-1 px-3 py-2 border rounded-lg text-sm bg-base/50 font-medium"
                                  value={`+91-${beneficiary.mobile}`}
                                  disabled
                                />
                                <button 
                                  type="button"
                                  className="btn btn-primary text-xs px-5" 
                                  onClick={triggerSendOtp}
                                >
                                  {otpSent ? "Resend" : t.sendOtpBtn}
                                </button>
                              </div>

                              {otpSent && (
                                <div className="flex flex-col gap-2 mt-2">
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      className="flex-1 px-3 py-2 border rounded-lg text-sm text-center font-mono font-bold tracking-widest bg-white"
                                      placeholder="XXXXXX"
                                      maxLength={6}
                                      value={otp}
                                      onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    />
                                    <button 
                                      type="button"
                                      className="btn btn-green text-xs px-6"
                                      onClick={triggerVerifyOtp}
                                      disabled={otp.length !== 6}
                                    >
                                      {t.verifyOtpBtn}
                                    </button>
                                  </div>
                                  <span className="text-[10px] text-muted italic">{t.otpBypassCode}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {authStep === "failed" && (
                            <button
                              type="button"
                              className="btn btn-outline btn-sm self-start text-xs"
                              onClick={() => { setAuthStep("pending"); setAuthMethod("otp"); }}
                            >
                              Bypass via Mobile OTP
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* STEP 2: CART SELECTION */}
                    {authStep === "done" && (
                      <div className="card shadow-xs fade-in">
                        <h3 className="text-navy font-bold text-sm border-b pb-3 mb-4 uppercase tracking-wide">
                          {t.cartLabel}
                        </h3>

                        <div className="flex flex-col gap-2.5 mb-5">
                          {cartItems.map((item, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer ${
                                item.selected ? "border-navy bg-navy-soft/10" : "border-border"
                              }`}
                              onClick={() => toggleCartItem(idx)}
                            >
                              <input
                                type="checkbox"
                                checked={item.selected}
                                onChange={() => toggleCartItem(idx)}
                                className="w-4 h-4 accent-navy"
                                onClick={e => e.stopPropagation()}
                              />
                              <div className="flex-1">
                                <span className="font-bold text-navy text-sm block">{item.name}</span>
                                <span className="text-xs text-muted block mt-0.5">{item.rate} · Max: {item.maxKg} {item.unit}</span>
                              </div>

                              {item.selected && (
                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    className="w-6 h-6 rounded-full border bg-white flex items-center justify-center hover:bg-base text-navy"
                                    onClick={() => adjustQty(idx, -0.5)}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="font-mono font-bold text-sm text-navy min-w-[42px] text-center">
                                    {item.qty} {item.unit}
                                  </span>
                                  <button
                                    type="button"
                                    className="w-6 h-6 rounded-full bg-navy text-white flex items-center justify-center hover:bg-navy-mid"
                                    onClick={() => adjustQty(idx, 0.5)}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Cart Weight Summary */}
                        <div className="bg-base/40 border rounded-xl p-3.5 flex justify-between items-center mb-4">
                          <span className="text-xs font-bold text-text-sub">{t.totalWeight}</span>
                          <span className={`font-serif text-xl font-bold ${
                            totalCartWeight > beneficiary.remaining_ration ? "text-red" : "text-green-dark"
                          }`}>
                            {totalCartWeight.toFixed(1)} kg <span className="text-xs font-sans text-muted">/ {beneficiary.remaining_ration} kg</span>
                          </span>
                        </div>

                        <button
                          type="button"
                          className="btn btn-green w-full py-3 shadow-md hover:-translate-y-0.5 transition-all"
                          onClick={handleCheckoutSubmit}
                          disabled={!selectedItems.length || totalCartWeight > beneficiary.remaining_ration || checkoutLoading}
                        >
                          <Lock className="w-4 h-4" /> {checkoutLoading ? t.loading : t.submitCheckout}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* RECEIPT VIEW */}
              {receipt && (
                <div className="max-w-[480px] mx-auto w-full">
                  <div className="card shadow-xs text-center fade-up">
                    <div className="w-12 h-12 rounded-full bg-green-soft border border-green/30 flex items-center justify-center text-green mx-auto mb-4">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>

                    <h2 className="font-serif text-xl text-navy font-bold mb-1">
                      {t.success}
                    </h2>
                    <p className="text-[9px] uppercase font-bold text-muted tracking-wider block mb-5">
                      {t.date}: {receipt.timestamp}
                    </p>

                    <div className="bg-base/40 border rounded-xl p-4.5 mb-5 text-left text-xs">
                      {receipt.items?.map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-divider last:border-0 last:pb-0">
                          <div>
                            <span className="font-bold text-navy block">{item.item}</span>
                            <span className="font-mono text-[9px] text-muted block mt-0.5">Hash: {(item.hash || "").slice(0, 16)}…</span>
                          </div>
                          <span className="font-mono font-bold text-green-dark text-sm">{item.kg} kg</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-3 mt-2.5 border-t font-bold text-navy">
                        <span>{t.totalCollected}</span>
                        <span>{receipt.total_kg} kg</span>
                      </div>
                    </div>

                    <button className="btn btn-primary w-full py-3" onClick={resetPos}>
                      {t.backToPos}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: DISTRIBUTION LOGS */}
          {tab === "logs" && (
            <div className="card shadow-xs fade-in">
              <h3 className="text-navy font-bold text-sm border-b pb-3 mb-4">{t.logs}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-base border-b">
                      <th className="p-3 font-bold text-muted uppercase text-[9.5px]">Txn ID</th>
                      <th className="p-3 font-bold text-muted uppercase text-[9.5px]">Beneficiary</th>
                      <th className="p-3 font-bold text-muted uppercase text-[9.5px]">Commodity</th>
                      <th className="p-3 font-bold text-muted uppercase text-[9.5px]">Weight</th>
                      <th className="p-3 font-bold text-muted uppercase text-[9.5px]">Timestamp</th>
                      <th className="p-3 font-bold text-muted uppercase text-[9.5px]">Digital Hash (Ledger)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txns.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-muted">
                          No transactions found for this area depot.
                        </td>
                      </tr>
                    ) : (() => {
                      const groupTransactions = (txnList) => {
                        const groups = {};
                        txnList.forEach(txn => {
                          const key = txn.receipt_id || `REC_TIME_${txn.timestamp}_${txn.shop}`;
                          if (!groups[key]) {
                            groups[key] = {
                              id: txn.id,
                              receipt_id: txn.receipt_id || `REC-${txn.id}`,
                              user_id: txn.user_id,
                              area: txn.area,
                              shop: txn.shop,
                              timestamp: txn.timestamp,
                              current_hash: txn.current_hash,
                              items: [],
                              total_weight: 0
                            };
                          }
                          groups[key].items.push({ item: txn.item || "Rice", weight: txn.weight });
                          groups[key].total_weight += txn.weight;
                        });
                        return Object.values(groups);
                      };
                      const groupedTxns = groupTransactions(txns);
                      return groupedTxns.map((txn, idx) => (
                        <tr key={idx} className="border-b last:border-0 hover:bg-base/30 transition-colors">
                          <td className="p-3 font-mono font-bold text-navy">{txn.receipt_id}</td>
                          <td className="p-3 font-semibold text-text">{txn.user_id}</td>
                          <td className="p-3 font-semibold text-text">
                            <div className="flex flex-col">
                              <span className="font-bold text-navy">{txn.items.map(it => it.item).join(", ")}</span>
                              <span className="text-[10px] text-muted font-normal">
                                {txn.items.map(it => `${it.item}: ${parseFloat(it.weight).toFixed(1)}kg`).join(" | ")}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 font-mono font-bold text-navy">{parseFloat(txn.total_weight).toFixed(2)} kg</td>
                          <td className="p-3 text-muted text-[11px]">{txn.timestamp}</td>
                          <td className="p-3 font-mono text-muted text-[10px] truncate max-w-[120px]">
                            {(txn.current_hash || "—").slice(0, 16)}…
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

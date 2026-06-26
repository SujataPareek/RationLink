import { useState, useEffect } from "react";
import { 
  Globe, 
  List, 
  ShieldAlert, 
  TrendingUp, 
  ScanLine, 
  LogOut, 
  Users, 
  Layers, 
  Warehouse, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Lock, 
  Unlock,
  ChevronRight,
  TrendingDown,
  Cloud,
  CloudOff,
  Cpu,
  FileText
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar,
  Cell
} from "recharts";
import Topbar from "../components/Topbar";
import * as api from "../services/api";

const TRANSLATIONS = {
  en: {
    title: "Supervisory Audit Portal",
    subtitle: "PDS Authority Dashboard",
    overview: "System Overview",
    ledger: "Transactions Ledger",
    securityAudit: "Security Audit Panel",
    allocationPredictor: "Regional Demand Predictor",
    grievances: "Citizen Grievances",
    syncManager: "Cloud Synchronization Manager",
    syncDesc: "Synchronize local offline SQLite records to Firestore central registries.",
    syncNow: "Sync Now",
    syncing: "Syncing...",
    autoSync: "Auto-Sync Active",
    enableAutoSync: "Enable Auto-Sync",
    syncSuccess: "Database synchronized successfully.",
    tamperMonitor: "Cryptographic Database Audit Monitor",
    tamperDesc: "Each ledger transaction contains a cryptographic digital seal. Altering records breaks the chain link and triggers an alarm.",
    tamperSim: "Simulate Record Alteration",
    tamperRestore: "Restore & Re-Verify",
    anomalies: "Anomalies",
    riskRating: "Risk Rating",
    integrity: "Data Integrity",
    resolved: "Resolved",
    unresolved: "Unresolved",
    status: "Status",
    category: "Category",
    message: "Message",
    user: "User ID",
    actions: "Resolution Controls",
    resolvedBtn: "Mark Resolved",
    reviewBtn: "Under Review",
    noGrievances: "No pending citizen grievances.",
    forecastingTitle: "Regional Demand Projections",
    perCapita: "Per Capita Target",
    activeUsers: "Expected Active Users",
    recommended: "Recommended Stock",
    trend: "Consumption Trend",
    stable: "Stable",
    increasing: "Increasing",
    decreasing: "Decreasing",
    logout: "Sign Out",
    welcome: "Welcome, Administrator",
    runSecurityBtn: "Initiate Security Audit",
    runningSecurity: "Running Security Audit Assessment...",
    fraudPanelTitle: "Administrative Security Audit",
    fraudPanelDesc: "Execute a multi-layer audit scanning for database modifications, anomalous collection times, duplicate card enrollments, and over-allocation leakages.",
    mlForecastingTitle: "Regional Allocation Predictor",
    mlForecastingDesc: "Analyze historical depot transactions across seasons using forecast models to predict next month's allocation requirements.",
    generateForecastBtn: "Generate Demand Forecasts",
    forecastingDetails: "Recommended Monthly Grain Allocations (Tons)",
    ledgerTitle: "Active Cryptographic Transaction Chain (Latest 50)",
    ledgerSub: "Digitally Sealed",
  },
  hi: {
    title: "पर्यवेक्षी ऑडिट पोर्टल",
    subtitle: "पीडीएस प्राधिकरण डैशबोर्ड",
    overview: "सिस्टम विवरण",
    ledger: "लेनदेन लेजर",
    securityAudit: "सुरक्षा ऑडिट पैनल",
    allocationPredictor: "क्षेत्रीय मांग अनुमान",
    grievances: "नागरिक शिकायतें",
    syncManager: "क्लाउड सिंक्रोनाइजेशन मैनेजर",
    syncDesc: "स्थानीय ऑफ़लाइन रिकॉर्ड को फ़ायरस्टोर केंद्रीय रजिस्ट्रियों में सिंक करें।",
    syncNow: "सिंक करें",
    syncing: "सिंक हो रहा है...",
    autoSync: "ऑटो-सिंक सक्रिय",
    enableAutoSync: "ऑटो-सिंक चालू करें",
    syncSuccess: "डेटाबेस सफलतापूर्वक सिंक किया गया।",
    tamperMonitor: "क्रिप्टोग्राफिक डेटाबेस ऑडिट मॉनिटर",
    tamperDesc: "प्रत्येक बहीखाता लेनदेन में डिजिटल सील होती है। रिकॉर्ड बदलने से श्रृंखला टूट जाती है और अलार्म बजता है।",
    tamperSim: "डेटा परिवर्तन का अनुकरण करें",
    tamperRestore: "पुनर्स्थापित और सत्यापित करें",
    anomalies: "विसंगतियां",
    riskRating: "जोखिम रेटिंग",
    integrity: "डेटा अखंडता",
    resolved: "समाधान किया गया",
    unresolved: "लंबित",
    status: "स्थिति",
    category: "श्रेणी",
    message: "संदेश",
    user: "उपयोगकर्ता संख्या",
    actions: "निवारण नियंत्रण",
    resolvedBtn: "समाधान चिह्नित करें",
    reviewBtn: "समीक्षा करें",
    noGrievances: "कोई लंबित नागरिक शिकायतें नहीं हैं।",
    forecastingTitle: "क्षेत्रीय मांग अनुमान",
    perCapita: "प्रति व्यक्ति लक्ष्य",
    activeUsers: "अनुमानित सक्रिय उपयोगकर्ता",
    recommended: "अनुशंसित स्टॉक",
    trend: "खपत प्रवृत्ति",
    stable: "स्थिर",
    increasing: "बढ़ रहा है",
    decreasing: "घट रहा है",
    logout: "लॉग आउट",
    welcome: "नमस्ते, व्यवस्थापक",
    runSecurityBtn: "सुरक्षा ऑडिट शुरू करें",
    runningSecurity: "सुरक्षा ऑडिट मूल्यांकन चल रहा है...",
    fraudPanelTitle: "प्रशासनिक सुरक्षा ऑडिट",
    fraudPanelDesc: "डेटाबेस संशोधनों, असामान्य संग्रह समय, डुप्लिकेट कार्ड नामांकन और आवंटन से अधिक राशन निकासी के लिए एक बहु-स्तरीय सुरक्षा स्कैन निष्पादित करें।",
    mlForecastingTitle: "क्षेत्रीय आवंटन पूर्वानुमान",
    mlForecastingDesc: "अगले महीने के आवंटन आवश्यकताओं की भविष्यवाणी करने के लिए ऐतिहासिक डिपो लेनदेन का विश्लेषण करें।",
    generateForecastBtn: "मांग पूर्वानुमान उत्पन्न करें",
    forecastingDetails: "अनुशंसित मासिक अनाज आवंटन (टन)",
    ledgerTitle: "सक्रिय क्रिप्टोग्राफिक लेनदेन श्रृंखला (नवीनतम 50)",
    ledgerSub: "डिजिटल सीलबंद",
  }
};

export default function AdminDashboard({ user, navigate, lang, toggleLang }) {
  const [tab, setTab] = useState("overview");
  const [txns, setTxns] = useState([]);
  const [chain, setChain] = useState(null);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Grievance states
  const [grievances, setGrievances] = useState([]);
  const [grievanceLoading, setGrievanceLoading] = useState(false);

  // Fraud states
  const [fraud, setFraud] = useState(null);
  const [fraudLoading, setFL] = useState(false);

  // Predictions states
  const [predictions, setPred] = useState(null);
  const [predLoading, setPL] = useState(false);

  // Tampering simulation states
  const [tamperedRecord, setTamperedRecord] = useState(null);
  const [simulatingTamper, setSimulatingTamper] = useState(false);

  // Sync status
  const [syncStatus, setSyncStatus] = useState({
    collections: {
      beneficiaries: { total: 0, pending: 0 },
      dealers: { total: 0, pending: 0 },
      transactions: { total: 0, pending: 0 },
      alerts: { total: 0, pending: 0 },
      grain_reports: { total: 0, pending: 0 }
    },
    cloud_status: "Offline",
    demo_mode: true,
    internet_available: true
  });
  const [syncLoading, setSyncLoading] = useState(false);
  const [autoSync, setAutoSync] = useState(false);

  const fetchLogsAndChain = async () => {
    try {
      const logs = await api.getTransactions(50);
      setTxns(logs.transactions || []);
      const ch = await api.verifyChain();
      setChain(ch);
    } catch (e) {
      console.error("Failed to load audit logs", e);
    }
  };

  const fetchSyncStatus = async () => {
    try {
      const res = await api.getSyncStatus();
      setSyncStatus(res);
    } catch (e) {
      console.error("Failed to load sync status", e);
    }
  };

  const fetchAllGrievances = async () => {
    setGrievanceLoading(true);
    try {
      const res = await api.getAllGrievances();
      setGrievances(res.grievances || []);
    } catch (e) {
      console.error("Failed to fetch grievances", e);
    }
    setGrievanceLoading(false);
  };

  const handleUpdateGrievance = async (id, status) => {
    try {
      await api.updateGrievanceStatus(id, status);
      fetchAllGrievances();
    } catch (e) {
      alert("Failed to update status: " + e.message);
    }
  };

  const handleSync = async () => {
    setSyncLoading(true);
    try {
      const res = await api.syncNow();
      alert(res.message);
      await fetchLogsAndChain();
      await fetchSyncStatus();
    } catch (e) {
      alert("Sync failed: " + e.message);
    }
    setSyncLoading(false);
  };

  useEffect(() => {
    fetchLogsAndChain();
    fetchSyncStatus();
    fetchAllGrievances();
  }, []);

  useEffect(() => {
    if (!autoSync) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.syncNow();
        if (res.synced_count > 0) {
          fetchLogsAndChain();
          fetchSyncStatus();
        }
      } catch (e) {
        console.error("Auto-sync failed", e);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [autoSync]);

  const runFraud = async () => {
    setFL(true);
    setTab("fraud");
    try {
      const res = await api.fraudScan();
      setFraud(res);
    } catch {
      setFraud(MOCK_FRAUD);
    }
    setFL(false);
  };

  const loadPred = async () => {
    setPL(true);
    setTab("predict");
    try {
      const res = await api.predictAll();
      setPred(res);
    } catch {
      setPred(MOCK_PRED);
    }
    setPL(false);
  };

  const handleTamperSimulate = async () => {
    setSimulatingTamper(true);
    try {
      const res = await api.tamperBlockchain();
      if (res.success) {
        setTamperedRecord(res);
        await fetchLogsAndChain();
      } else {
        alert(res.message);
      }
    } catch (e) {
      alert("Tampering failed: " + e.message);
    }
    setSimulatingTamper(false);
  };

  const handleRestoreSimulate = async () => {
    if (!tamperedRecord) return;
    setSimulatingTamper(true);
    try {
      const res = await api.restoreBlockchain(tamperedRecord.tampered_id, tamperedRecord.original_weight);
      if (res.success) {
        setTamperedRecord(null);
        await fetchLogsAndChain();
      } else {
        alert(res.message);
      }
    } catch (e) {
      alert("Restoration failed: " + e.message);
    }
    setSimulatingTamper(false);
  };

  const TABS = [
    { id: "overview", label: t.overview, icon: Globe },
    { id: "transactions", label: t.ledger, icon: List },
    { id: "fraud", label: t.securityAudit, icon: ShieldAlert },
    { id: "predict", label: t.allocationPredictor, icon: TrendingUp },
    { id: "grievances", label: t.grievances, icon: FileText },
  ];

  const chartColors = ["#0F4C81", "#145C9A", "#1E8E3E", "#E06B00"];

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
        
        {/* User Card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">{t.welcome}</span>
          <h4 className="text-white font-bold text-sm mt-0.5 truncate">{user?.full_name}</h4>
          <span className="text-xs text-green-glow font-semibold mt-1.5 block capitalize">{user?.role} Mode</span>
        </div>

        <nav className="sidebar-nav">
          {TABS.map(tTab => {
            const IconComp = tTab.icon;
            return (
              <button
                key={tTab.id}
                className={`sidebar-link ${tab === tTab.id ? "active" : ""}`}
                onClick={() => setTab(tTab.id)}
              >
                <IconComp className="w-4 h-4" /> {tTab.label}
              </button>
            );
          })}
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

      {/* Main Content */}
      <main className="main-content pb-16">
        <Topbar
          title="Staff Supervisory Portal"
          subtitle={`${user?.full_name} · PDS Central Authority`}
          right={
            <div className="flex gap-2 items-center">
              <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border ${
                syncStatus.internet_available 
                  ? "bg-green-soft border-green/20 text-green-dark" 
                  : "bg-red-soft border-red/20 text-red"
              }`}>
                {syncStatus.internet_available ? <Cloud className="w-3.5 h-3.5 text-green" /> : <CloudOff className="w-3.5 h-3.5 text-red" />}
                {syncStatus.internet_available ? "Online" : "Offline"}
              </span>
            </div>
          }
        />

        <div className="max-w-4xl mx-auto px-6 mt-8 w-full">
          {/* TAB: OVERVIEW */}
          {tab === "overview" && (
            <div className="flex flex-col gap-6 fade-in">
              <div className="bg-white border rounded-2xl p-6 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-glow/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b">
                  <div>
                    <h3 className="text-navy font-bold text-base flex items-center gap-2">
                      <Cloud className="w-5 h-5 text-navy" /> {t.syncManager}
                    </h3>
                    <p className="text-text-sub text-xs mt-1">
                      {t.syncDesc}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      className="w-full sm:w-auto font-bold text-xs py-2.5 px-6 rounded-lg bg-green hover:bg-green-dark text-white transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                      onClick={handleSync}
                      disabled={syncLoading}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncLoading ? "animate-spin" : ""}`} /> 
                      {syncLoading ? t.syncing : t.syncNow}
                    </button>
                    
                    <button 
                      className={`w-full sm:w-auto font-bold text-xs py-2.5 px-6 rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                        autoSync 
                          ? "bg-navy text-white border-navy" 
                          : "bg-white text-navy border-border hover:bg-base"
                      }`}
                      onClick={() => setAutoSync(!autoSync)}
                    >
                      <div className={`w-2 h-2 rounded-full ${autoSync ? "bg-green animate-ping" : "bg-muted"}`} />
                      {autoSync ? t.autoSync : t.enableAutoSync}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mt-6 pt-2">
                  {Object.entries({
                    beneficiaries: "Beneficiaries",
                    dealers: "Depot Dealers",
                    transactions: "Transactions",
                    alerts: "Fraud Warnings",
                    grain_reports: "Quality Reports"
                  }).map(([key, label]) => {
                    const info = syncStatus.collections?.[key] || { total: 0, pending: 0 };
                    return (
                      <div key={key} className="bg-base/30 border rounded-xl p-3 flex flex-col justify-between hover:border-navy/10 transition-colors">
                        <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                          {label}
                        </span>
                        <div className="flex justify-between items-baseline mt-2.5">
                          <span className="font-serif text-lg font-bold text-navy">
                            {info.total}
                          </span>
                          {info.pending > 0 ? (
                            <span className="text-[9px] font-bold bg-red-soft text-red px-1.5 py-0.5 rounded">
                              {info.pending} pend
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold bg-green-soft text-green-dark px-1.5 py-0.5 rounded">
                              Synced
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: TRANSACTIONS & CRYPTO LEDGER MONITOR */}
          {tab === "transactions" && (
            <div className="flex flex-col gap-6 fade-in">
              <div className={`border rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6 transition-colors ${
                chain?.status === "tampered" || chain?.status === "broken"
                  ? "bg-red-soft border-red/30 text-red" 
                  : "bg-white border-border"
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full mt-0.5 ${
                    chain?.status === "tampered" || chain?.status === "broken"
                      ? "bg-red/10 text-red" 
                      : "bg-green-soft text-green"
                  }`}>
                    {chain?.status === "tampered" || chain?.status === "broken" ? (
                      <Unlock className="w-6 h-6 animate-pulse" />
                    ) : (
                      <Lock className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-navy text-base">
                      {t.tamperMonitor}
                    </h3>
                    <p className="text-text-sub text-xs mt-1 leading-relaxed max-w-xl">
                      {t.tamperDesc}
                    </p>
                    {chain && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className={`text-[10px] font-bold border px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          chain.status === "verified" 
                            ? "bg-green-soft border-green/20 text-green-dark" 
                            : chain.status === "empty" 
                              ? "bg-navy-soft border-navy/15 text-navy" 
                              : "bg-red-soft border-red/20 text-red font-extrabold"
                        }`}>
                          Verification: {chain.status}
                        </span>
                        {chain.broken_at && (
                          <span className="bg-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Broken at Record #{chain.broken_at}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  {!tamperedRecord ? (
                    <button 
                      className="bg-red hover:bg-red/90 text-white font-bold text-xs py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-1.5"
                      onClick={handleTamperSimulate}
                      disabled={simulatingTamper || txns.length === 0}
                    >
                      <AlertTriangle className="w-4 h-4 text-white" /> {t.tamperSim}
                    </button>
                  ) : (
                    <button 
                      className="bg-green hover:bg-green-dark text-white font-bold text-xs py-3 px-6 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
                      onClick={handleRestoreSimulate}
                      disabled={simulatingTamper}
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" /> {t.tamperRestore}
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-white border rounded-2xl p-6 shadow-xs">
                <div className="flex justify-between items-center mb-5 border-b pb-3">
                  <h4 className="text-navy font-bold text-sm">
                    {t.ledgerTitle}
                  </h4>
                  <span className="text-[10px] uppercase font-bold text-muted bg-base px-2 py-0.5 rounded border">
                    {t.ledgerSub}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-base border-b">
                        <th className="p-3 font-bold text-muted uppercase text-[9.5px]">ID</th>
                        <th className="p-3 font-bold text-muted uppercase text-[9.5px]">Beneficiary</th>
                        <th className="p-3 font-bold text-muted uppercase text-[9.5px]">Area</th>
                        <th className="p-3 font-bold text-muted uppercase text-[9.5px]">Commodity</th>
                        <th className="p-3 font-bold text-muted uppercase text-[9.5px]">Weight</th>
                        <th className="p-3 font-bold text-muted uppercase text-[9.5px]">Timestamp</th>
                        <th className="p-3 font-bold text-muted uppercase text-[9.5px]">Prev Seal</th>
                        <th className="p-3 font-bold text-muted uppercase text-[9.5px]">Seal (Hash)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {txns.map((tRow, i) => {
                        const isRowTampered = tamperedRecord && tRow.id === tamperedRecord.tampered_id;
                        return (
                          <tr 
                            key={i} 
                            className={`border-b last:border-0 hover:bg-base/30 transition-colors ${
                              isRowTampered ? "bg-red-soft/30 hover:bg-red-soft/50" : ""
                            }`}
                          >
                            <td className="p-3 font-mono font-bold text-navy">#{tRow.id}</td>
                            <td className="p-3 font-semibold text-text">{tRow.user_id}</td>
                            <td className="p-3 text-text-sub">{tRow.area}</td>
                            <td className="p-3 font-medium">{tRow.item || "Rice"}</td>
                            <td className={`p-3 font-mono font-bold ${isRowTampered ? "text-red text-sm" : "text-navy"}`}>
                              {parseFloat(tRow.weight).toFixed(2)} kg
                              {isRowTampered && <span className="block text-[9px] font-bold font-sans text-red-dark">Altered!</span>}
                            </td>
                            <td className="p-3 text-muted text-[11px]">{tRow.timestamp}</td>
                            <td className="p-3 font-mono text-[9px] text-muted">
                              {(tRow.prev_hash || "0").slice(0, 10)}…
                            </td>
                            <td className={`p-3 font-mono text-[9px] ${isRowTampered ? "text-red font-bold" : "text-muted"}`}>
                              {(tRow.current_hash || "").slice(0, 12)}…
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SECURITY AUDIT FLAGS */}
          {tab === "fraud" && (
            <div className="flex flex-col gap-6 fade-in">
              {fraudLoading && (
                <div className="bg-white border rounded-2xl p-16 text-center shadow-xs">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-green" />
                  <h3 className="font-bold text-navy text-sm">{t.runningSecurity}</h3>
                </div>
              )}

              {!fraudLoading && !fraud && (
                <div className="bg-white border rounded-2xl p-16 text-center shadow-xs flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-navy-soft text-navy flex items-center justify-center mb-4">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-navy text-sm mb-1">
                    {t.fraudPanelTitle}
                  </h3>
                  <p className="text-xs text-muted max-w-sm mb-5 leading-normal">
                    {t.fraudPanelDesc}
                  </p>
                  <button 
                    className="bg-navy hover:bg-navy-mid text-white font-bold text-xs py-3 px-6 rounded-lg transition-colors"
                    onClick={runFraud}
                  >
                    {t.runSecurityBtn}
                  </button>
                </div>
              )}

              {!fraudLoading && fraud && (
                <>
                  <div className="grid grid-cols-3 gap-5">
                    {[
                      { label: "Flagged Outliers", value: fraud.total_alerts, red: fraud.total_alerts > 0 },
                      { label: t.riskRating, value: fraud.overall_severity, red: ["HIGH", "CRITICAL"].includes(fraud.overall_severity) },
                      { label: t.integrity, value: `${fraud.checks?.behavioural_ai?.integrity_pct || 94}%`, red: false },
                    ].map((s, i) => (
                      <div 
                        key={i} 
                        className={`bg-white border border-t-4 rounded-xl p-5 shadow-xs flex flex-col justify-between ${
                          s.red ? "border-t-red border-x-border border-b-border" : "border-t-green border-x-border border-b-border"
                        }`}
                      >
                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1">
                          {s.label}
                        </span>
                        <span className={`text-xl font-bold font-serif ${
                          s.red ? "text-red animate-pulse" : "text-navy"
                        }`}>
                          {s.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {Object.entries(fraud.checks || {}).map(([key, check]) => {
                    const hasAlert = check.alert || check.flagged_count > 0;
                    return (
                      <div 
                        key={key} 
                        className={`bg-white border border-l-4 rounded-xl p-6 shadow-xs ${
                          hasAlert ? "border-l-red border-y-border border-r-border" : "border-l-green border-y-border border-r-border"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-4 pb-2 border-b">
                          <div>
                            <h4 className="font-bold text-navy text-sm uppercase tracking-wide">
                              {key.replace(/_/g, " ")} Audit
                            </h4>
                            <span className="text-xs text-text-sub mt-0.5 block leading-normal font-medium">
                              {check.message || `${check.flagged_count || 0} flagged outliers.`}
                            </span>
                          </div>
                          <span className={`text-[9px] font-bold border px-2.5 py-0.5 rounded-full uppercase ${
                            hasAlert 
                              ? "bg-red-soft border-red/20 text-red" 
                              : "bg-green-soft border-green/25 text-green"
                          }`}>
                            {hasAlert ? "Flagged Action" : "Passed"}
                          </span>
                        </div>

                        {check.flagged?.length > 0 && (
                          <div className="overflow-x-auto border rounded-lg">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-base border-b">
                                  <th className="p-2.5 font-bold text-muted uppercase text-[9.5px]">User Identity</th>
                                  <th className="p-2.5 font-bold text-muted uppercase text-[9.5px]">FPS Area</th>
                                  <th className="p-2.5 font-bold text-muted uppercase text-[9.5px]">Metric</th>
                                  <th className="p-2.5 font-bold text-muted uppercase text-[9.5px]">Anomaly Flag</th>
                                  <th className="p-2.5 font-bold text-muted uppercase text-[9.5px]">Risk Level</th>
                                </tr>
                              </thead>
                              <tbody>
                                {check.flagged.map((f, i) => (
                                  <tr key={i} className="border-b last:border-0 hover:bg-base/20 transition-colors">
                                    <td className="p-2.5 font-semibold text-navy">{f.user_id || f.user || f.mobile}</td>
                                    <td className="p-2.5 text-text-sub font-medium">{f.area}</td>
                                    <td className="p-2.5 font-mono">{f.weight ? `${f.weight} kg` : f.min_gap_s ? `${f.min_gap_s}s gap` : "—"}</td>
                                    <td className="p-2.5 text-red font-semibold leading-normal">
                                      {Array.isArray(f.reasons) ? f.reasons.join(" · ") : f.reason}
                                    </td>
                                    <td className="p-2.5">
                                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                        f.severity === "HIGH" || f.severity === "CRITICAL"
                                          ? "bg-red-soft text-red"
                                          : "bg-amber-soft text-amber"
                                      }`}>
                                        {f.severity || "HIGH"}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* TAB: ML DEMAND FORECASTING */}
          {tab === "predict" && (
            <div className="flex flex-col gap-6 fade-in">
              {predLoading && (
                <div className="bg-white border rounded-2xl p-16 text-center shadow-xs">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-green" />
                  <h3 className="font-bold text-navy text-sm font-serif">Analyzing Consumption Outliers...</h3>
                </div>
              )}

              {!predLoading && !predictions && (
                <div className="bg-white border rounded-2xl p-16 text-center shadow-xs flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-green-soft text-green flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-navy text-sm mb-1">
                    {t.mlForecastingTitle}
                  </h3>
                  <p className="text-xs text-muted max-w-sm mb-5 leading-normal">
                    {t.mlForecastingDesc}
                  </p>
                  <button 
                    className="bg-navy hover:bg-navy-mid text-white font-bold text-xs py-3 px-6 rounded-lg transition-colors"
                    onClick={loadPred}
                  >
                    {t.generateForecastBtn}
                  </button>
                </div>
              )}

              {!predLoading && predictions && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {predictions.map((p, i) => {
                      const isUp = p.trend === "increasing";
                      const isDown = p.trend === "decreasing";
                      
                      const chartData = (p.history || []).map(h => ({
                        month: h.month,
                        weight: parseFloat((h.total_weight / 1000).toFixed(1)),
                        users: h.unique_users
                      }));
                      
                      chartData.push({
                        month: "Next Month",
                        weight: parseFloat((p.recommended_kg / 1000).toFixed(1)),
                        users: p.beneficiaries_est
                      });

                      return (
                        <div key={i} className="bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-4 border-b pb-2">
                              <div>
                                <h4 className="font-bold text-navy text-sm block">
                                  {p.area} Depot
                                </h4>
                                <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold border px-2 py-0.5 rounded-full mt-1.5 ${
                                  isUp 
                                    ? "bg-red-soft border-red/15 text-red" 
                                    : isDown 
                                      ? "bg-green-soft border-green/15 text-green-dark" 
                                      : "bg-navy-soft border-navy/15 text-navy"
                                }`}>
                                  {isUp ? `↑ ${t.increasing} (${p.trend_pct}%)` : isDown ? `↓ ${t.decreasing} (${p.trend_pct}%)` : `→ ${t.stable} (${p.trend_pct}%)`}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-[9px] font-bold text-muted uppercase tracking-widest block">
                                  {t.recommended}
                                </span>
                                <span className="text-xl font-bold text-green block">
                                  {(p.recommended_kg / 1000).toFixed(1)} Tons
                                </span>
                              </div>
                            </div>

                            <div className="h-32 my-3">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                  <XAxis dataKey="month" tick={{ fontSize: 8, fill: "#4B5563" }} stroke="#D1D5DB" />
                                  <YAxis tick={{ fontSize: 8, fill: "#4B5563" }} stroke="#D1D5DB" />
                                  <Tooltip contentStyle={{ fontSize: 9 }} />
                                  <Area 
                                    type="monotone" 
                                    dataKey="weight" 
                                    stroke={chartColors[i % 4]} 
                                    fillOpacity={0.1} 
                                    fill={chartColors[i % 4]} 
                                    strokeWidth={2}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5 mt-4">
                              {[
                                { label: "Base Forecast", value: `${(p.predicted_kg / 1000).toFixed(1)} T` },
                                { label: "Buffer (8%)", value: `${(p.recommended_kg / 1000).toFixed(1)} T` },
                                { label: t.activeUsers, value: p.beneficiaries_est?.toLocaleString() },
                                { label: t.perCapita, value: `${p.per_capita_kg} kg` },
                              ].map((m, j) => (
                                <div key={j} className="bg-base/30 border rounded-lg p-2 flex flex-col">
                                  <span className="text-[9px] font-bold text-muted uppercase tracking-wide">
                                    {m.label}
                                  </span>
                                  <span className="text-xs font-bold text-navy mt-0.5">
                                    {m.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-white border rounded-2xl p-6 shadow-xs">
                    <h3 className="text-navy font-bold text-sm mb-5 border-b pb-2">
                      {t.forecastingDetails}
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={predictions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                          <XAxis dataKey="area" tick={{ fontSize: 11, fill: "#4B5563" }} stroke="#D1D5DB" />
                          <YAxis tick={{ fontSize: 11, fill: "#4B5563" }} stroke="#D1D5DB" />
                          <Tooltip formatter={(value) => [`${(value/1000).toFixed(1)} Tons`, "Recommended"]} />
                          <Bar dataKey="recommended_kg" radius={[4, 4, 0, 0]}>
                            {predictions.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={chartColors[index % 4]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB: CITIZEN GRIEVANCE RESOLUTION PANEL */}
          {tab === "grievances" && (
            <div className="card shadow-xs fade-in">
              <div className="flex justify-between items-center border-b pb-3 mb-5">
                <div>
                  <h3 className="text-navy font-bold text-sm uppercase tracking-wide">
                    {t.grievances}
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    Review and resolve grievances submitted by beneficiaries.
                  </p>
                </div>
                <button 
                  onClick={fetchAllGrievances}
                  className="btn btn-outline btn-sm flex items-center gap-1.5"
                  disabled={grievanceLoading}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${grievanceLoading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>

              {grievanceLoading && (
                <div className="text-center py-10 text-muted text-xs">
                  Loading citizen grievances...
                </div>
              )}

              {!grievanceLoading && grievances.length === 0 && (
                <div className="text-center py-12 text-muted text-xs">
                  {t.noGrievances}
                </div>
              )}

              {!grievanceLoading && grievances.length > 0 && (
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-base border-b">
                        <th className="p-3 font-bold text-muted uppercase text-[9.5px]">ID</th>
                        <th className="p-3 font-bold text-muted uppercase text-[9.5px]">{t.user}</th>
                        <th className="p-3 font-bold text-muted uppercase text-[9.5px]">{t.category}</th>
                        <th className="p-3 font-bold text-muted uppercase text-[9.5px]">{t.message}</th>
                        <th className="p-3 font-bold text-muted uppercase text-[9.5px]">Date</th>
                        <th className="p-3 font-bold text-muted uppercase text-[9.5px]">{t.status}</th>
                        <th className="p-3 font-bold text-muted uppercase text-[9.5px] text-center">{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grievances.map((g) => (
                        <tr key={g.id} className="border-b last:border-0 hover:bg-base/30 transition-colors">
                          <td className="p-3 font-mono font-bold text-navy">#{g.id}</td>
                          <td className="p-3 font-semibold text-text">{g.user_id}</td>
                          <td className="p-3 font-medium text-navy">{g.category}</td>
                          <td className="p-3 text-text-sub italic leading-relaxed max-w-[200px] truncate" title={g.message}>
                            "{g.message}"
                          </td>
                          <td className="p-3 text-muted text-[11px] whitespace-nowrap">{g.created_at || "—"}</td>
                          <td className="p-3">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                              g.status === "Resolved" 
                                ? "bg-green-soft border-green/20 text-green-dark" 
                                : g.status === "Under Review" 
                                  ? "bg-amber-soft border-gold-border/20 text-gold" 
                                  : "bg-blue-soft border-blue/20 text-blue"
                            }`}>
                              {g.status}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex gap-1.5 justify-center">
                              {g.status !== "Under Review" && g.status !== "Resolved" && (
                                <button
                                  onClick={() => handleUpdateGrievance(g.id, "Under Review")}
                                  className="bg-white hover:bg-base text-navy border border-border text-[9.5px] font-bold px-2 py-1 rounded transition-colors"
                                >
                                  {t.reviewBtn}
                                </button>
                              )}
                              {g.status !== "Resolved" && (
                                <button
                                  onClick={() => handleUpdateGrievance(g.id, "Resolved")}
                                  className="bg-green hover:bg-green-dark text-white text-[9.5px] font-bold px-2 py-1 rounded transition-colors"
                                >
                                  {t.resolvedBtn}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
const MOCK_TXNS = [
  { id: 47, user_id: "RL-BENE-1092", area: "Delhi", item: "Rice", weight: 34.25, timestamp: "2026-06-24 11:51:20", status: "Collected", current_hash: "a3f92bc1d0abcc73", prev_hash: "7d0d0c3ab8792cc4" },
  { id: 46, user_id: "RL-BENE-3042", area: "Jaipur", item: "Wheat", weight: 20.60, timestamp: "2026-06-24 10:31:05", status: "Collected", current_hash: "9d4e1f7c35bc7d0e", prev_hash: "0ab87c12f273adcc" },
  { id: 45, user_id: "RL-BENE-2201", area: "Noida", item: "Rice", weight: 6.15, timestamp: "2026-06-24 09:21:40", status: "Collected", current_hash: "b82ca3d0473aed82", prev_hash: "a8e8f237bc902c38" },
  { id: 44, user_id: "RL-BENE-9011", area: "Sri Ganganagar", item: "Wheat", weight: 10.50, timestamp: "2026-06-24 08:11:15", status: "Collected", current_hash: "c91f4e8a27d2c3ab", prev_hash: "d7f1d2c37e81ccad" },
];

const MOCK_FRAUD = {
  scan_time: "2026-06-24 14:30:00",
  total_alerts: 4,
  overall_severity: "HIGH",
  checks: {
    db_tampering: { type: "db_tampering", status: "verified", message: "Ledger validation succeeded. SHA-256 seal verified.", alert: false, severity: "OK", flagged: [] },
    behavioural_ai: {
      type: "behavioural_ai",
      flagged_count: 2,
      alert: true,
      flagged: [
        { user_id: "RL-BENE-1092", area: "Delhi", weight: 34.25, reasons: ["Abnormal time gap: 4648s", "Near-maximum weight collected"], severity: "HIGH" },
        { user_id: "RL-BENE-2287", area: "Delhi", weight: 2.10, reasons: ["Suspiciously low weight collected"], severity: "MEDIUM" },
      ]
    },
    fake_ids: { type: "fake_id", flagged_count: 0, alert: false, flagged: [] },
    rapid_collection: {
      type: "rapid_collection",
      flagged_count: 2,
      alert: true,
      flagged: [
        { user_id: "RL-BENE-2201", area: "Noida", min_gap_s: 18, reason: "Multiple quota collections inside 1 hour", severity: "HIGH" }
      ]
    },
    over_allocation: { type: "over_allocation", flagged_count: 0, alert: false, flagged: [] }
  }
};

const MOCK_PRED = [
  { 
    area: "Delhi", predicted_kg: 92400, recommended_kg: 99792, trend: "increasing", trend_pct: 5.2, beneficiaries_est: 18850, per_capita_kg: 5.3,
    history: [
      { month: "2026-01", total_weight: 88000, unique_users: 17200 },
      { month: "2026-02", total_weight: 89500, unique_users: 17500 },
      { month: "2026-03", total_weight: 91000, unique_users: 17900 },
      { month: "2026-04", total_weight: 92400, unique_users: 18100 },
      { month: "2026-05", total_weight: 93800, unique_users: 18450 }
    ]
  },
  { 
    area: "Noida", predicted_kg: 24800, recommended_kg: 26784, trend: "stable", trend_pct: 0.4, beneficiaries_est: 4770, per_capita_kg: 5.6,
    history: [
      { month: "2026-01", total_weight: 23200, unique_users: 4100 },
      { month: "2026-02", total_weight: 24000, unique_users: 4300 },
      { month: "2026-03", total_weight: 24200, unique_users: 4350 },
      { month: "2026-04", total_weight: 24500, unique_users: 4500 },
      { month: "2026-05", total_weight: 24650, unique_users: 4600 }
    ]
  },
  { 
    area: "Jaipur", predicted_kg: 80600, recommended_kg: 87048, trend: "increasing", trend_pct: 3.1, beneficiaries_est: 15500, per_capita_kg: 5.6,
    history: [
      { month: "2026-01", total_weight: 76000, unique_users: 14100 },
      { month: "2026-02", total_weight: 78500, unique_users: 14500 },
      { month: "2026-03", total_weight: 79000, unique_users: 14600 },
      { month: "2026-04", total_weight: 80200, unique_users: 15000 },
      { month: "2026-05", total_weight: 80600, unique_users: 15120 }
    ]
  },
  { 
    area: "Sri Ganganagar", predicted_kg: 18200, recommended_kg: 19656, trend: "decreasing", trend_pct: -2.1, beneficiaries_est: 3500, per_capita_kg: 5.6,
    history: [
      { month: "2026-01", total_weight: 19800, unique_users: 3800 },
      { month: "2026-02", total_weight: 19400, unique_users: 3750 },
      { month: "2026-03", total_weight: 19100, unique_users: 3700 },
      { month: "2026-04", total_weight: 18800, unique_users: 3600 },
      { month: "2026-05", total_weight: 18400, unique_users: 3520 }
    ]
  },
];

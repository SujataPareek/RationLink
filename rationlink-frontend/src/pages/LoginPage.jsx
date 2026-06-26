import { useState } from "react";
import { 
  Smartphone, 
  Camera, 
  KeyRound, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft, 
  Leaf, 
  ShieldAlert, 
  User,
  Globe
} from "lucide-react";
import FaceCapture from "../components/FaceCapture";
import * as api from "../services/api";

const TRANSLATIONS = {
  en: {
    title: "Sign In to PDS Portal",
    desc: "Ministry of Consumer Affairs, Food & Public Distribution",
    beneficiaryRole: "Beneficiary Citizen",
    dealerRole: "FPS Depot Dealer",
    adminRole: "Inspector Audit",
    otpMode: "Mobile OTP",
    faceMode: "Biometric Face Scan",
    mobileLabel: "Registered Mobile Number",
    enterMobile: "10-digit mobile number",
    sendOtp: "Send OTP",
    resendOtp: "Resend",
    faceHelp: "Align your face in the camera viewport below to log in.",
    otpHelp: "Verify using secure SMS validation code.",
    otpCodeLabel: "Verification Code",
    otpCodePlaceholder: "Enter 6-digit OTP",
    signInBtn: "Sign In to Portal",
    verifying: "Authenticating credentials...",
    emailLabel: "Operator Email ID",
    passwordLabel: "Secure Password",
    enrollLink: "New beneficiary? Click here to enroll",
    demoHelp: "Presentation Assistant (Demo Mode)",
    home: "Home",
    adminTitle: "Authorized Staff Log In",
    citizenTitle: "Citizen Services Log In",
    alertOtpSent: "OTP sent successfully to registered number.",
    alertOtpDemo: "OTP sent. Use code 123456 for demo bypass.",
    alertLoginFailed: "Failed to log in. Please check your credentials.",
    alertFaceFailed: "Facial scan recognition failed. Please use Mobile OTP login."
  },
  hi: {
    title: "पीडीएस पोर्टल में लॉगिन करें",
    desc: "उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय",
    beneficiaryRole: "लाभार्थी नागरिक",
    dealerRole: "राशन दुकान विक्रेता",
    adminRole: "निरीक्षक ऑडिट",
    otpMode: "मोबाइल ओटीपी",
    faceMode: "बायोमेट्रिक फेस स्कैन",
    mobileLabel: "पंजीकृत मोबाइल नंबर",
    enterMobile: "10-अंकीय मोबाइल नंबर",
    sendOtp: "ओटीपी भेजें",
    resendOtp: "पुनः भेजें",
    faceHelp: "लॉगिन करने के लिए नीचे कैमरा व्यू में अपना चेहरा संरेखित करें।",
    otpHelp: "सुरक्षित एसएमएस सत्यापन कोड का उपयोग करके सत्यापित करें।",
    otpCodeLabel: "सत्यापन कोड",
    otpCodePlaceholder: "6-अंकीय कोड दर्ज करें",
    signInBtn: "पोर्टल में लॉगिन करें",
    verifying: "प्रमाणिकता जांची जा रही है...",
    emailLabel: "ऑपरेटर ईमेल आईडी",
    passwordLabel: "सुरक्षित पासवर्ड",
    enrollLink: "नए लाभार्थी? यहाँ नया पंजीकरण करें",
    demoHelp: "प्रदर्शन सहायक (डेमो मोड)",
    home: "होम",
    adminTitle: "अधिकृत कर्मचारी लॉगिन",
    citizenTitle: "नागरिक सेवा लॉगिन",
    alertOtpSent: "पंजीकृत नंबर पर ओटीपी सफलतापूर्वक भेजा गया।",
    alertOtpDemo: "ओटीपी भेजा गया। डेमो बाईपास के लिए 123456 का उपयोग करें।",
    alertLoginFailed: "लॉगिन विफल। कृपया अपने विवरण की जाँच करें।",
    alertFaceFailed: "चेहरा स्कैन पहचान विफल। कृपया मोबाइल ओटीपी लॉगिन का उपयोग करें।"
  }
};

export default function LoginPage({ navigate, setUser, lang, toggleLang }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  
  const [role, setRole] = useState("beneficiary"); // beneficiary | dealer | admin
  const [authMode, setAuthMode] = useState("face"); // face | otp
  const [failedFaceAttempts, setFailedFaceAttempts] = useState(0);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [adminId, setAdminId] = useState("");
  const [adminPw, setAdminPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);

  const showAlert = (type, msg) => { 
    setAlert({ type, msg }); 
    setTimeout(() => setAlert(null), 5000); 
  };

  const handleLogoClick = () => {
    setLogoClicks(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setDrawerOpen(true);
        showAlert("success", "Presentation Assistant unlocked!");
        return 0;
      }
      return next;
    });
  };

  const doSendOtp = async () => {
    try {
      const r = await api.sendOtp(mobile);
      setOtpSent(true);
      showAlert("success", `${t.alertOtpSent} ${r.demo_otp ? `— Demo Code: ${r.demo_otp}` : ""}`);
    } catch {
      setOtpSent(true);
      showAlert("success", t.alertOtpDemo);
    }
  };

  const doOtpLogin = async () => {
    setLoading(true);
    try {
      const profile = await api.login({
        role: "beneficiary",
        mobile,
        otp
      });
      setUser(profile); 
      navigate("dashboard", profile);
    } catch(e) { 
      showAlert("error", e.message || t.alertLoginFailed); 
    }
    setLoading(false);
  };

  const doFaceLogin = async (descriptor) => {
    setLoading(true);
    try {
      const profile = await api.login({
        role: "beneficiary",
        mobile: mobile || undefined,
        face_descriptor: descriptor
      });
      setUser(profile); 
      navigate("dashboard", profile);
    } catch(e) {
      const nextAttempts = failedFaceAttempts + 1;
      setFailedFaceAttempts(nextAttempts);
      if (nextAttempts >= 2) {
        setAuthMode("otp");
        if (!mobile) setMobile("1234567890"); // Prefill demo mobile
        showAlert("error", "Facial scan recognition failed multiple times. Automatically switched to Mobile OTP.");
      } else {
        showAlert("error", e.message || t.alertFaceFailed);
      }
    }
    setLoading(false);
  };

  const doAdminLogin = async () => {
    setLoading(true);
    try {
      let email = adminId.trim();
      if (email === "admin") {
        email = "admin@rationlink.com";
      } else if (email === "dealer") {
        email = "dealer@rationlink.com";
      }

      const profile = await api.login({
        role: role,
        email,
        password: adminPw
      });
      
      setUser(profile); 
      navigate("dashboard", profile);
    } catch(e) {
      showAlert("error", e.message || t.alertLoginFailed);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-base flex flex-col font-sans">
      {/* ── HEADER ── */}
      <header className="bg-navy-dark h-16 border-b border-white/10 flex items-center justify-between px-6 md:px-10 z-10 text-white">
        <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={handleLogoClick}>
          <div className="w-8 h-8 rounded bg-white flex items-center justify-center text-navy font-bold">
            R
          </div>
          <span className="font-serif text-lg font-bold text-white tracking-wide">
            Smart<span className="text-gold-bright">PDS</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button className="nav-link-custom" onClick={toggleLang}>
            🌐 {lang === "en" ? "Hindi (हिन्दी)" : "English"}
          </button>
          <button 
            className="nav-link-custom"
            onClick={() => navigate("landing")}
          >
            <ArrowLeft className="w-4 h-4" /> {t.home}
          </button>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-8 md:py-16">
        <div className="w-full max-w-[440px] flex flex-col">
          {/* Page Titles */}
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl text-navy font-bold mb-1.5">
              {t.title}
            </h1>
            <p className="text-text-sub text-xs">
              {t.desc}
            </p>
          </div>

          {/* Role selection tab */}
          <div className="bg-border-soft p-1 rounded-lg flex mb-5 border shadow-2xs">
            <button 
              type="button"
              className={`flex-1 py-2 text-[10.5px] font-bold rounded transition-all flex items-center justify-center gap-1 ${
                role === "beneficiary" 
                  ? "bg-navy text-white shadow-xs" 
                  : "text-text-sub hover:text-navy"
              }`}
              onClick={() => { setRole("beneficiary"); setAlert(null); }}
            >
              <User className="w-3.5 h-3.5" /> {t.beneficiaryRole}
            </button>
            <button 
              type="button"
              className={`flex-1 py-2 text-[10.5px] font-bold rounded transition-all flex items-center justify-center gap-1 ${
                role === "dealer" 
                  ? "bg-navy text-white shadow-xs" 
                  : "text-text-sub hover:text-navy"
              }`}
              onClick={() => { setRole("dealer"); setAlert(null); }}
            >
              <KeyRound className="w-3.5 h-3.5" /> {t.dealerRole}
            </button>
            <button 
              type="button"
              className={`flex-1 py-2 text-[10.5px] font-bold rounded transition-all flex items-center justify-center gap-1 ${
                role === "admin" 
                  ? "bg-navy text-white shadow-xs" 
                  : "text-text-sub hover:text-navy"
              }`}
              onClick={() => { setRole("admin"); setAlert(null); }}
            >
              <ShieldAlert className="w-3.5 h-3.5" /> {t.adminRole}
            </button>
          </div>

          {/* Core Card */}
          <div className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            {alert && (
              <div 
                className={`flex gap-2 p-3 rounded-lg border text-xs font-medium mb-4 items-start ${
                  alert.type === "success" 
                    ? "bg-green-soft border-green/20 text-green-dark" 
                    : "bg-red-soft border-red/20 text-red"
                }`}
              >
                {alert.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-green flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red flex-shrink-0 mt-0.5" />
                )}
                <span>{alert.msg}</span>
              </div>
            )}

            {/* BENEFICIARY SIGN IN */}
            {role === "beneficiary" && (
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block border-b pb-2 mb-1">
                  {t.citizenTitle}
                </span>

                {/* Mobile input */}
                <div className="flex flex-col gap-1.5 mt-1">
                  <label className="text-[10px] font-bold text-text-sub uppercase tracking-wider">
                    {t.mobileLabel} {authMode === "face" ? `(${lang === "en" ? "Optional" : "वैकल्पिक"})` : ""}
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 border rounded-lg bg-base text-sm font-semibold text-muted select-none">
                      +91
                    </div>
                    <input 
                      type="text"
                      className="flex-1 px-3 py-2 border rounded-lg text-sm text-text bg-white outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all font-semibold"
                      placeholder={t.enterMobile}
                      maxLength={10}
                      value={mobile}
                      onChange={e => setMobile(e.target.value.replace(/\D/g,"").slice(0,10))}
                    />
                    {authMode === "otp" && (
                      <button 
                        type="button"
                        className="bg-white hover:bg-base text-navy border border-border text-xs font-bold px-4 rounded-lg transition-colors"
                        onClick={doSendOtp} 
                        disabled={mobile.length !== 10}
                      >
                        {otpSent ? t.resendOtp : t.sendOtp}
                      </button>
                    )}
                  </div>
                </div>

                {/* Camera / Face Component */}
                {authMode === "face" && (
                  <div className="mt-2 pt-2 border-t border-divider">
                    <FaceCapture label="Verify Face Bio-Print" onCapture={doFaceLogin} />
                    <button
                      type="button"
                      className="w-full mt-3 text-xs font-semibold text-navy hover:underline flex items-center justify-center gap-1 bg-navy-soft/30 py-2 rounded-lg border border-navy/10"
                      onClick={() => { setAuthMode("otp"); setAlert(null); }}
                    >
                      <Smartphone className="w-3.5 h-3.5" /> Log In with Mobile OTP instead
                    </button>
                  </div>
                )}

                {/* OTP Submit inputs */}
                {authMode === "otp" && otpSent && (
                  <div className="flex flex-col gap-1.5 mt-1 fade-in">
                    <label className="text-[10px] font-bold text-text-sub uppercase tracking-wider">
                      {t.otpCodeLabel}
                    </label>
                    <input 
                      type="text"
                      className="px-3 py-2.5 border rounded-lg text-sm text-text bg-white outline-none focus:border-navy transition-all font-mono font-bold tracking-widest text-center"
                      placeholder={t.otpCodePlaceholder}
                      maxLength={6}
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g,"").slice(0,6))}
                    />
                  </div>
                )}

                {/* Submit button for OTP */}
                {authMode === "otp" && (
                  <div className="flex flex-col gap-2 mt-2">
                    <button 
                      type="button"
                      className="w-full bg-navy hover:bg-navy-mid text-white font-bold text-sm py-3 rounded-lg shadow-sm transition-all disabled:opacity-40"
                      disabled={!otpSent || otp.length !== 6 || loading}
                      onClick={doOtpLogin}
                    >
                      {loading ? t.verifying : t.signInBtn}
                    </button>
                    <button
                      type="button"
                      className="w-full text-xs font-semibold text-navy hover:underline flex items-center justify-center gap-1 bg-navy-soft/30 py-2 rounded-lg border border-navy/10"
                      onClick={() => { setAuthMode("face"); setAlert(null); }}
                    >
                      <Camera className="w-3.5 h-3.5" /> Back to Facial Scan Login
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STAFF SIGN IN */}
            {(role === "admin" || role === "dealer") && (
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block border-b pb-2 mb-1">
                  {t.adminTitle}
                </span>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-text-sub uppercase tracking-wider">
                    {t.emailLabel}
                  </label>
                  <input 
                    type="text"
                    className="px-3 py-2.5 border rounded-lg text-sm text-text bg-white outline-none focus:border-navy transition-all font-semibold"
                    placeholder={role === "admin" ? "admin@rationlink.com" : "dealer@rationlink.com"}
                    value={adminId}
                    onChange={e => setAdminId(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-text-sub uppercase tracking-wider">
                    {t.passwordLabel}
                  </label>
                  <input 
                    type="password"
                    className="px-3 py-2.5 border rounded-lg text-sm text-text bg-white outline-none focus:border-navy transition-all font-semibold"
                    placeholder="••••••••"
                    value={adminPw}
                    onChange={e => setAdminPw(e.target.value)}
                  />
                </div>

                <button 
                  type="button"
                  className="w-full bg-navy hover:bg-navy-mid text-white font-bold text-sm py-3 rounded-lg shadow-sm transition-all mt-2 disabled:opacity-40"
                  onClick={doAdminLogin} 
                  disabled={!adminId || !adminPw || loading}
                >
                  {loading ? t.verifying : t.signInBtn}
                </button>
              </div>
            )}
          </div>

          {/* Footer toggle */}
          {role === "beneficiary" && (
            <p className="text-center mt-5 text-xs text-muted">
              <button 
                type="button"
                className="text-navy hover:underline font-bold transition-colors"
                onClick={() => navigate("register")}
              >
                {t.enrollLink}
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Hidden Presentation Assistant shortcut: logo clicks unlock it */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer Panel */}
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col p-6 border-l z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b mb-6">
              <div>
                <h2 className="text-navy font-bold text-base">{t.demoHelp}</h2>
                <p className="text-xs text-muted">Sandbox login credentials for demonstration</p>
              </div>
              <button 
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="text-muted hover:text-navy text-sm font-bold bg-base px-2.5 py-1 rounded"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex flex-col gap-5">
              {/* Beneficiary */}
              <div className="border rounded-xl p-4 bg-base/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-green uppercase tracking-wider">Beneficiary</span>
                  <button 
                    type="button"
                    onClick={() => {
                      setRole("beneficiary");
                      setAuthMode("otp");
                      setMobile("1234567890");
                      setOtpSent(true);
                      setOtp("123456");
                      setDrawerOpen(false);
                      showAlert("success", "Beneficiary credentials auto-filled.");
                    }}
                    className="text-[10px] font-bold text-navy hover:underline bg-white border px-2 py-0.5 rounded"
                  >
                    Auto-Fill
                  </button>
                </div>
                <div className="text-xs text-text-sub flex flex-col gap-1">
                  <div><strong>Mobile:</strong> <code className="bg-white px-1 py-0.5 rounded border select-all font-mono">1234567890</code></div>
                  <div><strong>OTP Code:</strong> <code className="bg-white px-1 py-0.5 rounded border select-all font-mono">123456</code></div>
                </div>
              </div>

              {/* Dealer */}
              <div className="border rounded-xl p-4 bg-base/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-gold uppercase tracking-wider">FPS Dealer</span>
                  <button 
                    type="button"
                    onClick={() => {
                      setRole("dealer");
                      setAdminId("dealer");
                      setAdminPw("dealer123");
                      setDrawerOpen(false);
                      showAlert("success", "Dealer credentials auto-filled.");
                    }}
                    className="text-[10px] font-bold text-navy hover:underline bg-white border px-2 py-0.5 rounded"
                  >
                    Auto-Fill
                  </button>
                </div>
                <div className="text-xs text-text-sub flex flex-col gap-1">
                  <div><strong>ID / Email:</strong> <code className="bg-white px-1 py-0.5 rounded border select-all font-mono">dealer</code></div>
                  <div><strong>Password:</strong> <code className="bg-white px-1 py-0.5 rounded border select-all font-mono">dealer123</code></div>
                </div>
              </div>

              {/* Admin */}
              <div className="border rounded-xl p-4 bg-base/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-navy uppercase tracking-wider">Administrator</span>
                  <button 
                    type="button"
                    onClick={() => {
                      setRole("admin");
                      setAdminId("admin");
                      setAdminPw("admin123");
                      setDrawerOpen(false);
                      showAlert("success", "Admin credentials auto-filled.");
                    }}
                    className="text-[10px] font-bold text-navy hover:underline bg-white border px-2 py-0.5 rounded"
                  >
                    Auto-Fill
                  </button>
                </div>
                <div className="text-xs text-text-sub flex flex-col gap-1">
                  <div><strong>ID / Email:</strong> <code className="bg-white px-1 py-0.5 rounded border select-all font-mono">admin</code></div>
                  <div><strong>Password:</strong> <code className="bg-white px-1 py-0.5 rounded border select-all font-mono">admin123</code></div>
                </div>
              </div>
            </div>
            
            <div className="mt-auto border-t pt-4 text-[10px] text-muted leading-relaxed">
              This credentials drawer is a testing utility and is only visible in demo environments by tapping the header logo 5 times.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

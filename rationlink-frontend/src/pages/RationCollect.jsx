import { useState } from "react";
import { 
  Check, 
  ShoppingBag, 
  User, 
  Camera, 
  Smartphone, 
  Minus, 
  Plus, 
  Lock, 
  Info, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp
} from "lucide-react";
import Topbar from "../components/Topbar";
import FaceCapture from "../components/FaceCapture";
import * as api from "../services/api";

const RATION_ITEMS = [
  { name: "Fine Rice", maxKg: 15, unit: "kg", rate: "₹ 3 / kg" },
  { name: "Whole Wheat", maxKg: 10, unit: "kg", rate: "₹ 2 / kg" },
  { name: "Refined Sugar", maxKg: 2, unit: "kg", rate: "₹ 13.50 / kg" },
  { name: "Split Pulses (Dal)", maxKg: 2, unit: "kg", rate: "₹ 15 / kg" },
  { name: "Kerosene Oil", maxKg: 2, unit: "L", rate: "Subsidised rates" },
];

export default function RationCollect({ user, navigate }) {
  const [authStep, setAuthStep] = useState("pending"); // pending | verifying | done | failed
  const [authMethod, setAuthMethod] = useState("face");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [items, setItems] = useState(
    RATION_ITEMS.map(i => ({ ...i, selected: false, qty: 0 }))
  );
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [alert, setAlert] = useState(null);

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 5000);
  };

  const remaining = user?.remaining_ration ?? 23;
  const mobile = user?.mobile || user?.user_id;

  /* ── Authentication ── */
  const handleFace = async (descriptor) => {
    setAuthStep("verifying");
    try {
      const r = await api.verifyFace(mobile, descriptor);
      if (r.verified) {
        setAuthStep("done");
        showAlert("success", `Face matched with stored prints (Confidence: ${Math.round(r.score * 100)}%)`);
      } else {
        setAuthStep("failed");
        showAlert("error", `Face mismatch (Confidence score: ${Math.round(r.score * 100)}%). Try OTP fallback.`);
      }
    } catch {
      // Demo sandbox fallback
      setAuthStep("done");
      showAlert("success", "Sandbox verification: face authenticated.");
    }
  };

  const sendOtp = async () => {
    try { 
      await api.sendOtp(mobile); 
    } catch {}
    setOtpSent(true);
    showAlert("success", "OTP sent. Enter code 123456 to verify.");
  };

  const verifyOtp = async () => {
    try { 
      await api.verifyOtp(mobile, otp); 
    } catch { 
      if (otp !== "123456") { 
        showAlert("error", "Invalid OTP."); 
        return; 
      } 
    }
    setAuthStep("done");
    showAlert("success", "Identity confirmed. Proceeding to allocation selection.");
  };

  /* ── Cart Handling ── */
  const toggle = (i) => {
    setItems(p => p.map((it, idx) => 
      idx === i ? { ...it, selected: !it.selected, qty: !it.selected ? 1 : 0 } : it
    ));
  };

  const changeQty = (i, delta) => {
    setItems(p => p.map((it, idx) =>
      idx === i 
        ? { ...it, qty: Math.min(it.maxKg, Math.max(0.5, +(it.qty + delta).toFixed(1))) } 
        : it
    ));
  };

  const selectedItems = items.filter(i => i.selected && i.qty > 0);
  const totalKg = selectedItems.reduce((a, i) => a + (i.unit === "kg" ? i.qty : 0), 0);

  /* ── Submit ── */
  const handleCollect = async () => {
    if (!selectedItems.length) return showAlert("error", "Please select at least one item.");
    if (totalKg > remaining) return showAlert("error", `Ration cart exceeds remaining quota of ${remaining} kg.`);

    setSubmitting(true);
    try {
      const r = await api.collectRation({
        mobile,
        otp_verified: authMethod === "otp",
        items: selectedItems.map(i => ({ name: i.name, kg: i.qty })),
        shop: "FPS Depot — " + (user?.area || "Delhi"),
        area: user?.area || "Delhi",
      });
      
      setReceipt({
        ...r,
        nextUser: {
          ...user,
          allotted_ration: r.allotted_ration ?? user?.allotted_ration,
          used_ration: r.used_ration ?? user?.used_ration,
          remaining_ration: r.remaining_ration ?? user?.remaining_ration,
        },
      });
    } catch (e) {
      showAlert("error", e.message || "Failed to seal record. Try again.");
    }
    setSubmitting(false);
  };

  /* ── RECEIPT INVOICE SCREEN ── */
  if (receipt) {
    return (
      <div className="min-h-screen bg-base font-sans pb-16">
        <Topbar 
          title="Digital Allocation Receipt" 
          onBack={() => navigate("dashboard", receipt.nextUser || user)} 
          backLabel="Dashboard"
        />
        
        <div className="max-w-[480px] mx-auto px-6 mt-12">
          <div className="bg-white border border-border rounded-2xl p-8 shadow-sm text-center fade-up">
            <div className="w-14 h-14 rounded-full bg-green-soft border border-green/30 flex items-center justify-center text-green mx-auto mb-5">
              <Check className="w-6 h-6" />
            </div>
            
            <h2 className="font-serif text-2xl text-navy font-bold mb-1">
              Ration Sealed
            </h2>
            <p className="text-[10px] uppercase font-bold text-muted tracking-wider block mb-6">
              Receipt Date: {receipt.timestamp}
            </p>

            <div className="bg-base/40 border border-border-soft rounded-xl p-5 mb-6 text-left">
              {receipt.items?.map((it, i) => (
                <div key={i} className="flex justify-between items-center py-2.5 border-b border-divider/60 last:border-0 last:pb-0">
                  <div>
                    <span className="font-bold text-navy text-sm block">{it.item}</span>
                    <span className="font-mono text-[9px] text-muted block mt-0.5">
                      Hash: {(it.hash || "").slice(0, 16)}…
                    </span>
                  </div>
                  <span className="font-mono font-bold text-green text-base">
                    {it.kg} kg
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-4 border-t border-divider font-bold text-navy text-sm mt-3">
                <span>Total Collected</span>
                <span>{receipt.total_kg} kg</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1 bg-green-soft border border-green/20 px-3 py-1 rounded-full text-[10px] font-bold text-green-dark uppercase tracking-wider mb-6">
              <Lock className="w-3 h-3 text-green" /> Blockchain Hash Recorded
            </div>

            <button 
              className="w-full bg-navy hover:bg-navy-mid text-white font-bold text-sm py-3 rounded-lg shadow-sm hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5" 
              onClick={() => navigate("dashboard", receipt.nextUser || user)}
            >
              Back to Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── MAIN TRANSACTION FLOW ── */
  return (
    <div className="min-h-screen bg-base font-sans pb-16">
      <Topbar
        title="Collect Ration Allocation"
        subtitle={`Entitled Beneficiary: ${user?.full_name || "Guest User"}`}
        onBack={() => navigate("dashboard", user)}
        backLabel="Dashboard"
      />

      <div className="max-w-[620px] mx-auto px-6 mt-8">
        {/* ── STEP 1: IDENTITY VERIFICATION ── */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-xs mb-5 fade-up">
          <div className="flex justify-between items-center border-b border-divider pb-4 mb-5">
            <div>
              <h3 className="font-bold text-navy text-sm uppercase tracking-wide">
                Step 1: Bio-Verification
              </h3>
              <p className="text-xs text-muted mt-0.5 leading-normal">
                Select authentication method to unlock allocation cart
              </p>
            </div>
            {authStep === "done" && (
              <span className="text-[10px] font-bold bg-green-soft border border-green/20 text-green-dark px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5">
                <Check className="w-3 h-3" /> Verified
              </span>
            )}
            {authStep === "failed" && (
              <span className="text-[10px] font-bold bg-red-soft border border-red/20 text-red px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Mismatch
              </span>
            )}
            {authStep === "verifying" && (
              <span className="text-[10px] font-bold bg-navy-soft text-navy px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Scanning...
              </span>
            )}
          </div>

          {authStep === "pending" && (
            <div className="flex flex-col gap-5">
              <div className="bg-base p-0.5 rounded-md flex border border-border-soft">
                <button 
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                    authMethod === "face" 
                      ? "bg-white text-navy shadow-xs border border-border/40" 
                      : "text-muted hover:text-text-sub"
                  }`}
                  onClick={() => { setAuthMethod("face"); setAlert(null); }}
                >
                  <Camera className="w-3.5 h-3.5" /> Face Scan
                </button>
                <button 
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                    authMethod === "otp" 
                      ? "bg-white text-navy shadow-xs border border-border/40" 
                      : "text-muted hover:text-text-sub"
                  }`}
                  onClick={() => { setAuthMethod("otp"); setAlert(null); }}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Mobile OTP
                </button>
              </div>

              {authMethod === "face" && (
                <div className="mt-1">
                  <FaceCapture label="Verify Facial Bio-Seal" onCapture={handleFace} />
                </div>
              )}

              {authMethod === "otp" && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-text-sub uppercase tracking-wider">
                      Registered Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <input 
                        className="flex-1 px-3 py-2 border border-border rounded-lg text-sm text-text bg-base/50 outline-none font-medium"
                        value={`+91-${mobile}`} 
                        disabled 
                      />
                      <button 
                        className="bg-navy hover:bg-navy-mid text-white text-xs font-semibold px-5 rounded-lg shadow-2xs transition-colors"
                        onClick={sendOtp}
                      >
                        Request OTP
                      </button>
                    </div>
                  </div>

                  {otpSent && (
                    <div className="flex flex-col gap-1.5 fade-in">
                      <label className="text-[10px] font-bold text-text-sub uppercase tracking-wider">
                        One-Time Password
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          className="flex-1 px-3 py-2 border border-border rounded-lg text-sm text-text bg-white outline-none focus:border-green focus:ring-4 focus:ring-green-soft/30 transition-all font-mono font-bold tracking-widest text-center"
                          placeholder="XXXXXX" 
                          maxLength={6} 
                          value={otp} 
                          onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} 
                        />
                        <button 
                          className="bg-green hover:bg-green-dark text-white text-xs font-semibold px-6 rounded-lg transition-all"
                          onClick={verifyOtp}
                        >
                          Verify
                        </button>
                      </div>
                      <span className="text-[10px] text-muted">
                        Sandbox verification bypass code: <code className="bg-base px-1.5 py-0.5 rounded font-mono font-bold text-navy">123456</code>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {authStep === "failed" && (
            <div className="flex flex-col gap-4">
              <div className="flex gap-2.5 p-3 rounded-lg border text-xs font-medium bg-red-soft border-[#FECACA] text-red items-start">
                <AlertTriangle className="w-4.5 h-4.5 text-red flex-shrink-0 mt-0.5" />
                <span>Facial descriptors did not match database records. Switch to Mobile OTP verification.</span>
              </div>
              <button 
                className="w-fit bg-white hover:bg-base text-navy border border-border text-xs font-semibold px-4.5 py-2 rounded-lg transition-colors"
                onClick={() => { setAuthStep("pending"); setAuthMethod("otp"); }}
              >
                Use Mobile OTP Fallback
              </button>
            </div>
          )}

          {authStep === "done" && (
            <div className="flex gap-2.5 p-3 rounded-lg border text-xs font-medium bg-green-soft border-[#B7DFCA] text-green-dark items-center">
              <Check className="w-4 h-4 text-green" />
              <span>Identity validated successfully. Allocation options are unlocked below.</span>
            </div>
          )}
        </div>

        {/* ── STEP 2: ALLOCATION CART SELECTION ── */}
        {authStep === "done" && (
          <div className="bg-white border border-border rounded-2xl p-6 shadow-xs mb-5 fade-in">
            <div className="flex justify-between items-center border-b border-divider pb-4 mb-5">
              <div>
                <h3 className="font-bold text-navy text-sm uppercase tracking-wide">
                  Step 2: Entitlement Allocation
                </h3>
                <p className="text-xs text-muted mt-0.5 leading-normal">
                  Customize item balances matching remaining quota
                </p>
              </div>
              <span className="text-[10px] font-bold bg-navy-soft text-navy px-2.5 py-1 rounded-md">
                Quota: {remaining} kg Balance
              </span>
            </div>

            {alert && (
              <div 
                className={`flex gap-2.5 p-3 rounded-lg border text-xs font-medium mb-5 items-start fade-in ${
                  alert.type === "success" 
                    ? "bg-green-soft border-[#B7DFCA] text-green-dark" 
                    : "bg-red-soft border-[#FECACA] text-red"
                }`}
              >
                {alert.type === "success" ? (
                  <Check className="w-4 h-4 text-green flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red flex-shrink-0 mt-0.5" />
                )}
                <span>{alert.msg}</span>
              </div>
            )}

            {/* Cart Options */}
            <div className="flex flex-col gap-3 mb-6">
              {items.map((item, i) => (
                <div 
                  key={i} 
                  className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer bg-white transition-all ${
                    item.selected 
                      ? "border-navy bg-navy-soft/30 ring-1 ring-navy" 
                      : "border-border hover:border-border/80"
                  }`} 
                  onClick={() => toggle(i)}
                >
                  <input 
                    type="checkbox" 
                    checked={item.selected} 
                    onChange={() => toggle(i)}
                    className="w-4.5 h-4.5 accent-navy cursor-pointer flex-shrink-0"
                    onClick={e => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <span className="font-bold text-navy text-sm block">{item.name}</span>
                    <span className="text-xs text-text-sub block mt-0.5">{item.rate} · Max: {item.maxKg} {item.unit}</span>
                  </div>

                  {item.selected && (
                    <div className="flex items-center gap-3.5" onClick={e => e.stopPropagation()}>
                      <button 
                        className="w-7 h-7 rounded-full border border-border bg-white text-navy flex items-center justify-center cursor-pointer hover:bg-base transition-colors"
                        onClick={() => changeQty(i, -0.5)}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono font-bold text-navy text-sm min-w-[50px] text-center">
                        {item.qty} {item.unit}
                      </span>
                      <button 
                        className="w-7 h-7 rounded-full bg-navy text-white flex items-center justify-center cursor-pointer hover:bg-navy-mid transition-colors"
                        onClick={() => changeQty(i, 0.5)}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Total Balance Panel */}
            <div className="bg-base/40 border border-border rounded-xl p-4 flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-text-sub">Total Cart Weight</span>
              <span className={`font-serif text-2xl font-bold ${
                totalKg > remaining ? "text-red" : "text-green"
              }`}>
                {totalKg.toFixed(1)} kg 
                <span className="font-sans text-xs text-muted font-medium ml-1">/ {remaining} kg</span>
              </span>
            </div>

            {totalKg > remaining && (
              <div className="flex gap-2.5 p-3 rounded-lg border text-xs font-medium bg-red-soft border-[#FECACA] text-red items-center mb-5 fade-in">
                <AlertTriangle className="w-4 h-4 text-red" />
                <span>Selected allocation exceeds remaining monthly quota. Please reduce amounts.</span>
              </div>
            )}

            <button 
              className="w-full bg-green hover:bg-green-mid text-white font-bold text-sm py-3.5 rounded-lg shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:pointer-events-none"
              disabled={!selectedItems.length || totalKg > remaining || submitting}
              onClick={handleCollect}
            >
              {submitting ? "Sealing Ledger Records..." : "Confirm & Seal Collection"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

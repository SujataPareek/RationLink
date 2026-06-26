import { 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Info, 
  Cpu, 
  Database, 
  Shield, 
  Lock, 
  EyeOff,
  Leaf
} from "lucide-react";
import Topbar from "../components/Topbar";

const TECH_STACK = [
  { layer: "Frontend UI", tech: "React + Vite + Tailwind CSS", why: "Lightning-fast HMR build, modular component workflows, and responsive styles." },
  { layer: "Backend API", tech: "FastAPI (Python Async)", why: "Asynchronous router pipeline with auto-compiled swagger API logs." },
  { layer: "Edge Database", tech: "SQLite 3", why: "Lightweight file database perfect for simulating disconnected Fair Price Shop edge depots." },
  { layer: "Cloud Mirror", tech: "Firebase Firestore / Supabase", why: "Cloud database sync targets. PostgreSQL structures map edge tables." },
  { layer: "Biometric Auth", tech: "face-api.js (browser TensorFlow)", why: "Local client-side 128D facial descriptor extraction, ensuring server-side privacy." },
  { layer: "AI Fraud Scan", tech: "Isolation Forest (scikit-learn)", why: "Unsupervised forest anomalies evaluating weight outliers and impossible gap speeds." },
  { layer: "ML Demand Plan", tech: "Linear Regression (scikit-learn)", why: "Linear models matching seasonal demand scales to predict regional requirements." },
  { layer: "CV Inspector", tech: "OpenCV (Otsu threshold + contours)", why: "Backend image color space segmentation & edge counts to detect debris and broken grains." },
];

const FRAUD_LAYERS = [
  { num: "01", title: "Cryptographic Tamper Audits", desc: "Transactions are hash-chained using SHA-256. Manual edits break the chain link, triggering critical security alarms." },
  { num: "02", title: "AI Behavioral Outliers", desc: "Isolation Forest scans transactional records for extreme speed gaps and over-quota collection attempts." },
  { num: "03", title: "Duplicate Aadhaar Check", desc: "Flags duplicate identity bindings across multiple mobile numbers, detecting card cloning." },
  { num: "04", title: "Rapid Collection Logs", desc: "Flags multiple quota collections under the same card within 1 hour, alerting operators of card skimming." },
  { num: "05", title: "Quota Overdraw Auditing", desc: "Restricts and audits used weights exceeding standard monthly allowances." },
];

export default function AboutPage({ navigate }) {
  return (
    <div className="min-h-screen bg-base font-sans pb-16 text-text">
      <Topbar
        title="About SmartPDS"
        subtitle="Digital PDS Architecture &amp; System Features"
        onBack={() => navigate("landing")}
        backLabel="Home"
      />

      <div className="max-w-4xl mx-auto px-6 mt-10">
        {/* Header */}
        <div className="fade-up mb-8">
          <div className="h-1 w-12 bg-gold-bright rounded-full mb-4" />
          <h1 className="font-serif text-3xl md:text-4xl text-navy font-bold mb-3">
            System Design &amp; Architecture
          </h1>
          <p className="text-text-sub text-base leading-relaxed max-w-2xl">
            SmartPDS is a digital Public Distribution System (PDS) portal built to solve supply leakages, authenticate beneficiaries securely, and audit depot grain inventory using secure verification algorithms.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-navy-dark border-l-4 border-gold-bright rounded-2xl p-6 text-white mb-6 shadow-sm fade-up-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <h2 className="font-serif text-lg font-bold text-white mb-2 flex items-center gap-1.5">
            <Leaf className="w-4.5 h-4.5 text-gold-bright" /> Core Mission
          </h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-3xl">
            To secure India's food security distribution by enforcing biometric authentication, providing cryptographic ledger guarantees for receipts, auditing grains quality with automated computer vision, and forecasting demand with machine learning.
          </p>
        </div>

        {/* Tech Stack Table Card */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-xs mb-6 fade-up-2">
          <div className="flex justify-between items-center border-b border-divider pb-4 mb-5">
            <div>
              <h3 className="font-bold text-navy text-sm uppercase tracking-wide">
                Technology Specifications
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Modern tools selected for performance, simplicity, and resume-worthiness
              </p>
            </div>
            <span className="text-[10px] font-bold bg-green-soft border border-green/20 text-green-dark px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Open-Source Stack
            </span>
          </div>

          <div className="overflow-x-auto border border-divider/60 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-base border-b border-border">
                  <th className="p-3 font-bold text-text-sub uppercase tracking-wider text-[10px] w-32">Layer</th>
                  <th className="p-3 font-bold text-text-sub uppercase tracking-wider text-[10px] w-48">Technology</th>
                  <th className="p-3 font-bold text-text-sub uppercase tracking-wider text-[10px]">Architecture Value</th>
                </tr>
              </thead>
              <tbody>
                {TECH_STACK.map((t, i) => (
                  <tr key={i} className="border-b border-divider/40 last:border-0 hover:bg-base/20 transition-colors">
                    <td className="p-3">
                      <span className="bg-navy-soft text-navy text-[10px] font-bold px-2 py-0.5 rounded border border-navy/10">
                        {t.layer}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-navy">{t.tech}</td>
                    <td className="p-3 text-text-sub leading-normal">{t.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5-Layer Shield Card */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-xs mb-6 fade-up-3">
          <div className="flex justify-between items-center border-b border-divider pb-4 mb-5">
            <div>
              <h3 className="font-bold text-navy text-sm uppercase tracking-wide">
                5-Layer Fraud Prevention Shield
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Heuristic and machine learning checks to identify and quarantine distribution anomalies
              </p>
            </div>
            <span className="text-[10px] font-bold bg-red-soft border border-red/20 text-red px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Security Matrix
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {FRAUD_LAYERS.map((f, i) => (
              <div 
                key={i} 
                className="flex gap-4 p-4 bg-base/30 hover:bg-base/50 transition-colors border border-border-soft rounded-xl"
              >
                <div className="font-serif text-xl font-bold text-gold-bright flex-shrink-0 w-8">
                  {f.num}
                </div>
                <div>
                  <span className="font-bold text-navy text-sm block">{f.title}</span>
                  <span className="text-xs text-text-sub block mt-0.5 leading-relaxed">{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How Blockchain works */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-xs mb-6">
          <div className="border-b border-divider pb-4 mb-4">
            <h3 className="font-bold text-navy text-sm uppercase tracking-wide">
              Cryptographic Transaction Hashing Chaining
            </h3>
            <p className="text-xs text-muted mt-0.5">
              How database seals protect ledger logs from direct SQL modifications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="flex flex-col justify-between h-full text-xs text-text-sub leading-relaxed gap-3">
              <p>
                Whenever grains are collected, a new transaction row is written. Before it is saved, the backend computes a hash of the transaction data joined with the preceding transaction's digital seal.
              </p>
              <div className="bg-base border border-border rounded-lg p-3 font-mono text-[11px] text-navy font-bold leading-normal">
                data = String(mobile | weight | prev_hash)<br/>
                current_hash = SHA256(data)
              </div>
              <p>
                Because each block depends on the previous block's hash, changing a single weight value breaks the link on all subsequent rows. Our audit parser highlights the exact record tampered with.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {[
                { title: "Genesis Seal", desc: "prev_hash = '0'" },
                { title: "Record #1 Seal", desc: "SHA256(bene_A | 5.0 kg | '0') = 4a9f..." },
                { title: "Record #2 Seal", desc: "SHA256(bene_B | 10.0 kg | '4a9f...') = 7d2b..." },
                { title: "Record #3 Seal", desc: "SHA256(bene_A | 2.5 kg | '7d2b...') = a18f..." },
              ].map((b, i) => (
                <div 
                  key={i} 
                  className={`border rounded-lg p-3 font-mono text-[11px] ${
                    i === 0 ? "bg-navy-soft/60 border-navy/15 text-navy" : "bg-base/40 border-border"
                  }`}
                >
                  <span className="font-bold block mb-0.5 text-navy/80">{b.title}</span>
                  <span className="text-text-sub text-[10px]">{b.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data Privacy Details */}
        <div className="bg-gold-soft/40 border border-gold-border/20 rounded-2xl p-6 shadow-xs">
          <h3 className="font-bold text-gold text-xs uppercase tracking-wider mb-4">
            Security &amp; Data Safeguards
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Lock, title: "Face ID Biometrics", desc: "Faces are stored only as 128D mathematical vectors. Actual images are never stored, preventing identity duplication." },
              { icon: EyeOff, title: "Aadhaar Masking", desc: "Only the last four digits of Aadhaar are visible in the UI. Inputs are regex validated and saved securely." },
              { icon: ShieldCheck, title: "Ledger Locking", desc: "All local transaction histories are double-verified by blockchain seals before syncing to the cloud." },
            ].map((p, i) => {
              const IconComp = p.icon;
              return (
                <div key={i} className="bg-white border border-gold-border/15 p-4 rounded-xl shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-gold-soft text-gold flex items-center justify-center mb-3">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-navy text-xs block mb-1">{p.title}</span>
                  <span className="text-[10px] text-text-sub leading-relaxed block">{p.desc}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
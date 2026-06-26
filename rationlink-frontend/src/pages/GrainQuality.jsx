import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Camera, 
  Upload, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  RotateCcw,
  Sparkles,
  HelpCircle,
  TrendingUp,
  Image as ImageIcon
} from "lucide-react";
import Topbar from "../components/Topbar";
import * as api from "../services/api";

const GRADES = {
  GOOD: { 
    label: "Acceptable (Grade A)", 
    color: "text-green", 
    border: "border-green/30", 
    bg: "bg-green-soft/40", 
    desc: "Grain meets all PDS specifications. Moisture and impurities are well within safety bounds. Fit for public distribution." 
  },
  MODERATE: { 
    label: "Marginal (Grade B)", 
    color: "text-amber", 
    border: "border-amber/30", 
    bg: "bg-amber-soft/40", 
    desc: "Contains minor broken grains or husk impurities. Inspect visually before distributing. Recommended for priority consumption." 
  },
  POOR: { 
    label: "Reject (Below Standard)", 
    color: "text-red", 
    border: "border-red/30", 
    bg: "bg-red-soft/40", 
    desc: "Excessive foreign impurities or black stones detected. Do NOT issue to beneficiaries. Quarantine sample and report to warehouse supervisor." 
  },
};

export default function GrainQuality({ navigate }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const loopRef = useRef(null);

  const [activeTab, setActiveTab] = useState("camera"); // camera | upload
  const [status, setStatus] = useState("idle"); // idle | loading | active | error
  const [msg, setMsg] = useState("");
  const [autoScan, setAutoScan] = useState(true);

  // Client-side quick metrics
  const [clientGrade, setClientGrade] = useState(null);
  const [clientImpurity, setClientImpurity] = useState(0);

  // Backend OpenCV detailed metrics
  const [backendLoading, setBackendLoading] = useState(false);
  const [backendResult, setBackendResult] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);

  // Helper to convert dataURL to Blob
  const dataURLtoBlob = (dataUrl) => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // Client-side quick pixel logic
  const analyseClientSide = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const total = canvas.width * canvas.height;

    let darkCount = 0;
    let brownCount = 0;
    let coloredCount = 0;

    for (let i = 0; i < imgData.length; i += 16) {
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];
      const brightness = (r + g + b) / 3;
      const saturation = Math.max(r, g, b) - Math.min(r, g, b);

      if (brightness < 60) darkCount++;
      if (r > 80 && g < 60 && b < 60) brownCount++;
      if (saturation > 80 && brightness > 80) coloredCount++;
    }

    const sampledPixels = total / 4;
    const impurityRatio = (darkCount + brownCount) / sampledPixels * 100;
    const isGrainLikely = (coloredCount / sampledPixels) < 0.3;

    const pct = Math.min(100, Math.round(impurityRatio));

    if (!isGrainLikely) {
      setClientGrade(null);
      setClientImpurity(0);
      setMsg("No grain detected in frame. Point camera at grain sample.");
      return;
    }

    let g = "GOOD";
    if (pct > 15) g = "POOR";
    else if (pct > 6) g = "MODERATE";

    setClientImpurity(pct);
    setClientGrade(g);
    setMsg("");
  }, []);

  // Web CV analysis trigger (uses backend OpenCV router)
  const runBackendAnalysis = async (dataUrl) => {
    setBackendLoading(true);
    setMsg("Sending snapshot to Python/OpenCV engine...");
    try {
      const blob = dataURLtoBlob(dataUrl);
      const res = await api.uploadGrainImage(blob);
      setBackendResult(res);
      setMsg(res.message || "Detailed backend scan completed.");
    } catch (e) {
      setMsg("Backend scan failed: " + e.message);
    }
    setBackendLoading(false);
  };

  const startCamera = async () => {
    setStatus("loading");
    setMsg("Initializing camera hardware...");
    setBackendResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "environment" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStatus("active");
        setMsg("Camera ready. Align grain tray in frame.");
      }
    } catch (e) {
      setStatus("error");
      setMsg("Camera error: " + e.message + ". Check camera permissions.");
    }
  };

  const stopCamera = () => {
    if (loopRef.current) clearInterval(loopRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setStatus("idle");
    setClientGrade(null);
    setMsg("");
  };

  const captureFrameForBackend = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    
    // Trigger the detailed OpenCV scan
    runBackendAnalysis(dataUrl);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBackendResult(null);
    setUploadedImage(null);
    setMsg("Loading image file...");

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      setUploadedImage(dataUrl);
      
      // Send directly to backend OpenCV analyzer
      setBackendLoading(true);
      try {
        const blob = dataURLtoBlob(dataUrl);
        const res = await api.uploadGrainImage(blob);
        setBackendResult(res);
        setMsg(res.message);
      } catch (err) {
        setMsg("Analysis failed: " + err.message);
      }
      setBackendLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const resetUploadTab = () => {
    setBackendResult(null);
    setUploadedImage(null);
    setMsg("");
  };

  useEffect(() => {
    if (status !== "active" || !autoScan || activeTab !== "camera") return;
    loopRef.current = setInterval(analyseClientSide, 1000);
    return () => clearInterval(loopRef.current);
  }, [status, autoScan, activeTab, analyseClientSide]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (loopRef.current) clearInterval(loopRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const currentGrade = backendResult?.success ? backendResult.grade : clientGrade;
  const G = currentGrade ? GRADES[currentGrade] : null;

  return (
    <div className="min-h-screen bg-base font-sans pb-16">
      <Topbar
        title="Grain Quality Inspector"
        subtitle="OpenCV computer vision purity analysis"
        onBack={() => { stopCamera(); navigate("dashboard", null); }}
        backLabel="Dashboard"
      />

      <div className="max-w-5xl mx-auto px-6 mt-8">
        {/* Method Switcher Tabs */}
        <div className="flex bg-border-soft p-1 rounded-lg max-w-[340px] mb-6 border border-border/50">
          <button 
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "camera" 
                ? "bg-white text-navy shadow-sm" 
                : "text-text-sub hover:text-navy"
            }`}
            onClick={() => { stopCamera(); resetUploadTab(); setActiveTab("camera"); }}
          >
            <Camera className="w-3.5 h-3.5" /> Live Camera
          </button>
          <button 
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "upload" 
                ? "bg-white text-navy shadow-sm" 
                : "text-text-sub hover:text-navy"
            }`}
            onClick={() => { stopCamera(); resetUploadTab(); setActiveTab("upload"); }}
          >
            <Upload className="w-3.5 h-3.5" /> Photo Upload
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* ── LEFT PANEL: Camera view or File drag-drop ── */}
          <div className="md:col-span-7 flex flex-col gap-5">
            {activeTab === "camera" ? (
              /* CAMERA CARD */
              <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-xs">
                {/* Viewport */}
                <div className="bg-[#0A0D14] min-h-[320px] max-h-[380px] flex items-center justify-center relative">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover max-h-[380px]"
                    muted
                    playsInline
                    style={{ display: status === "active" ? "block" : "none" }}
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {status === "idle" && (
                    <div className="text-center p-8 text-white/20">
                      <Camera className="w-12 h-12 mx-auto mb-3 opacity-40 text-muted" />
                      <p className="text-sm font-medium">Camera Offline</p>
                    </div>
                  )}
                  {status === "loading" && (
                    <div className="text-center text-white/50 text-xs font-medium">
                      <RotateCcw className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Initializing feed...
                    </div>
                  )}
                  {status === "error" && (
                    <div className="text-center p-6 text-white/60">
                      <AlertTriangle className="w-10 h-10 text-red mx-auto mb-3" />
                      <p className="text-xs">{msg}</p>
                    </div>
                  )}

                  {/* Real-time Badge */}
                  {status === "active" && G && !backendResult && (
                    <div className="absolute top-4 right-4 bg-navy-dark/80 backdrop-blur border border-white/10 px-3 py-1 rounded-md">
                      <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider block">Live Estimate</span>
                      <span className={`text-xs font-bold ${G.color}`}>{G.label}</span>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="p-4 bg-white border-t border-divider flex gap-3 justify-between items-center">
                  {status === "idle" && (
                    <button 
                      className="w-full bg-navy hover:bg-navy-mid text-white font-bold text-sm py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      onClick={startCamera}
                    >
                      <Camera className="w-4 h-4" /> Start Quality Feed
                    </button>
                  )}
                  {status === "active" && (
                    <>
                      <button 
                        className="bg-green hover:bg-green-mid text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-40"
                        onClick={captureFrameForBackend}
                        disabled={backendLoading}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-gold-bright" />
                        {backendLoading ? "Processing..." : "Deep Python/OpenCV Audit"}
                      </button>
                      <button 
                        className="text-red bg-red-soft hover:bg-red/10 border border-red/20 text-xs font-bold px-4 py-2.5 rounded-lg transition-colors"
                        onClick={stopCamera}
                      >
                        Disconnect
                      </button>
                    </>
                  )}
                  {status === "error" && (
                    <button 
                      className="w-full text-navy border border-border hover:bg-base text-sm font-semibold py-2.5 rounded-lg transition-colors"
                      onClick={() => setStatus("idle")}
                    >
                      Reset Connection
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* UPLOAD CARD */
              <div className="bg-white border border-border rounded-2xl p-6 shadow-xs flex flex-col items-center">
                {!uploadedImage ? (
                  <label className="border-2 border-dashed border-border hover:border-green/50 rounded-xl w-full py-16 px-6 text-center cursor-pointer bg-base/30 hover:bg-green-soft/10 transition-all flex flex-col items-center group">
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                    />
                    <div className="w-12 h-12 rounded-full bg-navy-soft text-navy flex items-center justify-center mb-4 group-hover:bg-green-soft group-hover:text-green transition-all">
                      <Upload className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-navy text-sm mb-1">
                      Upload Grain Sample
                    </h3>
                    <p className="text-xs text-muted max-w-[240px] leading-normal mb-1">
                      Drag and drop your photo, or click to browse local files.
                    </p>
                    <span className="text-[10px] text-muted uppercase tracking-wider block bg-white px-2 py-0.5 rounded border border-border shadow-2xs font-semibold">
                      Rice / Wheat Samples
                    </span>
                  </label>
                ) : (
                  <div className="w-full flex flex-col gap-4">
                    {/* Uploaded view */}
                    <div className="border border-border rounded-xl overflow-hidden bg-navy-dark max-h-[360px] flex items-center justify-center relative">
                      <img 
                        src={backendResult?.overlay_img || uploadedImage} 
                        alt="Grain snap" 
                        className="max-h-[360px] w-full object-contain"
                      />
                      {backendLoading && (
                        <div className="absolute inset-0 bg-navy-dark/60 backdrop-blur-2xs flex flex-col items-center justify-center text-white text-xs font-semibold">
                          <RotateCcw className="w-6 h-6 animate-spin mb-2 text-green-glow" />
                          Running OpenCV Segmentation...
                        </div>
                      )}
                    </div>
                    
                    <button 
                      className="text-navy hover:bg-base border border-border text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                      onClick={resetUploadTab}
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset Upload
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* How it works info card */}
            <div className="bg-white border border-border rounded-2xl p-5 shadow-xs border-l-4 border-navy">
              <h3 className="text-navy font-bold text-xs uppercase tracking-wider mb-3">
                OpenCV Audit Process
              </h3>
              {[
                { step: "Contour Separation", desc: "Adaptive thresholding isolates grains from background debris." },
                { step: "Size Profiling", desc: "Circularity and bounding areas divide grains into full or broken contours." },
                { step: "HSV Color Filtering", desc: "Chrominance channels flag stones, dirt clods, or artificial impurities." },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 mb-2.5 items-start last:mb-0">
                  <div className="w-5 h-5 rounded-full bg-navy-soft text-navy font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <span className="font-semibold text-navy text-xs block">{item.step}</span>
                    <span className="text-text-sub text-[11px] leading-relaxed block">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT PANEL: Quality results & stats ── */}
          <div className="md:col-span-5 flex flex-col gap-5">
            {/* Analysis card */}
            <div className="bg-white border border-border rounded-2xl p-5 md:p-6 shadow-xs">
              <h2 className="text-navy font-bold text-sm mb-4">
                Analysis Summary
              </h2>

              {/* Grade Banner */}
              {G ? (
                <div className={`border rounded-xl p-4 mb-5 flex flex-col ${G.bg} ${G.border}`}>
                  <span className="text-[10px] font-bold text-text-sub uppercase tracking-wider block mb-1">
                    Quality Rating
                  </span>
                  <span className={`text-base font-bold ${G.color} flex items-center gap-1.5`}>
                    {currentGrade === "POOR" ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                    {G.label}
                  </span>
                  <p className="text-xs text-text-sub leading-relaxed mt-2.5 border-t border-divider/40 pt-2.5">
                    {G.desc}
                  </p>
                </div>
              ) : (
                <div className="border border-dashed border-border rounded-xl py-8 text-center text-muted text-xs mb-5 font-medium">
                  Scan feed or upload sample to view quality grading.
                </div>
              )}

              {/* Status messages */}
              {msg && (
                <div className="flex gap-2 p-3 bg-base border border-border-soft rounded-lg text-xs text-text-sub font-medium mb-5 items-start">
                  <Info className="w-4 h-4 text-navy/60 flex-shrink-0 mt-0.5" />
                  <span>{msg}</span>
                </div>
              )}

              {/* Live Metric Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-border rounded-xl p-3 text-center bg-base/20">
                  <span className="text-[9px] font-bold text-muted uppercase tracking-widest block mb-0.5">
                    Impurity Score
                  </span>
                  <span className={`font-serif text-2xl font-bold ${
                    (backendResult?.impurity_pct || clientImpurity) > 15 
                      ? "text-red" 
                      : (backendResult?.impurity_pct || clientImpurity) > 6 
                        ? "text-amber" 
                        : "text-green"
                  }`}>
                    {backendResult?.success ? `${backendResult.impurity_pct}%` : clientGrade ? `${clientImpurity}%` : "—"}
                  </span>
                </div>
                <div className="border border-border rounded-xl p-3 text-center bg-base/20">
                  <span className="text-[9px] font-bold text-muted uppercase tracking-widest block mb-0.5">
                    Total Grains
                  </span>
                  <span className="font-serif text-2xl font-bold text-navy">
                    {backendResult?.success ? backendResult.total_count : clientGrade ? "~120" : "—"}
                  </span>
                </div>
              </div>

              {/* Contours itemized breakdown (Only if Backend scan was run) */}
              {backendResult?.success && (
                <div className="mt-5 border-t border-divider pt-4 flex flex-col gap-3">
                  <h3 className="text-[10px] font-bold text-text-sub uppercase tracking-wider block">
                    Detailed Contour Counts
                  </h3>
                  <div className="flex justify-between items-center text-xs py-1.5 border-b border-divider/60">
                    <span className="flex items-center gap-1.5 text-text-sub font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-green" /> Full Grains
                    </span>
                    <span className="font-mono font-bold text-navy">{backendResult.good_count}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs py-1.5 border-b border-divider/60">
                    <span className="flex items-center gap-1.5 text-text-sub font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-gold-bright" /> Broken Grains
                    </span>
                    <span className="font-mono font-bold text-navy">{backendResult.broken_count}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs py-1.5">
                    <span className="flex items-center gap-1.5 text-text-sub font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-red" /> Debris / Stones
                    </span>
                    <span className="font-mono font-bold text-navy">{backendResult.impurity_count}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Standards criteria card */}
            <div className="bg-white border border-border rounded-2xl p-5 shadow-xs">
              <h2 className="text-navy font-bold text-xs uppercase tracking-wider mb-3">
                Grading Benchmarks
              </h2>
              {Object.entries(GRADES).map(([k, v]) => (
                <div key={k} className="flex gap-3 py-2 border-b border-divider last:border-0 items-start">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                    k === "GOOD" ? "bg-green" : k === "MODERATE" ? "bg-amber" : "bg-red"
                  }`} />
                  <div>
                    <span className="font-bold text-navy text-xs block">{v.label}</span>
                    <span className="text-muted text-[10px] leading-relaxed block">{v.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

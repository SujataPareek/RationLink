/**
 * FaceCapture.jsx
 * Uses face-api.js (loaded via CDN in index.html) to detect a face,
 * extract a 128-dimension descriptor, and return it via onCapture(descriptor).
 *
 * Props:
 *   onCapture(descriptor[])  — called when face is locked
 *   label                    — button label
 */
import { useRef, useState, useEffect } from "react";
import { 
  Camera, 
  Check, 
  AlertTriangle, 
  RotateCcw,
  Sparkles
} from "lucide-react";

export default function FaceCapture({ onCapture, label = "Capture Face" }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectLoopRef = useRef(null);
  const eyesClosedRef = useRef(false);
  const livenessVerifiedRef = useRef(false);
  
  const [captureMode, setCaptureMode] = useState("webcam"); // webcam | upload
  const [status, setStatus] = useState("idle");
  // idle | loading | ready | detecting | done | error
  const [msg, setMsg] = useState("");
  const [captured, setCaptured] = useState(false);
  const [liveness, setLiveness] = useState("pending"); // pending | verified | bypassed

  const stopCamera = () => {
    if (detectLoopRef.current) {
      cancelAnimationFrame(detectLoopRef.current);
      detectLoopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const getDistance = (p1, p2) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  const calculateEAR = (eyePoints) => {
    const d_v1 = getDistance(eyePoints[1], eyePoints[5]);
    const d_v2 = getDistance(eyePoints[2], eyePoints[4]);
    const d_h = getDistance(eyePoints[0], eyePoints[3]);
    if (d_h === 0) return 0.0;
    return (d_v1 + d_v2) / (2.0 * d_h);
  };

  const startDetectLoop = () => {
    const faceapi = window.faceapi;
    const video = videoRef.current;
    if (!video) return;

    const opts = new faceapi.TinyFaceDetectorOptions({ inputSize: 320 });

    const detectFrame = async () => {
      if (video.paused || video.ended || !streamRef.current) return;

      try {
        const result = await faceapi
          .detectSingleFace(video, opts)
          .withFaceLandmarks(true);

        if (result) {
          const leftEye = result.landmarks.getLeftEye();
          const rightEye = result.landmarks.getRightEye();
          const ear = (calculateEAR(leftEye) + calculateEAR(rightEye)) / 2.0;

          // Liveness detection threshold validation (slightly more lenient)
          if (ear < 0.20) {
            eyesClosedRef.current = true;
            setMsg("Liveness Scan: Eyes closed detected. Now open them.");
          } else if (ear > 0.25 && eyesClosedRef.current) {
            livenessVerifiedRef.current = true;
            setLiveness("verified");
            setMsg("Liveness Verified ✅! Locking biometric seal...");
            setTimeout(() => {
              lockFace();
            }, 1000);
            return;
          } else if (!livenessVerifiedRef.current) {
            setMsg("Liveness verification: Please blink your eyes now.");
          }
        } else if (!livenessVerifiedRef.current) {
          setMsg("Position face in the frame clearly.");
        }
      } catch (err) {
        console.error("Liveness check loop error:", err);
      }

      if (!livenessVerifiedRef.current && streamRef.current) {
        detectLoopRef.current = requestAnimationFrame(detectFrame);
      }
    };

    detectLoopRef.current = requestAnimationFrame(detectFrame);
  };

  const startCamera = async () => {
    setStatus("loading");
    setMsg("Loading face detection models...");
    eyesClosedRef.current = false;
    livenessVerifiedRef.current = false;
    setLiveness("pending");

    try {
      const faceapi = window.faceapi;
      if (!faceapi) throw new Error("face-api.js library missing. Verify scripts in index.html.");

      const MODEL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL);
      await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL);

      setMsg("Connecting to camera...");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStatus("ready");
        setMsg("Liveness verification: Please blink your eyes now.");
        startDetectLoop();
      }
    } catch (e) {
      setStatus("error");
      setMsg(e.message);
    }
  };

  const lockFace = async () => {
    setStatus("detecting");
    setMsg("Detecting face features — please hold still...");

    try {
      const faceapi = window.faceapi;
      const opts = new faceapi.TinyFaceDetectorOptions({ inputSize: 320 });
      const result = await faceapi
        .detectSingleFace(videoRef.current, opts)
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (!result) {
        setStatus("ready");
        setMsg("No face detected. Ensure good lighting and look directly at camera.");
        livenessVerifiedRef.current = false;
        eyesClosedRef.current = false;
        setLiveness("pending");
        startDetectLoop();
        return;
      }

      const descriptor = Array.from(result.descriptor);
      stopCamera();
      setCaptured(true);
      setStatus("done");
      setMsg("Face descriptor captured successfully.");
      onCapture(descriptor);
    } catch (e) {
      setStatus("error");
      setMsg("Feature extraction failed: " + e.message);
    }
  };

  const bypassLiveness = () => {
    livenessVerifiedRef.current = true;
    setLiveness("verified");
    setMsg("Bypassing blink verification... Hold still.");
    setTimeout(() => {
      lockFace();
    }, 500);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStatus("loading");
    setMsg("Extracting face signature from image file...");

    try {
      const faceapi = window.faceapi;
      if (!faceapi) throw new Error("face-api.js library missing. Verify scripts in index.html.");

      const MODEL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL);
      await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL);

      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = async () => {
        try {
          const opts = new faceapi.TinyFaceDetectorOptions({ inputSize: 320 });
          const result = await faceapi
            .detectSingleFace(img, opts)
            .withFaceLandmarks(true)
            .withFaceDescriptor();

          if (!result) {
            setStatus("error");
            setMsg("No face detected in the uploaded image. Please ensure the image is bright and shows a clear face.");
            return;
          }

          const descriptor = Array.from(result.descriptor);
          setCaptured(true);
          setStatus("done");
          setMsg("Face signature extracted successfully.");
          onCapture(descriptor);
        } catch (err) {
          setStatus("error");
          setMsg("Failed to analyze image file: " + err.message);
        }
      };
    } catch (err) {
      setStatus("error");
      setMsg("Models loading failed: " + err.message);
    }
  };

  const reset = () => {
    stopCamera();
    setCaptured(false);
    setStatus("idle");
    setMsg("");
    setLiveness("pending");
  };

  useEffect(() => () => stopCamera(), []);

  const borderClass = captured
    ? "border-green bg-green-soft/20"
    : status === "error"
    ? "border-red bg-red-soft/20"
    : "border-border bg-base";

  return (
    <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${borderClass}`}>
      {/* Tab Switcher */}
      <div className="flex border-b border-divider bg-base/50 p-1">
        <button
          type="button"
          className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${
            captureMode === "webcam"
              ? "bg-white text-navy shadow-xs border border-border"
              : "text-muted hover:text-navy"
          }`}
          onClick={() => { reset(); setCaptureMode("webcam"); }}
        >
          Webcam Live Scan
        </button>
        <button
          type="button"
          className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${
            captureMode === "upload"
              ? "bg-white text-navy shadow-xs border border-border"
              : "text-muted hover:text-navy"
          }`}
          onClick={() => { reset(); setCaptureMode("upload"); }}
        >
          Upload Photo ID / Selfie
        </button>
      </div>

      {/* Video Viewport / File Upload area */}
      <div className="bg-[#0A0D14] min-h-[220px] flex items-center justify-center relative">
        {captureMode === "webcam" ? (
          <video
            ref={videoRef}
            className="w-full max-h-[220px] object-cover"
            muted
            playsInline
            style={{ display: status === "ready" || status === "detecting" ? "block" : "none" }}
          />
        ) : (
          status === "idle" && (
            <div className="text-center p-6 text-white/50 w-full">
              <label className="cursor-pointer block group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-white/20 transition-all">
                  <Camera className="w-5 h-5 text-white/80" />
                </div>
                <span className="text-xs font-bold text-white/80 block group-hover:text-white transition-colors">Click to Select Photo</span>
                <span className="text-[10px] text-white/40 block mt-1">Accepts PNG, JPG or JPEG</span>
              </label>
            </div>
          )
        )}

        {/* Idle (Webcam) */}
        {captureMode === "webcam" && status === "idle" && (
          <div className="text-center text-white/20 p-6">
            <Camera className="w-10 h-10 mx-auto mb-2.5 opacity-40 text-muted" />
            <span className="text-xs font-semibold">Biometric Camera Inactive</span>
          </div>
        )}

        {/* Loading */}
        {status === "loading" && (
          <div className="text-center text-white/50 text-xs font-medium p-6">
            <RotateCcw className="w-5 h-5 animate-spin mx-auto mb-2 text-green-glow" />
            Initializing biometric parser...
          </div>
        )}

        {/* Done */}
        {status === "done" && (
          <div className="text-center text-white/60 p-6 flex flex-col items-center">
            <div className="w-11 h-11 rounded-full bg-green text-white flex items-center justify-center mb-2.5 shadow-sm">
              <Check className="w-5.5 h-5.5" />
            </div>
            <span className="text-xs font-bold text-green-glow">Biometric Seal Locked</span>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="text-center text-red p-6 max-w-[300px]">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2.5 text-red" />
            <p className="text-xs font-medium leading-normal">{msg}</p>
          </div>
        )}

        {/* Detecting overlay */}
        {status === "detecting" && (
          <div className="absolute inset-0 bg-[#0A0D14]/75 backdrop-blur-2xs flex flex-col items-center justify-center text-white text-xs font-semibold">
            <Sparkles className="w-5 h-5 animate-pulse text-gold-bright mb-1.5" />
            Locking vector coordinates...
          </div>
        )}
      </div>

      {/* Control Actions footer */}
      <div className="p-3.5 bg-base/50 flex flex-col gap-2 border-t border-divider">
        {msg && status !== "error" && status !== "idle" && status !== "loading" && (
          <span className={`text-[11px] font-medium leading-normal block ${
            status === "done" ? "text-green-dark" : "text-muted"
          }`}>
            {msg}
          </span>
        )}

        <div className="flex gap-2.5">
          {captureMode === "webcam" && status === "idle" && (
            <button 
              className="w-full bg-white hover:bg-base text-navy border border-border text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              onClick={startCamera}
            >
              <Camera className="w-3.5 h-3.5" /> {label}
            </button>
          )}
          {status === "loading" && (
            <button 
              className="w-full bg-base text-muted border border-border text-xs font-bold py-2 rounded-lg cursor-not-allowed flex items-center justify-center gap-1.5" 
              disabled
            >
              Configuring...
            </button>
          )}
          {captureMode === "webcam" && status === "ready" && (
            <div className="flex flex-col w-full gap-2">
              <button 
                className={`w-full text-xs font-bold py-2 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all ${
                  liveness === "verified"
                    ? "bg-navy hover:bg-navy-mid text-white"
                    : "bg-base text-muted border border-border cursor-not-allowed opacity-70"
                }`}
                onClick={lockFace}
                disabled={liveness !== "verified"}
              >
                {liveness === "verified" ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Capture Biometric descriptor
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-pulse text-gold-bright" /> Blink Eyes to Unlock Bio-capture
                  </>
                )}
              </button>
              {liveness !== "verified" && (
                <button
                  type="button"
                  onClick={bypassLiveness}
                  className="w-full bg-white hover:bg-base text-text border text-[10px] font-bold py-1 rounded transition-colors"
                >
                  Blink scan failed? Click here to bypass liveness check
                </button>
              )}
            </div>
          )}
          {status === "detecting" && (
            <button 
              className="w-full bg-base text-muted border border-border-soft text-xs font-bold py-2 rounded-lg cursor-not-allowed flex items-center justify-center gap-1.5"
              disabled
            >
              Extracting Face landmarks...
            </button>
          )}
          {(status === "done" || status === "error") && (
            <button 
              className="w-full bg-white hover:bg-base text-navy border border-border text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              onClick={reset}
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retake / Reset capture
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

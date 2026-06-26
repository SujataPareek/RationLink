import { useState, useEffect } from "react";
import Icon from "./Icon";

/**
 * Topbar — used on every inner page (not landing)
 * Props:
 *   title       — page title (bold)
 *   subtitle    — small text below title
 *   onBack      — function to call on back click (omit to hide back btn)
 *   backLabel   — label for back button (default "Back")
 *   right       — JSX for right side actions
 */
export default function Topbar({ title, subtitle, onBack, backLabel = "Back", right }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="topbar">
      <div className="topbar-left">
        {/* Brand */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginRight:16, flexShrink:0 }}>
          <div className="brand-icon" style={{ width:28, height:28, background:"#1E8E3E" }}>
            <Icon.Leaf />
          </div>
          <span style={{ fontFamily:"sans-serif", fontWeight:"bold", fontSize:16, color:"white", letterSpacing:"-0.01em" }}>
            Smart<span style={{ color:"#FF9933" }}>PDS</span>
          </span>
        </div>

        {/* Divider */}
        {onBack && <div style={{ width:1, height:24, background:"rgba(255,255,255,0.12)", marginRight:12 }}/>}

        {/* Back button */}
        {onBack && (
          <button className="back-btn" onClick={onBack}>
            <Icon.Back />
            {backLabel}
          </button>
        )}

        {/* Title */}
        {title && (
          <div>
            <div className="topbar-title">{title}</div>
            {subtitle && <div className="topbar-sub">{subtitle}</div>}
          </div>
        )}

        {/* Online/Offline Connection Status Indicator */}
        <div style={{ marginLeft: 16, display: "flex", alignItems: "center" }}>
          {isOnline ? (
            <span className="inline-flex items-center gap-1 bg-[#EAF5EC] border border-[#1E8E3E]/30 px-2 py-0.5 rounded-full text-[9px] font-bold text-[#1E8E3E] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1E8E3E] animate-pulse" />
              Online
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-[#FFF3E0] border border-[#FF9933]/30 px-2 py-0.5 rounded-full text-[9px] font-bold text-[#FF9933] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF9933]" />
              Offline
            </span>
          )}
        </div>
      </div>

      <div className="topbar-right">{right}</div>
    </div>
  );
}

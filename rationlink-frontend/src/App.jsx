import { useState, useEffect } from "react";
import LandingPage    from "./pages/LandingPage";
import RegisterPage   from "./pages/RegisterPage";
import LoginPage      from "./pages/LoginPage";
import DashboardPage  from "./pages/DashboardPage";
import AdminDashboard from "./pages/AdminDashboard";
import DealerDashboard from "./pages/DealerDashboard";
import RationCollect  from "./pages/RationCollect";
import GrainQuality   from "./pages/GrainQuality";
import AboutPage      from "./pages/AboutPage";
import "./index.css";

export default function App() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState(() => localStorage.getItem("rationlink_lang") || "en");

  // ── Load Session on Mount ──
  useEffect(() => {
    const savedSession = localStorage.getItem("rationlink_session");
    if (savedSession) {
      try {
        const u = JSON.parse(savedSession);
        setUser(u);
        setPage("dashboard");
      } catch (e) {
        localStorage.removeItem("rationlink_session");
      }
    }
    setLoading(false);
  }, []);

  const navigate = (p, data) => {
    // ── Logout Handling ──
    if (p === "landing") {
      setUser(null);
      localStorage.removeItem("rationlink_session");
    } 
    // ── Session Syncing ──
    else if (data !== undefined) {
      setUser(data);
      if (data) {
        localStorage.setItem("rationlink_session", JSON.stringify(data));
      } else {
        localStorage.removeItem("rationlink_session");
      }
    }
    
    setPage(p);
    window.scrollTo(0, 0);
  };

  const toggleLang = () => {
    const next = lang === "en" ? "hi" : "en";
    setLang(next);
    localStorage.setItem("rationlink_lang", next);
  };

  // ── Route Protection ──
  useEffect(() => {
    if (loading) return;

    const protectedPages = ["dashboard", "collect"];
    const guestOnlyPages = ["login", "register"];

    if (!user && protectedPages.includes(page)) {
      setPage("login");
    } else if (user && guestOnlyPages.includes(page)) {
      setPage("dashboard");
    }
  }, [page, user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-navy">Loading RationLink Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {page === "landing"   && <LandingPage  navigate={navigate} lang={lang} toggleLang={toggleLang} />}
      {page === "register"  && <RegisterPage navigate={navigate} lang={lang} toggleLang={toggleLang} />}
      {page === "login"     && <LoginPage    navigate={navigate} setUser={setUser} lang={lang} toggleLang={toggleLang} />}
      {page === "about"     && <AboutPage    navigate={navigate} lang={lang} toggleLang={toggleLang} />}
      {page === "grain"     && <GrainQuality navigate={navigate} lang={lang} toggleLang={toggleLang} />}
      {page === "collect"   && <RationCollect user={user} navigate={navigate} lang={lang} toggleLang={toggleLang} />}
      {page === "dashboard" && (
        user?.role === "admin"
          ? <AdminDashboard user={user} navigate={navigate} lang={lang} toggleLang={toggleLang} />
          : user?.role === "dealer"
            ? <DealerDashboard user={user} navigate={navigate} lang={lang} toggleLang={toggleLang} />
            : <DashboardPage  user={user} navigate={navigate} lang={lang} toggleLang={toggleLang} />
      )}
    </div>
  );
}
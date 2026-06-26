import { useState, useEffect } from "react";
import * as api from "../services/api";
import { 
  Link, 
  Camera, 
  ShieldCheck, 
  LineChart, 
  ScanLine, 
  Smartphone, 
  ArrowRight, 
  Award,
  Layers,
  ChevronRight,
  Database,
  Cpu,
  Server,
  Cloud
} from "lucide-react";

const TRANSLATIONS = {
  en: {
    heroTag: "Smart PDS Initiative",
    heroTitle: "Transparent & Secure Ration Distribution System",
    heroDesc: "Securing national food grains distribution with biometric verification, automated quality inspection, and real-time inventory management. Building a fraud-free public distribution system.",
    getStarted: "Beneficiary Citizen Portal",
    dealerLogin: "FPS Depot Operator Login",
    noticesTitle: "Official Notices & Circulars",
    announcementsBoard: "PDS Notices Board",
    helpline: "National Toll-Free Helpline: 1967",
    featuresTitle: "Core Accountability Controls",
    featuresDesc: "Enhancing the transparency of the Public Distribution System (PDS) to ensure essential food grains reach the correct beneficiaries.",
    stepsTitle: "Ration Collection Flow",
    stepsDesc: "Simple verification steps for beneficiaries to collect their monthly allocation at fair price counters.",
    footerText: "Smart PDS Portal · Department of Food & Public Distribution · Ministry of Consumer Affairs, Food & Public Distribution",
    govIndia: "Government of India",
    coverageLabel: "National Coverage",
    coverageVal: "81.3 Crore",
    coverageSub: "Beneficiaries covered under NFSA 2013",
    accuracyLabel: "Identity Integration",
    accuracyVal: "100% Aadhaar",
    accuracySub: "Linked & verified distribution units",
    depotsLabel: "Fair Price Shops (FPS)",
    depotsVal: "5.4 Lakh+",
    depotsSub: "Digitized counters across India",
    qualityLabel: "Subsidized Commodities",
    qualityVal: "Fortified",
    qualitySub: "Nutritious grain stocks distributed",
    aboutLink: "About Portal",
    signInLink: "Sign In",
    registerLink: "Register Account",
    langName: "Hindi (हिन्दी)"
  },
  hi: {
    heroTag: "स्मार्ट पीडीएस पहल",
    heroTitle: "पारदर्शी एवं सुरक्षित राशन वितरण प्रणाली",
    heroDesc: "बायोमेट्रिक सत्यापन, स्वचालित गुणवत्ता निरीक्षण और वास्तविक समय में इन्वेंटरी प्रबंधन के साथ राष्ट्रीय खाद्य सुरक्षा खाद्यान्न वितरण को सुरक्षित करना। भ्रष्टाचार मुक्त वितरण प्रणाली का निर्माण।",
    getStarted: "लाभार्थी नागरिक पोर्टल",
    dealerLogin: "उचित दर दुकान संचालक लॉगिन",
    noticesTitle: "आधिकारिक सूचनाएं और परिपत्र",
    announcementsBoard: "राशन सूचना बोर्ड",
    helpline: "राष्ट्रीय टोल-फ्री हेल्पलाइन: 1967",
    featuresTitle: "मुख्य जवाबदेही नियंत्रण",
    featuresDesc: "सार्वजनिक वितरण प्रणाली (पीडीएस) की पारदर्शिता को बढ़ाना ताकि यह सुनिश्चित हो सके कि खाद्यान्न सही लाभार्थियों तक पहुंचे।",
    stepsTitle: "राशन संग्रह प्रक्रिया",
    stepsDesc: "राशन कार्ड धारकों के लिए उचित दर काउंटर से अपना मासिक आवंटन प्राप्त करने की सरल चरणबद्ध प्रक्रिया।",
    footerText: "स्मार्ट पीडीएस पोर्टल · खाद्य और सार्वजनिक वितरण विभाग · उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय",
    govIndia: "भारत सरकार",
    coverageLabel: "राष्ट्रीय कवरेज",
    coverageVal: "81.3 करोड़",
    coverageSub: "एनएफएसए 2013 के तहत शामिल लाभार्थी",
    accuracyLabel: "पहचान एकीकरण",
    accuracyVal: "100% आधार",
    accuracySub: "संबद्ध और सत्यापित राशन इकाइयाँ",
    depotsLabel: "उचित दर दुकानें (FPS)",
    depotsVal: "5.4 लाख+",
    depotsSub: "देश भर में डिजिटल काउंटर",
    qualityLabel: "अनुदानित वस्तुएं",
    qualityVal: "फोर्टिफाइड",
    qualitySub: "पोषक तत्वों से भरपूर अनाज वितरण",
    aboutLink: "पोर्टल विवरण",
    signInLink: "लॉगिन करें",
    registerLink: "नया पंजीकरण",
    langName: "English"
  }
};

const getFeatures = (lang) => {
  const isEn = lang === "en";
  return [
    { 
      icon: Link, 
      title: isEn ? "Secure Distribution Records" : "सुरक्षित वितरण रिकॉर्ड", 
      desc: isEn ? "Secures every ration transaction with unique cryptographic seals, preventing duplicate or ghost card checkouts." : "प्रत्येक राशन लेनदेन को विशिष्ट डिजिटल सील से सुरक्षित करता है, जिससे नकली राशन निकासी को रोका जा सके।"
    },
    { 
      icon: Camera, 
      title: isEn ? "Biometric Verification" : "बायोमेट्रिक सत्यापन", 
      desc: isEn ? "Face match verification at fair price counters prevents proxy collections and protects beneficiaries against identity duplication." : "उचित दर दुकानों पर चेहरा सत्यापन प्रॉक्सी संग्रह को रोकता है और लाभार्थियों की राशन पहचान सुरक्षित करता है।"
    },
    { 
      icon: ShieldCheck, 
      title: isEn ? "Leakage Auditing" : "वितरण रिसाव ऑडिटिंग", 
      desc: isEn ? "System-wide scans alert authorities about card duplication, over-allocation, and suspicious collection frequencies." : "सिस्टम-व्यापी स्कैन दोहराव कार्ड, सीमा से अधिक आवंटन और संदिग्ध संग्रह आवृत्तियों के बारे में अधिकारियों को सचेत करता है।"
    },
    { 
      icon: LineChart, 
      title: isEn ? "Demand Optimization" : "मांग अनुकूलन", 
      desc: isEn ? "Predicts regional allocation requirements based on consumption trends to prevent grain shortages in rural depots." : "अनाज की कमी को रोकने के लिए ऐतिहासिक उपभोग प्रवृत्तियों के आधार पर क्षेत्रीय राशन आवश्यकताओं का सटीक अनुमान लगाता है।"
    },
    { 
      icon: ScanLine, 
      title: isEn ? "Grain Quality Inspection" : "अनाज गुणवत्ता निरीक्षण", 
      desc: isEn ? "Automated visual analysis of grain samples verifies impurity counts and commodity grades before distribution." : "अनाज के नमूनों का स्वचालित दृश्य विश्लेषण वितरण से पहले अशुद्धियों और अनाज की गुणवत्ता ग्रेड की पुष्टि करता है।"
    },
    { 
      icon: Smartphone, 
      title: isEn ? "Mobile OTP Support" : "मोबाइल ओटीपी सुविधा", 
      desc: isEn ? "Alternative secure SMS OTP-based authentication ensures smooth shop operations even during network variations." : "वैकल्पिक सुरक्षित एसएमएस ओटीपी-आधारित सत्यापन नेटवर्क की स्थिति खराब होने पर भी सुचारू संचालन सुनिश्चित करता है।"
    },
  ];
};

const getSteps = (lang) => {
  const isEn = lang === "en";
  return [
    { num: "01", title: isEn ? "Cardholder Verification" : "कार्डधारक सत्यापन", desc: isEn ? "Search and fetch beneficiary ration profile using card number or registered mobile." : "कार्ड नंबर या पंजीकृत मोबाइल नंबर का उपयोग करके लाभार्थी की राशन प्रोफाइल खोजें।" },
    { num: "02", title: isEn ? "Biometric Authentication" : "बायोमेट्रिक प्रमाणीकरण", desc: isEn ? "Trigger face biometric matching or secure SMS OTP code at the counter." : "उचित दर काउंटर पर फेस बायोमेट्रिक मिलान या सुरक्षित एसएमएस ओटीपी सत्यापित करें।" },
    { num: "03", title: isEn ? "Quality Validation" : "अनाज गुणवत्ता जांच", desc: isEn ? "Verify quality grades of the grain sample tray using CV scanner camera." : "अनाज नमूना ट्रे की गुणवत्ता ग्रेड की जांच स्कैनर कैमरे का उपयोग करके करें।" },
    { num: "04", title: isEn ? "Sealed Distribution" : "सुरक्षित खाद्यान्न वितरण", desc: isEn ? "Dispense allocation commodities while the digital receipt is sealed in the ledger." : "आवंटित वस्तुओं का वितरण करें, जब तक कि डिजिटल रसीद पीडीएस लेजर में दर्ज हो जाए।" },
  ];
};

export default function LandingPage({ navigate, lang, toggleLang }) {
  const [announcements, setAnnouncements] = useState([]);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  useEffect(() => {
    api.getAnnouncements()
      .then(res => setAnnouncements(res.announcements || []))
      .catch(err => console.error("Failed to load announcements:", err));
  }, []);

  return (
    <div className="min-h-screen bg-base text-text selection:bg-navy/10 selection:text-navy font-sans">
      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-navy-dark border-b border-white/10 flex items-center shadow-md">
        <div className="max-w-6xl mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("landing")}>
            <div className="w-8 h-8 rounded bg-white text-navy flex items-center justify-center font-bold">
              <Award className="w-5 h-5 text-navy" />
            </div>
            <span className="font-serif text-lg font-bold text-white tracking-wide">
              Smart<span className="text-gold-bright">PDS</span>
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button className="nav-link-custom" onClick={toggleLang}>
              🌐 {t.langName}
            </button>
            <button className="nav-link-custom" onClick={() => navigate("about")}>
              {t.aboutLink}
            </button>
            <button className="nav-link-custom" onClick={() => navigate("login")}>
              {t.signInLink}
            </button>
            <button className="bg-green hover:bg-green-dark text-white font-bold text-xs px-3.5 py-1.5 rounded shadow-sm transition-all" onClick={() => navigate("register")}>
              {t.registerLink}
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="relative bg-gradient-to-br from-navy-dark to-navy pt-28 pb-20 overflow-hidden border-b border-navy-mid text-white">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          <div className="md:col-span-7 flex flex-col items-start">
            {/* National Flag Tri-Color Accent */}
            <div className="flex gap-1 mb-5">
              <div className="h-1 w-10 bg-[#FF9933]" />
              <div className="h-1 w-10 bg-white" />
              <div className="h-1 w-10 bg-[#138808]" />
            </div>

            <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider mb-4">
              <Layers className="w-3 h-3 text-gold-bright" /> {t.heroTag}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
              {t.heroTitle}
            </h1>

            <p className="text-white/70 text-sm md:text-base leading-relaxed mb-6 max-w-xl">
              {t.heroDesc}
            </p>

            <div className="flex flex-wrap gap-3">
              <button 
                className="bg-green hover:bg-green-dark text-white font-bold text-xs px-6 py-3 rounded shadow-lg transition-all flex items-center gap-1.5" 
                onClick={() => navigate("login")}
              >
                {t.getStarted} <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-6 py-3 rounded border border-white/20 transition-all" 
                onClick={() => navigate("login")}
              >
                {t.dealerLogin}
              </button>
            </div>
          </div>

          {/* Real PDS Metrics Panel */}
          <div className="md:col-span-5 flex flex-col gap-3">
            {[
              { label: t.coverageLabel, value: t.coverageVal, sub: t.coverageSub },
              { label: t.accuracyLabel, value: t.accuracyVal, sub: t.accuracySub },
              { label: t.depotsLabel, value: t.depotsVal, sub: t.depotsSub },
              { label: t.qualityLabel, value: t.qualityVal, sub: t.qualitySub },
            ].map((stat, i) => (
              <div 
                key={i} 
                className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <div>
                  <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider block mb-0.5">
                    {stat.label}
                  </span>
                  <span className="text-xl font-bold text-gold-bright tracking-wide">
                    {stat.value}
                  </span>
                </div>
                <div className="text-[10px] text-white/60 text-right font-medium max-w-[150px]">
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ANNOUNCEMENTS NOTICE BOARD ── */}
      <div className="py-12 bg-white border-b border-divider">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-navy tracking-wider uppercase block mb-1">
                {t.noticesTitle}
              </span>
              <h2 className="text-2xl text-navy font-bold">
                {t.announcementsBoard}
              </h2>
            </div>
            <div className="flex items-center gap-2 bg-blue-soft border border-blue/20 text-blue px-4 py-2 rounded-lg text-xs font-semibold">
              <span className="w-2.5 h-2.5 bg-blue rounded-full animate-pulse" />
              {t.helpline}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {announcements.length > 0 ? (
              announcements.map((ann) => (
                <div key={ann.id} className="bg-base border border-border rounded-xl p-5 hover:shadow-sm transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b pb-2">
                      <span className="text-[9px] font-bold text-white bg-navy px-2 py-0.5 rounded uppercase">
                        {lang === "en" ? "Notice" : "सूचना"}
                      </span>
                      <span className="text-xs text-muted font-semibold">{ann.date}</span>
                    </div>
                    <h3 className="text-navy font-bold text-sm mb-2">{ann.title}</h3>
                    <p className="text-text-sub text-xs leading-relaxed">{ann.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-6 text-muted text-sm">
                No active announcements found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CORE CONTROLS ── */}
      <div className="py-16 bg-base border-b border-divider">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-navy tracking-wider uppercase block mb-2">
              {t.heroTag}
            </span>
            <h2 className="text-2xl sm:text-3xl text-navy font-bold mb-3">
              {t.featuresTitle}
            </h2>
            <p className="text-text-sub text-sm leading-relaxed">
              {t.featuresDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFeatures(lang).map((feat, i) => {
              const IconComp = feat.icon;
              return (
                <div 
                  key={i} 
                  className="bg-white border border-border rounded-xl p-5 shadow-xs hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 flex flex-col items-start group"
                >
                  <div className="w-9 h-9 rounded bg-navy-soft text-navy flex items-center justify-center mb-3 group-hover:bg-navy group-hover:text-white transition-all">
                    <IconComp className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-navy font-bold text-sm mb-1.5 group-hover:text-navy transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-text-sub text-xs leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── FLOW PROCESS ── */}
      <div className="py-16 bg-white border-b border-divider">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-lg mx-auto mb-12">
            <span className="text-xs font-bold text-navy tracking-wider uppercase block mb-2">
              {lang === "en" ? "Verification Procedure" : "सत्यापन प्रक्रिया"}
            </span>
            <h2 className="text-2xl text-navy font-bold">
              {t.stepsTitle}
            </h2>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="hidden lg:block absolute top-5 left-[12%] right-[12%] h-0.5 bg-border pointer-events-none" />
            
            {getSteps(lang).map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center px-2 relative z-10 group">
                <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center text-sm font-bold mb-3 shadow-xs group-hover:bg-green transition-colors relative">
                  {step.num}
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-gold border border-white" />
                </div>
                <h4 className="text-navy font-bold text-sm mb-1 group-hover:text-green-dark transition-colors">
                  {step.title}
                </h4>
                <p className="text-text-sub text-[11px] leading-relaxed max-w-[180px]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-navy-dark text-white border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50 font-medium">
              {t.footerText}
            </span>
          </div>
          <div className="text-xs text-white/40 text-center md:text-right">
            {t.govIndia} · © 2026.
          </div>
          {/* Indian Flag Tri-color Accent */}
          <div className="flex gap-1">
            <div className="w-3 h-1 bg-[#FF9933]" />
            <div className="w-3 h-1 bg-white" />
            <div className="w-3 h-1 bg-[#138808]" />
          </div>
        </div>
      </footer>
    </div>
  );
}

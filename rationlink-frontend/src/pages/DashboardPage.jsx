import { useState, useEffect } from "react";
import { 
  Globe, 
  List, 
  ShieldCheck, 
  User, 
  Sparkles, 
  LogOut, 
  Layers, 
  ShoppingBag,
  History,
  Activity,
  ArrowRight,
  Info,
  Calendar,
  Lock,
  ExternalLink,
  ChevronRight,
  Cpu,
  HelpCircle
} from "lucide-react";
import Topbar from "../components/Topbar";
import * as api from "../services/api";

const TRANSLATIONS = {
  en: {
    welcome: "Namaste",
    rationCard: "Ration Card",
    schemeTier: "Subsidized Scheme",
    availBalance: "Available Grain Balance",
    allottedLimit: "of {allotted} kg allotted this month",
    quickActions: "Quick Actions",
    collectRation: "Collect Grain Quota",
    collectSub: "At counter terminal",
    inspectGrain: "Inspect Grains Quality",
    inspectSub: "Visual quality check",
    auditReceipts: "Audit Distribution Receipts",
    auditSub: "Verify digital seal",
    myAllocation: "My Allocation",
    history: "Collection History",
    familyUnit: "Family Unit",
    grievance: "Citizen Grievance",
    calculator: "Scheme Calculator",
    schemes: "Welfare Schemes",
    profile: "Biometric Profile",
    entitlementBreakdown: "Detailed Entitlement Breakdown",
    entitlementSub: "Standard rates approved under food security mandates",
    itemRice: "Fine Rice",
    itemWheat: "Whole Wheat",
    itemSugar: "Refined Sugar",
    itemPulses: "Split Pulses (Dal)",
    itemSalt: "Nutrient Salt",
    itemKerosene: "Kerosene Oil",
    freeOfCost: "Free of cost",
    subsidizedRates: "Subsidized rates",
    rateRice: "₹ 3 / kg",
    rateWheat: "₹ 2 / kg",
    rateSugar: "₹ 13.50 / kg",
    ratePulses: "₹ 15 / kg",
    rateSalt: "Free",
    rateKerosene: "Subsidized",
    txnLogs: "Ration Collection History",
    txnSub: "Dispensation logs recorded for this card unit",
    txnId: "Txn ID",
    txnItem: "Commodity",
    txnWeight: "Weight",
    txnShop: "FPS Depot",
    txnDate: "Dispensed Date",
    txnStatus: "Status",
    noHistory: "No distribution history found for this card.",
    startCollection: "Initiate Quota Checkout",
    familyRegistry: "Household Family Registry",
    familySub: "Members registered under this ration card unit. Aadhaar link status is mandatory.",
    familyHead: "Head of Family",
    relationship: "Relationship",
    age: "Age",
    aadhaarVerified: "Aadhaar Linked",
    linkPending: "Link Pending",
    registerGrievance: "Register Grievance / Complaint",
    grievanceSub: "Lodge service discrepancies. All submissions are audited by regional officials.",
    complaintCat: "Complaint Category",
    detailedMsg: "Detailed Message",
    placeholderMsg: "Provide specific details, dates, weights, or shop codes to assist auditing officers...",
    submitComplaint: "File Official Complaint",
    grievanceLog: "Grievance Status Log",
    grievanceLogSub: "Track the progress of registered public disputes.",
    noGrievances: "No grievances logged under this ration card.",
    calcTitle: "Welfare Allocation & Scheme Calculator",
    calcSub: "Estimate monthly grain allocations and check eligibility for food subsidies.",
    calcCategory: "Family Category Tier",
    calcMembers: "Number of Family Members",
    calcIncome: "Annual Household Income",
    calcEstAllotted: "Estimated Monthly Allocation",
    calcEstCost: "Approximate Subsidized Cost",
    calcRecommendation: "System Policy Recommendation",
    calcPolicyDesc: "Based on target parameters under NFSA 2013 distribution mandates.",
    profileTitle: "Beneficiary Enrollment Details",
    profileName: "Beneficiary Name",
    profileAadhaar: "Aadhaar Card No.",
    profileMobile: "Mobile Number",
    profileArea: "FPS Allocation Area",
    profileAddress: "Residential Address",
    auditStatusTitle: "Transaction Security Status",
    auditText: "Your PDS ration allocations are secured using cryptographic audit trails to prevent fraud.",
    auditSecure: "Allocation Status: ACTIVE",
    auditReceiptSeal: "Digital receipt seals: VERIFIED",
    auditProtection: "Anti-manipulation checks: ACTIVE",
    auditSuccess: "PDS Compliance: SUCCESS",
  },
  hi: {
    welcome: "नमस्ते",
    rationCard: "राशन कार्ड",
    schemeTier: "योजना श्रेणी",
    availBalance: "उपलब्ध अनाज संतुलन",
    allottedLimit: "इस महीने आवंटित {allotted} किलोग्राम में से",
    quickActions: "त्वरित कार्रवाई",
    collectRation: "अनाज कोटा प्राप्त करें",
    collectSub: "काउंटर टर्मिनल पर",
    inspectGrain: "अनाज गुणवत्ता जांचें",
    inspectSub: "गुणवत्ता जांचें",
    auditReceipts: "वितरण रसीदें देखें",
    auditSub: "डिजिटल सील सत्यापित करें",
    myAllocation: "मेरा आवंटन",
    history: "वितरण इतिहास",
    familyUnit: "परिवार के सदस्य",
    grievance: "नागरिक शिकायतें",
    calculator: "योजना कैलकुलेटर",
    schemes: "कल्याणकारी योजनाएं",
    profile: "बायोमेट्रिक प्रोफाइल",
    entitlementBreakdown: "विस्तृत आवंटन विवरण",
    entitlementSub: "खाद्य सुरक्षा नियमों के तहत स्वीकृत मानक दरें",
    itemRice: "बढ़िया चावल",
    itemWheat: "साबुत गेहूं",
    itemSugar: "परिष्कृत चीनी",
    itemPulses: "दाल (विभाजित)",
    itemSalt: "पोषक नमक",
    itemKerosene: "मिट्टी का तेल",
    freeOfCost: "निःशुल्क",
    subsidizedRates: "अनुदानित दरें",
    rateRice: "₹ 3 / किग्रा",
    rateWheat: "₹ 2 / किग्रा",
    rateSugar: "₹ 13.50 / किग्रा",
    ratePulses: "₹ 15 / किग्रा",
    rateSalt: "मुफ़्त",
    rateKerosene: "अनुदानित",
    txnLogs: "राशन वितरण इतिहास",
    txnSub: "इस राशन कार्ड यूनिट के लिए दर्ज वितरण विवरण",
    txnId: "लेनदेन संख्या",
    txnItem: "वस्तु",
    txnWeight: "वजन",
    txnShop: "राशन डिपो",
    txnDate: "वितरण तिथि",
    txnStatus: "स्थिति",
    noHistory: "इस राशन कार्ड के लिए कोई वितरण इतिहास नहीं मिला।",
    startCollection: "कोटा चेकआउट शुरू करें",
    familyRegistry: "पारिवारिक सदस्य पंजीकरण सूची",
    familySub: "इस राशन कार्ड के तहत पंजीकृत सदस्य। आधार लिंक होना अनिवार्य है।",
    familyHead: "परिवार का मुखिया",
    relationship: "संबंध",
    age: "उम्र",
    aadhaarVerified: "आधार लिंक है",
    linkPending: "लिंक लंबित है",
    registerGrievance: "शिकायत दर्ज करें",
    grievanceSub: "सेवा विसंगतियों की शिकायत करें। सभी शिकायतें क्षेत्रीय अधिकारियों द्वारा ऑडिट की जाती हैं।",
    complaintCat: "शिकायत श्रेणी",
    detailedMsg: "विस्तृत संदेश",
    placeholderMsg: "ऑडिट अधिकारियों की सहायता के लिए विशिष्ट विवरण, तारीखें, वजन या दुकान कोड प्रदान करें...",
    submitComplaint: "आधिकारिक शिकायत दर्ज करें",
    grievanceLog: "शिकायत स्थिति लॉग",
    grievanceLogSub: "दर्ज सार्वजनिक विवादों की प्रगति को ट्रैक करें।",
    noGrievances: "इस राशन कार्ड के तहत कोई शिकायत दर्ज नहीं है।",
    calcTitle: "कल्याण आवंटन और पात्रता कैलकुलेटर",
    calcSub: "मासिक खाद्यान्न आवंटन का अनुमान लगाएं और खाद्य सब्सिडी के लिए अपनी पात्रता जांचें।",
    calcCategory: "पारिवारिक पात्रता श्रेणी",
    calcMembers: "परिवार के सदस्यों की संख्या",
    calcIncome: "वार्षिक पारिवारिक आय",
    calcEstAllotted: "अनुमानित मासिक आवंटन",
    calcEstCost: "अनुमानित सब्सिडी मूल्य",
    calcRecommendation: "सिस्टम नीति सिफारिश",
    calcPolicyDesc: "खाद्य सुरक्षा अधिनियम 2013 वितरण नियमों के आधार पर।",
    profileTitle: "लाभार्थी पंजीकरण विवरण",
    profileName: "लाभार्थी का नाम",
    profileAadhaar: "आधार कार्ड संख्या",
    profileMobile: "मोबाइल नंबर",
    profileArea: "आवंटित उचित दर क्षेत्र",
    profileAddress: "पंजीकृत आवासीय पता",
    auditStatusTitle: "लेनदेन सुरक्षा स्थिति",
    auditText: "धोखाधड़ी को रोकने के लिए आपके राशन आवंटन डिजिटल सुरक्षा जांच के तहत सुरक्षित हैं।",
    auditSecure: "आवंटन स्थिति: सक्रिय",
    auditReceiptSeal: "डिजिटल रसीद सील: सत्यापित",
    auditProtection: "छेड़छाड़ रोकथाम जांच: सक्रिय",
    auditSuccess: "पीडीएस अनुपालन स्थिति: सफल",
  }
};

const GOVT_SCHEMES = [
  {
    name: "PM Garib Kalyan Anna Yojana (PMGKAY)",
    short: "PMGKAY",
    badge: "Active Allocation",
    desc: "Additional free 5 kg grain (rice/wheat) per person per month to over 80 crore NFSA beneficiaries.",
    benefit: "5 kg/person FREE",
    ministry: "Ministry of Consumer Affairs, Food & PD",
    link: "https://dfpd.gov.in",
  },
  {
    name: "Antyodaya Anna Yojana (AAY)",
    short: "AAY",
    badge: "Special Quota",
    desc: "Highly subsidised grains (35 kg per family per month) dedicated to poorest-of-the-poor households.",
    benefit: "35 kg/family @ ₹2-3/kg",
    ministry: "Ministry of Consumer Affairs, Food & PD",
    link: "https://dfpd.gov.in",
  },
  {
    name: "National Food Security Act (NFSA)",
    short: "NFSA",
    badge: "Primary Scheme",
    desc: "Subsidised grain entitlement covering up to 75% rural and 50% urban populations.",
    benefit: "5 kg/person @ subsidised rate",
    ministry: "Ministry of Consumer Affairs, Food & PD",
    link: "https://nfsa.gov.in",
  },
  {
    name: "One Nation One Ration Card",
    short: "ONORC",
    badge: "Portability Active",
    desc: "Enables national portability, allowing migrants to claim ration from any Fair Price Shop in India.",
    benefit: "Pan-India grain claims",
    ministry: "Ministry of Consumer Affairs, Food & PD",
    link: "https://impds.nic.in",
  },
];

export default function DashboardPage({ user, navigate, lang, toggleLang }) {
  const [tab, setTab] = useState("overview");
  const [txns, setTxns] = useState([]);
  const [family, setFamily] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [category, setCategory] = useState("Short Allocation");
  const [message, setMessage] = useState("");
  const [submittingGrievance, setSubmittingGrievance] = useState(false);
  
  // Calculator states
  const [calcMembers, setCalcMembers] = useState(4);
  const [calcIncome, setCalcIncome] = useState(48000);
  const [calcCategory, setCalcCategory] = useState("NFSA");

  // Live Depot Stats & Chatbot
  const [regionalStatsData, setRegionalStatsData] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: "bot", text: `Namaste! I am Ration Mitra, your PDS digital assistant. How can I help you today?` }
  ]);
  const [faqSearch, setFaqSearch] = useState("");
  const [showInspectorContact, setShowInspectorContact] = useState(false);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const fetchGrievances = () => {
    if (user?.mobile || user?.user_id) {
      api.getGrievances(user.mobile || user.user_id)
        .then(r => setGrievances(r.grievances || []))
        .catch(() => {});
    }
  };

  useEffect(() => {
    if (!user || (!user.mobile && !user.user_id)) return;

    api.getUserTransactions(user.mobile || user.user_id, 20)
      .then(r => setTxns(r.transactions || []))
      .catch(() => {});

    api.regionalStats()
      .then(r => setRegionalStatsData(r || []))
      .catch(() => {});

    if (user.mobile) {
      api.getFamilyMembers(user.mobile)
        .then(r => {
          const fm = r.family_members || [];
          setFamily(fm);
          setCalcMembers(fm.length + 1);
        })
        .catch(() => {});
    }
    fetchGrievances();
  }, [user]);

  const handleGrievanceSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmittingGrievance(true);
    try {
      await api.submitGrievance({
        user_id: user.mobile || user.user_id,
        category,
        message
      });
      setMessage("");
      fetchGrievances();
    } catch (err) {
      console.error(err);
    }
    setSubmittingGrievance(false);
  };

  const calcRation = calcCategory === "AAY" ? 35 : (calcMembers * 5);
  const calcCost = calcCategory === "AAY" ? 35 * 3 : (calcMembers * 5 * 2.5);
  let recommendedScheme = lang === "en" ? "National Food Security Act (NFSA)" : "राष्ट्रीय खाद्य सुरक्षा अधिनियम (NFSA)";
  if (calcIncome <= 24000) {
    recommendedScheme = lang === "en" ? "Antyodaya Anna Yojana (AAY) - Special Support" : "अंत्योदय अन्न योजना (AAY) - विशेष सहायता";
  } else if (calcIncome > 120000) {
    recommendedScheme = lang === "en" ? "Non-Subsidised Food Security (General Category)" : "गैर-अनुदानित खाद्य सुरक्षा (सामान्य श्रेणी)";
  }

  const allotted = user?.allotted_ration ?? 35;
  const used = user?.used_ration ?? 0;
  const remaining = user?.remaining_ration ?? 35;
  const pct = Math.round((used / allotted) * 100);

  const TABS = [
    { id: "overview", label: t.myAllocation, icon: Globe },
    { id: "transactions", label: t.history, icon: History },
    { id: "family", label: t.familyUnit, icon: User },
    { id: "grievance", label: t.grievance, icon: Info },
    { id: "calculator", label: t.calculator, icon: Sparkles },
    { id: "schemes", label: t.schemes, icon: Layers },
    { id: "faq", label: lang === "en" ? "Knowledge / Help" : "सहायता / सामान्य प्रश्न", icon: HelpCircle },
    { id: "profile", label: t.profile, icon: Lock },
  ];

  const handleChatQuery = (text) => {
    if (!text.trim()) return;
    
    // Add user message
    const userMsg = { sender: "user", text };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");

    // Simulate bot response
    setTimeout(() => {
      let replyText = "";
      const lower = text.toLowerCase();
      const currentArea = user?.area || "Delhi";
      const localDepotData = regionalStatsData.find(
        d => d.area?.toLowerCase() === currentArea.toLowerCase()
      ) || { stock_kg: 4250 };

      if (lower.includes("balance") || lower.includes("quota") || lower.includes("कितना") || lower.includes("संतुलन") || lower.includes("कोटा")) {
        replyText = lang === "en" 
          ? `Namaste ${user?.full_name?.split(" ")[0]}! Your remaining ration balance for this month is ${remaining} kg (Allotted: ${allotted} kg, Claimed: ${used} kg). rice: 15.0kg, wheat: 10.0kg.`
          : `नमस्ते ${user?.full_name?.split(" ")[0]}! इस महीने के लिए आपका शेष राशन कोटा ${remaining} किलोग्राम है (आवंतित: ${allotted} किग्रा, प्राप्त: ${used} किग्रा)।`;
      } else if (lower.includes("biometric") || lower.includes("face") || lower.includes("fail") || lower.includes("चेहरा") || lower.includes("ओटीपी")) {
        replyText = lang === "en"
          ? `If face scan fails at the fair price shop, the operator can switch to Mobile OTP. A 6-digit verification code will be sent to +91-${user?.mobile || "1234567890"}.`
          : `यदि राशन की दुकान पर चेहरा पहचान विफल होती है, तो विक्रेता मोबाइल ओटीपी विकल्प का उपयोग कर सकता है। आपके नंबर +91-${user?.mobile || "1234567890"} पर एक 6-अंकीय कोड भेजा जाएगा।`;
      } else if (lower.includes("stock") || lower.includes("depot") || lower.includes("अनाज") || lower.includes("दुकान")) {
        replyText = lang === "en"
          ? `Your assigned shop FPS-${currentArea.toUpperCase().slice(0,3)}-102 in Dwarka (${currentArea}) has ${localDepotData.stock_kg} kg of grain stocks online. Hours: 08:00 AM - 04:00 PM.`
          : `आपके आवंटित डिपो FPS-${currentArea.toUpperCase().slice(0,3)}-102 (${currentArea}) में कुल ${localDepotData.stock_kg} किलोग्राम अनाज का लाइव स्टॉक उपलब्ध है। समय: सुबह 8 से शाम 4 बजे।`;
      } else if (lower.includes("quality") || lower.includes("grain") || lower.includes("गुणवत्ता") || lower.includes("अशुद्ध")) {
        replyText = lang === "en"
          ? "Grains are inspected at checkout using a computer vision scanner on a sample tray. You can run a self-test in the 'Inspect Grains Quality' tab."
          : "वितरण से पहले पीओएस मशीन पर कैमरे से अनाज के दानों की गुणवत्ता जांची जाती है। आप खुद 'अनाज गुणवत्ता जांचें' विकल्प से टेस्ट कर सकते हैं।";
      } else {
        replyText = lang === "en"
          ? "I can help you check your ration balance, look up depot stocks, troubleshoot biometric scan failures, or explain food security rules. Please type a query or tap a quick chip below."
          : "मैं आपके राशन कोटे, डिपो स्टॉक, बायोमेट्रिक त्रुटियों और सरकारी खाद्य नियमों के बारे में मदद कर सकता हूँ। कृपया नीचे दिए गए बटनों का उपयोग करें या प्रश्न लिखें।";
      }

      setChatMessages(prev => [...prev, { sender: "bot", text: replyText }]);
    }, 600);
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
        
        {/* User Card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">{lang === "en" ? "Cardholder" : "कार्डधारक"}</span>
          <h4 className="text-white font-bold text-sm mt-0.5 truncate">{user?.full_name}</h4>
          <span className="text-xs text-gold-bright font-bold mt-1.5 block">{remaining} kg {lang === "en" ? "Available" : "उपलब्ध"}</span>
        </div>

        <nav className="sidebar-nav">
          {TABS.map(t => {
            const IconComp = t.icon;
            return (
              <button
                key={t.id}
                className={`sidebar-link ${tab === t.id ? "active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                <IconComp className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer flex flex-col gap-1 border-t border-white/10 pt-4">
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
            <LogOut className="w-4 h-4" /> {lang === "en" ? "Sign Out" : "लॉग आउट"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content pb-16">
        <Topbar
          title={`${t.welcome}, ${user?.full_name?.split(" ")[0] || "Beneficiary"}`}
          subtitle={`${t.rationCard}: ${user?.user_id} · ${t.schemeTier}: ${user?.scheme || "NFSA"}`}
        />

        <div className="max-w-4xl mx-auto px-6 mt-8 w-full">
          {/* ── CARD: QUOTA HERO BANNER ── */}
          <div className="bg-navy border-b-4 border-gold-bright rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm fade-up text-white relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-glow/5 rounded-full blur-3xl pointer-events-none" />
            
            <div>
              <div className="h-1 w-10 bg-gold-bright rounded-full mb-3" />
              <h2 className="text-xl md:text-2xl font-bold tracking-wide mb-1">
                {user?.full_name}
              </h2>
              <div className="text-white/60 text-xs flex flex-wrap gap-x-3 gap-y-1 mt-1 font-medium">
                <span>ID: {user?.user_id}</span>
                <span>•</span>
                <span>Area: {user?.area || "Delhi"}</span>
                <span>•</span>
                <span>Tier: {user?.scheme || "NFSA"}</span>
              </div>
            </div>
            <div className="text-left md:text-right border-t md:border-t-0 border-white/10 pt-3 md:pt-0 w-full md:w-auto">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-0.5">
                {t.availBalance}
              </span>
              <span className="font-serif text-4xl font-bold text-gold-bright leading-none block">
                {remaining} <span className="text-sm font-sans font-semibold">kg</span>
              </span>
              <span className="text-xs text-white/40 mt-1 block">
                {t.allottedLimit.replace("{allotted}", allotted)}
              </span>
            </div>
          </div>

          {/* ── CARD: QUICK ACTIONS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6 fade-up-1">
            {[
              { label: t.collectRation, sub: t.collectSub, icon: ShoppingBag, color: "text-green", bg: "bg-green-soft", border: "border-green/20", fn: () => navigate("collect", user) },
              { label: t.inspectGrain, sub: t.inspectSub, icon: Sparkles, color: "text-gold", bg: "bg-gold-soft", border: "border-gold-border/25", fn: () => navigate("grain") },
              { label: t.auditReceipts, sub: t.auditSub, icon: History, color: "text-navy", bg: "bg-navy-soft", border: "border-navy/15", fn: () => setTab("transactions") },
            ].map((act, idx) => {
              const IconComp = act.icon;
              return (
                <button 
                  key={idx}
                  onClick={act.fn} 
                  className="bg-white border border-border hover:border-navy p-4.5 rounded-xl shadow-2xs hover:shadow-xs transition-all flex items-start gap-4 text-left group w-full"
                >
                  <div className={`w-9 h-9 rounded-lg ${act.bg} ${act.color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-navy text-xs block group-hover:text-green-dark transition-colors">
                      {act.label}
                    </span>
                    <span className="text-[10px] text-text-sub block mt-0.5">
                      {act.sub}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── TAB CONTENT: OVERVIEW ── */}
          {tab === "overview" && (
            <div className="flex flex-col gap-6 fade-in">
              {/* Stats Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  { 
                    label: lang === "en" ? "Allotted Quota" : "आवंटित कोटा", 
                    value: `${allotted} kg`, 
                    sub: lang === "en" ? "Assigned monthly limit (Click to Calculate)" : "निर्धारित मासिक सीमा (कैलकुलेटर खोलें)", 
                    color: "border-t-navy text-navy",
                    onClick: () => setTab("calculator")
                  },
                  { 
                    label: lang === "en" ? "Claimed Grains" : "प्राप्त अनाज", 
                    value: `${used} kg`, 
                    sub: lang === "en" ? "Withdrawn this cycle (Click to view History)" : "इस चक्र में निकाला गया (इतिहास देखें)", 
                    color: "border-t-green text-green",
                    onClick: () => setTab("transactions")
                  },
                  { 
                    label: lang === "en" ? "Remaining Balance" : "शेष संतुलन", 
                    value: `${remaining} kg`, 
                    sub: lang === "en" ? "Available at shop (Click to view Depot Stock)" : "उचित दर दुकान पर उपलब्ध (डिपो स्टॉक देखें)", 
                    color: remaining < 5 ? "border-t-red text-red" : "border-t-gold text-gold",
                    onClick: () => {
                      const element = document.getElementById("depot-stock-section");
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth" });
                      }
                    }
                  },
                ].map((s, i) => (
                  <div 
                    key={i} 
                    onClick={s.onClick}
                    className={`bg-white border border-border border-t-4 rounded-xl p-5 shadow-xs flex flex-col justify-between cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all ${s.color.split(" ")[0]}`}
                  >
                    <div>
                      <span className="text-[9px] font-bold text-muted uppercase tracking-widest block mb-1">
                        {s.label}
                      </span>
                      <span className={`font-serif text-2xl font-bold ${s.color.split(" ")[1]}`}>
                        {s.value}
                      </span>
                    </div>
                    <div className="text-xs text-text-sub mt-2.5 font-medium">
                      {s.sub}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quota Progress meter */}
              <div className="bg-white border border-border rounded-2xl p-6 shadow-xs">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-navy font-bold text-sm">
                    {lang === "en" ? "Withdrawal Progress" : "निकासी प्रगति मीटर"}
                  </h3>
                  <span className={`text-[9px] font-bold border px-2.5 py-0.5 rounded-full uppercase ${
                    pct > 80 
                      ? "bg-red-soft border-red/20 text-red" 
                      : pct > 50 
                        ? "bg-amber-soft border-gold-border/20 text-gold" 
                        : "bg-green-soft border-green/20 text-green-dark"
                  }`}>
                    {pct}% {lang === "en" ? "Claimed" : "वितरित"}
                  </span>
                </div>
                <div className="w-full bg-base h-2.5 rounded-full overflow-hidden border">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${
                      pct > 80 ? "bg-red" : pct > 50 ? "bg-gold" : "bg-green"
                    }`} 
                    style={{ width: `${pct}%` }} 
                  />
                </div>
                <div className="flex justify-between mt-3 text-xs text-muted font-medium">
                  <span>0 kg</span>
                  <span>{allotted} kg limit</span>
                </div>
              </div>

              {/* ── CARD: LIVE DEPOT STOCK & INVENTORY ── */}
              {(() => {
                const currentArea = user?.area || "Delhi";
                const localDepotData = regionalStatsData.find(
                  d => d.area?.toLowerCase() === currentArea.toLowerCase()
                ) || {
                  area: currentArea,
                  stock_kg: 4250,
                  txn_count: 14,
                  avg_weight: 12.4,
                  fraud_alerts: 0
                };
                const maxStock = 10000;
                const stockPct = Math.min(100, Math.round((localDepotData.stock_kg / maxStock) * 100));

                return (
                  <div id="depot-stock-section" className="bg-white border border-border rounded-2xl p-6 shadow-xs border-l-4 border-green-dark">
                    <div className="flex justify-between items-center mb-5">
                      <div>
                        <h3 className="text-navy font-bold text-sm">
                          {lang === "en" ? "Live Depot Inventory & Status" : "राशन डिपो लाइव स्टॉक और स्थिति"}
                        </h3>
                        <span className="text-xs text-muted block mt-0.5">
                          {lang === "en" 
                            ? `Fair Price Shop: FPS-${currentArea.toUpperCase().slice(0,3)}-102 (Sector 4, ${currentArea})`
                            : `उचित दर दुकान: FPS-${currentArea.toUpperCase().slice(0,3)}-102 (सेक्टर 4, ${currentArea})`}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 bg-[#EAF5EC] border border-[#1E8E3E]/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#1E8E3E] uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1E8E3E] animate-pulse" />
                        {lang === "en" ? "DEPOT ONLINE" : "डिपो ऑनलाइन"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      {/* Left: Stock Bar Chart/Meter */}
                      <div className="md:col-span-7 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between text-xs font-semibold mb-1.5 text-text-sub">
                            <span>{lang === "en" ? "Current Depot Grain Level" : "वर्तमान खाद्यान्न स्टॉक स्तर"}</span>
                            <span className="font-bold text-green-dark">{localDepotData.stock_kg} / {maxStock} kg</span>
                          </div>
                          <div className="w-full bg-base h-3 rounded-full overflow-hidden border">
                            <div 
                              className={`h-full rounded-full transition-all duration-700 ${
                                stockPct < 20 ? "bg-red" : stockPct < 50 ? "bg-gold" : "bg-green"
                              }`} 
                              style={{ width: `${stockPct}%` }} 
                            />
                          </div>
                          <p className="text-[10px] text-muted mt-1.5">
                            {lang === "en" 
                              ? `Inventory represents allocated grains for ${currentArea} cardholders. Restocking occurs bi-weekly.` 
                              : `यह स्टॉक ${currentArea} कार्डधारकों के लिए आवंटित खाद्यान्न दर्शाता है। प्रत्येक दो सप्ताह में पुनः आपूर्ति की जाती है।`}
                          </p>
                        </div>

                        {/* Audit check detail */}
                        <div className="mt-4 bg-base/50 rounded-xl p-3 border border-border-soft flex gap-2 items-start">
                          <ShieldCheck className="w-4.5 h-4.5 text-green-dark flex-shrink-0 mt-0.5" />
                          <div className="text-[11px]">
                            <span className="font-bold text-navy block">{lang === "en" ? "Cryptographic Receipt Seals" : "क्रिप्टोग्राफिक रसीद सील"}</span>
                            <span className="text-text-sub block mt-0.5">
                              {lang === "en" 
                                ? `Verification ledger checks active. Last transaction audit: ${localDepotData.txn_count > 0 ? "SECURELY CHAINED" : "NO NEW TXNS"}.` 
                                : `सत्यापन लेजर जांच सक्रिय। अंतिम लेनदेन ऑडिट: ${localDepotData.txn_count > 0 ? "सुरक्षित रूप से लिंक" : "कोई नया लेनदेन नहीं"}।`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Depot details checklist */}
                      <div className="md:col-span-5 border-t md:border-t-0 md:border-l border-divider/60 pt-4 md:pt-0 md:pl-6 flex flex-col gap-3 justify-between">
                        <div className="flex flex-col gap-2.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-muted">{lang === "en" ? "Operating Hours" : "खुला रहने का समय"}:</span>
                            <span className="font-bold text-navy">08:00 AM - 04:00 PM</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-muted">{lang === "en" ? "Today's Checkouts" : "आज के कुल वितरण"}:</span>
                            <span className="font-bold text-navy">{localDepotData.txn_count} {lang === "en" ? "Citizens" : "नागरिक"}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-muted">{lang === "en" ? "Security alerts" : "सुरक्षा चेतावनी"}:</span>
                            <span className={`font-bold uppercase text-[10px] ${localDepotData.fraud_alerts === 0 ? "text-green-dark" : "text-red"}`}>
                              {localDepotData.fraud_alerts === 0 ? (lang === "en" ? "0 Warnings" : "0 चेतावनी") : `${localDepotData.fraud_alerts} Warnings`}
                            </span>
                          </div>
                        </div>

                        {/* Inspector Info Toggle */}
                        <div>
                          <button 
                            onClick={() => setShowInspectorContact(!showInspectorContact)}
                            className="w-full text-center py-2 bg-base hover:bg-cream border rounded-lg text-xs font-bold text-navy-dark transition-all mt-2"
                          >
                            {showInspectorContact 
                              ? (lang === "en" ? "Hide Inspector Contacts" : "संपर्क छिपाएं") 
                              : (lang === "en" ? "View Inspector Contacts" : "ऑडिट अधिकारी संपर्क देखें")}
                          </button>
                          {showInspectorContact && (
                            <div className="bg-navy-soft rounded-lg p-2.5 mt-2 border border-navy/10 text-[10.5px] text-green-dark leading-relaxed">
                              <strong>Inspector:</strong> Ashok Sharma (Dwarka Audit Desk)<br />
                              <strong>Phone:</strong> +91 98765 43210<br />
                              <strong>Govt Toll-Free Helpline:</strong> 1967
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Quota Items List */}
              <div className="bg-white border border-border rounded-2xl p-6 shadow-xs border-l-4 border-gold-bright">
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h3 className="text-navy font-bold text-sm">
                      {t.entitlementBreakdown}
                    </h3>
                    <span className="text-xs text-muted block mt-0.5">
                      {t.entitlementSub}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold border border-gold-border/20 bg-gold-soft text-gold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {user?.scheme || "NFSA"} Allocation
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { item: t.itemRice, qty: "15 kg", rate: t.rateRice },
                    { item: t.itemWheat, qty: "10 kg", rate: t.rateWheat },
                    { item: t.itemSugar, qty: "2 kg", rate: t.rateSugar },
                    { item: t.itemPulses, qty: "2 kg", rate: t.ratePulses },
                    { item: t.itemSalt, qty: "1 kg", rate: t.freeOfCost },
                    { item: t.itemKerosene, qty: "2 L", rate: t.subsidizedRates },
                  ].map((e, i) => (
                    <div 
                      key={i} 
                      className="bg-base/30 border border-border-soft rounded-xl p-4 flex justify-between items-center"
                    >
                      <div>
                        <span className="font-bold text-navy text-sm block">{e.item}</span>
                        <span className="text-xs text-text-sub block mt-0.5">{e.rate}</span>
                      </div>
                      <span className="font-serif text-lg font-bold text-green-dark">
                        {e.qty}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB CONTENT: TRANSACTIONS ── */}
          {tab === "transactions" && (
            <div className="bg-white border border-border rounded-2xl p-6 shadow-xs fade-in">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="text-navy font-bold text-sm">
                    {t.txnLogs}
                  </h3>
                  <span className="text-xs text-muted block mt-0.5">
                    {t.txnSub}
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-navy-soft text-navy px-2.5 py-1 rounded">
                  {txns.length} {lang === "en" ? "Receipts" : "रसीदें"}
                </span>
              </div>

              {txns.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-base text-muted flex items-center justify-center mb-3">
                    <List className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-muted mb-4 font-medium">{t.noHistory}</p>
                  <button 
                    className="bg-navy hover:bg-navy-mid text-white font-bold text-xs py-2 px-5 rounded transition-colors"
                    onClick={() => navigate("collect", user)}
                  >
                    {t.startCollection}
                  </button>
                </div>
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
                        status: txn.status,
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
                return (
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-base border-b">
                          <th className="p-3 font-bold text-muted uppercase text-[9.5px]">{t.txnId}</th>
                          <th className="p-3 font-bold text-muted uppercase text-[9.5px]">{t.txnItem}</th>
                          <th className="p-3 font-bold text-muted uppercase text-[9.5px]">{t.txnWeight}</th>
                          <th className="p-3 font-bold text-muted uppercase text-[9.5px]">{t.txnShop}</th>
                          <th className="p-3 font-bold text-muted uppercase text-[9.5px]">{t.txnDate}</th>
                          <th className="p-3 font-bold text-muted uppercase text-[9.5px]">{t.txnStatus}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedTxns.map((gTxn, i) => (
                          <tr key={i} className="border-b last:border-0 hover:bg-base/20 transition-colors">
                            <td className="p-3 font-mono font-bold text-navy">{gTxn.receipt_id}</td>
                            <td className="p-3 font-semibold text-text">
                              <div className="flex flex-col">
                                <span className="font-bold text-navy">{gTxn.items.map(it => it.item).join(", ")}</span>
                                <span className="text-[10px] text-muted font-normal">
                                  {gTxn.items.map(it => `${it.item}: ${parseFloat(it.weight).toFixed(1)}kg`).join(" | ")}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 font-mono font-bold text-navy">{parseFloat(gTxn.total_weight).toFixed(2)} kg</td>
                            <td className="p-3 text-text-sub">{gTxn.shop || "FPS Depot"}</td>
                            <td className="p-3 text-muted text-[11px]">{gTxn.timestamp}</td>
                            <td className="p-3">
                              <span className="bg-green-soft text-green-dark text-[9px] font-bold border border-green/20 px-2 py-0.5 rounded-full uppercase">
                                Collected
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ── TAB CONTENT: GOVT SCHEMES ── */}
          {tab === "schemes" && (
            <div className="flex flex-col gap-6 fade-in">
              <div className="bg-navy rounded-2xl p-5 shadow-sm text-white flex items-start gap-4">
                <Info className="w-5 h-5 text-gold-bright flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-gold-bright">
                    {lang === "en" ? "Food Security Entitlement Directory" : "खाद्य सुरक्षा पात्रता निर्देशिका"}
                  </h4>
                  <p className="text-white/70 text-xs mt-1 leading-relaxed">
                    {lang === "en" 
                      ? "Beneficiaries can verify enrollment criteria and apply for subsidies under Central Welfare programs below." 
                      : "लाभार्थी नामांकन मानदंडों को सत्यापित कर सकते हैं और नीचे केंद्रीय कल्याण कार्यक्रमों के तहत सब्सिडी के लिए आवेदन कर सकते हैं।"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {GOVT_SCHEMES.map((scheme, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white border border-border hover:border-navy rounded-xl overflow-hidden shadow-xs hover:-translate-y-0.5 transition-all flex flex-col justify-between group cursor-pointer"
                    onClick={() => window.open(scheme.link, "_blank")}
                  >
                    <div className="p-5 border-b bg-base/20">
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <h4 className="text-navy font-bold text-sm group-hover:text-green-dark transition-colors leading-snug">
                          {scheme.name}
                        </h4>
                        <span className="text-[9px] font-bold bg-green-soft text-green-dark px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0">
                          {scheme.badge}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-muted uppercase">
                        Code: {scheme.short}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <p className="text-xs text-text-sub leading-relaxed mb-4">
                        {scheme.desc}
                      </p>
                      <div className="flex justify-between items-center border-t pt-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-green" />
                          <span className="text-xs font-bold text-green-dark">{scheme.benefit}</span>
                        </div>
                        <span className="text-[10px] text-muted font-medium flex items-center gap-0.5">
                          Portal <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB CONTENT: FAMILY UNIT ── */}
          {tab === "family" && (
            <div className="bg-white border border-border rounded-2xl p-6 shadow-xs fade-in">
              <div className="flex justify-between items-center mb-5 pb-3 border-b">
                <div>
                  <h3 className="text-navy font-bold text-sm">
                    {t.familyRegistry}
                  </h3>
                  <span className="text-xs text-muted block mt-0.5">
                    {t.familySub}
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-navy-soft text-navy px-2.5 py-1 rounded">
                  {family.length + 1} {lang === "en" ? "Members" : "सदस्य"}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Primary Card Holder */}
                <div className="bg-green-soft/50 border border-green/20 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green text-white flex items-center justify-center font-bold text-xs">
                      H
                    </div>
                    <div>
                      <h4 className="font-bold text-navy text-sm">
                        {user?.full_name} 
                        <span className="text-[9px] bg-green text-white px-2 py-0.5 rounded font-bold uppercase ml-2">
                          {t.familyHead}
                        </span>
                      </h4>
                      <p className="text-xs text-text-sub mt-0.5">
                        {t.relationship}: Self · {t.age}: {user?.dob ? (new Date().getFullYear() - new Date(user.dob).getFullYear()) : "32"}
                      </p>
                    </div>
                  </div>
                  <span className="bg-green/10 text-green-dark border border-green/20 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {t.aadhaarVerified}
                  </span>
                </div>

                {/* Family Members */}
                {family.map((m, idx) => (
                  <div key={idx} className="bg-base/30 border rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center font-bold text-xs">
                        {m.name.split(" ")[0][0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-navy text-sm">{m.name}</h4>
                        <p className="text-xs text-text-sub mt-0.5">{t.relationship}: {m.relationship} · {t.age}: {m.age}</p>
                      </div>
                    </div>
                    {m.aadhaar_seeded ? (
                      <span className="bg-green/10 text-green-dark border border-green/20 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {t.aadhaarVerified}
                      </span>
                    ) : (
                      <span className="bg-red-soft text-red border border-red/20 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {t.linkPending}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB CONTENT: CITIZEN GRIEVANCE ── */}
          {tab === "grievance" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 fade-in">
              {/* Form Card */}
              <div className="bg-white border border-border rounded-2xl p-6 shadow-xs md:col-span-6 flex flex-col gap-4">
                <div>
                  <h3 className="text-navy font-bold text-sm uppercase tracking-wide block">
                    {t.registerGrievance}
                  </h3>
                  <span className="text-xs text-muted block mt-0.5">
                    {t.grievanceSub}
                  </span>
                </div>

                <form onSubmit={handleGrievanceSubmit} className="flex flex-col gap-4 mt-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-text-sub uppercase tracking-wider">
                      {t.complaintCat}
                    </label>
                    <select 
                      className="field-input py-2.5"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                    >
                      <option value="Short Allocation">{lang === "en" ? "Short Allocation of Grain" : "अनाज का कम आवंटन"}</option>
                      <option value="FPS Dealer Behavior">{lang === "en" ? "Depot Dealer Behavior" : "राशन विक्रेता का व्यवहार"}</option>
                      <option value="Grain Quality Issue">{lang === "en" ? "Grain Quality Deficit" : "अनाज गुणवत्ता में कमी"}</option>
                      <option value="Depot Closed">{lang === "en" ? "Depot Closed During Hours" : "समय पर राशन दुकान बंद मिलना"}</option>
                      <option value="Other">{lang === "en" ? "Other Service Discrepancy" : "अन्य सेवा विसंगति"}</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-text-sub uppercase tracking-wider">
                      {t.detailedMsg}
                    </label>
                    <textarea 
                      className="field-input min-h-[100px]"
                      placeholder={t.placeholderMsg}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      required
                    />
                  </div>

                  <button 
                    type="submit"
                    className="btn btn-primary w-full py-2.5 shadow-sm"
                    disabled={submittingGrievance || !message.trim()}
                  >
                    {submittingGrievance ? t.loading : t.submitComplaint}
                  </button>
                </form>
              </div>

              {/* Status List Card */}
              <div className="bg-white border border-border rounded-2xl p-6 shadow-xs md:col-span-6 flex flex-col gap-4">
                <div>
                  <h3 className="text-navy font-bold text-sm uppercase tracking-wide block">
                    {t.grievanceLog}
                  </h3>
                  <span className="text-xs text-muted block mt-0.5">
                    {t.grievanceLogSub}
                  </span>
                </div>

                <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
                  {grievances.length === 0 ? (
                    <div className="text-center py-12 text-muted text-xs">
                      {t.noGrievances}
                    </div>
                  ) : (
                    grievances.map((g) => (
                      <div key={g.id} className="border border-border rounded-xl p-4 bg-base/30 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-navy">{g.category}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            g.status === "Resolved" 
                              ? "bg-green-soft text-green-dark border border-green/20" 
                              : g.status === "Under Review" 
                                ? "bg-amber-soft text-gold border border-gold-border/20" 
                                : "bg-blue-soft text-blue border border-blue/20"
                          }`}>
                            {g.status}
                          </span>
                        </div>
                        <p className="text-xs text-text-sub italic leading-relaxed">"{g.message}"</p>
                        <span className="text-[9px] text-muted font-medium self-end">{g.created_at || "Just now"}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB CONTENT: WELFARE CALCULATOR ── */}
          {tab === "calculator" && (
            <div className="bg-white border border-border rounded-2xl p-6 shadow-xs fade-in">
              <div className="flex justify-between items-center mb-6 pb-3 border-b">
                <div>
                  <h3 className="text-navy font-bold text-sm">
                    {t.calcTitle}
                  </h3>
                  <span className="text-xs text-muted block mt-0.5">
                    {t.calcSub}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Inputs */}
                <div className="md:col-span-6 flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-text-sub uppercase tracking-wider">
                      {t.calcCategory}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        type="button"
                        onClick={() => setCalcCategory("NFSA")}
                        className={`py-2 px-3 border text-xs font-bold rounded-lg transition-all ${
                          calcCategory === "NFSA" 
                            ? "bg-navy border-navy text-white" 
                            : "bg-white border-border text-text-sub hover:border-navy"
                        }`}
                      >
                        NFSA (Priority Household)
                      </button>
                      <button 
                        type="button"
                        onClick={() => setCalcCategory("AAY")}
                        className={`py-2 px-3 border text-xs font-bold rounded-lg transition-all ${
                          calcCategory === "AAY" 
                            ? "bg-navy border-navy text-white" 
                            : "bg-white border-border text-text-sub hover:border-navy"
                        }`}
                      >
                        AAY (Antyodaya - Poorest)
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-text-sub uppercase tracking-wider">
                      {t.calcMembers}
                    </label>
                    <div className="flex items-center gap-3">
                      <button 
                        type="button"
                        onClick={() => setCalcMembers(Math.max(1, calcMembers - 1))}
                        className="w-9 h-9 border bg-base hover:bg-cream rounded font-bold text-base"
                      >
                        -
                      </button>
                      <input 
                        type="text"
                        className="w-12 h-9 border text-center text-xs font-bold rounded bg-white outline-none"
                        value={calcMembers}
                        readOnly
                      />
                      <button 
                        type="button"
                        onClick={() => setCalcMembers(calcMembers + 1)}
                        className="w-9 h-9 border bg-base hover:bg-cream rounded font-bold text-base"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-text-sub uppercase tracking-wider flex justify-between">
                      <span>{t.calcIncome}</span>
                      <span className="text-navy font-bold">₹{calcIncome.toLocaleString()}</span>
                    </label>
                    <input 
                      type="range"
                      min={10000}
                      max={200000}
                      step={5000}
                      className="w-full accent-green cursor-pointer"
                      value={calcIncome}
                      onChange={e => setCalcIncome(parseInt(e.target.value))}
                    />
                    <div className="flex justify-between text-[9px] text-muted font-bold">
                      <span>₹10,000</span>
                      <span>₹2,00,000+</span>
                    </div>
                  </div>
                </div>

                {/* Outputs & Recommendation */}
                <div className="md:col-span-6 border-t md:border-t-0 md:border-l border-divider/60 pt-6 md:pt-0 md:pl-8 flex flex-col gap-5 justify-between">
                  <div className="flex flex-col gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest block">{t.calcEstAllotted}</span>
                      <span className="font-serif text-3xl font-bold text-green mt-1 block">
                        {calcRation} <span className="text-sm font-sans font-semibold">kg / month</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest block">{t.calcEstCost}</span>
                      <span className="font-serif text-xl font-bold text-navy mt-0.5 block">
                        ₹{calcCost} <span className="text-xs font-sans font-semibold">estimated total</span>
                      </span>
                    </div>

                    <div className="bg-base/60 border rounded-xl p-4 mt-2">
                      <span className="text-[9px] font-bold text-gold uppercase tracking-wider block mb-1">
                        {t.calcRecommendation}
                      </span>
                      <h4 className="text-xs font-bold text-navy leading-relaxed">
                        {recommendedScheme}
                      </h4>
                      <p className="text-[10px] text-text-sub mt-1 leading-normal">
                        {t.calcPolicyDesc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB CONTENT: PROFILE ── */}
          {tab === "profile" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 fade-in">
              {/* Details Card */}
              <div className="bg-white border border-border rounded-2xl p-6 shadow-xs md:col-span-7 flex flex-col gap-3">
                <h3 className="text-navy font-bold text-sm border-b pb-2.5 uppercase tracking-wide block mb-2">
                  {t.profileTitle}
                </h3>
                {[
                  { label: t.profileName, value: user?.full_name },
                  { label: t.profileAadhaar, value: user?.aadhaar ? `•••• •••• ${user.aadhaar.slice(-4)}` : "•••• •••• ••••" },
                  { label: t.rationCard + " ID", value: user?.user_id },
                  { label: t.profileMobile, value: user?.mobile ? `+91-${user.mobile}` : "—" },
                  { label: t.schemeTier, value: user?.scheme || "NFSA" },
                  { label: t.profileArea, value: user?.area || "Delhi" },
                  { label: t.profileAddress, value: user?.address || "Delhi NCR, India" },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 py-2 border-b border-divider/40 last:border-0 last:pb-0 items-start">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider w-32 flex-shrink-0 pt-0.5">
                      {item.label}
                    </span>
                    <span className="text-xs text-text font-semibold leading-relaxed">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Security status */}
              <div className="bg-white border border-border rounded-2xl p-6 shadow-xs md:col-span-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-navy font-bold text-sm border-b pb-2.5 uppercase tracking-wide block mb-4">
                    {t.auditStatusTitle}
                  </h3>
                  
                  <div className="flex gap-2.5 p-3 rounded-lg border text-xs font-medium bg-green-soft border-green/20 text-green-dark items-start mb-4">
                    <ShieldCheck className="w-4.5 h-4.5 text-green flex-shrink-0 mt-0.5" />
                    <span>{t.auditText}</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {[
                      t.auditSecure,
                      t.auditReceiptSeal,
                      t.auditProtection,
                      t.auditSuccess
                    ].map((str, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-text-sub">
                        <div className="w-2 h-2 rounded-full bg-green" />
                        <span>{str}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-divider">
                  <span className="text-[9px] text-muted block leading-normal italic text-center">
                    Audit logs are securely mirrored to central registries.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB CONTENT: FAQ / KNOWLEDGE CENTER ── */}
          {tab === "faq" && (
            <div className="bg-white border border-border rounded-2xl p-6 shadow-xs fade-in flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b gap-4">
                <div>
                  <h3 className="text-navy font-bold text-sm">
                    {lang === "en" ? "PDS Digital Knowledge Center" : "पीडीएस डिजिटल ज्ञान केंद्र"}
                  </h3>
                  <span className="text-xs text-muted block mt-0.5">
                    {lang === "en" 
                      ? "Search policies, verification guidance, and scheme rules." 
                      : "सरकारी नीतियों, सत्यापन सहायता और राशन नियमों की खोज करें।"}
                  </span>
                </div>
                {/* Search Input */}
                <div className="relative w-full md:w-72">
                  <input 
                    type="text" 
                    placeholder={lang === "en" ? "Search guidelines (e.g. face)..." : "दिशानिर्देश खोजें..."} 
                    className="w-full pl-9 pr-3 py-2 border rounded-lg text-xs outline-none focus:border-green transition-all"
                    value={faqSearch}
                    onChange={e => setFaqSearch(e.target.value)}
                  />
                  <div className="absolute left-3 top-2.5 text-muted">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Collapsible Accordion List */}
              <div className="flex flex-col gap-3.5">
                {[
                  {
                    q: lang === "en" ? "What should I do if my face biometric scan fails?" : "यदि मेरा फेस बायोमेट्रिक स्कैन विफल हो जाता है तो मुझे क्या करना चाहिए?",
                    a: lang === "en" 
                      ? "If face verification fails twice at the shop terminal, the dealer's machine will automatically prompt for a secure Mobile OTP bypass. A 6-digit validation code is sent to your registered mobile number, ensuring you never lose your entitlement due to camera/lighting issues."
                      : "यदि डिपो काउंटर पर दो बार चेहरा सत्यापन विफल हो जाता है, तो विक्रेता का पीओएस सिस्टम स्वचालित रूप से मोबाइल ओटीपी बायपास की पेशकश करेगा। आपके पंजीकृत मोबाइल नंबर पर 6-अंकीय कोड भेजा जाएगा ताकि खराब रोशनी या कैमरा विफलता के कारण आपको कोटा से वंचित न होना पड़े।"
                  },
                  {
                    q: lang === "en" ? "How does One Nation One Ration Card (ONORC) work?" : "वन नेशन वन राशन कार्ड (ONORC) कैसे काम करता है?",
                    a: lang === "en"
                      ? "ONORC enables national ration card portability. Migrant workers and family units can withdraw food grains from any Fair Price Shop across India. The terminal operator simply verifies your identity by typing your Aadhaar card number or registered mobile number to fetch your active allocation limits."
                      : "ONORC राष्ट्रीय राशन कार्ड पोर्टेबिलिटी को सक्षम बनाता है। प्रवासी श्रमिक और उनके परिवार देश भर में किसी भी सरकारी राशन दुकान से खाद्यान्न प्राप्त कर सकते हैं। डिपो संचालक आपके कोटे का विवरण प्राप्त करने के लिए केवल आपका आधार नंबर या मोबाइल दर्ज करके बायोमेट्रिक सत्यापन करेगा।"
                  },
                  {
                    q: lang === "en" ? "How is the grain quality inspected?" : "खाद्यान्न की गुणवत्ता की जाँच कैसे की जाती है?",
                    a: lang === "en"
                      ? "SmartPDS terminals are fitted with automated Computer Vision Grain Quality Inspectors. Before grains are checkout, the dealer scans a tray sample. The system executes Otsu edge thresholds and counts impurities (stones, straw, broken grains) to verify quality grade compliance before transaction hashes are sealed."
                      : "स्मार्ट पीडीएस दुकानों पर कंप्यूटर विजन आधारित अनाज गुणवत्ता नियंत्रक लगाए गए हैं। राशन वितरण से पहले, विक्रेता नमूने की तस्वीर स्कैन करता है। यह सिस्टम मलबे, कंकड़ और टूटे हुए दानों के प्रतिशत का विश्लेषण करता है ताकि यह सुनिश्चित हो सके कि आपको केवल निर्धारित मानक गुणवत्ता का अनाज मिले।"
                  },
                  {
                    q: lang === "en" ? "How does the blockchain ledger protect my transactions?" : "ब्लॉकचेन लेजर मेरे लेनदेन की सुरक्षा कैसे करता है?",
                    a: lang === "en"
                      ? "Every single checkout generates a digital receipt hashed with SHA-256 and cryptographically linked to the previous transaction. Because the ledger is chained, any attempt to back-date, edit weight, or duplicate card claims immediately invalidates subsequent hashes, creating an auditable fraud alarm."
                      : "प्रत्येक खाद्यान्न वितरण का एक डिजिटल रिकॉर्ड बनता है जो SHA-256 एल्गोरिथम से हैश होता है और पिछले रिकॉर्ड से कड़ियों की तरह जुड़ा होता है। ब्लॉकचेन लेजर के कारण कोई भी अधिकारी या विक्रेता पिछली तारीख में वजन या विवरण में हेरफेर नहीं कर सकता, जिससे भ्रष्टाचार पूर्णतः रुक जाता है।"
                  },
                  {
                    q: lang === "en" ? "What are the approved rates and free entitlement tiers?" : "स्वीकृत दरें और निःशुल्क आवंटन श्रेणियां क्या हैं?",
                    a: lang === "en"
                      ? "Under NFSA guidelines: Rice is ₹3/kg, Wheat is ₹2/kg, Sugar is ₹13.50/kg, and Split Pulses are ₹15/kg. Additionally, under relief initiatives like PMGKAY, an extra 5 kg of grain per person is distributed completely free of cost. poors under AAY get 35 kg flat per family."
                      : "एनएफएसए नियमों के तहत: चावल ₹3/किग्रा, गेहूं ₹2/किग्रा, चीनी ₹13.50/किग्रा और दालें ₹15/किग्रा वितरित की जाती हैं। पीएमजीकेएवाई जैसी राहत योजनाओं के तहत प्रति व्यक्ति 5 किलोग्राम अतिरिक्त खाद्यान्न बिल्कुल मुफ्त दिया जाता है। अंत्योदय (AAY) परिवारों को प्रति परिवार 35 किलो अनाज मिलता है।"
                  }
                ].filter(item => {
                  const term = faqSearch.toLowerCase();
                  return item.q.toLowerCase().includes(term) || item.a.toLowerCase().includes(term);
                }).map((item, idx) => (
                  <div key={idx} className="border border-border rounded-xl p-4 bg-base/10 hover:border-green/30 hover:bg-base/30 transition-all">
                    <h4 className="font-bold text-navy text-sm flex items-start gap-2">
                      <span className="bg-green/10 text-green-dark w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">Q</span>
                      <span>{item.q}</span>
                    </h4>
                    <p className="text-xs text-text-sub mt-2.5 pl-7 leading-relaxed border-l-2 border-divider">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>

              {/* Informative footer */}
              <div className="bg-navy-soft border border-navy/10 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-green/10 text-green flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-bold text-navy-dark text-xs block">{lang === "en" ? "Need official policy files?" : "आधिकारिक नीति फ़ाइलें चाहिए?"}</span>
                    <span className="text-[10px] text-muted block">{lang === "en" ? "Download NFSA handbook & ONORC guidelines" : "एनएफएसए नियमावली और पोर्टेबिलिटी नियम डाउनलोड करें"}</span>
                  </div>
                </div>
                <button 
                  onClick={() => alert(lang === "en" ? "Downloading Smart PDS Handbook..." : "स्मार्ट पीडीएस हैंडबुक डाउनलोड हो रही है...")}
                  className="bg-green hover:bg-green-dark text-white font-bold text-xs px-4 py-2 rounded shadow-sm transition-all"
                >
                  {lang === "en" ? "Download PDF (3.2 MB)" : "पीडीएफ डाउनलोड करें"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── FLOATING CHATBOT WIDGET: RATION MITRA ── */}
      <div className="chatbot-container">
        {/* Toggle Button */}
        <button 
          onClick={() => setChatOpen(!chatOpen)}
          className="chatbot-toggle-btn"
          title={lang === "en" ? "Chat with Ration Mitra" : "राशन मित्र से बात करें"}
        >
          {chatOpen ? (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          )}
        </button>

        {/* Chat Window */}
        {chatOpen && (
          <div className="chatbot-window">
            {/* Header */}
            <div className="chatbot-header">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green flex items-center justify-center text-white text-[11px] font-bold">
                  RM
                </div>
                <div>
                  <span className="font-bold text-xs block">Ration Mitra</span>
                  <span className="text-[9px] text-[#10B981] block font-semibold">● {lang === "en" ? "AI Helper Online" : "सहायक ऑनलाइन"}</span>
                </div>
              </div>
              <button 
                onClick={() => setChatOpen(false)}
                className="text-white/60 hover:text-white bg-transparent border-none cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Message Feed */}
            <div className="chatbot-messages">
              {chatMessages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`chatbot-msg ${msg.sender === "bot" ? "chatbot-msg-bot" : "chatbot-msg-user"}`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Quick reply chips */}
            <div className="chatbot-chips">
              {[
                { label: lang === "en" ? "Check Balance" : "कोटा संतुलन", query: "Check Balance" },
                { label: lang === "en" ? "Biometric Help" : "फेस बायोमेट्रिक समस्या", query: "Biometric Help" },
                { label: lang === "en" ? "Depot Stock" : "डिपो अनाज स्टॉक", query: "Depot Stock" },
                { label: lang === "en" ? "Quality Standards" : "गुणवत्ता मानक", query: "Quality Standards" }
              ].map((chip, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleChatQuery(chip.query)}
                  className="chatbot-chip"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!chatInput.trim()) return;
                handleChatQuery(chatInput);
              }}
              className="chatbot-footer"
            >
              <input 
                type="text" 
                placeholder={lang === "en" ? "Type a question..." : "प्रश्न लिखें..."}
                className="chatbot-input-field"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
              />
              <button type="submit" className="chatbot-send-btn">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

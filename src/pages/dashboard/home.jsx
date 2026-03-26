import React from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Chip,
  Input,
  Textarea,
  Carousel,
} from "@material-tailwind/react";

import { useNavigate } from "react-router-dom";
import {
  TagIcon,
  ClipboardDocumentCheckIcon,
  BoltIcon,
  StarIcon,
  RocketLaunchIcon,
  AcademicCapIcon,
  QuestionMarkCircleIcon,
  DocumentArrowUpIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

import { useLanguage } from "@/context/language-context";
import { useAuth } from "@/context/auth-context";
import { useProjects } from "@/context/projects-context";
import projectService from "@/services/projectService";
import supportService from "@/services/supportService";
import { EditProfileDialog } from "@/widgets/dialogs/edit-profile-dialog";
import { UserStatisticsDialog } from "@/widgets/dialogs/user-statistics-dialog";

export function Home() {
  const { t, language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { projects, batteries } = useProjects();
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [showEditProfile, setShowEditProfile] = React.useState(false);
  const [showStats, setShowStats] = React.useState(false);
  const [deckCount, setDeckCount] = React.useState(null);
  const [recentDecks, setRecentDecks] = React.useState([]);

  React.useEffect(() => {
    projectService.getUserDecks(1, 3)
      .then(data => {
        const results = data.results || (Array.isArray(data) ? data : []);
        const count = data.count ?? (Array.isArray(data) ? data.length : null);
        setDeckCount(count);
        setRecentDecks(results);
      })
      .catch(() => setDeckCount(null));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return language === "es" ? "Buenos días" : "Good morning";
    if (h < 18) return language === "es" ? "Buenas tardes" : "Good afternoon";
    return language === "es" ? "Buenas noches" : "Good evening";
  };

  const displayName = user?.first_name || user?.username || "there";

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState({ type: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      await supportService.sendSupportRequest({
        ...formData,
        source: "dashboard_home",
      });
      setStatus({
        type: "success",
        message: t("contact_page.success_message"),
      });
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      // err may be an array of JSON-encoded bilingual strings, e.g.
      // ["{\"es\":\"Mensaje\",\"en\":\"Message\"}"]
      let errorMsg = t("contact_page.error_message");
      try {
        const raw = Array.isArray(err) ? err[0] : (err?.message?.[0] ?? err?.non_field_errors?.[0] ?? null);
        if (raw) {
          const parsed = JSON.parse(raw);
          errorMsg = parsed[language] ?? parsed.en ?? errorMsg;
        }
      } catch (_) { }
      setStatus({
        type: "error",
        message: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Cómo funciona (3 pasos, con foco en preguntas/flashcards)
  const howItWorks = [
    {
      title: t("home.how_it_works.step1.title"),
      desc: t("home.how_it_works.step1.desc"),
      img: "https://cdn.pixabay.com/photo/2015/01/09/11/11/office-594132_1280.jpg",
      icon: DocumentArrowUpIcon,
    },
    {
      title: t("home.how_it_works.step2.title"),
      desc: t("home.how_it_works.step2.desc"),
      img: "https://cdn.pixabay.com/photo/2017/07/20/03/53/homework-2521144_1280.jpg",
      icon: ClipboardDocumentCheckIcon,
    },
    {
      title: t("home.how_it_works.step3.title"),
      desc: t("home.how_it_works.step3.desc"),
      img: "https://cdn.pixabay.com/photo/2015/07/17/22/43/student-849825_1280.jpg",
      icon: SparklesIcon,
    },
  ];

  // ✅ Beneficios
  const benefits = [
    {
      title: t("home.benefits.b1.title"),
      desc: t("home.benefits.b1.desc"),
      icon: QuestionMarkCircleIcon,
    },
    {
      title: t("home.benefits.b2.title"),
      desc: t("home.benefits.b2.desc"),
      icon: AcademicCapIcon,
    },
    {
      title: t("home.benefits.b3.title"),
      desc: t("home.benefits.b3.desc"),
      icon: TagIcon,
    },
    {
      title: t("home.benefits.b4.title"),
      desc: t("home.benefits.b4.desc"),
      icon: BoltIcon,
    },
  ];

  // ✅ Para quién es
  const forWho = [
    {
      title: t("home.for_who.w1.title"),
      desc: t("home.for_who.w1.desc"),
      img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    },
    {
      title: t("home.for_who.w2.title"),
      desc: t("home.for_who.w2.desc"),
      img: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    },
    {
      title: t("home.for_who.w3.title"),
      desc: t("home.for_who.w3.desc"),
      img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    },
    {
      title: t("home.for_who.w4.title"),
      desc: t("home.for_who.w4.desc"),
      img: "https://images.unsplash.com/photo-1544531585-9847b68c8c86?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    },
  ];

  // ✅ Pricing

  // ✅ FAQ
  const faqs = [
    {
      q: t("home.faq.q1.q"),
      a: t("home.faq.q1.a"),
    },
    {
      q: t("home.faq.q2.q"),
      a: t("home.faq.q2.a"),
    },
    {
      q: t("home.faq.q3.q"),
      a: t("home.faq.q3.a"),
    },
    {
      q: t("home.faq.q4.q"),
      a: t("home.faq.q4.a"),
    },
    {
      q: t("home.faq.q5.q"),
      a: t("home.faq.q5.a"),
    },
  ];

  return (
    <div>

    {/* ═══════════════ MOBILE HOME ═══════════════ */}
    <div className="md:hidden min-h-screen" style={{ background: "#fff" }}>

      {/* ══ HERO — dark mesh ══ */}
      <div style={{ background: "#0f172a", padding: "36px 22px 28px", position: "relative", overflow: "hidden" }}>
        {/* Ambient orbs */}
        <div style={{ position: "absolute", width: 420, height: 420, background: "radial-gradient(circle, rgba(57,73,171,.65) 0%, transparent 60%)", top: -180, right: -140, borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 200, height: 200, background: "radial-gradient(circle, rgba(139,92,246,.35) 0%, transparent 65%)", bottom: -60, left: -40, borderRadius: "50%", pointerEvents: "none" }} />

        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 2, marginBottom: 28 }}>
          <div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginBottom: 6, letterSpacing: ".4px" }}>{greeting()}</p>
            <p style={{ fontSize: 11, fontWeight: 400, color: "rgba(255,255,255,.32)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 5 }}>
              {language === "es" ? "Bienvenido de vuelta" : "Welcome back"}
            </p>
            <p style={{ fontSize: 34, fontWeight: 800, color: "#fff", letterSpacing: "-1px", lineHeight: .9 }}>{displayName}</p>
          </div>

          {/* Avatar / profile menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(v => !v)}
              style={{ width: 42, height: 42, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 15, fontWeight: 700 }}
            >
              {(user?.first_name?.[0] || user?.username?.[0] || "U").toUpperCase()}
            </button>
            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                <div className="absolute right-0 top-12 z-50 bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden" style={{ minWidth: 180 }}>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
                    <span style={{ fontSize: "11px", color: "#888" }}>{language === "es" ? "Idioma" : "Language"}</span>
                    <div className="flex gap-1">
                      {["es","en"].map(lang => (
                        <button key={lang} onClick={() => changeLanguage(lang)} style={{ padding: "2px 8px", borderRadius: "8px", fontSize: "10px", fontWeight: 600, background: language === lang ? "#3949AB" : "#f5f5f5", color: language === lang ? "#fff" : "#888", border: "none", cursor: "pointer" }}>{lang.toUpperCase()}</button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => { setShowProfileMenu(false); setShowEditProfile(true); }} style={{ width: "100%", textAlign: "left", padding: "12px 16px", fontSize: "12px", color: "#1a1a2e", fontWeight: 500, background: "none", border: "none", borderBottom: "1px solid #f5f5f5", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>👤</span> {language === "es" ? "Mi perfil" : "My profile"}
                  </button>
                  <button onClick={() => { setShowProfileMenu(false); setShowStats(true); }} style={{ width: "100%", textAlign: "left", padding: "12px 16px", fontSize: "12px", color: "#1a1a2e", fontWeight: 500, background: "none", border: "none", borderBottom: "1px solid #f5f5f5", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>📊</span> {language === "es" ? "Estadísticas" : "Statistics"}
                  </button>
                  <button onClick={() => { setShowProfileMenu(false); logout(); }} style={{ width: "100%", textAlign: "left", padding: "12px 16px", fontSize: "12px", color: "#e53e3e", fontWeight: 600, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>→</span> {language === "es" ? "Cerrar sesión" : "Sign out"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Ring + stats */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, position: "relative", zIndex: 2, marginBottom: 24 }}>
          {/* Streak ring */}
          <div style={{ position: "relative", width: 92, height: 92, flexShrink: 0 }}>
            <svg viewBox="0 0 92 92" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
              <defs>
                <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgb(57,73,171)" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>
              <circle cx="46" cy="46" r="37" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
              <circle cx="46" cy="46" r="37" fill="none" stroke="url(#rg)" strokeWidth="6" strokeLinecap="round" strokeDasharray="232" strokeDashoffset="232" />
            </svg>
            <div style={{ position: "absolute", inset: 12, background: "rgba(255,255,255,.05)", borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1 }}>0</p>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,.35)", textTransform: "uppercase", letterSpacing: ".8px", marginTop: 2 }}>
                {language === "es" ? "Racha" : "Streak"}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(52,211,153,.15)", border: "1px solid rgba(52,211,153,.28)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
              </div>
              <div>
                <p style={{ fontSize: 17, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{projects.length}</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,.35)", textTransform: "uppercase", letterSpacing: ".7px" }}>
                  {language === "es" ? "Proyectos" : "Projects"}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(139,92,246,.15)", border: "1px solid rgba(139,92,246,.28)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              </div>
              <div>
                <p style={{ fontSize: 17, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{batteries.length}</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,.35)", textTransform: "uppercase", letterSpacing: ".7px" }}>
                  {language === "es" ? "Baterías" : "Batteries"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Focus glass card */}
        {batteries.length > 0 && (
          <div style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 22, padding: 18, position: "relative", zIndex: 2, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "1.2px", textTransform: "uppercase", color: "rgba(255,255,255,.45)", display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                  <span style={{ width: 6, height: 6, background: "#34d399", borderRadius: "50%", display: "inline-block" }} />
                  {language === "es" ? "Enfoque de hoy · Batería" : "Today's Focus · Battery"}
                </p>
                <p style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-.6px", lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>
                  {batteries[0]?.title || batteries[0]?.name || "—"}
                </p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,.42)", marginTop: 3 }}>
                  {batteries[0]?.question_count || batteries[0]?.questions_count || batteries[0]?.total_questions || "—"} {language === "es" ? "preguntas · No iniciado" : "questions · Not started"}
                </p>
              </div>
              <div style={{ background: "rgba(52,211,153,.12)", border: "1px solid rgba(52,211,153,.28)", borderRadius: 12, padding: "9px 13px", textAlign: "center", flexShrink: 0 }}>
                <p style={{ fontSize: 20, fontWeight: 800, color: "#34d399", lineHeight: 1 }}>
                  {batteries[0]?.question_count || batteries[0]?.questions_count || batteries[0]?.total_questions || "0"}
                </p>
                <p style={{ fontSize: 9, color: "rgba(52,211,153,.6)", textTransform: "uppercase", letterSpacing: ".7px", marginTop: 2 }}>Qs</p>
              </div>
            </div>
            <div style={{ height: 4, background: "rgba(255,255,255,.10)", borderRadius: 2, marginBottom: 14, overflow: "hidden" }}>
              <div style={{ width: "0%", height: "100%", background: "linear-gradient(90deg, #34d399, #6ee7b7)", borderRadius: 2 }} />
            </div>
            <button
              onClick={() => navigate("/dashboard/my-batteries")}
              style={{ width: "100%", padding: 14, background: "linear-gradient(135deg, #3949AB 0%, #818cf8 100%)", color: "#fff", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, boxShadow: "0 6px 22px rgba(57,73,171,.45)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              {language === "es" ? "Iniciar Simulación" : "Start Simulation"}
            </button>
          </div>
        )}
      </div>

      {/* ══ WHITE BODY ══ */}
      <div style={{ background: "#fff", padding: "24px 20px 0" }}>

        {/* Batteries section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{language === "es" ? "Baterías" : "Batteries"}</p>
          <button onClick={() => navigate("/dashboard/my-batteries")} style={{ fontSize: 11, color: "#3949AB", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
            {language === "es" ? "Ver todas →" : "See all →"}
          </button>
        </div>

        {/* Horizontal battery scroll */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {batteries.slice(0, 5).map((batt, i) => (
            <div key={batt.id || i} style={{ flexShrink: 0, width: 160, background: "#f8fafc", borderRadius: 20, border: "1.5px solid #e8edf8", padding: 16, cursor: "pointer" }}
              onClick={() => navigate("/dashboard/my-batteries")}
            >
              <div style={{ width: 38, height: 38, borderRadius: 12, background: i % 2 === 0 ? "#fffbeb" : "rgba(57,73,171,0.10)", border: `1.5px solid ${i % 2 === 0 ? "#fde68a" : "rgba(57,73,171,0.22)"}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={i % 2 === 0 ? "#d97706" : "#3949AB"} strokeWidth="1.8">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {batt.title || batt.name}
              </p>
              <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10 }}>
                {language === "es" ? "No iniciado" : "Not started"}
              </p>
              <div style={{ height: 3, background: "#e8edf8", borderRadius: 2, marginBottom: 11, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "#3949AB", borderRadius: 2, width: "0%" }} />
              </div>
              <button style={{ width: "100%", padding: "8px 0", borderRadius: 10, fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer", background: "#3949AB", color: "#fff" }}>
                {language === "es" ? "Iniciar" : "Start"}
              </button>
            </div>
          ))}
          {batteries.length === 0 && (
            <p style={{ fontSize: 13, color: "#94a3b8", padding: "16px 0" }}>
              {language === "es" ? "No hay baterías todavía" : "No batteries yet"}
            </p>
          )}
        </div>

        {/* Quick Access dark block */}
        <div style={{ background: "#0f172a", margin: "0 -20px", padding: "22px 20px 28px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", width: 260, height: 260, background: "radial-gradient(circle, rgba(57,73,171,.5) 0%, transparent 60%)", top: -100, right: -80, borderRadius: "50%", pointerEvents: "none" }} />
          <div style={{ position: "absolute", width: 160, height: 160, background: "radial-gradient(circle, rgba(139,92,246,.25) 0%, transparent 65%)", bottom: -50, left: -40, borderRadius: "50%", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, position: "relative", zIndex: 2 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{language === "es" ? "Acceso Rápido" : "Quick Access"}</p>
            <button onClick={() => navigate("/dashboard/projects")} style={{ fontSize: 11, color: "#818cf8", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
              {language === "es" ? "Gestionar →" : "Manage →"}
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, position: "relative", zIndex: 2 }}>
            {[
              { num: batteries.length, lbl: language === "es" ? "Baterías" : "Batteries", nav: "/dashboard/my-batteries", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg> },
              { num: deckCount ?? "—", lbl: language === "es" ? "Mazos" : "Decks", nav: "/dashboard/my-decks", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg> },
              { num: batteries.length, lbl: language === "es" ? "Simular" : "Simulate", nav: "/dashboard/my-batteries", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.8"><polygon points="5 3 19 12 5 21 5 3"/></svg> },
            ].map((item, i) => (
              <button key={i} onClick={() => navigate(item.nav)} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 18, padding: "16px 10px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 9, cursor: "pointer" }}>
                <div style={{ width: 36, height: 36, background: "rgba(57,73,171,.3)", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(99,102,241,.4)" }}>
                  {item.icon}
                </div>
                <p style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{item.num}</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".8px" }}>{item.lbl}</p>
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: 24 }} />
      </div>

    </div>

      <EditProfileDialog open={showEditProfile} handler={() => setShowEditProfile(false)} />
      <UserStatisticsDialog open={showStats} handler={() => setShowStats(false)} userId={user?.id} />

    {/* ═══════════════ DESKTOP HOME (landing page) ═══════════════ */}
    <div className="hidden md:block mt-6 space-y-24">
      {/* ================= HERO (premium) ================= */}
      <section className="relative overflow-hidden rounded-2xl border border-blue-gray-100 bg-white">
        {/* Fondo suave tipo SaaS */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full blur-3xl opacity-40 bg-blue-gray-100" />
          <div className="absolute -bottom-48 -left-48 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-40 bg-blue-100" />
        </div>

        <div className="relative px-6 py-10 lg:px-10 lg:py-14">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
            {/* Left: copy */}
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                <Chip value={t("home.hero.tags.flashcards")} variant="outlined" color="blue-gray" />
                <Chip value={t("home.hero.tags.questions")} variant="outlined" color="blue-gray" />
                <Chip value={t("home.hero.tags.progress")} variant="outlined" color="blue-gray" />
              </div>

              <Typography variant="h2" color="blue-gray" className="leading-tight">
                {t("home.hero.title_1")}
                <br />
                {t("home.hero.title_2")}
              </Typography>

              <Typography variant="lead" className="mt-3 text-blue-gray-500 max-w-xl">
                <span className="font-semibold text-blue-gray-700">{t("home.hero.subtitle_prefix")}</span> {t("home.hero.subtitle_mid1")}{" "}
                <span className="font-semibold text-blue-gray-700">{t("home.hero.subtitle_flashcards")}</span> {t("home.hero.subtitle_mid2")}{" "}
                <span className="font-semibold text-blue-gray-700">{t("home.hero.subtitle_questions")}</span> {t("home.hero.subtitle_suffix")}
              </Typography>

              <Typography className="mt-2 text-sm text-blue-gray-400">
                {t("home.hero.ideal_for")}
              </Typography>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  color="blue-gray"
                  className="shadow-sm"
                  onClick={() => navigate("/dashboard/projects")}
                >
                  {t("home.hero.btn_create")}
                </Button>
                <Button
                  variant="outlined"
                  color="blue-gray"
                  onClick={() => {
                    const el = document.getElementById("como-funciona");
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  {t("home.hero.btn_how_it_works")}
                </Button>
              </div>

              {/* Ribbon */}
              <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-blue-gray-100 bg-blue-gray-50 px-4 py-3">
                <BoltIcon className="h-5 w-5 text-blue-gray-700" />
                <Typography className="text-sm text-blue-gray-700">
                  {t("home.hero.ribbon")}
                </Typography>
              </div>
            </div>

            {/* Right: mockup */}
            <div className="relative">
              <div className="absolute -inset-6 rounded-3xl bg-blue-gray-50/70 blur-2xl" />
              <div className="relative rounded-2xl border border-blue-gray-100 bg-white shadow-xl">
                {/* Usa tu mockup aquí */}
                <img
                  src="/img/anko-hero.png"
                  alt="Anko Studio UI"
                  className="h-[320px] w-full rounded-2xl object-cover lg:h-[380px]"
                />
              </div>

              {/* Mini cards flotantes (detalle premium) */}
              <div className="absolute -bottom-6 -left-4 hidden w-56 rounded-2xl border border-blue-gray-100 bg-white p-4 shadow-lg lg:block">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-blue-gray-50 p-2">
                    <QuestionMarkCircleIcon className="h-5 w-5 text-blue-gray-700" />
                  </div>
                  <div>
                    <Typography className="text-sm font-semibold text-blue-gray-800">
                      {t("home.hero.floating_learn.title")}
                    </Typography>
                    <Typography className="text-xs text-blue-gray-500">
                      {t("home.hero.floating_learn.desc")}
                    </Typography>
                  </div>
                </div>
              </div>

              <div className="absolute -top-6 -right-4 hidden w-56 rounded-2xl border border-blue-gray-100 bg-white p-4 shadow-lg lg:block">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-blue-gray-50 p-2">
                    <TagIcon className="h-5 w-5 text-blue-gray-700" />
                  </div>
                  <div>
                    <Typography className="text-sm font-semibold text-blue-gray-800">
                      {t("home.hero.floating_progress.title")}
                    </Typography>
                    <Typography className="text-xs text-blue-gray-500">
                      {t("home.hero.floating_progress.desc")}
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-10 border-t border-blue-gray-100" />
        </div>
      </section>

      {/* ================= CÓMO FUNCIONA ================= */}
      <section id="como-funciona">
        <div className="mx-auto max-w-6xl px-1">
          <div className="text-center mb-8">
            <Typography variant="h3" color="blue-gray" className="mb-2">
              {t("home.how_it_works.title")}
            </Typography>
            <Typography className="text-blue-gray-500">
              {t("home.how_it_works.subtitle")}
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {howItWorks.map((item) => (
              <Card
                key={item.title}
                className="group border border-blue-gray-100 shadow-sm hover:shadow-lg transition-shadow rounded-2xl overflow-hidden"
              >
                <CardHeader floated={false} shadow={false} className="m-0 h-44">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </CardHeader>
                <CardBody className="p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-xl bg-blue-gray-50 p-2">
                      {React.createElement(item.icon, { className: "h-5 w-5 text-blue-gray-700" })}
                    </div>
                    <Typography variant="h5" color="blue-gray">
                      {item.title}
                    </Typography>
                  </div>
                  <Typography className="text-blue-gray-600">{item.desc}</Typography>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BENEFICIOS ================= */}
      <section className="px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <Typography variant="h2" className="text-3xl lg:text-5xl font-bold tracking-tight text-zinc-900">
              {t("home.benefits.title")}
            </Typography>
            <Typography className="text-zinc-500 font-medium text-lg max-w-2xl mx-auto">
              {t("home.benefits.subtitle")}
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.isArray(benefits) && benefits.map((b) => (
              <div key={b.title} className="p-8 rounded-[2rem] bg-zinc-50 border border-zinc-100 hover:bg-white hover:shadow-premium transition-all duration-300 group">
                <div className="mb-6 h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-zinc-900 group-hover:scale-110 transition-transform">
                  {React.createElement(b.icon, { className: "h-7 w-7" })}
                </div>
                <Typography variant="h5" className="font-bold text-zinc-900 mb-2 tracking-tight">
                  {b.title}
                </Typography>
                <Typography className="text-zinc-500 font-medium leading-relaxed text-sm">
                  {b.desc}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PARA QUIÉN ES ================= */}
      <section className="px-4">
        <div className="max-w-7xl mx-auto">
          <Carousel
            className="rounded-[3rem] overflow-hidden h-[500px] shadow-2xl border border-zinc-200"
            navigation={({ setActiveIndex, activeIndex, length }) => (
              <div className="absolute bottom-8 left-2/4 z-50 flex -translate-x-2/4 gap-3">
                {new Array(length).fill("").map((_, i) => (
                  <span
                    key={i}
                    className={`block h-1.5 cursor-pointer rounded-full transition-all content-[''] ${activeIndex === i ? "w-10 bg-white" : "w-4 bg-white/40"
                      }`}
                    onClick={() => setActiveIndex(i)}
                  />
                ))}
              </div>
            )}
            transition={{ duration: 0.7, type: "tween" }}
            autoplay={true}
            loop={true}
          >
            {Array.isArray(forWho) && forWho.map((item, idx) => (
              <div key={idx} className="relative h-full w-full">
                <img
                  src={item.img}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-900/40 to-transparent flex flex-col justify-end p-12 lg:p-20">
                  <div className="max-w-2xl space-y-4">
                    <Typography
                      variant="h2"
                      className="text-4xl lg:text-6xl font-extrabold text-white tracking-tight"
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="lead"
                      className="text-white/80 font-medium text-lg lg:text-xl"
                    >
                      {item.desc}
                    </Typography>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {/* ================= TESTIMONIOS ================= */}
      <section className="px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <Typography variant="h2" className="text-3xl lg:text-5xl font-bold tracking-tight text-zinc-900">
              {t("home.testimonials.title")}
            </Typography>
            <Typography className="text-zinc-500 font-medium text-lg max-w-2xl mx-auto">
              {t("home.testimonials.subtitle")}
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                name: t("home.testimonials.t1.name"),
                role: t("home.testimonials.t1.role"),
                img: "https://i.pravatar.cc/150?u=a",
                quote: t("home.testimonials.t1.quote"),
              },
              {
                name: t("home.testimonials.t2.name"),
                role: t("home.testimonials.t2.role"),
                img: "https://i.pravatar.cc/150?u=b",
                quote: t("home.testimonials.t2.quote"),
              },
              {
                name: t("home.testimonials.t3.name"),
                role: t("home.testimonials.t3.role"),
                img: "https://i.pravatar.cc/150?u=c",
                quote: t("home.testimonials.t3.quote"),
              },
            ].map((t, idx) => (
              <div key={idx} className="p-8 rounded-[2.5rem] bg-white border border-zinc-200/60 shadow-premium flex flex-col">
                <div className="flex-1">
                  <div className="flex gap-1 mb-6">
                    {[1, 2, 3, 4, 5].map(star => (
                      <StarIcon key={star} className="h-4 w-4 text-amber-400" />
                    ))}
                  </div>
                  <Typography className="text-zinc-700 font-medium text-lg leading-relaxed italic mb-8">
                    &quot;{t.quote}&quot;
                  </Typography>
                </div>
                <div className="flex items-center gap-4 pt-6 border-t border-zinc-100">
                  <img
                    src={t.img}
                    alt={t.name}
                    className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md"
                  />
                  <div>
                    <Typography className="font-bold text-zinc-900 tracking-tight">{t.name}</Typography>
                    <Typography className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{t.role}</Typography>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <Typography variant="h2" className="text-3xl lg:text-5xl font-bold tracking-tight text-zinc-900">
              {t("home.faq.title")}
            </Typography>
            <Typography className="text-zinc-500 font-medium text-lg">
              {t("home.faq.subtitle")}
            </Typography>
          </div>

          <div className="space-y-4">
            {Array.isArray(faqs) && faqs.map((f) => (
              <div key={f.q} className="p-6 rounded-2xl bg-zinc-50 border border-zinc-100 hover:bg-white hover:border-zinc-200 transition-all group">
                <Typography variant="h5" className="font-bold text-zinc-900 mb-3 tracking-tight flex items-center gap-3">
                  <QuestionMarkCircleIcon className="h-5 w-5 text-indigo-500" />
                  {f.q}
                </Typography>
                <Typography className="text-zinc-500 font-medium pl-8 leading-relaxed">
                  {f.a}
                </Typography>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button
              variant="outline"
              color="zinc"
              className="rounded-xl border-zinc-200 hover:bg-zinc-50 normal-case text-sm font-bold shadow-sm transition-all"
              onClick={() => navigate("/dashboard/faqs")}
            >
              {language === "es" ? "Ver todas las preguntas" : "View all FAQs"}
              <RocketLaunchIcon className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* ================= CONTACTO ================= */}
      <section className="px-4">
        <div className="max-w-7xl mx-auto">
          <Card className="overflow-hidden border border-zinc-200/60 shadow-2xl rounded-[3rem]">
            <CardBody className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Image Side */}
                <div className="relative h-64 md:h-auto bg-zinc-900">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80"
                    alt="Contact support"
                    className="absolute inset-0 h-full w-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/40 to-black/80 flex flex-col justify-end p-12">
                    <Typography variant="h3" className="text-white font-extrabold text-3xl mb-4">
                      {language === "es" ? "¿Necesitas ayuda?" : "Need help?"}
                    </Typography>
                    <Typography className="text-white/70 font-medium text-lg leading-snug">
                      {language === "es"
                        ? "Nuestro equipo está listo para ayudarte a maximizar tu productividad."
                        : "Our team is ready to help you maximize your productivity."}
                    </Typography>
                  </div>
                </div>

                {/* Form Side */}
                <div className="p-8 lg:p-16 bg-white">
                  <div className="mb-10">
                    <Typography variant="h3" className="font-bold text-zinc-900 mb-3 tracking-tight">
                      {t("home.contact.title")}
                    </Typography>
                    <Typography className="text-zinc-500 font-medium mb-6">
                      {t("home.contact.subtitle")}
                    </Typography>
                  </div>

                  {status.message && (
                    <div className={`p-4 mb-8 rounded-xl font-bold text-sm ${status.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                      {status.message}
                    </div>
                  )}

                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <Input
                        label={t("home.contact.form.name")}
                        className="!border-zinc-200 focus:!border-indigo-600 !bg-zinc-50/50 rounded-xl"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        labelProps={{ className: "hidden" }}
                        placeholder={t("home.contact.form.name")}
                      />
                      <Input
                        label={t("home.contact.form.phone")}
                        type="tel"
                        className="!border-zinc-200 focus:!border-indigo-600 !bg-zinc-50/50 rounded-xl"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        labelProps={{ className: "hidden" }}
                        placeholder={t("home.contact.form.phone")}
                      />
                    </div>
                    <Input
                      label={t("home.contact.form.email")}
                      type="email"
                      required
                      className="!border-zinc-200 focus:!border-indigo-600 !bg-zinc-50/50 rounded-xl"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      labelProps={{ className: "hidden" }}
                      placeholder={t("home.contact.form.email")}
                    />
                    <Textarea
                      label={t("home.contact.form.desc")}
                      required
                      className="!border-zinc-200 focus:!border-indigo-600 !bg-zinc-50/50 rounded-xl"
                      rows={4}
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      labelProps={{ className: "hidden" }}
                      placeholder={t("home.contact.form.desc")}
                    />

                    <Button
                      className="py-4 bg-zinc-900 hover:bg-black rounded-xl shadow-xl shadow-zinc-200 flex items-center justify-center gap-3 normal-case text-sm font-bold transition-all hover:-translate-y-1"
                      fullWidth
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (language === "es" ? "Enviando..." : "Sending...") : t("home.contact.form.button")}
                      {!loading && <BoltIcon className="h-4 w-4 text-indigo-400" />}
                    </Button>
                  </form>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* ================= CTA FINAL ================= */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-[3rem] bg-indigo-600 p-12 lg:p-20 overflow-hidden shadow-2xl shadow-indigo-200">
            {/* Decorative circles */}
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center lg:justify-between gap-12 text-center lg:text-left">
              <div className="space-y-6 max-w-2xl">
                <Typography variant="h2" className="text-4xl lg:text-6xl font-extrabold text-white tracking-tight">
                  {t("home.cta.title")}
                </Typography>
                <Typography variant="lead" className="text-indigo-100 font-medium text-lg lg:text-xl">
                  {t("home.cta.subtitle")}
                </Typography>
              </div>
              <Button
                size="lg"
                className="rounded-2xl bg-white text-indigo-600 hover:bg-zinc-50 px-12 py-5 normal-case text-lg font-bold shadow-xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                onClick={() => navigate("/dashboard/projects")}
              >
                {t("home.cta.btn_create")}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>

    </div>
  );
}

export default Home;

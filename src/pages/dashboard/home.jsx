import React from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCircleIcon,
  ServerStackIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  EnvelopeIcon,
  BuildingOffice2Icon,
  RectangleStackIcon,
  BoltIcon,
  TagIcon,
  ClipboardDocumentCheckIcon,
  UsersIcon,
  FolderIcon,
  BookOpenIcon,
  ArrowRightIcon,
  ChartBarIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";
import { useLanguage } from "@/context/language-context";
import { useAuth } from "@/context/auth-context";
import { useProjects } from "@/context/projects-context";
import projectService from "@/services/projectService";
import { EditProfileDialog } from "@/widgets/dialogs/edit-profile-dialog";
import { UserStatisticsDialog } from "@/widgets/dialogs/user-statistics-dialog";


/* Admin action cards config */
const adminCards = (lang) => [
  { name: lang === "es" ? "Usuarios"        : "Users",          path: "/dashboard/users",          icon: UsersIcon,               accent: "#818CF8", bg: "rgba(99,102,241,0.1)",  border: "rgba(99,102,241,0.22)" },
  { name: lang === "es" ? "Recursos"        : "Resources",      path: "/dashboard/resources",      icon: ServerStackIcon,         accent: "#A78BFA", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.22)" },
  { name: lang === "es" ? "Permisos"        : "Permissions",    path: "/dashboard/permissions",    icon: ShieldCheckIcon,         accent: "#60A5FA", bg: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.22)" },
  { name: lang === "es" ? "Roles"           : "Roles",          path: "/dashboard/roles",          icon: UserCircleIcon,          accent: "#C084FC", bg: "rgba(192,132,252,0.1)", border: "rgba(192,132,252,0.22)" },
  { name: lang === "es" ? "Planes"          : "Plans",          path: "/dashboard/plans",          icon: CreditCardIcon,          accent: "#4ADE80", bg: "rgba(74,222,128,0.09)", border: "rgba(74,222,128,0.2)" },
  { name: lang === "es" ? "Límites de Plan" : "Plan Limits",    path: "/dashboard/plan-limits",    icon: ClipboardDocumentCheckIcon, accent: "#34D399", bg: "rgba(52,211,153,0.09)", border: "rgba(52,211,153,0.2)" },
  { name: lang === "es" ? "Suscripciones"  : "Subscriptions",  path: "/dashboard/subscriptions",  icon: TagIcon,                 accent: "#FCD34D", bg: "rgba(252,211,77,0.09)", border: "rgba(252,211,77,0.2)" },
  { name: lang === "es" ? "Decks"          : "Decks",           path: "/dashboard/decks",          icon: RectangleStackIcon,      accent: "#38BDF8", bg: "rgba(56,189,248,0.09)", border: "rgba(56,189,248,0.2)" },
  { name: lang === "es" ? "Baterías"       : "Batteries",       path: "/dashboard/batteries",      icon: BoltIcon,                accent: "#818CF8", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)" },
  { name: lang === "es" ? "Flashcards"     : "Flashcards",      path: "/dashboard/flashcards",     icon: RectangleStackIcon,      accent: "#93C5FD", bg: "rgba(147,197,253,0.09)", border: "rgba(147,197,253,0.2)" },
  { name: lang === "es" ? "Soporte"        : "Support",         path: "/dashboard/support-requests", icon: EnvelopeIcon,          accent: "#F87171", bg: "rgba(248,113,113,0.09)", border: "rgba(248,113,113,0.2)" },
  { name: lang === "es" ? "Procesos"       : "Processes",       path: "/dashboard/global-projects", icon: FolderIcon,             accent: "#FB923C", bg: "rgba(251,146,60,0.09)", border: "rgba(251,146,60,0.2)" },
  { name: lang === "es" ? "Rutas Aprend."  : "Learning Paths",  href: "/enterprise/learning/paths", icon: BookOpenIcon,           accent: "#F472B6", bg: "rgba(244,114,182,0.09)", border: "rgba(244,114,182,0.2)" },
  { name: lang === "es" ? "Empresas"       : "Companies",       href: "/platform-admin/companies",  icon: BuildingOffice2Icon,    accent: "#FBBF24", bg: "rgba(251,191,36,0.09)", border: "rgba(251,191,36,0.2)" },
];

export function Home() {
  const { language, changeLanguage } = useLanguage();
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

  const displayName = user?.first_name || user?.username || "Admin";

  const cards = adminCards(language);

  return (
    <div>
      {/* ═══════════════ MOBILE ═══════════════ */}
      <div className="md:hidden min-h-screen" style={{ background: "#020617" }}>
        {/* Hero dark */}
        <div style={{ background: "linear-gradient(180deg, #080F1E 0%, #060D1A 100%)", padding: "32px 20px 24px", position: "relative", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(99,102,241,0.05) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: -80, right: -60, width: 280, height: 280, background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)", borderRadius: "50%", pointerEvents: "none" }} />

          {/* Top row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {language === "es" ? "Bienvenido de vuelta" : "Welcome back"}
              </p>
              <p style={{ fontSize: 28, fontWeight: 900, color: "#F1F5F9", letterSpacing: "-0.03em", lineHeight: 1 }}>{displayName}</p>
              <span style={{ display: "inline-flex", alignItems: "center", marginTop: 6, padding: "3px 9px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 6, fontSize: 10, fontWeight: 800, color: "#F87171", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                Platform Admin
              </span>
            </div>
            {/* Avatar menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(v => !v)}
                style={{ width: 42, height: 42, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#F1F5F9", fontSize: 15, fontWeight: 800 }}>
                {(user?.first_name?.[0] || user?.username?.[0] || "A").toUpperCase()}
              </button>
              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                  <div style={{ position: "absolute", right: 0, top: 50, zIndex: 50, background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, overflow: "hidden", minWidth: 180, boxShadow: "0 16px 48px rgba(0,0,0,0.5)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                      <span style={{ fontSize: 11, color: "#64748B" }}>{language === "es" ? "Idioma" : "Language"}</span>
                      <div style={{ display: "flex", gap: 4 }}>
                        {["es","en"].map(lang => (
                          <button key={lang} onClick={() => changeLanguage(lang)} style={{ padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, background: language === lang ? "#6366F1" : "rgba(255,255,255,0.05)", color: language === lang ? "#fff" : "#64748B", border: "none", cursor: "pointer" }}>{lang.toUpperCase()}</button>
                        ))}
                      </div>
                    </div>
                    {[
                      { label: language === "es" ? "Mi perfil" : "My profile", action: () => { setShowProfileMenu(false); setShowEditProfile(true); } },
                      { label: language === "es" ? "Estadísticas" : "Statistics", action: () => { setShowProfileMenu(false); setShowStats(true); } },
                    ].map(item => (
                      <button key={item.label} onClick={item.action} style={{ width: "100%", textAlign: "left", padding: "11px 16px", fontSize: 12, color: "#94A3B8", fontWeight: 500, background: "none", border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" }}>
                        {item.label}
                      </button>
                    ))}
                    <button onClick={() => { setShowProfileMenu(false); logout(); }} style={{ width: "100%", textAlign: "left", padding: "11px 16px", fontSize: 12, color: "#F87171", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>
                      {language === "es" ? "Cerrar sesión" : "Sign out"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, position: "relative" }}>
            {[
              { num: projects.length, label: language === "es" ? "Proyectos" : "Projects" },
              { num: batteries.length, label: language === "es" ? "Baterías" : "Batteries" },
              { num: deckCount ?? "—", label: language === "es" ? "Decks" : "Decks" },
            ].map((s, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
                <p style={{ fontSize: 22, fontWeight: 900, color: "#F1F5F9", lineHeight: 1, marginBottom: 3 }}>{s.num}</p>
                <p style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Admin actions mobile grid */}
        <div style={{ padding: "20px 16px 32px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
            {language === "es" ? "Acciones de Admin" : "Admin Actions"}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {cards.map((card, i) => {
              const Icon = card.icon;
              const handleClick = () => card.href ? navigate(card.href) : navigate(card.path);
              return (
                <button key={i} onClick={handleClick}
                  style={{ background: card.bg, border: `1px solid ${card.border}`, borderRadius: 14, padding: "14px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer", transition: "all 0.15s" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon style={{ width: 18, height: 18, color: card.accent }} />
                  </div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#CBD5E1", textAlign: "center", lineHeight: 1.3 }}>{card.name}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dialogs (shared mobile+desktop) */}
      <EditProfileDialog open={showEditProfile} handler={() => setShowEditProfile(false)} />
      <UserStatisticsDialog open={showStats} handler={() => setShowStats(false)} userId={user?.id} />

      {/* ═══════════════ DESKTOP ADMIN HUB ═══════════════ */}
      <div className="hidden md:block" style={{ minHeight: "calc(100vh - 48px)" }}>

        {/* ── Welcome header ── */}
        <div style={{ position: "relative", background: "linear-gradient(135deg, #080F1E 0%, #0B1628 50%, #080F1E 100%)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "36px 40px", marginBottom: 28, overflow: "hidden" }}>
          {/* glow */}
          <div style={{ position: "absolute", top: -60, right: -60, width: 340, height: 340, background: "radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 65%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(99,102,241,0.05) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none", borderRadius: 20 }} />

          <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#475569", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>
                {greeting()}
              </p>
              <h1 style={{ fontSize: 32, fontWeight: 900, color: "#F1F5F9", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 10 }}>
                {displayName}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ padding: "4px 10px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#F87171", fontSize: 11, fontWeight: 800, borderRadius: 7, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                  Platform Admin
                </span>
                <span style={{ fontSize: 12, color: "#334155" }}>·</span>
                <p style={{ fontSize: 13, color: "#64748B" }}>
                  {language === "es" ? "Control total de la plataforma Ankard" : "Full control of the Ankard platform"}
                </p>
              </div>
            </div>

            {/* Quick stats */}
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { num: projects.length, label: language === "es" ? "Proyectos" : "Projects", accent: "#818CF8" },
                { num: batteries.length, label: language === "es" ? "Baterías" : "Batteries", accent: "#4ADE80" },
                { num: deckCount ?? "—", label: language === "es" ? "Decks" : "Decks", accent: "#38BDF8" },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 22px", textAlign: "center", minWidth: 80 }}>
                  <p style={{ fontSize: 26, fontWeight: 900, color: s.accent, lineHeight: 1, marginBottom: 4 }}>{s.num}</p>
                  <p style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Admin Actions Grid ── */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 16 }}>
            {language === "es" ? "Módulos de Administración" : "Administration Modules"}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
            {cards.map((card, i) => {
              const Icon = card.icon;
              const handleClick = () => card.href ? navigate(card.href) : navigate(card.path);
              return (
                <button key={i} onClick={handleClick}
                  style={{ background: card.bg, border: `1px solid ${card.border}`, borderRadius: 16, padding: "20px 12px 18px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer", transition: "all 0.18s", textAlign: "center" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 28px ${card.border}`; e.currentTarget.style.borderColor = card.accent + "55"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = card.border; }}
                  onMouseDown={(e) => e.currentTarget.style.transform = "translateY(0) scale(0.97)"}
                  onMouseUp={(e) => e.currentTarget.style.transform = "translateY(-2px)"}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: "rgba(255,255,255,0.06)", border: `1px solid ${card.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon style={{ width: 20, height: 20, color: card.accent }} />
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#CBD5E1", lineHeight: 1.3 }}>{card.name}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Platform Overview ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* Left: Content metrics */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "28px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ChartBarIcon style={{ width: 16, height: 16, color: "#818CF8" }} />
              </div>
              <p style={{ fontSize: 13, fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.01em" }}>
                {language === "es" ? "Contenido de la Plataforma" : "Platform Content"}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                { num: deckCount ?? "—",   label: language === "es" ? "Decks totales"     : "Total Decks",     accent: "#38BDF8", bg: "rgba(56,189,248,0.07)",  border: "rgba(56,189,248,0.15)",  path: "/dashboard/decks",      icon: RectangleStackIcon },
                { num: batteries.length,   label: language === "es" ? "Baterías activas"  : "Active Batteries",accent: "#818CF8", bg: "rgba(99,102,241,0.07)", border: "rgba(99,102,241,0.15)", path: "/dashboard/batteries",  icon: BoltIcon },
                { num: projects.length,    label: language === "es" ? "Proyectos"         : "Projects",        accent: "#4ADE80", bg: "rgba(74,222,128,0.07)", border: "rgba(74,222,128,0.15)", path: "/dashboard/global-projects", icon: FolderIcon },
                { num: "—",               label: language === "es" ? "Flashcards"         : "Flashcards",      accent: "#F472B6", bg: "rgba(244,114,182,0.07)", border: "rgba(244,114,182,0.15)", path: "/dashboard/flashcards", icon: RectangleStackIcon },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <button key={i} onClick={() => navigate(s.path)}
                    style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 14, padding: "16px", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.borderColor = s.accent + "44"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = s.border; }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <Icon style={{ width: 16, height: 16, color: s.accent }} />
                      <ArrowRightIcon style={{ width: 12, height: 12, color: "#334155" }} />
                    </div>
                    <p style={{ fontSize: 24, fontWeight: 900, color: s.accent, lineHeight: 1, marginBottom: 4 }}>{s.num}</p>
                    <p style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>{s.label}</p>
                  </button>
                );
              })}
            </div>

            {/* Platform health strip */}
            <div style={{ background: "rgba(74,222,128,0.07)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ADE80", boxShadow: "0 0 8px rgba(74,222,128,0.6)", flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: "#4ADE80", fontWeight: 700 }}>
                {language === "es" ? "Plataforma operativa — todos los servicios activos" : "Platform operational — all services active"}
              </p>
            </div>
          </div>

          {/* Right: Admin quick links */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "28px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShieldCheckIcon style={{ width: 16, height: 16, color: "#F87171" }} />
              </div>
              <p style={{ fontSize: 13, fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.01em" }}>
                {language === "es" ? "Acciones Críticas de Admin" : "Critical Admin Actions"}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: language === "es" ? "Gestionar usuarios globales"      : "Manage global users",      sub: language === "es" ? "Altas, bajas, roles"                 : "Create, disable, assign roles",  path: "/dashboard/users",              icon: UsersIcon,          accent: "#818CF8" },
                { label: language === "es" ? "Revisar mensajes de soporte"     : "Review support messages",  sub: language === "es" ? "Tickets pendientes de respuesta"     : "Tickets awaiting response",        path: "/dashboard/support-requests",   icon: EnvelopeIcon,       accent: "#F87171" },
                { label: language === "es" ? "Administrar empresas Enterprise" : "Manage Enterprise companies", sub: language === "es" ? "Altas, configuración, usuarios"   : "Onboard, configure, manage users", href: "/platform-admin/companies",     icon: BuildingOffice2Icon, accent: "#FBBF24" },
                { label: language === "es" ? "Configurar planes y límites"    : "Configure plans & limits",  sub: language === "es" ? "Precios, cuotas, restricciones"     : "Pricing, quotas, restrictions",    path: "/dashboard/plans",              icon: CreditCardIcon,     accent: "#4ADE80" },
                { label: language === "es" ? "Control de permisos y roles"    : "Permissions & roles",       sub: language === "es" ? "Accesos y privilegios del sistema"  : "System access and privileges",     path: "/dashboard/permissions",        icon: ShieldCheckIcon,    accent: "#A78BFA" },
                { label: language === "es" ? "Suscripciones activas"          : "Active subscriptions",      sub: language === "es" ? "Estado y gestión de suscripciones" : "Subscription status and management", path: "/dashboard/subscriptions",     icon: TagIcon,            accent: "#FCD34D" },
              ].map((item, i) => {
                const Icon = item.icon;
                const handleNav = () => item.href ? navigate(item.href) : navigate(item.path);
                return (
                  <button key={i} onClick={handleNav}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, cursor: "pointer", transition: "all 0.15s", textAlign: "left" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = item.accent + "30"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: `${item.accent}14`, border: `1px solid ${item.accent}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon style={{ width: 14, height: 14, color: item.accent }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#CBD5E1", marginBottom: 1 }}>{item.label}</p>
                      <p style={{ fontSize: 11, color: "#475569" }}>{item.sub}</p>
                    </div>
                    <ArrowRightIcon style={{ width: 13, height: 13, color: "#334155", flexShrink: 0 }} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;

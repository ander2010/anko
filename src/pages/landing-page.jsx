import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DocumentArrowUpIcon,
  SparklesIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
  BoltIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  LockClosedIcon,
  BuildingOffice2Icon,
  BookOpenIcon,
  RocketLaunchIcon,
  Bars3Icon,
  XMarkIcon,
  CheckBadgeIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import supportService from "@/services/supportService";

// ─── Demo / Contact Modal ─────────────────────────────────────────────────────

function DemoModal({ onClose }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // "success" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      await supportService.sendSupportRequest({ ...form, source: "enterprise_demo_request" });
      setStatus("success");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      let msg = "Ocurrió un error. Por favor intenta de nuevo.";
      try {
        const raw = Array.isArray(err) ? err[0] : (err?.message?.[0] ?? err?.non_field_errors?.[0] ?? null);
        if (raw) { const p = JSON.parse(raw); msg = p.es ?? p.en ?? msg; }
      } catch (_) {}
      setErrorMsg(msg);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  // Close on backdrop click
  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

  return (
    <div onClick={handleBackdrop} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#0F172A", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 18, padding: "32px 28px", maxWidth: 520, width: "100%", boxShadow: "0 30px 80px rgba(0,0,0,0.7)", position: "relative" }}>
        {/* Close */}
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 7, padding: 6, cursor: "pointer", color: "#64748B", transition: "color 0.15s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#F1F5F9")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#64748B")}>
          <XMarkIcon className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.28)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <EnvelopeIcon className="h-5 w-5" style={{ color: "#818CF8" }} />
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 800, color: "#F1F5F9" }}>Solicitar demo de Ankard</p>
            <p style={{ fontSize: 12, color: "#64748B", marginTop: 1 }}>Te contactamos en menos de 24 horas</p>
          </div>
        </div>

        {/* Success state */}
        {status === "success" ? (
          <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.28)", borderRadius: 12, padding: "24px", textAlign: "center" }}>
            <CheckCircleIcon className="h-10 w-10 mx-auto mb-3" style={{ color: "#22C55E" }} />
            <p style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", marginBottom: 6 }}>Mensaje enviado</p>
            <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6 }}>Recibimos tu solicitud. Nuestro equipo te escribirá pronto para agendar una demo personalizada.</p>
            <button onClick={onClose} style={{ marginTop: 18, fontSize: 13, fontWeight: 700, color: "#22C55E", background: "none", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, padding: "9px 20px", cursor: "pointer" }}>
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {status === "error" && (
              <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#EF4444" }}>
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", display: "block", marginBottom: 6 }}>Nombre completo *</label>
                <input name="name" value={form.name} onChange={handleChange} required
                  style={{ width: "100%", background: "#1E293B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#F1F5F9", outline: "none", transition: "border-color 0.15s", boxSizing: "border-box" }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.6)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  placeholder="Juan García" />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", display: "block", marginBottom: 6 }}>Correo electrónico *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required
                  style={{ width: "100%", background: "#1E293B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#F1F5F9", outline: "none", transition: "border-color 0.15s", boxSizing: "border-box" }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.6)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  placeholder="juan@empresa.com" />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", display: "block", marginBottom: 6 }}>Teléfono / WhatsApp</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                style={{ width: "100%", background: "#1E293B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#F1F5F9", outline: "none", transition: "border-color 0.15s", boxSizing: "border-box" }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.6)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                placeholder="+52 55 1234 5678" />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", display: "block", marginBottom: 6 }}>Cuéntanos sobre tu empresa *</label>
              <textarea name="message" value={form.message} onChange={handleChange} required rows={4}
                style={{ width: "100%", background: "#1E293B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#F1F5F9", outline: "none", transition: "border-color 0.15s", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.6)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                placeholder="¿Cuántos empleados? ¿Qué tipo de capacitación necesitan? ¿Tienen documentos listos?" />
            </div>

            <button type="submit" disabled={loading}
              style={{ width: "100%", fontSize: 14, fontWeight: 700, color: "#fff", background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #6366F1, #818CF8)", border: "none", borderRadius: 10, padding: "13px", cursor: loading ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "opacity 0.15s" }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.88"; }}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
              {loading
                ? <><div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff" }} className="animate-spin" />Enviando...</>
                : <>Enviar solicitud de demo <ArrowRightIcon className="h-4 w-4" /></>
              }
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({ onDemoOpen }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: "Producto", href: "#features" },
    { label: "Cómo funciona", href: "#how" },
    { label: "Casos de uso", href: "#roles" },
    { label: "Seguridad", href: "#security" },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      background: scrolled ? "rgba(2,6,23,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      transition: "all 0.25s ease",
    }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
        <a href="/" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #6366F1, #818CF8)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <BoltIcon className="h-5 w-5 text-white" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.02em" }}>Ankard</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: "rgba(99,102,241,0.18)", color: "#818CF8", letterSpacing: "0.05em" }}>
            ENTERPRISE
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {links.map(({ label, href }) => (
            <a key={href} href={href}
              style={{ fontSize: 13, fontWeight: 500, color: "#94A3B8", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={(e) => (e.target.style.color = "#F1F5F9")}
              onMouseLeave={(e) => (e.target.style.color = "#94A3B8")}>
              {label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => navigate("/auth/sign-in")}
            style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8", background: "none", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "7px 16px", cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#F1F5F9"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#94A3B8"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}>
            Iniciar sesión
          </button>
          <button onClick={onDemoOpen}
            style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg, #6366F1, #818CF8)", border: "none", borderRadius: 8, padding: "8px 18px", cursor: "pointer", transition: "opacity 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
            Solicitar demo
          </button>
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen((p) => !p)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", padding: 6 }}>
          {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div style={{ background: "rgba(2,6,23,0.98)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 20px 24px" }}>
          {links.map(({ label, href }) => (
            <a key={href} href={href} onClick={() => setMobileOpen(false)}
              style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#94A3B8", textDecoration: "none", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              {label}
            </a>
          ))}
          <div className="flex flex-col gap-3 mt-5">
            <button onClick={() => { navigate("/auth/sign-in"); setMobileOpen(false); }}
              style={{ fontSize: 14, fontWeight: 600, color: "#94A3B8", background: "none", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "12px", cursor: "pointer" }}>
              Iniciar sesión
            </button>
            <button onClick={() => { onDemoOpen(); setMobileOpen(false); }}
              style={{ fontSize: 14, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg, #6366F1, #818CF8)", border: "none", borderRadius: 8, padding: "12px", cursor: "pointer" }}>
              Solicitar demo
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero({ onDemoOpen }) {
  const navigate = useNavigate();

  return (
    <section style={{ background: "linear-gradient(180deg, #020617 0%, #0F172A 60%, #020617 100%)", paddingTop: 120, paddingBottom: 80, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: 800, height: 400, background: "radial-gradient(ellipse, rgba(99,102,241,0.14) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div className="max-w-6xl mx-auto px-4 md:px-8 text-center relative">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-6"
          style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.28)", borderRadius: 999, padding: "6px 14px" }}>
          <SparklesIcon className="h-3.5 w-3.5" style={{ color: "#818CF8" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#818CF8", letterSpacing: "0.04em" }}>
            IA para Capacitación Corporativa
          </span>
        </div>

        <h1 style={{ fontSize: "clamp(30px, 5.5vw, 58px)", fontWeight: 900, color: "#F1F5F9", lineHeight: 1.08, letterSpacing: "-0.03em", maxWidth: 860, margin: "0 auto 20px" }}>
          Convierte tus documentos internos{" "}
          <span style={{ background: "linear-gradient(135deg, #6366F1, #C084FC)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            en programas de capacitación
          </span>
          , en minutos
        </h1>

        <p style={{ fontSize: "clamp(14px, 2vw, 18px)", color: "#94A3B8", lineHeight: 1.75, maxWidth: 660, margin: "0 auto 36px", fontWeight: 400 }}>
          Sube tus PDFs, manuales y políticas internas. La IA de Ankard genera automáticamente flashcards y quizzes listos para asignar a tu equipo — sin intervención manual, sin semanas de trabajo.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button onClick={onDemoOpen}
            style={{ fontSize: 15, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg, #6366F1, #818CF8)", border: "none", borderRadius: 12, padding: "14px 28px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 0 32px rgba(99,102,241,0.35)", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 0 48px rgba(99,102,241,0.5)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 0 32px rgba(99,102,241,0.35)"; }}>
            Solicitar demo gratuita
            <ArrowRightIcon className="h-4 w-4" />
          </button>
          <a href="#how"
            style={{ fontSize: 14, fontWeight: 600, color: "#94A3B8", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, transition: "color 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#F1F5F9")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}>
            Ver cómo funciona
            <ArrowRightIcon className="h-4 w-4" />
          </a>
        </div>

        {/* Dashboard mockup */}
        <div style={{ maxWidth: 880, margin: "0 auto", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 40px 100px rgba(0,0,0,0.55)", background: "#0F172A" }}>
          <div style={{ background: "#1E293B", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {["#EF4444","#F59E0B","#22C55E"].map((c) => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
            </div>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: 5, padding: "4px 12px", fontSize: 11, color: "#64748B", textAlign: "center" }}>
              app.ankard.com/enterprise/dashboard
            </div>
          </div>
          <div style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {[
              { label: "Procesos", value: "12", icon: BookOpenIcon, color: "#6366F1" },
              { label: "Empleados", value: "148", icon: UserGroupIcon, color: "#22C55E" },
              { label: "Completados", value: "89%", icon: CheckBadgeIcon, color: "#F59E0B" },
              { label: "En progreso", value: "34", icon: ChartBarIcon, color: "#C084FC" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} style={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 12px" }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: `${color}1A`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                  <Icon className="h-3.5 w-3.5" style={{ color }} />
                </div>
                <p style={{ fontSize: 20, fontWeight: 800, color: "#F1F5F9", lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: 10, color: "#64748B", marginTop: 4 }}>{label}</p>
              </div>
            ))}
          </div>
          <div style={{ padding: "0 20px 20px", display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
            <div style={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 14 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Procesos recientes</p>
              {["Manual de Onboarding", "Política de Seguridad IT", "Procedimiento de Ventas"].map((name, i) => (
                <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <span style={{ fontSize: 11, color: "#94A3B8" }}>{name}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "rgba(34,197,94,0.1)", color: "#22C55E" }}>Listo</span>
                </div>
              ))}
            </div>
            <div style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.14), rgba(192,132,252,0.08))", border: "1px solid rgba(99,102,241,0.22)", borderRadius: 10, padding: 16, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: 8 }}>
              <SparklesIcon className="h-6 w-6" style={{ color: "#818CF8" }} />
              <p style={{ fontSize: 12, fontWeight: 700, color: "#F1F5F9" }}>IA generando</p>
              <p style={{ fontSize: 10, color: "#818CF8" }}>Compliance 2025.pdf</p>
              <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2 }}>
                <div style={{ height: "100%", width: "68%", background: "linear-gradient(90deg, #6366F1, #818CF8)", borderRadius: 2 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function Stats() {
  const stats = [
    { value: "3 min", label: "Para convertir un documento en curso completo" },
    { value: "100%", label: "Privado — los datos de tu empresa nunca se comparten" },
    { value: "10×", label: "Más rápido que crear contenido manualmente" },
    { value: "0", label: "Horas de trabajo manual de contenido requeridas" },
  ];
  return (
    <section style={{ background: "#0F172A", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "44px 0" }}>
      <div className="max-w-6xl mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map(({ value, label }) => (
          <div key={value}>
            <p style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 900, lineHeight: 1, marginBottom: 8, background: "linear-gradient(135deg, #6366F1, #C084FC)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{value}</p>
            <p style={{ fontSize: 12, color: "#64748B", lineHeight: 1.5, maxWidth: 160, margin: "0 auto" }}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    { n: "01", icon: DocumentArrowUpIcon, color: "#6366F1", title: "Sube tus documentos", desc: "PDFs, manuales, políticas, procedimientos internos — cualquier documento que tu empresa ya tiene. Sin formatos especiales ni configuración." },
    { n: "02", icon: SparklesIcon, color: "#818CF8", title: "La IA genera el contenido", desc: "Ankard analiza el documento y genera automáticamente flashcards para repasar y quizzes de evaluación. Sin trabajo manual de ningún tipo." },
    { n: "03", icon: UserGroupIcon, color: "#C084FC", title: "Tu equipo aprende y es evaluado", desc: "Asigna los programas a equipos o empleados. Mide el progreso y el cumplimiento en tiempo real con reportes completos." },
  ];
  return (
    <section id="how" style={{ background: "#020617", padding: "100px 0" }}>
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <p style={{ fontSize: 11, fontWeight: 700, color: "#6366F1", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Cómo funciona</p>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, color: "#F1F5F9", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            De documento a curso completo<br />
            <span style={{ color: "#818CF8" }}>en 3 pasos</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {steps.map(({ n, icon: Icon, color, title, desc }) => (
            <div key={n} style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "28px 24px", position: "relative", transition: "border-color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${color}40`)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}>
              <p style={{ fontSize: 11, fontWeight: 800, color, letterSpacing: "0.05em", marginBottom: 16 }}>{n}</p>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: `${color}18`, border: `1px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", marginBottom: 10 }}>{title}</h3>
              <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

function Features() {
  const features = [
    { icon: BoltIcon, color: "#F59E0B", title: "Generación instantánea de quizzes", desc: "Sube un PDF y en minutos tienes un banco de preguntas categorizado por dificultad listo para evaluar a tu equipo." },
    { icon: BookOpenIcon, color: "#6366F1", title: "Flashcards automáticas", desc: "El sistema extrae conceptos clave y genera flashcards interactivos que facilitan la retención del conocimiento." },
    { icon: AcademicCapIcon, color: "#22C55E", title: "Learning Paths personalizados", desc: "Organiza el contenido en rutas de aprendizaje estructuradas y asígnalas a equipos o roles específicos." },
    { icon: ChartBarIcon, color: "#C084FC", title: "Trazabilidad de compliance", desc: "Sabe exactamente quién completó qué y cuándo. Reportes para auditorías y regulaciones internas." },
    { icon: UserGroupIcon, color: "#38BDF8", title: "Multi-equipo y multi-rol", desc: "Estructura tu empresa por business units. Cada grupo recibe el contenido relevante para su área." },
    { icon: LockClosedIcon, color: "#EF4444", title: "Datos 100% privados", desc: "Los documentos de tu empresa permanecen en tu silo. Nunca se comparten ni entrenan modelos de terceros." },
  ];
  return (
    <section id="features" style={{ background: "#0F172A", padding: "100px 0" }}>
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <p style={{ fontSize: 11, fontWeight: 700, color: "#6366F1", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Funcionalidades</p>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, color: "#F1F5F9", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            Todo lo que necesitas para capacitar<br />
            <span style={{ color: "#818CF8" }}>a tu equipo sin esfuerzo</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, color, title, desc }) => (
            <div key={title}
              style={{ background: "#162032", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 22, transition: "border-color 0.2s, transform 0.2s", cursor: "default" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${color}38`; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = ""; }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9", marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 12, color: "#64748B", lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Roles ────────────────────────────────────────────────────────────────────

function Roles() {
  const [active, setActive] = useState(0);
  const roles = [
    {
      tab: "HR Manager",
      icon: BuildingOffice2Icon,
      color: "#22C55E",
      headline: "Onboarding de empleados en días, no semanas",
      body: "Sube el manual de incorporación, las políticas y el código de conducta. Ankard genera el programa de onboarding completo. Nuevos empleados llegan preparados desde el primer día.",
      bullets: ["Programa de onboarding automatizado", "Seguimiento de quién lo completó", "Certificación digital de comprensión", "Reutilizable para cada nueva contratación"],
    },
    {
      tab: "L&D Lead",
      icon: AcademicCapIcon,
      color: "#6366F1",
      headline: "Crea cursos corporativos sin ser diseñador instruccional",
      body: "El equipo de Learning & Development puede convertir cualquier contenido técnico en material de aprendizaje estructurado sin conocimientos de diseño educativo ni herramientas costosas de autoría.",
      bullets: ["Sin curva de aprendizaje de herramientas", "Contenido actualizable en minutos", "Múltiples formatos: flashcards + quizzes", "Learning paths por rol y departamento"],
    },
    {
      tab: "CTO / IT",
      icon: ShieldCheckIcon,
      color: "#C084FC",
      headline: "Compliance técnico y seguridad sin fricción",
      body: "Convierte tus políticas de seguridad, procedimientos técnicos y guías de infraestructura en evaluaciones medibles. Demuestra que tu equipo conoce los protocolos.",
      bullets: ["Documentación técnica → quizzes automatizados", "Control de acceso por equipo y rol", "Datos en tu infraestructura, no en la nube compartida", "Auditoría completa de completaciones"],
    },
  ];
  const r = roles[active];

  return (
    <section id="roles" style={{ background: "#020617", padding: "100px 0" }}>
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-14">
          <p style={{ fontSize: 11, fontWeight: 700, color: "#6366F1", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Casos de uso</p>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, color: "#F1F5F9", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            Diseñado para quienes toman<br /><span style={{ color: "#818CF8" }}>decisiones de capacitación</span>
          </h2>
        </div>

        <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
          {roles.map(({ tab }, i) => (
            <button key={tab} onClick={() => setActive(i)}
              style={{ fontSize: 13, fontWeight: 700, padding: "8px 20px", borderRadius: 999, cursor: "pointer", transition: "all 0.2s", background: active === i ? "linear-gradient(135deg, #6366F1, #818CF8)" : "rgba(255,255,255,0.04)", border: active === i ? "none" : "1px solid rgba(255,255,255,0.08)", color: active === i ? "#fff" : "#94A3B8" }}>
              {tab}
            </button>
          ))}
        </div>

        <div style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "40px 36px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}
          className="flex-col md:grid">
          <div>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: `${r.color}18`, border: `1px solid ${r.color}28`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
              <r.icon className="h-6 w-6" style={{ color: r.color }} />
            </div>
            <h3 style={{ fontSize: "clamp(17px, 2.5vw, 24px)", fontWeight: 800, color: "#F1F5F9", lineHeight: 1.2, marginBottom: 12 }}>{r.headline}</h3>
            <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.75 }}>{r.body}</p>
          </div>
          <div className="flex flex-col justify-center gap-4">
            {r.bullets.map((b) => (
              <div key={b} className="flex items-start gap-3">
                <CheckCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: r.color }} />
                <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.5 }}>{b}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Security ─────────────────────────────────────────────────────────────────

function Security() {
  const items = [
    { icon: LockClosedIcon, title: "Datos aislados por empresa", desc: "Cada empresa tiene su propio silo. Ningún dato se comparte entre clientes." },
    { icon: ShieldCheckIcon, title: "Trazabilidad de compliance", desc: "Log completo de quién completó qué y cuándo. Listo para auditorías regulatorias." },
    { icon: CheckBadgeIcon, title: "Certificaciones digitales", desc: "Genera evidencia verificable de que tus empleados completaron la capacitación." },
    { icon: ClockIcon, title: "Historial de intentos", desc: "Cada sesión de estudio queda registrada. Visibilidad total del progreso individual." },
  ];
  return (
    <section id="security" style={{ background: "#0F172A", padding: "100px 0" }}>
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#6366F1", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Seguridad y Compliance</p>
            <h2 style={{ fontSize: "clamp(22px, 3.5vw, 36px)", fontWeight: 800, color: "#F1F5F9", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 16 }}>
              Diseñado para industrias reguladas
            </h2>
            <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.8, marginBottom: 28 }}>
              Finanzas, salud, industria, retail — en cualquier sector donde el cumplimiento es obligatorio, Ankard te da la trazabilidad que necesitas para demostrar que tu equipo está capacitado.
            </p>
            <button
              style={{ fontSize: 14, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg, #6366F1, #818CF8)", border: "none", borderRadius: 10, padding: "12px 24px", cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>
              Hablar con ventas <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ background: "#162032", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 18 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <Icon className="h-4 w-4" style={{ color: "#818CF8" }} />
                </div>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: "#F1F5F9", marginBottom: 6 }}>{title}</h4>
                <p style={{ fontSize: 11, color: "#64748B", lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────────

function CTASection({ onDemoOpen }) {
  const navigate = useNavigate();
  return (
    <section style={{ background: "#020617", padding: "100px 0" }}>
      <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
        <div style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.11), rgba(192,132,252,0.07))", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 24, padding: "60px 36px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 300, background: "radial-gradient(ellipse, rgba(99,102,241,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />
          <RocketLaunchIcon className="h-11 w-11 mx-auto mb-6" style={{ color: "#818CF8" }} />
          <h2 style={{ fontSize: "clamp(22px, 4vw, 40px)", fontWeight: 900, color: "#F1F5F9", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 14 }}>
            Empieza hoy — tu primer documento<br />
            <span style={{ color: "#818CF8" }}>convertido en curso en minutos</span>
          </h2>
          <p style={{ fontSize: 15, color: "#64748B", lineHeight: 1.7, maxWidth: 480, margin: "0 auto 32px" }}>
            Sin tarjeta de crédito. Sin instalación. Sin semanas de configuración. Solo sube tu primer documento y ve la magia.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={onDemoOpen}
              style={{ fontSize: 15, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg, #6366F1, #818CF8)", border: "none", borderRadius: 12, padding: "14px 30px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 0 40px rgba(99,102,241,0.38)", transition: "opacity 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
              Solicitar demo gratuita <ArrowRightIcon className="h-4 w-4" />
            </button>
            <button onClick={() => navigate("/auth/sign-in")}
              style={{ fontSize: 14, fontWeight: 600, color: "#94A3B8", background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "13px 22px", cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#F1F5F9"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.24)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#94A3B8"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
              Ya tengo cuenta
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ background: "#0F172A", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "48px 0 32px" }}>
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg, #6366F1, #818CF8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BoltIcon className="h-4 w-4 text-white" />
              </div>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#F1F5F9" }}>Ankard Enterprise</span>
            </div>
            <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.7, maxWidth: 240 }}>
              Capacitación corporativa automatizada con IA. Convierte documentos internos en programas de aprendizaje en minutos.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {[
              { title: "Producto", links: ["Características", "Cómo funciona", "Seguridad", "Precios"] },
              { title: "Empresa", links: ["Sobre nosotros", "Blog", "Casos de éxito", "Contacto"] },
              { title: "Legal", links: ["Términos de uso", "Privacidad", "Cookies"] },
            ].map(({ title, links }) => (
              <div key={title}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>{title}</p>
                {links.map((l) => (
                  <p key={l} style={{ fontSize: 12, color: "#64748B", marginBottom: 8, cursor: "pointer", transition: "color 0.15s" }}
                    onMouseEnter={(e) => (e.target.style.color = "#94A3B8")}
                    onMouseLeave={(e) => (e.target.style.color = "#64748B")}>
                    {l}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 22, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
          <p style={{ fontSize: 11, color: "#334155" }}>© 2026 Ankard Enterprise. Todos los derechos reservados.</p>
          <p style={{ fontSize: 10, color: "#1E293B" }}>Capacitación corporativa · LMS con IA · Compliance training · Onboarding digital · Flashcards automáticas</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function LandingPage() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div style={{ background: "#020617", minHeight: "100vh" }}>
      {demoOpen && <DemoModal onClose={() => setDemoOpen(false)} />}
      <Navbar onDemoOpen={() => setDemoOpen(true)} />
      <Hero onDemoOpen={() => setDemoOpen(true)} />
      <Stats />
      <HowItWorks />
      <Features />
      <Roles />
      <Security />
      <CTASection onDemoOpen={() => setDemoOpen(true)} />
      <Footer />
    </div>
  );
}

export default LandingPage;

import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/language-context";
import { EnvelopeIcon, CheckCircleIcon, XCircleIcon, BoltIcon } from "@heroicons/react/24/outline";
import authService from "@/services/authService";
import { APP_NAME } from "@/config/app";

function Spin() {
  return (
    <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(99,102,241,0.2)", borderTopColor: "#6366F1" }}
      className="animate-spin mx-auto" />
  );
}

export function EmailVerification() {
  const { language } = useLanguage();
  const location = useLocation();
  const [status, setStatus] = useState("info"); // 'info' | 'verifying' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    if (token) { handleVerify(token); }
  }, [location]);

  const handleVerify = async (token) => {
    setStatus("verifying");
    try {
      await authService.verifyEmail(token);
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err?.error || err?.detail || (language === "es" ? "El enlace es inválido o ha expirado." : "Link is invalid or has expired."));
    }
  };

  const content = {
    verifying: {
      icon: <Spin />,
      title: language === "es" ? "Verificando tu cuenta..." : "Verifying your account...",
      body: language === "es" ? "Por favor espera un momento." : "Please wait a moment.",
      accentColor: "#6366F1",
      accentBg: "rgba(99,102,241,0.1)",
      accentBorder: "rgba(99,102,241,0.25)",
    },
    success: {
      icon: <CheckCircleIcon className="h-12 w-12 mx-auto" style={{ color: "#22C55E" }} />,
      title: language === "es" ? "¡Cuenta verificada!" : "Account verified!",
      body: language === "es"
        ? "Tu correo ha sido verificado con éxito. Ya puedes acceder a todas las funciones."
        : "Your email has been successfully verified. You can now access all features.",
      accentColor: "#22C55E",
      accentBg: "rgba(34,197,94,0.08)",
      accentBorder: "rgba(34,197,94,0.22)",
      cta: { label: language === "es" ? "Ir a Iniciar Sesión" : "Go to Sign In", to: "/auth/sign-in" },
    },
    error: {
      icon: <XCircleIcon className="h-12 w-12 mx-auto" style={{ color: "#EF4444" }} />,
      title: language === "es" ? "Error de verificación" : "Verification error",
      body: errorMsg,
      accentColor: "#EF4444",
      accentBg: "rgba(239,68,68,0.08)",
      accentBorder: "rgba(239,68,68,0.22)",
      cta: { label: language === "es" ? "Volver al inicio" : "Back to login", to: "/auth/sign-in" },
    },
    info: {
      icon: <EnvelopeIcon className="h-12 w-12 mx-auto" style={{ color: "#818CF8" }} />,
      title: language === "es" ? "Verifica tu correo" : "Verify your email",
      body: language === "es"
        ? "Hemos enviado un enlace de confirmación a tu correo electrónico. Revisa tu bandeja de entrada y spam."
        : "We sent a confirmation link to your email address. Check your inbox and spam folder.",
      accentColor: "#6366F1",
      accentBg: "rgba(99,102,241,0.08)",
      accentBorder: "rgba(99,102,241,0.22)",
      cta: { label: language === "es" ? "Volver a Iniciar Sesión" : "Back to Sign In", to: "/auth/sign-in" },
    },
  };

  const c = content[status];

  return (
    <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#020617", padding: "24px" }}>
      {/* Glow */}
      <div style={{ position: "fixed", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 400, background: "radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 65%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 420, position: "relative" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 32 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, #6366F1, #818CF8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BoltIcon className="h-4.5 w-4.5 text-white" style={{ width: 18, height: 18 }} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#F1F5F9" }}>Ankard</span>
        </div>

        {/* Card */}
        <div style={{ background: "#0F172A", border: `1px solid ${c.accentBorder}`, borderRadius: 20, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
          {/* Top accent strip */}
          <div style={{ height: 4, background: `linear-gradient(90deg, ${c.accentColor}, ${c.accentColor}80)` }} />

          {/* Icon area */}
          <div style={{ background: c.accentBg, padding: "32px 24px 24px", textAlign: "center" }}>
            {c.icon}
          </div>

          {/* Content */}
          <div style={{ padding: "28px 28px 32px", textAlign: "center" }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#F1F5F9", marginBottom: 10, letterSpacing: "-0.01em" }}>
              {c.title}
            </h2>
            <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.75, marginBottom: 28 }}>
              {c.body}
            </p>

            {c.cta && (
              <Link to={c.cta.to} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "13px", borderRadius: 11, background: "linear-gradient(135deg, #6366F1, #818CF8)", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 0 24px rgba(99,102,241,0.3)", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 0 36px rgba(99,102,241,0.5)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 0 24px rgba(99,102,241,0.3)"; }}>
                {c.cta.label}
              </Link>
            )}

            <p style={{ fontSize: 11, color: "#334155", marginTop: 20 }}>{APP_NAME}</p>
          </div>
        </div>

        {/* Back home */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <a href="/" style={{ fontSize: 12, color: "#475569", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#94A3B8")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {language === "es" ? "Volver al inicio" : "Back to home"}
          </a>
        </div>
      </div>
    </section>
  );
}

export default EmailVerification;

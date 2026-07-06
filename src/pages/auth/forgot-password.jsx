import { Link } from "react-router-dom";
import { useState } from "react";
import authService from "../../services/authService";
import { useLanguage } from "@/context/language-context";
import { BoltIcon, EnvelopeIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

const INPUT = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  padding: "13px 16px",
  fontSize: 14,
  color: "#F1F5F9",
  width: "100%",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
  boxSizing: "border-box",
};
const focusInput = (e) => { e.target.style.borderColor = "rgba(99,102,241,0.7)"; e.target.style.background = "rgba(99,102,241,0.06)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; };
const blurInput  = (e) => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.background = "rgba(255,255,255,0.05)"; e.target.style.boxShadow = "none"; };

function Spin() {
  return <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.25)", borderTopColor: "#fff", flexShrink: 0 }} className="animate-spin" />;
}

function Panel({ language }) {
  return (
    <div className="hidden lg:flex lg:flex-1 flex-col justify-center items-center p-12 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0B1120 0%, #0F172A 50%, #0B1120 100%)" }}>
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 500, height: 500, background: "radial-gradient(ellipse, rgba(99,102,241,0.16) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div className="relative z-10 max-w-sm w-full text-center">
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.28)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
          <EnvelopeIcon className="h-7 w-7" style={{ color: "#818CF8" }} />
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: "#F1F5F9", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 14 }}>
          {language === "es" ? "Recupera el acceso a tu conocimiento." : "Regain access to your knowledge."}
        </h2>
        <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.75, marginBottom: 36 }}>
          {language === "es"
            ? "No te preocupes, a todos nos pasa. Sigue los pasos y estarás de vuelta en un momento."
            : "Don't worry, it happens to everyone. Follow the steps and you'll be back in no time."}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
          {(language === "es"
            ? ["Ingresa tu correo electrónico registrado", "Revisa tu bandeja de entrada (y spam)", "Haz clic en el enlace y elige tu nueva contraseña"]
            : ["Enter your registered email address", "Check your inbox (and spam folder)", "Click the link and choose your new password"]
          ).map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg, #6366F1, #818CF8)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10, fontWeight: 800, color: "#fff" }}>{i + 1}</div>
              <p style={{ fontSize: 12, color: "#94A3B8" }}>{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ForgotPassword() {
  const { language } = useLanguage();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null); setSuccess(false); setLoading(true);
    try {
      const response = await authService.requestPasswordReset(email);
      console.log("Password reset response:", response);
      setSuccess(true);
    } catch (err) {
      console.error("Password reset error:", err);
      setError(err?.error || err?.detail || err?.message || (
        language === "es"
          ? "No se pudo enviar el correo. Por favor verifica que tu dirección de correo sea correcta."
          : "Failed to send email. Please verify that your email address is correct."
      ));
    } finally { setLoading(false); }
  };

  return (
    <section style={{ minHeight: "100vh", display: "flex", background: "#060D1A" }}>
      {/* ── Left: form panel ── */}
      <div style={{ width: "100%", maxWidth: 520, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 24px", background: "linear-gradient(180deg, #060D1A 0%, #080F1E 100%)", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(99,102,241,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />

        {/* Back */}
        <Link to="/auth/sign-in" style={{ position: "absolute", top: 28, left: 28, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#475569", textDecoration: "none", transition: "color 0.15s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#94A3B8")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {language === "es" ? "Volver al inicio de sesión" : "Back to Sign In"}
        </Link>

        {/* Card */}
        <div style={{ width: "100%", maxWidth: 400, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "36px 32px", boxShadow: "0 24px 60px rgba(0,0,0,0.4)", position: "relative" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, #6366F1, #818CF8)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(99,102,241,0.4)", flexShrink: 0 }}>
              <BoltIcon className="h-5 w-5 text-white" />
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.01em" }}>Ankard</span>
          </div>

          <h1 style={{ fontSize: 23, fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.025em", lineHeight: 1.2, marginBottom: 6 }}>
            {language === "es" ? "¿Olvidaste tu contraseña?" : "Forgot Password?"}
          </h1>
          <p style={{ fontSize: 13, color: "#64748B", marginBottom: 28, lineHeight: 1.6 }}>
            {language === "es"
              ? "Te enviaremos un correo con las instrucciones para restablecerla."
              : "We'll send you an email with instructions to reset it."}
          </p>

          {success ? (
            <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.22)", borderRadius: 14, padding: "28px 24px", textAlign: "center" }}>
              <CheckCircleIcon className="h-12 w-12 mx-auto mb-4" style={{ color: "#22C55E" }} />
              <p style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", marginBottom: 8 }}>
                {language === "es" ? "Correo enviado" : "Email sent"}
              </p>
              <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.65, marginBottom: 20 }}>
                {language === "es"
                  ? "¡Correo enviado con éxito! Revisa tu bandeja de entrada (y spam)."
                  : "Instructions sent! Please check your email inbox (and spam)."}
              </p>
              <Link to="/auth/sign-in" style={{ fontSize: 13, fontWeight: 700, color: "#818CF8", textDecoration: "none" }}>
                {language === "es" ? "Volver al inicio de sesión" : "Back to Sign In"}
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#CBD5E1", display: "block", marginBottom: 8 }}>
                  {language === "es" ? "Correo electrónico" : "Email Address"}
                </label>
                <input type="email" placeholder="email@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading || success} required
                  style={INPUT} onFocus={focusInput} onBlur={blurInput} />
              </div>

              {error && (
                <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "11px 14px" }}>
                  <p style={{ fontSize: 12, color: "#FCA5A5", textAlign: "center" }}>{error}</p>
                </div>
              )}

              <button type="button" onClick={handleSubmit} disabled={loading || success}
                style={{ position: "relative", width: "100%", padding: "14px", borderRadius: 12, border: "none", background: (loading || success) ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg, #6366F1 0%, #818CF8 100%)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: (loading || success) ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, overflow: "hidden", boxShadow: (loading || success) ? "none" : "0 4px 24px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.15)", transition: "all 0.2s" }}
                onMouseEnter={(e) => { if (!loading && !success) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(99,102,241,0.55), inset 0 1px 0 rgba(255,255,255,0.15)"; } }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = (!loading && !success) ? "0 4px 24px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.15)" : "none"; }}>
                <span style={{ position: "absolute", inset: 0, borderRadius: 12, background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 55%)", pointerEvents: "none" }} />
                <span style={{ position: "relative" }}>
                  {loading ? <Spin /> : language === "es" ? "Enviar instrucciones" : "Send Instructions"}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      <Panel language={language} />
    </section>
  );
}

export default ForgotPassword;

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { EyeIcon, EyeSlashIcon, BoltIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/context/language-context";
import { useGoogleLogin } from "@react-oauth/google";
import { APP_NAME } from "@/config/app";

// ─── Shared design tokens ─────────────────────────────────────────────────────

const INPUT = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  padding: "12px 16px",
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

function Field({ label, required, children }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#CBD5E1", letterSpacing: "0.01em", display: "block", marginBottom: 8 }}>
        {label}{required && <span style={{ color: "#818CF8", marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function Spin() {
  return <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.25)", borderTopColor: "#fff", flexShrink: 0 }} className="animate-spin" />;
}

// ─── Right decorative panel ───────────────────────────────────────────────────

function Panel({ language }) {
  const steps = language === "es"
    ? ["Sube tus documentos internos", "La IA genera quizzes y flashcards", "Tu equipo aprende y es evaluado"]
    : ["Upload your internal documents", "AI generates quizzes & flashcards", "Your team learns and is evaluated"];

  return (
    <div className="hidden lg:flex lg:flex-1 flex-col justify-center items-center p-12 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0B1120 0%, #0F172A 50%, #0B1120 100%)" }}>
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 500, height: 500, background: "radial-gradient(ellipse, rgba(99,102,241,0.16) 0%, transparent 65%)", pointerEvents: "none" }} />

      <div className="relative z-10 max-w-sm w-full text-center">
        <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg, #6366F1, #818CF8)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 0 40px rgba(99,102,241,0.4)" }}>
          <BoltIcon className="h-7 w-7 text-white" />
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 999, padding: "4px 14px", marginBottom: 22 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#818CF8", letterSpacing: "0.1em" }}>ANKARD ENTERPRISE</span>
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: "#F1F5F9", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 14 }}>
          {language === "es" ? "Capacitación corporativa con IA" : "Corporate training powered by AI"}
        </h2>
        <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.75, marginBottom: 32 }}>
          {language === "es"
            ? `${APP_NAME} convierte tus documentos internos en programas de aprendizaje estructurados y medibles.`
            : `${APP_NAME} turns your internal documents into structured, measurable learning programs.`}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg, #6366F1, #818CF8)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, fontWeight: 800, color: "#fff" }}>{i + 1}</div>
              <p style={{ fontSize: 13, color: "#94A3B8" }}>{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Sign Up ──────────────────────────────────────────────────────────────────

export function SignUp() {
  const { language } = useLanguage();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, socialLogin } = useAuth();

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true); setError(null);
      try {
        await socialLogin("google", tokenResponse.access_token);
        navigate("/dashboard/home", { replace: true });
      } catch (err) {
        console.error("Social register catch block error:", err);
        setError(err?.error || "Google login failed");
      } finally { setLoading(false); }
    },
    onError: (error) => {
      console.error("Google useGoogleLogin (Register) onError callback:", error);
      setError("Google Login Failed"); setLoading(false);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      const res = await register({ username, email, password, first_name: firstName, last_name: lastName });
      if (res && res.email_verification === "sent") { navigate("/auth/email-verification"); }
      else { navigate("/dashboard/home"); }
    } catch (err) {
      console.error("Register Error:", err);
      if (err.email) {
        const msg = Array.isArray(err.email) ? err.email[0] : err.email;
        if (msg.toLowerCase().includes("exists") || msg.toLowerCase().includes("already")) {
          setError({ type: "email_exists", message: msg });
        } else { setError(msg); }
      } else if (err.password) {
        setError({ type: "password_weak", message: Array.isArray(err.password) ? err.password : [err.password] });
      } else if (err.username) { setError(Array.isArray(err.username) ? err.username[0] : err.username);
      } else if (err.first_name) { setError(Array.isArray(err.first_name) ? err.first_name[0] : err.first_name);
      } else if (err.last_name) { setError(Array.isArray(err.last_name) ? err.last_name[0] : err.last_name);
      } else { setError(err?.error || err?.detail || JSON.stringify(err)); }
    } finally { setLoading(false); }
  };

  return (
    <section style={{ minHeight: "100vh", display: "flex", background: "#060D1A" }}>
      {/* ── Left: form panel ── */}
      <div style={{ width: "100%", maxWidth: 520, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 24px", background: "linear-gradient(180deg, #060D1A 0%, #080F1E 100%)", position: "relative", overflowY: "auto" }}>
        {/* Subtle grid texture */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(99,102,241,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />

        {/* Back link */}
        <a href="/" style={{ position: "absolute", top: 28, left: 28, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#475569", textDecoration: "none", transition: "color 0.15s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#94A3B8")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {language === "es" ? "Volver al inicio" : "Back to home"}
        </a>

        {/* Card */}
        <div style={{ width: "100%", maxWidth: 400, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "34px 30px", boxShadow: "0 24px 60px rgba(0,0,0,0.4)", position: "relative", marginTop: 20 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, #6366F1, #818CF8)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(99,102,241,0.4)", flexShrink: 0 }}>
              <BoltIcon className="h-5 w-5 text-white" />
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.01em" }}>Ankard</span>
          </div>

          {/* Heading */}
          <h1 style={{ fontSize: 23, fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.025em", lineHeight: 1.2, marginBottom: 5 }}>
            {language === "es" ? "Crea tu cuenta" : "Create your account"}
          </h1>
          <p style={{ fontSize: 13, color: "#64748B", marginBottom: 24, lineHeight: 1.5 }}>
            {language === "es" ? `Empieza tu viaje con ${APP_NAME} gratis` : `Start your journey with ${APP_NAME} for free`}
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            {/* First + Last name */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label={language === "es" ? "Nombre" : "First Name"} required>
                <input type="text" placeholder="Juan" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={loading} required
                  style={INPUT} onFocus={focusInput} onBlur={blurInput} />
              </Field>
              <Field label={language === "es" ? "Apellido" : "Last Name"}>
                <input type="text" placeholder="García" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={loading}
                  style={INPUT} onFocus={focusInput} onBlur={blurInput} />
              </Field>
            </div>

            <Field label={language === "es" ? "Nombre de usuario" : "Username"} required>
              <input type="text" placeholder="juangarcia" value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading} autoComplete="username" required
                style={INPUT} onFocus={focusInput} onBlur={blurInput} />
            </Field>

            <Field label={language === "es" ? "Correo electrónico" : "Email address"} required>
              <input type="email" placeholder="juan@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} autoComplete="email" required
                style={INPUT} onFocus={focusInput} onBlur={blurInput} />
            </Field>

            <Field label={language === "es" ? "Contraseña" : "Password"} required>
              <div style={{ position: "relative" }}>
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} autoComplete="new-password" required
                  style={{ ...INPUT, paddingRight: 48 }} onFocus={focusInput} onBlur={blurInput} />
                <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#475569", display: "flex", padding: 4, transition: "color 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#94A3B8")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}>
                  {showPassword ? <EyeSlashIcon style={{ width: 18, height: 18 }} /> : <EyeIcon style={{ width: 18, height: 18 }} />}
                </button>
              </div>
            </Field>

            {/* Error */}
            {error && (
              <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "11px 14px" }}>
                <p style={{ fontSize: 12, color: "#FCA5A5", textAlign: "center", lineHeight: 1.5 }}>
                  {error.type === "email_exists" ? (
                    <>
                      {language === "es" ? "Este correo ya está en uso. " : "This email is already in use. "}
                      <Link to="/auth/forgot-password" style={{ fontWeight: 700, color: "#818CF8", textDecoration: "underline" }}>
                        {language === "es" ? "Restablecer contraseña." : "Reset password."}
                      </Link>
                    </>
                  ) : error.type === "password_weak" ? (
                    language === "es"
                      ? "Contraseña muy débil. Debe tener al menos 8 caracteres, letras, números y un carácter especial."
                      : "Password too weak. Must have at least 8 characters, letters, numbers, and a special character."
                  ) : (
                    typeof error === "string" ? error : JSON.stringify(error)
                  )}
                </p>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{ position: "relative", width: "100%", padding: "14px", borderRadius: 12, border: "none", background: loading ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg, #6366F1 0%, #818CF8 100%)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, letterSpacing: "0.01em", overflow: "hidden", boxShadow: loading ? "none" : "0 4px 24px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.15)", transition: "all 0.2s", marginTop: 4 }}
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(99,102,241,0.55), inset 0 1px 0 rgba(255,255,255,0.15)"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = loading ? "none" : "0 4px 24px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.15)"; }}
              onMouseDown={(e) => { if (!loading) e.currentTarget.style.transform = "translateY(0) scale(0.985)"; }}
              onMouseUp={(e) => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}>
              <span style={{ position: "absolute", inset: 0, borderRadius: 12, background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 55%)", pointerEvents: "none" }} />
              {loading
                ? <><Spin />{language === "es" ? "Creando cuenta..." : "Registering..."}</>
                : <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
                    {language === "es" ? "Registrarme" : "Get Started"}
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
              }
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
              <span style={{ fontSize: 11, color: "#334155", fontWeight: 500 }}>{language === "es" ? "o" : "or"}</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
            </div>

            {/* Sign in link */}
            <p style={{ fontSize: 13, color: "#475569", textAlign: "center" }}>
              {language === "es" ? "¿Ya tienes cuenta?" : "Already have an account?"}{" "}
              <Link to="/auth/sign-in" style={{ fontWeight: 700, color: "#818CF8", textDecoration: "none" }}>
                {language === "es" ? "Inicia sesión" : "Sign in"}
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* ── Right panel ── */}
      <Panel language={language} />
    </section>
  );
}

export default SignUp;

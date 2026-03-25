import { Typography, Spinner } from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/context/language-context";
import { useGoogleLogin } from "@react-oauth/google";
import { APP_NAME } from "@/config/app";


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
      setLoading(true);
      setError(null);
      try {
        await socialLogin("google", tokenResponse.access_token);
        navigate("/dashboard/home", { replace: true });
      } catch (err) {
        console.error("Social register catch block error:", err);
        setError(err?.error || "Google login failed");
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google useGoogleLogin (Register) onError callback:", error);
      setError("Google Login Failed");
      setLoading(false);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await register({
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName
      });
      if (res && res.email_verification === "sent") {
        navigate("/auth/email-verification");
      } else {
        navigate("/dashboard/home");
      }
    } catch (err) {
      console.error("Register Error:", err);
      if (err.email) {
        const msg = Array.isArray(err.email) ? err.email[0] : err.email;
        if (msg.toLowerCase().includes("exists") || msg.toLowerCase().includes("already")) {
          setError({ type: 'email_exists', message: msg });
        } else {
          setError(msg);
        }
      } else if (err.password) {
        setError({
          type: 'password_weak',
          message: Array.isArray(err.password) ? err.password : [err.password]
        });
      } else if (err.username) {
        setError(Array.isArray(err.username) ? err.username[0] : err.username);
      } else if (err.first_name) {
        setError(Array.isArray(err.first_name) ? err.first_name[0] : err.first_name);
      } else if (err.last_name) {
        setError(Array.isArray(err.last_name) ? err.last_name[0] : err.last_name);
      } else {
        setError(err?.error || err?.detail || JSON.stringify(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: '#f5f5f8',
    border: '1.5px solid transparent',
    color: '#1a1a2e',
    fontFamily: 'inherit',
  };
  const inputFocus = (e) => { e.target.style.borderColor = '#3949AB'; e.target.style.background = '#E8EAF6'; };
  const inputBlur  = (e) => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#f5f5f8'; };

  return (
    <section className="min-h-screen flex flex-col lg:flex-row lg:items-stretch" style={{ background: '#1a1730' }}>

      {/* ── Mobile hero ── */}
      <div className="lg:hidden relative flex flex-col items-center px-7 pt-10 pb-14 flex-shrink-0 overflow-hidden" style={{ background: '#1a1730' }}>
        <div className="absolute top-5 right-7 w-14 h-14 rounded-full" style={{ background: 'rgba(57,73,171,0.18)' }} />
        <div className="absolute top-12 right-16 w-7 h-7 rounded-full" style={{ background: 'rgba(57,73,171,0.12)' }} />

        <div className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-5 shadow-lg"
          style={{ background: '#3949AB', boxShadow: '0 8px 24px rgba(57,73,171,0.45)' }}>
          <span className="text-white font-black text-3xl leading-none">A</span>
        </div>
        <h1 className="text-white font-extrabold text-2xl tracking-tight mb-1.5">
          {language === "es" ? "Crea tu cuenta" : "Create account"}
        </h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {language === "es" ? `Empieza con ${APP_NAME} gratis` : `Start with ${APP_NAME} for free`}
        </p>
      </div>

      {/* ── Form panel ── */}
      <div className="bg-white flex flex-col flex-1 rounded-t-[28px] -mt-6 lg:mt-0 lg:rounded-none lg:justify-center lg:px-8 lg:max-w-lg lg:w-full">
        <div className="lg:hidden w-10 h-1 rounded-full mx-auto mt-4 mb-5" style={{ background: 'rgba(0,0,0,0.10)' }} />

        {/* Desktop header */}
        <div className="hidden lg:flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg mb-5"
            style={{ background: '#3949AB', boxShadow: '0 8px 24px rgba(57,73,171,0.4)' }}>
            <span className="text-white font-black text-3xl leading-none">A</span>
          </div>
          <Typography variant="h3" className="font-bold tracking-tight text-zinc-900 leading-tight text-center">
            {language === "es" ? "Crea tu cuenta" : "Create your account"}
          </Typography>
          <Typography className="text-zinc-500 font-medium mt-2 text-center">
            {language === "es" ? `Empieza tu viaje con ${APP_NAME} gratis` : `Start your journey with ${APP_NAME} for free`}
          </Typography>
        </div>

        <form onSubmit={handleSubmit} className="px-6 lg:px-0 lg:mx-auto lg:w-full lg:max-w-sm space-y-3.5 pb-8">

          {/* First + Last name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#1a1a2e' }}>
                {language === "es" ? "Nombre" : "First Name"} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={loading}
                required
                className="w-full rounded-[14px] px-4 py-3 text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={inputFocus}
                onBlur={inputBlur}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#1a1a2e' }}>
                {language === "es" ? "Apellido" : "Last Name"}
              </label>
              <input
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={loading}
                className="w-full rounded-[14px] px-4 py-3 text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={inputFocus}
                onBlur={inputBlur}
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: '#1a1a2e' }}>
              {language === "es" ? "Nombre de usuario" : "Username"} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoComplete="username"
              required
              className="w-full rounded-[14px] px-4 py-3 text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={inputFocus}
              onBlur={inputBlur}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: '#1a1a2e' }}>
              {language === "es" ? "Correo electrónico" : "Email address"} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="name@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              required
              className="w-full rounded-[14px] px-4 py-3 text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={inputFocus}
              onBlur={inputBlur}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: '#1a1a2e' }}>
              {language === "es" ? "Contraseña" : "Password"} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                required
                className="w-full rounded-[14px] px-4 py-3 pr-12 text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={inputFocus}
                onBlur={inputBlur}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: '#bbb', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="relative w-full rounded-2xl py-4 text-white font-extrabold text-base mt-1 overflow-hidden"
            style={{
              background: loading
                ? 'linear-gradient(135deg, #7986CB, #5C6BC0)'
                : 'linear-gradient(135deg, #3949AB 0%, #3949AB 100%)',
              border: 'none',
              cursor: loading ? 'default' : 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '0.3px',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(57,73,171,0.45), 0 1px 4px rgba(57,73,171,0.3)',
              transition: 'box-shadow 0.2s, transform 0.15s',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.boxShadow = '0 6px 28px rgba(57,73,171,0.55), 0 2px 8px rgba(57,73,171,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(57,73,171,0.45), 0 1px 4px rgba(57,73,171,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            onMouseDown={e => { if (!loading) e.currentTarget.style.transform = 'translateY(0) scale(0.98)'; }}
            onMouseUp={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px) scale(1)'; }}
          >
            <span className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 60%)' }} />
            {loading ? (
              <span className="relative flex items-center justify-center gap-2">
                <Spinner className="h-4 w-4" />
                {language === "es" ? "Creando cuenta..." : "Registering..."}
              </span>
            ) : (
              <span className="relative flex items-center justify-center gap-2">
                {language === "es" ? "Registrarme" : "Get Started"}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.85 }}>
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
              <p className="text-center text-xs font-medium text-red-600">
                {error.type === 'email_exists' ? (
                  <>
                    {language === "es" ? "Este correo ya está en uso. " : "This email is already in use. "}
                    <Link to="/auth/forgot-password" className="font-bold hover:underline" style={{ color: '#3949AB' }}>
                      {language === "es" ? "Restablecer contraseña." : "Reset password."}
                    </Link>
                  </>
                ) : error.type === 'password_weak' ? (
                  <span>
                    {language === "es"
                      ? "Contraseña muy débil. Debe tener al menos 8 caracteres, letras, números y un carácter especial."
                      : "Password too weak. Must have at least 8 characters, letters, numbers, and a special character."}
                  </span>
                ) : (
                  typeof error === 'string' ? error : JSON.stringify(error)
                )}
              </p>
            </div>
          )}

          {/* Sign in link */}
          <p className="text-center text-sm mt-2" style={{ color: '#888' }}>
            {language === "es" ? "¿Ya tienes cuenta?" : "Already have an account?"}{" "}
            <Link to="/auth/sign-in" className="font-bold" style={{ color: '#3949AB' }}>
              {language === "es" ? "Inicia sesión" : "Sign in"}
            </Link>
          </p>

          {/* Back to home */}
          <a href="/" className="flex items-center justify-center gap-1.5 mt-1 text-xs transition-colors" style={{ color: '#bbb', textDecoration: 'none' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {language === "es" ? "Volver al inicio" : "Back to home"}
          </a>
        </form>
      </div>

      {/* ── Desktop right decorative panel ── */}
      <div className="hidden lg:block lg:flex-1 p-6">
        <div className="relative h-full w-full rounded-3xl overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-700 to-zinc-950"></div>
          <div className="absolute inset-0 bg-[url('/img/pattern.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
            <div className="max-w-md text-white">
              <Typography variant="h2" className="font-bold tracking-tight mb-6 text-white leading-tight">
                {language === "es"
                  ? "Impulsa tu capacidad de aprendizaje hoy mismo."
                  : "Boost your learning capacity today."}
              </Typography>
              <Typography className="text-white/70 text-lg font-medium">
                {language === "es"
                  ? `${APP_NAME} utiliza IA avanzada para ayudarte a dominar cualquier tema en tiempo récord.`
                  : `${APP_NAME} uses advanced AI to help you master any subject in record time.`}
              </Typography>
              <div className="mt-12 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-left">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-400/30 font-bold text-indigo-200">AI</div>
                  <Typography className="text-white font-bold text-sm">"Crea un mazo de flashcards sobre Microbiología"</Typography>
                </div>
                <div className="space-y-2 opacity-50">
                  <div className="h-2 w-3/4 bg-white/20 rounded-full"></div>
                  <div className="h-2 w-full bg-white/20 rounded-full"></div>
                  <div className="h-2 w-1/2 bg-white/20 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-10 left-10 p-4 flex items-center gap-4">
            <div className="flex -space-x-3">
              {[5, 6, 7, 8].map(i => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-indigo-600 bg-zinc-800 overflow-hidden shadow-xl">
                  <img src={`https://i.pravatar.cc/150?u=${i}`} alt="" />
                </div>
              ))}
            </div>
            <Typography className="text-white/60 text-[10px] font-bold">Joining thousands of early adopters</Typography>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SignUp;

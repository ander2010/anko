import {
  Typography,
  Spinner,
} from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import authService from "../../services/authService";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/context/language-context";
import { useGoogleLogin } from "@react-oauth/google";
import { useLocation } from "react-router-dom";
import { APP_NAME } from "@/config/app";


export function SignIn() {
  const { language } = useLanguage();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, socialLogin } = useAuth(); // hook

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {

      setLoading(true);
      setError(null);
      try {

        await socialLogin("google", tokenResponse.access_token);

        const from = location.state?.from?.pathname || "/dashboard/home";
        navigate(from, { replace: true });
      } catch (err) {
        console.error("Social login catch block error:", err);
        setError(err?.error || "Google login failed");
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google useGoogleLogin onError callback:", error);
      setError("Google Login Failed");
      setLoading(false);
    },
  });

  const handleSocialLogin = async (provider) => {
    if (provider === "google") {
      loginWithGoogle();
      return;
    }
    setError(null);
    setLoading(true);
    try {

      setError(`Please integrate the ${provider} SDK to get the access_token first.`);
    } catch (err) {
      console.error(err);
      setError(`Social login failed: ${err.error || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ username, password });
      const from = location.state?.from?.pathname || "/dashboard/home";
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setError(err?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex flex-col lg:flex-row lg:items-stretch" style={{ background: '#1a1730' }}>

      {/* ── Mobile hero ── */}
      <div className="lg:hidden relative flex flex-col items-center px-7 pt-12 pb-14 flex-shrink-0 overflow-hidden" style={{ background: '#1a1730' }}>
        {/* decorative circles */}
        <div className="absolute top-5 right-7 w-14 h-14 rounded-full" style={{ background: 'rgba(127,119,221,0.15)' }} />
        <div className="absolute top-12 right-16 w-7 h-7 rounded-full" style={{ background: 'rgba(127,119,221,0.10)' }} />

        <div className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-5 shadow-lg"
          style={{ background: 'var(--ank-purple, #7F77DD)', boxShadow: '0 8px 24px rgba(127,119,221,0.4)' }}>
          <span className="text-white font-black text-3xl leading-none">A</span>
        </div>
        <h1 className="text-white font-extrabold text-2xl tracking-tight mb-1.5">
          {language === "es" ? "Bienvenido de nuevo" : "Welcome back"}
        </h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {language === "es" ? "Ingresa para seguir aprendiendo" : "Sign in to continue learning"}
        </p>
      </div>

      {/* ── Form panel (mobile: overlapping card, desktop: left column) ── */}
      <div className="
        bg-white flex flex-col flex-1
        rounded-t-[28px] -mt-6
        lg:mt-0 lg:rounded-none lg:justify-center lg:px-8 lg:max-w-lg lg:w-full
      ">
        {/* drag handle — mobile only */}
        <div className="lg:hidden w-10 h-1 rounded-full mx-auto mt-4 mb-6" style={{ background: 'rgba(0,0,0,0.10)' }} />

        {/* Desktop header */}
        <div className="hidden lg:flex flex-col items-center mb-10">
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg mb-5"
            style={{ background: 'var(--ank-purple, #7F77DD)', boxShadow: '0 8px 24px rgba(127,119,221,0.35)' }}>
            <span className="text-white font-black text-3xl leading-none">A</span>
          </div>
          <Typography variant="h3" className="font-bold tracking-tight text-zinc-900 leading-tight text-center">
            {language === "es" ? "Bienvenido de nuevo" : "Welcome back"}
          </Typography>
          <Typography className="text-zinc-500 font-medium mt-2 text-center">
            {language === "es" ? `Ingresa a tu cuenta de ${APP_NAME}` : `Log in to your ${APP_NAME} account`}
          </Typography>
        </div>

        <form onSubmit={handleSubmit} className="px-6 lg:px-0 lg:mx-auto lg:w-full lg:max-w-sm space-y-4 pb-8">
          {/* Username */}
          <div>
            <label className="block text-xs font-bold mb-2" style={{ color: '#1a1a2e' }}>
              {language === "es" ? "Nombre de usuario" : "Username"}
            </label>
            <input
              type="text"
              placeholder={language === "es" ? "Tu usuario" : "Your username"}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoComplete="username"
              className="w-full rounded-[14px] px-4 py-3.5 text-sm outline-none transition-all"
              style={{
                background: '#f5f5f8',
                border: '1.5px solid transparent',
                color: '#1a1a2e',
                fontFamily: 'inherit',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--ank-purple, #7F77DD)'; e.target.style.background = '#EEEDFE'; }}
              onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#f5f5f8'; }}
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold" style={{ color: '#1a1a2e' }}>
                {language === "es" ? "Contraseña" : "Password"}
              </label>
              <Link to="/auth/forgot-password" className="text-xs font-semibold" style={{ color: 'var(--ank-purple, #7F77DD)' }}>
                {language === "es" ? "¿Olvidaste tu contraseña?" : "Forgot password?"}
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                className="w-full rounded-[14px] px-4 py-3.5 pr-12 text-sm outline-none transition-all"
                style={{
                  background: '#f5f5f8',
                  border: '1.5px solid transparent',
                  color: '#1a1a2e',
                  fontFamily: 'inherit',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--ank-purple, #7F77DD)'; e.target.style.background = '#EEEDFE'; }}
                onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#f5f5f8'; }}
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

          {/* Sign in button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl py-4 text-white font-extrabold text-base transition-all mt-2"
            style={{
              background: loading ? '#a9a4e0' : 'var(--ank-purple, #7F77DD)',
              border: 'none',
              cursor: loading ? 'default' : 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '0.1px',
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner className="h-4 w-4" />
                {language === "es" ? "Validando..." : "Signing in..."}
              </span>
            ) : (
              language === "es" ? "Entrar" : "Sign in"
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl mt-1" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
              <p className="text-center text-xs font-medium text-red-600">
                {typeof error === 'string' ? error : JSON.stringify(error)}
              </p>
              {typeof error === 'string' && error.toLowerCase().includes('not verified') && (
                <div className="mt-2 text-center">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await authService.resendVerification(username);
                        setError(language === 'es' ? 'Email de verificación re-enviado' : 'Verification email resent');
                      } catch (err) {
                        setError(err?.error || (language === 'es' ? 'Error al re-enviar email' : 'Error resending email'));
                      }
                    }}
                    className="text-xs font-bold hover:underline cursor-pointer"
                    style={{ color: 'var(--ank-purple, #7F77DD)', background: 'none', border: 'none' }}
                  >
                    {language === 'es' ? 'Re-enviar email de verificación' : 'Resend verification email'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Divider — comentado junto al botón de Google
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.08)' }} />
            <span className="text-xs font-medium" style={{ color: '#bbb' }}>
              {language === "es" ? "o continúa con" : "or continue with"}
            </span>
            <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.08)' }} />
          </div>

          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
            className="w-full rounded-[14px] py-3.5 flex items-center justify-center gap-2.5 text-sm font-semibold transition-all"
            style={{
              background: '#fff',
              border: '1.5px solid rgba(0,0,0,0.08)',
              color: '#1a1a2e',
              cursor: loading ? 'default' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {language === "es" ? "Continuar con Google" : "Continue with Google"}
          </button>
          */}

          {/* Register link */}
          <p className="text-center text-sm mt-2" style={{ color: '#888' }}>
            {language === "es" ? "¿No tienes cuenta?" : "Not registered?"}{" "}
            <Link to="/auth/sign-up" className="font-bold" style={{ color: 'var(--ank-purple, #7F77DD)' }}>
              {language === "es" ? "Crea una aquí" : "Create account"}
            </Link>
          </p>

          {/* Back to home */}
          <a href="/" className="flex items-center justify-center gap-1.5 mt-2 text-xs transition-colors" style={{ color: '#bbb', textDecoration: 'none' }}>
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
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-zinc-950"></div>
          <div className="absolute inset-0 bg-[url('/img/pattern.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
            <div className="max-w-md text-white">
              <Typography variant="h2" className="font-bold tracking-tight mb-6 text-white">
                {language === "es"
                  ? "Convierte tus documentos en conocimiento de forma inteligente."
                  : "Turn your documents into knowledge intelligently."}
              </Typography>
              <Typography className="text-white/70 text-lg font-medium">
                {language === "es"
                  ? `Únete a miles de estudiantes que ya están potenciando su aprendizaje con ${APP_NAME}.`
                  : `Join thousands of students who are already powering their learning with ${APP_NAME}.`}
              </Typography>
              <div className="mt-12 grid grid-cols-2 gap-6 w-full max-w-sm">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/10 text-left">
                  <Typography className="text-white font-bold text-2xl mb-1">20k+</Typography>
                  <Typography className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Proyectos</Typography>
                </div>
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/10 text-left">
                  <Typography className="text-white font-bold text-2xl mb-1">500k+</Typography>
                  <Typography className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Flashcards</Typography>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-10 left-10 p-4 flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-indigo-600 bg-zinc-800 overflow-hidden shadow-xl">
                  <img src={`https://i.pravatar.cc/150?u=${i}`} alt="" />
                </div>
              ))}
            </div>
            <Typography className="text-white/60 text-[10px] font-bold">Trusted by 5,000+ happy users</Typography>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SignIn;

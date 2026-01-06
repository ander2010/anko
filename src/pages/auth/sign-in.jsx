import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
  Spinner,
} from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import authService from "../../services/authService";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/context/language-context";
import { useGoogleLogin } from "@react-oauth/google";


export function SignIn() {
  const { language } = useLanguage();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, socialLogin } = useAuth(); // hook

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("Google Token Response Success:", tokenResponse);
      setLoading(true);
      setError(null);
      try {
        console.log("Attempting socialLogin in context with token...");
        await socialLogin("google", tokenResponse.access_token);
        console.log("Social login successful, navigating to dashboard.");
        navigate("/dashboard/home", { replace: true });
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
      console.log(`Initiating POST login for ${provider}`);
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
      navigate("/dashboard/home", { replace: true });
    } catch (err) {
      console.error(err);
      setError(err?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-stretch bg-white">
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 text-center">
            <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6 mx-auto">
              <span className="text-white font-bold text-2xl">A</span>
            </div>
            <Typography variant="h3" className="font-bold tracking-tight text-zinc-900 leading-tight">
              {language === "es" ? "Bienvenido de nuevo" : "Welcome back"}
            </Typography>
            <Typography className="text-zinc-500 font-medium mt-2">
              {language === "es" ? "Ingresa a tu cuenta de Anko Studio" : "Log in to your Anko Studio account"}
            </Typography>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <Button
              variant="outline"
              color="zinc"
              className="flex items-center gap-2 justify-center py-2.5 border-zinc-200 hover:bg-zinc-50 normal-case shadow-sm transition-all text-zinc-700"
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
            >
              <svg width="18" height="18" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.3442 8.18429C16.3442 7.64047 16.3001 7.09371 16.206 6.55872H8.66016V9.63937H12.9813C12.802 10.6329 12.2258 11.5119 11.3822 12.0704V14.0693H13.9602C15.4741 12.6759 16.3442 10.6182 16.3442 8.18429Z" fill="#4285F4" />
                <path d="M8.65974 16.0006C10.8174 16.0006 12.637 15.2922 13.9627 14.0693L11.3847 12.0704C10.6675 12.5584 9.7415 12.8347 8.66268 12.8347C6.5756 12.8347 4.80598 11.4266 4.17104 9.53357H1.51074V11.5942C2.86882 14.2956 5.63494 16.0006 8.65974 16.0006Z" fill="#34A853" />
                <path d="M4.16852 9.53356C3.83341 8.53999 3.83341 7.46411 4.16852 6.47054V4.40991H1.51116C0.376489 6.67043 0.376489 9.33367 1.51116 11.5942L4.16852 9.53356Z" fill="#FBBC04" />
                <path d="M8.65974 3.16644C9.80029 3.1488 10.9026 3.57798 11.7286 4.36578L14.0127 2.08174C12.5664 0.72367 10.6469 -0.0229773 8.65974 0.000539111C5.63494 0.000539111 2.86882 1.70548 1.51074 4.40987L4.1681 6.4705C4.8001 4.57449 6.57266 3.16644 8.65974 3.16644Z" fill="#EA4335" />
              </svg>
              <span className="font-semibold text-xs">Google</span>
            </Button>
            <Button
              variant="outline"
              color="zinc"
              className="flex items-center gap-1 justify-center py-2.5 border-zinc-200 hover:bg-zinc-50 normal-case shadow-sm transition-all text-zinc-700"
              onClick={() => handleSocialLogin('facebook')}
              disabled={loading}
            >
              <img src="/img/facebook-logo.svg" height={18} width={18} alt="" />
              <span className="font-semibold text-xs">Facebook</span>
            </Button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-200"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-zinc-400 font-bold tracking-widest">
                {language === "es" ? "O continúa con" : "Or continue with"}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Typography variant="small" className="font-bold text-zinc-700 ml-1">
                {language === "es" ? "Nombre de usuario" : "Username"}
              </Typography>
              <Input
                size="lg"
                placeholder="johndoe"
                className="!border-zinc-200 focus:!border-indigo-600 !bg-zinc-50/30 rounded-xl"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                labelProps={{ className: "hidden" }}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <Typography variant="small" className="font-bold text-zinc-700">
                  {language === "es" ? "Contraseña" : "Password"}
                </Typography>
                <Link to="/auth/forgot-password" size="sm" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
                  {language === "es" ? "¿Olvidaste tu contraseña?" : "Forgot password?"}
                </Link>
              </div>
              <Input
                type="password"
                size="lg"
                placeholder="••••••••"
                className="!border-zinc-200 focus:!border-indigo-600 !bg-zinc-50/30 rounded-xl"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                labelProps={{ className: "hidden" }}
              />
            </div>

            <Button
              className="mt-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-3 normal-case text-sm font-bold transition-all hover:-translate-y-0.5 text-white"
              fullWidth
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  {language === "es" ? "Validando..." : "Signing In..."}
                </>
              ) : (
                language === "es" ? "Entrar" : "Sign In"
              )}
            </Button>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 mt-4">
                <Typography variant="small" color="red" className="text-center font-medium text-xs">
                  {typeof error === 'string' ? error : JSON.stringify(error)}
                </Typography>
              </div>
            )}

            <Typography variant="paragraph" className="text-center text-zinc-500 font-medium text-sm mt-8">
              {language === "es" ? "¿No tienes una cuenta?" : "Not registered?"}
              <Link to="/auth/sign-up" className="text-indigo-600 font-bold ml-2 hover:underline">
                {language === "es" ? "Crea una aquí" : "Create account"}
              </Link>
            </Typography>

            <div className="pt-8">
              <a href="/" className="text-zinc-400 hover:text-zinc-600 transition-colors text-xs font-bold flex items-center justify-center gap-2 group">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                {language === "es" ? "VOLVER AL INICIO" : "BACK TO HOME"}
              </a>
            </div>
          </form>
        </div>
      </div>

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
                  ? "Únete a miles de estudiantes que ya están potenciando su aprendizaje con Anko Studio."
                  : "Join thousands of students who are already powering their learning with Anko Studio."}
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

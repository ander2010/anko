import {
    Card,
    Input,
    Button,
    Typography,
    Spinner,
} from "@material-tailwind/react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import authService from "../../services/authService";
import { useLanguage } from "@/context/language-context";

export function ResetPassword() {
    const { language } = useLanguage();
    const navigate = useNavigate();
    const { uid, token } = useParams();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (password !== confirmPassword) {
            setError(language === "es" ? "Las contraseñas no coinciden" : "Passwords do not match");
            return;
        }

        if (password.length < 8) {
            setError(language === "es" ? "La contraseña debe tener al menos 8 caracteres" : "Password must be at least 8 characters");
            return;
        }

        setLoading(true);
        try {
            await authService.confirmPasswordReset({
                uid,
                token,
                new_password1: password,
                new_password2: confirmPassword
            });
            setSuccess(true);
            setTimeout(() => {
                navigate("/auth/sign-in");
            }, 3000);
        } catch (err) {
            console.error(err);
            setError(err?.error || err?.detail || (language === "es" ? "Error al restablecer la contraseña" : "Failed to reset password"));
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
                            {language === "es" ? "Nueva contraseña" : "New Password"}
                        </Typography>
                        <Typography className="text-zinc-500 font-medium mt-2">
                            {language === "es"
                                ? "Elige una contraseña segura y fácil de recordar."
                                : "Choose a secure and easy-to-remember password."}
                        </Typography>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Typography variant="small" className="font-bold text-zinc-700 ml-1">
                                {language === "es" ? "Nueva contraseña" : "New Password"}
                            </Typography>
                            <Input
                                type="password"
                                size="lg"
                                placeholder="••••••••"
                                className="!border-zinc-200 focus:!border-indigo-600 !bg-zinc-50/30 rounded-xl"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading || success}
                                labelProps={{ className: "hidden" }}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Typography variant="small" className="font-bold text-zinc-700 ml-1">
                                {language === "es" ? "Confirmar contraseña" : "Confirm Password"}
                            </Typography>
                            <Input
                                type="password"
                                size="lg"
                                placeholder="••••••••"
                                className="!border-zinc-200 focus:!border-indigo-600 !bg-zinc-50/30 rounded-xl"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading || success}
                                labelProps={{ className: "hidden" }}
                                required
                            />
                        </div>

                        <Button
                            className="mt-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-3 normal-case text-sm font-bold transition-all hover:-translate-y-0.5 text-white"
                            fullWidth
                            type="submit"
                            disabled={loading || success}
                        >
                            {loading ? (
                                <>
                                    <Spinner className="h-4 w-4" />
                                    {language === "es" ? "Guardando..." : "Saving..."}
                                </>
                            ) : (
                                language === "es" ? "Cambiar contraseña" : "Reset Password"
                            )}
                        </Button>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-100 mt-4">
                                <Typography variant="small" color="red" className="text-center font-medium text-xs">
                                    {error}
                                </Typography>
                            </div>
                        )}

                        {success && (
                            <div className="p-3 rounded-lg bg-green-50 border border-green-100 mt-4">
                                <Typography variant="small" color="green" className="text-center font-bold text-xs">
                                    {language === "es"
                                        ? "¡Contraseña cambiada! Redirigiendo..."
                                        : "Password reset successfully! Redirecting..."}
                                </Typography>
                            </div>
                        )}
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
                                    ? "La seguridad es nuestra prioridad."
                                    : "Security is our priority."}
                            </Typography>
                            <Typography className="text-white/70 text-lg font-medium">
                                {language === "es"
                                    ? "Asegúrate de usar una contraseña única para proteger tus datos y proyectos."
                                    : "Make sure to use a unique password to protect your data and projects."}
                            </Typography>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ResetPassword;

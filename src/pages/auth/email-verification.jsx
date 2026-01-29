import {
    Typography,
    Button,
    Spinner,
} from "@material-tailwind/react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/language-context";
import { EnvelopeIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import authService from "@/services/authService";

export function EmailVerification() {
    const { language } = useLanguage();
    const location = useLocation();
    const [status, setStatus] = useState("info"); // 'info' (default msg), 'verifying', 'success', 'error'
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get("token");

        if (token) {
            handleVerify(token);
        }
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

    const renderContent = () => {
        if (status === "verifying") {
            return (
                <div className="flex flex-col items-center gap-4">
                    <Spinner className="h-12 w-12 text-indigo-500" />
                    <Typography className="text-zinc-600 font-bold">
                        {language === "es" ? "Verificando tu cuenta..." : "Verifying your account..."}
                    </Typography>
                </div>
            );
        }

        if (status === "success") {
            return (
                <>
                    <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center mb-6 mx-auto">
                        <CheckCircleIcon className="h-10 w-10 text-green-500" />
                    </div>
                    <Typography variant="h4" className="text-zinc-900 font-bold mb-2">
                        {language === "es" ? "¡Cuenta verificada!" : "Account verified!"}
                    </Typography>
                    <Typography className="text-zinc-600 mb-8">
                        {language === "es"
                            ? "Tu correo ha sido verificado con éxito. Ya puedes acceder a todas las funciones."
                            : "Your email has been successfully verified. You can now access all features."}
                    </Typography>
                    <Link to="/auth/sign-in" className="block">
                        <Button fullWidth variant="gradient" color="indigo" className="py-3 rounded-xl normal-case font-bold">
                            {language === "es" ? "Ir a Iniciar Sesión" : "Go to Sign In"}
                        </Button>
                    </Link>
                </>
            );
        }

        if (status === "error") {
            return (
                <>
                    <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mb-6 mx-auto">
                        <XCircleIcon className="h-10 w-10 text-red-500" />
                    </div>
                    <Typography variant="h4" className="text-zinc-900 font-bold mb-2">
                        {language === "es" ? "Error de verificación" : "Verification error"}
                    </Typography>
                    <Typography className="text-zinc-600 mb-8">
                        {errorMsg}
                    </Typography>
                    <Link to="/auth/sign-in" className="block">
                        <Button fullWidth variant="text" color="indigo" className="py-3 rounded-xl normal-case font-bold">
                            {language === "es" ? "Volver al inicio" : "Back to login"}
                        </Button>
                    </Link>
                </>
            );
        }

        // Default info (No token in URL)
        return (
            <>
                <Typography className="text-zinc-600 text-lg leading-relaxed font-medium">
                    {language === "es"
                        ? "Hemos enviado un enlace de confirmación a tu correo electrónico."
                        : "We sent a confirmation link to your email address."}
                </Typography>
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50">
                    <Typography variant="small" className="text-blue-800 font-medium">
                        {language === "es"
                            ? "Por favor, revisa tu bandeja de entrada (y spam) para activar tu cuenta."
                            : "Please check your inbox (and spam) to activate your account."}
                    </Typography>
                </div>
                <div className="pt-4">
                    <Link to="/auth/sign-in">
                        <Button fullWidth variant="gradient" color="indigo" className="py-3 rounded-xl normal-case text-base font-bold shadow-indigo-500/20">
                            {language === "es" ? "Volver a Iniciar Sesión" : "Back to Sign In"}
                        </Button>
                    </Link>
                </div>
            </>
        );
    };

    return (
        <section className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-zinc-100">
                    {status === "info" && (
                        <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('/img/pattern.png')] opacity-10 mix-blend-overlay"></div>
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="h-20 w-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 shadow-inner ring-1 ring-white/30">
                                    <EnvelopeIcon className="h-10 w-10 text-white" />
                                </div>
                                <Typography variant="h3" color="white" className="font-bold tracking-tight">
                                    {language === "es" ? "Verifica tu correo" : "Verify your email"}
                                </Typography>
                            </div>
                        </div>
                    )}

                    <div className="p-10 text-center space-y-6">
                        {renderContent()}
                        <Typography variant="small" className="text-zinc-400 font-medium pt-4">
                            Ankard
                        </Typography>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default EmailVerification;

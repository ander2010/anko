import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Typography,
    Button,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/language-context";
import { EnvelopeIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export function EmailVerification() {
    const { language } = useLanguage();

    return (
        <section className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-zinc-100">
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

                    <div className="p-8 text-center space-y-6">
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

                        <Typography variant="small" className="text-zinc-400 font-medium">
                            Ankard
                        </Typography>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default EmailVerification;

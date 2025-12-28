import React from "react";
import { Link } from "react-router-dom";
import {
    Navbar as MTNavbar,
    Typography,
    Button,
} from "@material-tailwind/react";
import { useLanguage } from "@/context/language-context";

export function LandingNavbar() {
    const { t, language, changeLanguage } = useLanguage();

    return (
        <MTNavbar className="mx-auto max-w-screen-2xl px-4 py-2 mt-4 lg:px-8 lg:py-4 bg-white/80 backdrop-blur-md border border-blue-gray-100 shadow-sm sticky top-4 z-50">
            <div className="container mx-auto flex items-center justify-between text-blue-gray-900">
                <Link to="/" className="flex items-center gap-2">
                    <img src="/img/logoanko.png" alt="Anko Logo" className="h-10 w-auto object-contain" />
                    <Typography
                        className="mr-4 ml-2 cursor-pointer py-1.5 font-bold text-xl tracking-tight"
                    >
                        ANKO Studio
                    </Typography>
                </Link>

                <div className="flex items-center gap-4">
                    <Button
                        variant="text"
                        size="sm"
                        color="blue-gray"
                        className="flex items-center gap-2"
                        onClick={() => changeLanguage(language === "en" ? "es" : "en")}
                    >
                        <img
                            src={language === "en" ? "https://flagcdn.com/w20/us.png" : "https://flagcdn.com/w20/es.png"}
                            alt={language}
                            className="h-3.5 w-5 rounded-sm"
                        />
                        <span className="hidden sm:inline-block uppercase font-bold text-xs">{language}</span>
                    </Button>

                    <Link to="/auth/sign-in">
                        <Button variant="text" size="sm" color="blue-gray">
                            {t("landing.auth.sign_in")}
                        </Button>
                    </Link>
                    <Link to="/auth/sign-up">
                        <Button variant="gradient" size="sm" color="blue">
                            {t("landing.auth.register")}
                        </Button>
                    </Link>
                </div>
            </div>
        </MTNavbar>
    );
}

export default LandingNavbar;

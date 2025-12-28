import React, { createContext, useContext, useState, useEffect } from "react";
import { dictionaryList } from "../locales";

export const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState("es");

    useEffect(() => {
        const savedLanguage = localStorage.getItem("language");
        if (savedLanguage && (savedLanguage === "es" || savedLanguage === "en")) {
            setLanguage(savedLanguage);
        }
    }, []);

    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem("language", lang);
    };

    const t = (key) => {
        if (!key || typeof key !== "string") return "";
        const keys = key.split(".");
        let value = dictionaryList[language];

        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) break;
        }

        return value || key;
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);

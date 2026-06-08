import React, { createContext, useContext, useState } from "react";
import { dictionaryList } from "../locales";

export const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        const saved = localStorage.getItem("language");
        if (saved === "es" || saved === "en") return saved;
        localStorage.setItem("language", "en");
        return "en";
    });

    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem("language", lang);
    };

    const t = (key, params) => {
        if (!key || typeof key !== "string") return "";
        const keys = key.split(".");
        let value = dictionaryList[language];

        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) break;
        }

        if (typeof value === "string" && params && typeof params === "object") {
            Object.keys(params).forEach(paramKey => {
                value = value.replace(new RegExp(`{${paramKey}}`, "g"), params[paramKey]);
            });
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

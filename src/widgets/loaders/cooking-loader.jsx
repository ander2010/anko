import React from "react";
import { Typography } from "@material-tailwind/react";
import { useLanguage } from "@/context/language-context";

export function CookingLoader() {
    const { language } = useLanguage();

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm transition-all duration-300">
            <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
                {/* CSS Cooking Pot Animation */}
                <div className="relative mb-8">
                    {/* Steam Bubble 1 */}
                    <div className="absolute -top-8 left-2 w-3 h-3 bg-zinc-400 rounded-full opacity-0 animate-steam-1"></div>
                    {/* Steam Bubble 2 */}
                    <div className="absolute -top-10 left-6 w-2 h-2 bg-zinc-400 rounded-full opacity-0 animate-steam-2"></div>
                    {/* Steam Bubble 3 */}
                    <div className="absolute -top-7 left-10 w-3 h-3 bg-zinc-400 rounded-full opacity-0 animate-steam-3"></div>

                    {/* Pot Lid */}
                    <div className="relative z-10 w-20 h-4 bg-zinc-800 rounded-t-full mb-[1px] animate-lid-bounce origin-bottom">
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-2 bg-zinc-900 rounded-sm"></div>
                    </div>

                    {/* Pot Body */}
                    <div className="w-20 h-16 bg-zinc-900 rounded-b-3xl relative">
                        {/* Reflection */}
                        <div className="absolute top-2 left-2 w-3 h-8 bg-zinc-800/30 rounded-full -rotate-12"></div>
                    </div>

                    {/* Handle */}
                    <div className="absolute top-2 -right-3 w-3 h-8 border-4 border-zinc-900 rounded-r-xl border-l-0"></div>
                    <div className="absolute top-2 -left-3 w-3 h-8 border-4 border-zinc-900 rounded-l-xl border-r-0"></div>
                </div>

                <Typography variant="h5" className="font-black text-zinc-900 tracking-tight">
                    {language === "es" ? "Cocinando tus datos..." : "Cooking your data..."}
                </Typography>
                <Typography className="text-zinc-500 font-medium text-sm mt-2 animate-pulse">
                    {language === "es" ? "Esto puede tomar unos momentos" : "This may take a few moments"}
                </Typography>

                <style jsx>{`
          @keyframes steam-1 {
            0% { transform: translateY(0) scale(1); opacity: 0; }
            50% { opacity: 0.6; }
            100% { transform: translateY(-20px) scale(1.5); opacity: 0; }
          }
          @keyframes steam-2 {
            0% { transform: translateY(0) scale(1); opacity: 0; }
            50% { opacity: 0.6; }
            100% { transform: translateY(-25px) scale(1.2); opacity: 0; }
          }
          @keyframes steam-3 {
            0% { transform: translateY(0) scale(1); opacity: 0; }
            50% { opacity: 0.6; }
            100% { transform: translateY(-22px) scale(1.4); opacity: 0; }
          }
          @keyframes lid-bounce {
            0%, 100% { transform: translateY(0) rotate(0); }
            25% { transform: translateY(-2px) rotate(-1deg); }
            50% { transform: translateY(-1px) rotate(1deg); }
            75% { transform: translateY(-2px) rotate(0); }
          }
          .animate-steam-1 { animation: steam-1 2s infinite ease-out; animation-delay: 0s; }
          .animate-steam-2 { animation: steam-2 2s infinite ease-out; animation-delay: 0.7s; }
          .animate-steam-3 { animation: steam-3 2s infinite ease-out; animation-delay: 1.4s; }
          .animate-lid-bounce { animation: lid-bounce 0.8s infinite ease-in-out; }
        `}</style>
            </div>
        </div>
    );
}

export default CookingLoader;

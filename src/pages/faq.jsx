import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/language-context";

const faqs = {
    es: [
        {
            q: "¿Qué tipos de archivos puedo subir a Ankard?",
            a: "Ankard admite PDFs, documentos de texto y apuntes. Puedes organizarlos en proyectos y temas para generar preguntas específicas por cada área de estudio.",
        },
        {
            q: "¿Cómo genera Ankard las preguntas con IA?",
            a: "Ankard analiza el contenido de tus documentos y genera automáticamente preguntas de opción múltiple, verdadero/falso y flashcards usando inteligencia artificial, adaptadas al tema y nivel de dificultad que configures.",
        },
        {
            q: "¿Es gratuito Ankard?",
            a: "Sí, Ankard tiene un plan gratuito que incluye proyectos básicos y preguntas de práctica diaria. Los planes Premium y Pro Team ofrecen proyectos ilimitados, práctica sin límite y funciones avanzadas.",
        },
        {
            q: "¿Puedo simular un examen real con Ankard?",
            a: "Sí. Ankard incluye un simulador de examen que replica las condiciones reales: tiempo limitado, puntuación y revisión detallada de resultados por tema.",
        },
        {
            q: "¿En qué idiomas está disponible Ankard?",
            a: "Ankard está disponible en español e inglés. Puedes cambiar el idioma desde tu perfil en cualquier momento.",
        },
        {
            q: "¿Mis documentos están seguros en Ankard?",
            a: "Sí. Tus documentos se almacenan de forma segura y solo tú tienes acceso a ellos, a menos que decidas compartirlos. Consulta nuestra política de privacidad para más detalles.",
        },
        {
            q: "¿Puedo usar Ankard desde el móvil?",
            a: "Sí, Ankard está diseñado para funcionar perfectamente tanto en móvil como en escritorio. Puedes estudiar desde cualquier dispositivo con conexión a internet.",
        },
        {
            q: "¿Qué ocurre si cancelo mi suscripción Premium?",
            a: "Si cancelas tu suscripción, pasarás al plan gratuito conservando tu historial y proyectos, aunque con las limitaciones del plan gratuito.",
        },
    ],
    en: [
        {
            q: "What file types can I upload to Ankard?",
            a: "Ankard supports PDFs, text documents, and notes. You can organize them into projects and topics to generate specific questions for each study area.",
        },
        {
            q: "How does Ankard generate questions using AI?",
            a: "Ankard analyzes the content of your documents and automatically generates multiple-choice, true/false questions, and flashcards using artificial intelligence, adapted to the topic and difficulty level you configure.",
        },
        {
            q: "Is Ankard free?",
            a: "Yes, Ankard has a free plan that includes basic projects and daily practice questions. Premium and Pro Team plans offer unlimited projects, unlimited practice, and advanced features.",
        },
        {
            q: "Can I simulate a real exam with Ankard?",
            a: "Yes. Ankard includes an exam simulator that replicates real conditions: time limits, scoring, and detailed results review by topic.",
        },
        {
            q: "What languages is Ankard available in?",
            a: "Ankard is available in Spanish and English. You can change the language from your profile at any time.",
        },
        {
            q: "Are my documents safe on Ankard?",
            a: "Yes. Your documents are stored securely and only you have access to them, unless you choose to share them. See our privacy policy for more details.",
        },
        {
            q: "Can I use Ankard on mobile?",
            a: "Yes, Ankard is designed to work seamlessly on both mobile and desktop. You can study from any device with an internet connection.",
        },
        {
            q: "What happens if I cancel my Premium subscription?",
            a: "If you cancel your subscription, you will move to the free plan, keeping your history and projects but subject to free plan limitations.",
        },
    ],
};

export function PublicFaq() {
    const { language } = useLanguage();
    const items = faqs[language] || faqs.es;
    const [open, setOpen] = useState(null);

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#f8fafc", color: "#0f172a" }}>
            {/* Nav */}
            <nav style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid #e2e8f0", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58, position: "sticky", top: 0, zIndex: 100 }}>
                <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: "#0f172a", textDecoration: "none" }}>
                    <div style={{ width: 30, height: 30, background: "#0f172a", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg viewBox="0 0 24 24" style={{ width: 15, height: 15, stroke: "#fff", strokeWidth: 2, fill: "none" }}>
                            <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
                        </svg>
                    </div>
                    Ankard
                </Link>
                <Link to="/auth/sign-up" style={{ padding: "8px 18px", borderRadius: 10, background: "#0f172a", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                    {language === "es" ? "Empezar gratis" : "Get started free"}
                </Link>
            </nav>

            {/* Content */}
            <main style={{ maxWidth: 760, margin: "0 auto", padding: "60px 24px 80px" }}>
                <div style={{ marginBottom: 48 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", background: "rgba(57,73,171,.10)", border: "1px solid rgba(57,73,171,.22)", color: "rgb(57,73,171)", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "3px 12px", borderRadius: 20, marginBottom: 16 }}>
                        {language === "es" ? "Ayuda" : "Help"}
                    </div>
                    <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800, color: "#0f172a", letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 12 }}>
                        {language === "es" ? "Preguntas Frecuentes" : "Frequently Asked Questions"}
                    </h1>
                    <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.7 }}>
                        {language === "es"
                            ? "Todo lo que necesitas saber sobre Ankard y cómo funciona."
                            : "Everything you need to know about Ankard and how it works."}
                    </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {items.map((item, i) => (
                        <div
                            key={i}
                            style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #e2e8f0", overflow: "hidden", cursor: "pointer" }}
                            onClick={() => setOpen(open === i ? null : i)}
                        >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", gap: 12 }}>
                                <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", margin: 0, lineHeight: 1.4 }}>{item.q}</h2>
                                <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, stroke: "#94a3b8", strokeWidth: 2, fill: "none", flexShrink: 0, transform: open === i ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>
                            {open === i && (
                                <div style={{ padding: "0 20px 18px", fontSize: 14, color: "#475569", lineHeight: 1.7, borderTop: "1px solid #f1f5f9" }}>
                                    <div style={{ paddingTop: 14 }}>{item.a}</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 48, padding: 28, background: "#0f172a", borderRadius: 20, textAlign: "center" }}>
                    <p style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 8 }}>
                        {language === "es" ? "¿Tienes más preguntas?" : "Still have questions?"}
                    </p>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,.5)", marginBottom: 20 }}>
                        {language === "es" ? "Nuestro equipo está aquí para ayudarte." : "Our team is here to help you."}
                    </p>
                    <Link to="/auth/sign-up" style={{ display: "inline-block", padding: "11px 24px", borderRadius: 12, background: "rgb(57,73,171)", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                        {language === "es" ? "Empezar gratis" : "Get started free"}
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer style={{ background: "#070e1a", padding: "32px 24px", borderTop: "1px solid rgba(255,255,255,.05)", textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,.3)", marginBottom: 10 }}>© 2026 Ankard. {language === "es" ? "Todos los derechos reservados." : "All rights reserved."}</p>
                <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
                    <Link to="/" style={{ fontSize: 12, color: "rgba(255,255,255,.4)", textDecoration: "none" }}>{language === "es" ? "Inicio" : "Home"}</Link>
                    <Link to="/privacidad" style={{ fontSize: 12, color: "rgba(255,255,255,.4)", textDecoration: "none" }}>{language === "es" ? "Privacidad" : "Privacy"}</Link>
                    <Link to="/terminos" style={{ fontSize: 12, color: "rgba(255,255,255,.4)", textDecoration: "none" }}>{language === "es" ? "Términos" : "Terms"}</Link>
                </div>
            </footer>
        </div>
    );
}

export default PublicFaq;

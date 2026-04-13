import React from "react";
import {
    Typography,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Button,
    Chip,
} from "@material-tailwind/react";

import { useNavigate, Link } from "react-router-dom";
import {
    TagIcon,
    ClipboardDocumentCheckIcon,
    BoltIcon,
    CheckCircleIcon,
    RocketLaunchIcon,
    AcademicCapIcon,
    QuestionMarkCircleIcon,
    DocumentArrowUpIcon,
    SparklesIcon,
} from "@heroicons/react/24/solid";

import { useLanguage } from "@/context/language-context";
import { APP_NAME } from "@/config/app";
import { LandingNavbar, Footer } from "@/widgets/layout";

export function LandingPage() {
    const { t, language } = useLanguage();
    const navigate = useNavigate();

    const howItWorks = [
        {
            title: t("home.how_it_works.step1.title"),
            desc: t("home.how_it_works.step1.desc"),
            img: "https://cdn.pixabay.com/photo/2015/01/09/11/11/office-594132_1280.jpg",
            icon: DocumentArrowUpIcon,
        },
        {
            title: t("home.how_it_works.step2.title"),
            desc: t("home.how_it_works.step2.desc"),
            img: "https://cdn.pixabay.com/photo/2017/07/20/03/53/homework-2521144_1280.jpg",
            icon: ClipboardDocumentCheckIcon,
        },
        {
            title: t("home.how_it_works.step3.title"),
            desc: t("home.how_it_works.step3.desc"),
            img: "https://cdn.pixabay.com/photo/2015/07/17/22/43/student-849825_1280.jpg",
            icon: SparklesIcon,
        },
    ];

    const benefits = [
        {
            title: t("home.benefits.b1.title"),
            desc: t("home.benefits.b1.desc"),
            icon: QuestionMarkCircleIcon,
        },
        {
            title: t("home.benefits.b2.title"),
            desc: t("home.benefits.b2.desc"),
            icon: AcademicCapIcon,
        },
        {
            title: t("home.benefits.b3.title"),
            desc: t("home.benefits.b3.desc"),
            icon: TagIcon,
        },
        {
            title: t("home.benefits.b4.title"),
            desc: t("home.benefits.b4.desc"),
            icon: BoltIcon,
        },
    ];

    const plans = [
        {
            name: t("home.pricing.plans.free.name"),
            price: t("home.pricing.plans.free.price"),
            color: "blue-gray",
            features: t("home.pricing.plans.free.features"),
            button: t("landing.pricing.cta_free"),
            onClick: () => navigate("/auth/sign-up"),
        },
        {
            name: t("home.pricing.plans.premium.name"),
            price: t("home.pricing.plans.premium.price"),
            color: "amber",
            recommended: true,
            features: t("home.pricing.plans.premium.features"),
            button: t("landing.pricing.cta_pro"),
            onClick: () => navigate("/auth/sign-up"),
        },
        {
            name: t("home.pricing.plans.team.name"),
            price: t("home.pricing.plans.team.price"),
            color: "blue-gray",
            features: t("home.pricing.plans.team.features"),
            button: t("landing.pricing.cta_team"),
            onClick: () => navigate("/dashboard/contact-us"),
        },
    ];

    const faqs = [
        { q: t("home.faq.q1.q"), a: t("home.faq.q1.a") },
        { q: t("home.faq.q2.q"), a: t("home.faq.q2.a") },
        { q: t("home.faq.q3.q"), a: t("home.faq.q3.a") },
        { q: t("home.faq.q4.q"), a: t("home.faq.q4.a") },
        { q: t("home.faq.q5.q"), a: t("home.faq.q5.a") },
    ];

    return (
        <>

        {/* ══════════════════════════════════════════════
            MOBILE LANDING
        ══════════════════════════════════════════════ */}
        <div className="md:hidden" style={{ fontFamily: "'DM Sans', sans-serif", background: "#fff", color: "#0f172a", overflowX: "hidden" }}>

            {/* NAV */}
            <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.90)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid #e2e8f0", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58 }}>
                <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: "#0f172a", textDecoration: "none" }}>
                    <div style={{ width: 30, height: 30, background: "#0f172a", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg viewBox="0 0 24 24" style={{ width: 15, height: 15, stroke: "#fff", strokeWidth: 2, fill: "none" }}>
                            <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
                        </svg>
                    </div>
                    Ankard
                </Link>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Link to="/auth/sign-in" style={{ fontSize: 13, fontWeight: 600, color: "#475569", textDecoration: "none", padding: "6px 10px" }}>Sign in</Link>
                    <Link to="/auth/sign-up" style={{ padding: "8px 16px", borderRadius: 10, background: "#0f172a", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Register</Link>
                </div>
            </nav>

            {/* HERO */}
            <section style={{ background: "#0f172a", padding: "44px 22px 40px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", borderRadius: "50%", pointerEvents: "none", width: 420, height: 420, background: "radial-gradient(circle, rgba(57,73,171,.6) 0%, transparent 60%)", top: -160, right: -140 }} />
                <div style={{ position: "absolute", borderRadius: "50%", pointerEvents: "none", width: 250, height: 250, background: "radial-gradient(circle, rgba(139,92,246,.25) 0%, transparent 65%)", bottom: -80, left: -60 }} />
                <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)", backgroundSize: "36px 36px", pointerEvents: "none" }} />
                <div style={{ position: "relative", zIndex: 2 }}>
                    {/* pills */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 22 }}>
                        {[{ label: "Flashcards", hi: true }, { label: "Questions", hi: false }, { label: "Real progress", hi: false }].map((p, i) => (
                            <span key={i} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 10, fontWeight: 600, letterSpacing: ".8px", textTransform: "uppercase", background: p.hi ? "rgba(57,73,171,.3)" : "rgba(255,255,255,.08)", border: `1px solid ${p.hi ? "rgba(99,102,241,.4)" : "rgba(255,255,255,.13)"}`, color: p.hi ? "#a5b4fc" : "rgba(255,255,255,.6)" }}>{p.label}</span>
                        ))}
                    </div>
                    <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: "-1.2px", lineHeight: 1.05, marginBottom: 16 }}>
                        {language === "es" ? <>Aprende con <em style={{ fontStyle: "normal", color: "#818cf8" }}>IA.</em><br />Domina con práctica.</> : <>Learn with <em style={{ fontStyle: "normal", color: "#818cf8" }}>AI.</em><br />Master with practice.</>}
                    </h2>
                    <p style={{ fontSize: 15, color: "rgba(255,255,255,.52)", lineHeight: 1.7, marginBottom: 28 }}>
                        <strong style={{ color: "rgba(255,255,255,.82)", fontWeight: 600 }}>Ankard</strong> {language === "es" ? "usa inteligencia artificial para convertir tus documentos en flashcards y cuestionarios — practica de verdad, mide tu progreso y mejora cada día." : "uses AI to turn your documents into flashcards and quizzes — practice for real, measure progress, improve every day."}
                    </p>
                    {/* CTAs */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                        <Link to="/auth/sign-up" style={{ padding: "15px 24px", borderRadius: 14, background: "rgb(57,73,171)", color: "#fff", fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 8px 24px rgba(57,73,171,.45)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none" }}>
                            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: "#fff", strokeWidth: 2.5, fill: "none" }}><polygon points="5 3 19 12 5 21 5 3"/></svg>
                            {language === "es" ? "Empezar gratis" : "Get started — it's free"}
                        </Link>
                        <a href="#how-mobile" style={{ padding: "14px 24px", borderRadius: 14, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.14)", color: "rgba(255,255,255,.75)", fontSize: 15, fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: "currentColor", strokeWidth: 2, fill: "none" }}><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/></svg>
                            {language === "es" ? "Ver cómo funciona" : "See how it works"}
                        </a>
                    </div>
                    {/* flow pill */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 12, padding: "10px 14px", marginBottom: 24 }}>
                        {["Project","Rules","Questions","Progress"].map((step, i, arr) => (
                            <React.Fragment key={step}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: i < 3 ? "#a5b4fc" : "rgba(255,255,255,.4)" }}>{step}</span>
                                {i < arr.length - 1 && <span style={{ color: "rgba(57,73,171,.7)", fontWeight: 700, fontSize: 13 }}>→</span>}
                            </React.Fragment>
                        ))}
                    </div>
                    {/* social proof */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                        <div style={{ display: "flex" }}>
                            {[["#3949ab","A"],["#0891b2","M"],["#7c3aed","R"],["#059669","K"]].map(([bg, letter], i) => (
                                <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid #0f172a", marginLeft: i === 0 ? 0 : -7, background: bg, fontSize: 11, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>{letter}</div>
                            ))}
                        </div>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,.42)" }}><strong style={{ color: "rgba(255,255,255,.72)", fontWeight: 600 }}>+1,000 students</strong> {language === "es" ? "nos confían" : "trust us"}</span>
                    </div>
                    {/* mini app preview */}
                    <div style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 20, padding: 14, backdropFilter: "blur(12px)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 12 }}>
                            {[["#f87171"],["#fbbf24"],["#34d399"]].map(([bg], i) => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: bg }} />)}
                            <div style={{ flex: 1, background: "rgba(255,255,255,.07)", borderRadius: 6, padding: "4px 10px", fontSize: 10, color: "rgba(255,255,255,.3)", marginLeft: 6 }}>ankard.app/dashboard</div>
                        </div>
                        <div style={{ background: "#1e293b", borderRadius: 12, overflow: "hidden" }}>
                            <div style={{ background: "#0f172a", padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700, color: "#fff" }}>Harry Potter — English</span>
                                <span style={{ background: "rgba(52,211,153,.15)", border: "1px solid rgba(52,211,153,.3)", color: "#34d399", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>Active</span>
                            </div>
                            <div style={{ padding: "12px 14px" }}>
                                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                                    {[["Batteries","10","#818cf8"],["Progress","72%","#34d399"],["Streak","7d","#fff"]].map(([lbl, val, col], i) => (
                                        <div key={i} style={{ flex: 1, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 9, padding: "9px 10px" }}>
                                            <div style={{ fontSize: 9, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".7px", marginBottom: 4 }}>{lbl}</div>
                                            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: col }}>{val}</div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ fontSize: 9, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".7px", marginBottom: 7 }}>Today&apos;s questions</div>
                                {["Dursley family dynamics","Bizarre occurrences"].map((title, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 8, padding: "8px 10px", marginBottom: 6 }}>
                                        <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgb(57,73,171)", fontSize: 9, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i+1}</div>
                                        <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)", flex: 1 }}>{title}</div>
                                        <div style={{ fontSize: 8, background: "rgba(57,73,171,.25)", color: "#818cf8", padding: "2px 6px", borderRadius: 20, fontWeight: 700 }}>SECTION</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="how-mobile" style={{ padding: "64px 20px", background: "#f8fafc" }} aria-label={language === "es" ? "Cómo funciona" : "How it works"}>
                <div style={{ display: "inline-flex", alignItems: "center", background: "rgba(57,73,171,.10)", border: "1px solid rgba(57,73,171,.22)", color: "rgb(57,73,171)", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "3px 12px", borderRadius: 20, marginBottom: 12 }}>
                    {language === "es" ? "Cómo funciona" : "How it works"}
                </div>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#0f172a", letterSpacing: "-.8px", lineHeight: 1.1, marginBottom: 10 }}>
                    {language === "es" ? "Del documento al dominio" : "From document to mastery"}
                </h2>
                <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.7, marginBottom: 36 }}>
                    {language === "es" ? "Contenido → reglas → práctica → resultados." : "Content → rules → practice → results."}
                </p>
                {[
                    { gradient: "linear-gradient(135deg,#f59e0b,#fbbf24)", num: "01", bigIcon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>, smallIcon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>, title: language === "es" ? "Crea un proyecto y sube documentos" : "Create a project & upload your docs", desc: language === "es" ? "Organiza contenido por proyectos y temas. Empieza con PDFs o notas." : "Organize content by projects and topics. Start with PDFs or notes and build your study base." },
                    { gradient: "linear-gradient(135deg,rgb(57,73,171),#818cf8)", num: "02", bigIcon: <><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></>, smallIcon: <><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/></>, title: language === "es" ? "Define las reglas de preguntas" : "Define question rules", desc: language === "es" ? "Elige tipos de preguntas, cantidad por tema y lógica de puntuación." : "Choose question types, quantity per topic, and scoring logic to practice with intent." },
                    { gradient: "linear-gradient(135deg,#059669,#34d399)", num: "03", bigIcon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>, smallIcon: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>, title: language === "es" ? "Practica con flashcards y mejora" : "Practice with flashcards & improve", desc: language === "es" ? "Simula exámenes, revisa resultados y enfócate donde más lo necesitas." : "Simulate exams, review results, and focus on where you really need to improve." },
                ].map((step, i) => (
                    <div key={i} style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #e2e8f0", overflow: "hidden", marginBottom: 16 }}>
                        <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", background: step.gradient }}>
                            <svg style={{ width: 60, height: 60, fill: "none", strokeWidth: 1.5, stroke: "rgba(255,255,255,.8)" }} viewBox="0 0 24 24">{step.bigIcon}</svg>
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(15,23,42,.55) 100%)" }} />
                            <span style={{ position: "absolute", bottom: 12, left: 16, fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: "rgba(255,255,255,.85)" }}>{step.num}</span>
                        </div>
                        <div style={{ padding: "18px 18px 20px" }}>
                            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(57,73,171,.10)", border: "1.5px solid rgba(57,73,171,.22)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                                <svg viewBox="0 0 24 24" style={{ width: 15, height: 15, stroke: "rgb(57,73,171)", strokeWidth: 1.8, fill: "none" }}>{step.smallIcon}</svg>
                            </div>
                            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 7 }}>{step.title}</h3>
                            <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.65 }}>{step.desc}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* FEATURES */}
            <section id="features-mobile" style={{ padding: "64px 20px", background: "#0f172a", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", borderRadius: "50%", pointerEvents: "none", width: 400, height: 400, background: "radial-gradient(circle, rgba(57,73,171,.45) 0%, transparent 60%)", top: -140, right: -120 }} />
                <div style={{ position: "absolute", borderRadius: "50%", pointerEvents: "none", width: 250, height: 250, background: "radial-gradient(circle, rgba(139,92,246,.2) 0%, transparent 65%)", bottom: -80, left: -60 }} />
                <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)", backgroundSize: "36px 36px", pointerEvents: "none" }} />
                <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", background: "rgba(57,73,171,.25)", border: "1px solid rgba(99,102,241,.3)", color: "#a5b4fc", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "3px 12px", borderRadius: 20, marginBottom: 12 }}>
                        {language === "es" ? "Por qué Ankard" : "Why Ankard"}
                    </div>
                    <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-.8px", lineHeight: 1.1, marginBottom: 10 }}>
                        {language === "es" ? "Menos lectura pasiva." : "Less passive reading."}<br />{language === "es" ? "Más aprendizaje real." : "More real learning."}
                    </h2>
                    <p style={{ fontSize: 15, color: "rgba(255,255,255,.45)", lineHeight: 1.7, marginBottom: 36 }}>
                        {language === "es" ? "Diseñado para aprender respondiendo, practicando y mejorando." : "Designed for you to learn by answering, practicing, and improving."}
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        {[
                            { ico: <><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></>, bg: "rgba(57,73,171,.25)", border: "1px solid rgba(99,102,241,.35)", stroke: "#818cf8", title: language === "es" ? "Aprendizaje activo" : "Active learning", desc: language === "es" ? "Descubre qué dominas de verdad con preguntas reales." : "Discover what you truly master with real questions." },
                            { ico: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>, bg: "rgba(52,211,153,.12)", border: "1px solid rgba(52,211,153,.25)", stroke: "#34d399", title: "Flashcards", desc: language === "es" ? "Práctica rápida y repetible para mejor retención." : "Fast, repeatable practice for better retention." },
                            { ico: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>, bg: "rgba(251,191,36,.10)", border: "1px solid rgba(251,191,36,.22)", stroke: "#fbbf24", title: language === "es" ? "Progreso por tema" : "Topic progress", desc: language === "es" ? "Estudia donde más lo necesitas." : "Study where you need it most." },
                            { ico: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>, bg: "rgba(248,113,113,.10)", border: "1px solid rgba(248,113,113,.22)", stroke: "#f87171", title: language === "es" ? "Simulacro de examen" : "Exam simulation", desc: language === "es" ? "Ritmo, puntuación y resultados reales." : "Real exam rhythm, scoring, and results." },
                        ].map((feat, i) => (
                            <div key={i} style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, padding: 16 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, background: feat.bg, border: feat.border }}>
                                    <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: "none", strokeWidth: 1.8, stroke: feat.stroke }}>{feat.ico}</svg>
                                </div>
                                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 6, lineHeight: 1.3 }}>{feat.title}</h3>
                                <p style={{ fontSize: 11, color: "rgba(255,255,255,.4)", lineHeight: 1.55 }}>{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                    <Link to="/auth/sign-up" style={{ display: "block", marginTop: 28, padding: 13, borderRadius: 13, background: "rgba(255,255,255,.08)", border: "1.5px solid rgba(255,255,255,.14)", color: "rgba(255,255,255,.8)", fontSize: 14, fontWeight: 600, cursor: "pointer", textAlign: "center", textDecoration: "none" }}>
                        {language === "es" ? "Explorar todos los beneficios" : "Explore all benefits"}
                    </Link>
                </div>
            </section>

            {/* PRICING */}
            <section id="pricing-mobile" style={{ padding: "64px 20px" }}>
                <div style={{ display: "inline-flex", alignItems: "center", background: "rgba(57,73,171,.10)", border: "1px solid rgba(57,73,171,.22)", color: "rgb(57,73,171)", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "3px 12px", borderRadius: 20, marginBottom: 12 }}>
                    {language === "es" ? "Precios" : "Pricing"}
                </div>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#0f172a", letterSpacing: "-.8px", lineHeight: 1.1, marginBottom: 10 }}>
                    {language === "es" ? "Empieza gratis," : "Start free,"}<br />{language === "es" ? "actualiza cuando estés listo" : "upgrade when ready"}
                </h2>
                <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.7, marginBottom: 36 }}>
                    {language === "es" ? "Sube de nivel cuando tus estudios lo requieran." : "Level up when your studies demand it."}
                </p>
                {/* Free */}
                {[
                    { dark: false, badge: null, tier: "Free", amount: "$0", period: language === "es" ? "siempre gratis" : "forever", features: language === "es" ? ["1–2 proyectos de estudio","Preguntas básicas (MC, V/F)","Límite de práctica diaria","Resultados simples","Progreso básico"] : ["1–2 study projects","Basic questions (MC, T/F)","Daily practice limit","Simple results","Basic progress"], btnLabel: language === "es" ? "Empezar gratis" : "Start free", btnStyle: { background: "transparent", border: "1.5px solid #e2e8f0", color: "#0f172a" }, onClick: () => navigate("/auth/sign-up") },
                    { dark: true, badge: language === "es" ? "Más popular" : "Most popular", tier: "Premium", amount: "$15", period: language === "es" ? "facturado mensualmente" : "billed monthly", perMo: true, features: language === "es" ? ["Todo en Free +","Proyectos ilimitados","Práctica ilimitada","Repetición inteligente","Favoritos + temporizador","Sin anuncios"] : ["Everything in Free +","Unlimited projects","Unlimited practice","Smart repetition","Favorites + timer","No ads"], btnLabel: language === "es" ? "Obtener Premium" : "Get Premium", btnStyle: { background: "rgb(57,73,171)", border: "none", color: "#fff", boxShadow: "0 4px 16px rgba(57,73,171,.4)" }, onClick: () => navigate("/auth/sign-up") },
                    { dark: false, badge: null, tier: "Pro Team", amount: "$25", period: language === "es" ? "por usuario, mensual" : "per user, billed monthly", perMo: true, features: language === "es" ? ["Todo en Premium +","Comparte sets / proyectos","Importación avanzada","Analíticas avanzadas","Exportar resultados (PDF/Excel)"] : ["Everything in Premium +","Share sets / projects","Advanced import","Advanced analytics","Export results (PDF/Excel)"], btnLabel: language === "es" ? "Contactar" : "Contact us", btnStyle: { background: "transparent", border: "1.5px solid #e2e8f0", color: "#0f172a" }, onClick: () => navigate("/dashboard/contact-us") },
                ].map((plan, i) => (
                    <div key={i} style={{ background: plan.dark ? "#0f172a" : "#f8fafc", borderRadius: 20, padding: 24, border: plan.dark ? "1.5px solid rgba(99,102,241,.3)" : "1.5px solid #e2e8f0", marginBottom: 14, position: "relative", boxShadow: plan.dark ? "0 12px 36px rgba(57,73,171,.25)" : "none" }}>
                        {plan.badge && <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "rgb(57,73,171)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 14px", borderRadius: 20, whiteSpace: "nowrap" }}>{plan.badge}</div>}
                        <h3 style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", color: plan.dark ? "#818cf8" : "#94a3b8", marginBottom: 10 }}>{plan.tier}</h3>
                        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 40, fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1, marginBottom: 4, color: plan.dark ? "#fff" : "#0f172a" }}>
                            <span style={{ fontSize: 18, fontWeight: 500, verticalAlign: "top", marginTop: 6, display: "inline-block" }}>$</span>
                            {plan.amount.replace("$","")}
                            {plan.perMo && <span style={{ fontSize: 15, fontWeight: 400, color: plan.dark ? "rgba(255,255,255,.38)" : "#94a3b8" }}>/mo</span>}
                        </div>
                        <div style={{ fontSize: 12, color: plan.dark ? "rgba(255,255,255,.38)" : "#94a3b8", marginBottom: 20 }}>{plan.period}</div>
                        <div style={{ height: 1, background: plan.dark ? "rgba(255,255,255,.1)" : "#e2e8f0", marginBottom: 18 }} />
                        <ul style={{ listStyle: "none", padding: 0, marginBottom: 24 }}>
                            {plan.features.map((f, j) => (
                                <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 13, color: plan.dark ? "rgba(255,255,255,.65)" : "#475569", padding: "4px 0" }}>
                                    <span style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2 }}>
                                        <svg viewBox="0 0 24 24" style={{ width: "100%", height: "100%", strokeWidth: 2.5, fill: "none", stroke: plan.dark ? "#34d399" : "rgb(57,73,171)" }}><polyline points="20 6 9 17 4 12"/></svg>
                                    </span>
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <button onClick={plan.onClick} style={{ width: "100%", padding: 13, borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", ...plan.btnStyle }}>{plan.btnLabel}</button>
                    </div>
                ))}
            </section>

            {/* FAQ */}
            <section style={{ padding: "64px 20px", background: "#f8fafc" }}>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#0f172a", letterSpacing: "-.8px", lineHeight: 1.1, marginBottom: 10 }}>
                    {language === "es" ? "Preguntas Frecuentes" : "Frequently Asked Questions"}
                </h2>
                <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.7, marginBottom: 36 }}>
                    {language === "es" ? "Todo lo que necesitas saber antes de empezar." : "Everything you need to know before starting."}
                </p>
                {faqs.map((item, i) => (
                    <div key={i} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: 18, marginBottom: 10, position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "rgb(57,73,171)", borderRadius: "14px 0 0 14px" }} />
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 7 }}>{item.q}</h3>
                        <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.65 }}>{item.a}</div>
                    </div>
                ))}
                <p style={{ textAlign: "center", fontSize: 14, color: "#94a3b8", marginTop: 8 }}>
                    {language === "es" ? "¿Más preguntas? " : "Still have questions? "}
                    <Link to="/faq" style={{ color: "rgb(57,73,171)", fontWeight: 600, textDecoration: "none" }}>
                        {language === "es" ? "Ver todas las FAQs →" : "View all FAQs →"}
                    </Link>
                </p>
            </section>

            {/* CTA */}
            <section style={{ background: "#0f172a", padding: "64px 20px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", width: 400, height: 400, background: "radial-gradient(circle, rgba(57,73,171,.45) 0%, transparent 60%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", borderRadius: "50%", pointerEvents: "none" }} />
                <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)", backgroundSize: "36px 36px", pointerEvents: "none" }} />
                <div style={{ position: "relative", zIndex: 2 }}>
                    <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-.8px", marginBottom: 12, lineHeight: 1.1 }}>
                        {language === "es" ? "Empieza a aprender más inteligente hoy" : "Start learning smarter today"}
                    </h2>
                    <p style={{ fontSize: 15, color: "rgba(255,255,255,.45)", marginBottom: 32, lineHeight: 1.6 }}>
                        {language === "es" ? "Únete a 1,000+ estudiantes que transforman sus documentos en dominio real." : "Join 1,000+ students turning their documents into real mastery."}
                    </p>
                    <Link to="/auth/sign-up" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "15px 24px", borderRadius: 14, background: "rgb(57,73,171)", color: "#fff", fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, boxShadow: "0 8px 24px rgba(57,73,171,.45)", textDecoration: "none", maxWidth: 320, width: "100%" }}>
                        <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: "#fff", strokeWidth: 2.5, fill: "none" }}><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        {language === "es" ? "Empezar gratis" : "Get started — it's free"}
                    </Link>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{ background: "#070e1a", padding: "44px 20px 32px", borderTop: "1px solid rgba(255,255,255,.05)" }}>
                <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 800, color: "#fff", textDecoration: "none", marginBottom: 10 }}>
                    <div style={{ width: 30, height: 30, background: "#0f172a", borderRadius: 9, border: "1px solid rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg viewBox="0 0 24 24" style={{ width: 15, height: 15, stroke: "#fff", strokeWidth: 2, fill: "none" }}>
                            <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
                        </svg>
                    </div>
                    Ankard
                </Link>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,.32)", lineHeight: 1.65, marginBottom: 32 }}>
                    {language === "es" ? "Transforma tus documentos en flashcards y cuestionarios. Practica mejor. Progresa más rápido." : "Turn your documents into flashcards and quizzes. Practice smarter. Progress faster."}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 36 }}>
                    {[
                        { title: language === "es" ? "Producto" : "Product", links: [[language === "es" ? "Cómo funciona" : "How it works","#how-mobile"],[language === "es" ? "Características" : "Features","#features-mobile"],[language === "es" ? "Precios" : "Pricing","#pricing-mobile"],[language === "es" ? "Hoja de ruta" : "Roadmap","#"]] },
                        { title: language === "es" ? "Empresa" : "Company", links: [["FAQ","/faq"],[language === "es" ? "Contacto" : "Contact","/dashboard/contact-us"],[language === "es" ? "Privacidad" : "Privacy","/privacidad"],[language === "es" ? "Términos" : "Terms","/terminos"]] },
                    ].map((col, i) => (
                        <div key={i}>
                            <h4 style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,.3)", marginBottom: 12 }}>{col.title}</h4>
                            {col.links.map(([label, href], j) => (
                                href.startsWith("/") ? (
                                    <Link key={j} to={href} style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,.45)", textDecoration: "none", marginBottom: 8 }}>{label}</Link>
                                ) : (
                                    <a key={j} href={href} style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,.45)", textDecoration: "none", marginBottom: 8 }}>{label}</a>
                                )
                            ))}
                        </div>
                    ))}
                </div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 20, textAlign: "center" }}>
                    <span style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,.22)", marginBottom: 4 }}>© 2026 Ankard. All rights reserved.</span>
                    <span style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,.22)" }}>Built for learners who mean it.</span>
                </div>
            </footer>

        </div>

        {/* ══════════════════════════════════════════════
            DESKTOP LANDING (unchanged)
        ══════════════════════════════════════════════ */}
        <div className="hidden md:flex md:flex-col min-h-screen bg-blue-gray-50/50">
            <LandingNavbar />

            <main className="flex-grow container mx-auto px-4 pb-20 pt-10">
                {/* HERO */}
                <section className="relative overflow-hidden rounded-3xl border border-blue-gray-100 bg-white shadow-sm mb-20">
                    <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
                        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#60a5fa] to-[#1d4ed8] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
                    </div>

                    <div className="relative px-6 py-10 lg:px-10 lg:py-14">
                        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
                            {/* Left: copy */}
                            <div>
                                <div className="mb-4 flex flex-wrap gap-2">
                                    <Chip value={t("home.hero.tags.flashcards")} variant="outlined" color="blue-gray" />
                                    <Chip value={t("home.hero.tags.questions")} variant="outlined" color="blue-gray" />
                                    <Chip value={t("home.hero.tags.progress")} variant="outlined" color="blue-gray" />
                                </div>
                                <Typography variant="h1" color="blue-gray" className="leading-tight text-3xl lg:text-5xl font-black">
                                    {t("home.hero.title_1")}
                                    <br />
                                    <span className="text-blue-gray-700">{t("home.hero.title_2")}</span>
                                </Typography>

                                <Typography variant="lead" className="mt-3 text-blue-gray-500 max-w-xl">
                                    <span className="font-semibold text-blue-gray-700">{t("home.hero.subtitle_prefix")}</span> {t("home.hero.subtitle_mid1")}{" "}
                                    <span className="font-semibold text-blue-gray-700">{t("home.hero.subtitle_flashcards")}</span> {t("home.hero.subtitle_mid2")}{" "}
                                    <span className="font-semibold text-blue-gray-700">{t("home.hero.subtitle_questions")}</span> {t("home.hero.subtitle_suffix")}
                                </Typography>

                                <Typography className="mt-2 text-sm text-blue-gray-400">
                                    {t("home.hero.ideal_for")}
                                </Typography>

                                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                    <Link to="/auth/sign-up">
                                        <Button
                                            size="lg"
                                            color="blue-gray"
                                            className="shadow-md hover:shadow-lg transition-all rounded-xl w-full sm:w-auto"
                                        >
                                            {t("landing.hero.cta_primary")}
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outlined"
                                        size="lg"
                                        color="blue-gray"
                                        className="rounded-xl w-full sm:w-auto"
                                        onClick={() => {
                                            const el = document.getElementById("como-funciona");
                                            el?.scrollIntoView({ behavior: "smooth", block: "start" });
                                        }}
                                    >
                                        {t("home.hero.btn_how_it_works")}
                                    </Button>
                                </div>

                                {/* Ribbon */}
                                <div className="mt-8 inline-flex items-center gap-2 rounded-xl border border-blue-gray-100 bg-blue-gray-50 px-4 py-3">
                                    <BoltIcon className="h-5 w-5 text-blue-gray-700" />
                                    <Typography className="text-sm text-blue-gray-700 font-medium">
                                        {t("home.hero.ribbon")}
                                    </Typography>
                                </div>

                                <div className="mt-8 flex items-center gap-4">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3, 4].map(i => (
                                            <img key={i} src={`/img/avatar${i > 3 ? 1 : i}.png`} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt={language === "es" ? `Estudiante de Ankard ${i}` : `Ankard student ${i}`} />
                                        ))}
                                    </div>
                                    <Typography variant="small" className="text-blue-gray-600 font-medium">
                                        {t("landing.hero.social_proof")}
                                    </Typography>
                                </div>
                            </div>

                            {/* Right: mockup */}
                            <div className="relative">
                                <div className="absolute -inset-6 rounded-3xl bg-blue-gray-50/70 blur-2xl" />
                                <div className="relative rounded-2xl border border-blue-gray-100 bg-white shadow-xl overflow-hidden">
                                    <img
                                        src="/img/anko-hero.png"
                                        alt={language === "es" ? "Ankard — interfaz de la plataforma de estudio con inteligencia artificial: flashcards y cuestionarios" : "Ankard — AI-powered study platform interface: flashcards and quiz generator"}
                                        className="h-[320px] w-full object-cover lg:h-[420px]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                </div>

                                {/* Mini cards flotantes */}
                                <div className="absolute -top-10 -left-8 hidden w-64 rounded-2xl border border-blue-gray-100 bg-white p-4 shadow-xl lg:block transform -translate-x-1/4 hover:-translate-y-1 transition-transform z-10">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-lg bg-blue-gray-50 p-2">
                                            <QuestionMarkCircleIcon className="h-5 w-5 text-blue-gray-700" />
                                        </div>
                                        <div>
                                            <Typography className="text-sm font-bold text-blue-gray-900">
                                                {t("home.hero.floating_learn.title")}
                                            </Typography>
                                            <Typography className="text-xs text-blue-gray-500 mt-1">
                                                {t("home.hero.floating_learn.desc")}
                                            </Typography>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute -bottom-10 -right-8 hidden w-64 rounded-2xl border border-blue-gray-100 bg-white p-4 shadow-xl lg:block transform translate-x-1/4 hover:-translate-y-1 transition-transform z-10">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-lg bg-blue-gray-50 p-2">
                                            <TagIcon className="h-5 w-5 text-blue-gray-700" />
                                        </div>
                                        <div>
                                            <Typography className="text-sm font-bold text-blue-gray-900">
                                                {t("home.hero.floating_progress.title")}
                                            </Typography>
                                            <Typography className="text-xs text-blue-gray-500 mt-1">
                                                {t("home.hero.floating_progress.desc")}
                                            </Typography>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURES (How it Works) */}
                <section id="como-funciona" className="mb-20 scroll-mt-24">
                    <div className="text-center mb-12">
                        <Typography variant="h2" color="blue-gray" className="mb-4">
                            {t("home.how_it_works.title")}
                        </Typography>
                        <Typography variant="lead" className="text-blue-gray-500 max-w-2xl mx-auto">
                            {t("home.how_it_works.subtitle")}
                        </Typography>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {howItWorks.map((step, idx) => (
                            <Card key={idx} className="border border-blue-gray-50 shadow-sm hover:scale-[1.02] transition-transform duration-300">
                                <CardHeader floated={false} shadow={false} className="m-0 h-48">
                                    <img src={step.img} alt={step.title} className="w-full h-full object-cover" />
                                </CardHeader>
                                <CardBody className="p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-2 bg-blue-gray-50 rounded-lg">
                                            {React.createElement(step.icon, { className: "h-6 w-6 text-blue-gray-700" })}
                                        </div>
                                        <Typography variant="h3" color="blue-gray" className="text-xl font-bold">
                                            {step.title}
                                        </Typography>
                                    </div>
                                    <Typography className="text-blue-gray-600">
                                        {step.desc}
                                    </Typography>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* BENEFITS */}
                <section className="bg-blue-gray-900 rounded-3xl p-10 lg:p-16 mb-20 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-blue-gray-700 blur-[100px] opacity-20"></div>
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <Typography variant="h2" color="white" className="mb-6">
                                {t("home.benefits.title")}
                            </Typography>
                            <Typography variant="lead" className="text-white/70 mb-10">
                                {t("home.benefits.subtitle")}
                            </Typography>
                            <Link to="/auth/sign-up">
                                <Button color="white" className="text-blue-gray-900 px-8 py-3 rounded-xl shadow-lg">
                                    {t("landing.benefits.cta")}
                                </Button>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {benefits.map((b, idx) => (
                                <div key={idx} className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                                    <div className="p-2 bg-blue-gray-100 rounded-lg w-fit mb-4">
                                        {React.createElement(b.icon, { className: "h-6 w-6 text-blue-gray-700" })}
                                    </div>
                                    <Typography variant="h3" color="white" className="mb-2 text-lg font-bold">
                                        {b.title}
                                    </Typography>
                                    <Typography variant="small" className="text-white/60">
                                        {b.desc}
                                    </Typography>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* PRICING */}
                <section className="mb-20">
                    <div className="text-center mb-12">
                        <Typography variant="h2" color="blue-gray" className="mb-4">
                            {t("home.pricing.title")}
                        </Typography>
                        <Typography variant="lead" className="text-blue-gray-500">
                            {t("home.pricing.subtitle")}
                        </Typography>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map((plan, idx) => (
                            <Card key={idx} className={`border ${plan.recommended ? "border-amber-500 shadow-xl scale-105" : "border-blue-gray-50 shadow-sm"}`}>
                                <CardHeader floated={false} shadow={false} className="p-6 text-center border-b border-blue-gray-50 bg-blue-gray-50/50">
                                    <Typography variant="small" className="uppercase font-bold tracking-widest text-blue-gray-400 mb-2">
                                        {plan.name}
                                    </Typography>
                                    <Typography variant="h3" color="blue-gray" className="font-black">
                                        {plan.price}
                                    </Typography>
                                </CardHeader>
                                <CardBody className="p-6">
                                    <ul className="space-y-4">
                                        {plan.features.map((f, i) => (
                                            <li key={i} className="flex items-center gap-3">
                                                <CheckCircleIcon className="h-5 w-5 text-blue-gray-400" />
                                                <Typography className="text-blue-gray-600 text-sm">{f}</Typography>
                                            </li>
                                        ))}
                                    </ul>
                                </CardBody>
                                <CardFooter className="p-6 pt-0">
                                    <Button fullWidth color={plan.color} onClick={plan.onClick} className="rounded-xl h-12">
                                        {plan.button}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* FAQ */}
                <section className="max-w-4xl mx-auto mb-20 text-center">
                    <Typography variant="h2" color="blue-gray" className="mb-10">
                        {t("home.faq.title")}
                    </Typography>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        {faqs.map((f, idx) => (
                            <Card key={idx} className="border border-blue-gray-50 p-6 shadow-sm">
                                <Typography variant="h3" color="blue-gray" className="mb-2 text-base font-bold">
                                    {f.q}
                                </Typography>
                                <Typography variant="small" className="text-blue-gray-600">
                                    {f.a}
                                </Typography>
                            </Card>
                        ))}
                    </div>
                    <Link to="/faq">
                        <Button variant="text" color="blue-gray" className="mt-10 px-8 flex items-center gap-2 mx-auto">
                            {t("landing.faq.cta")} <RocketLaunchIcon className="h-4 w-4" />
                        </Button>
                    </Link>
                </section>
            </main>
            <div className="bg-white/50 py-6 border-t border-blue-gray-100">
                <div className="container mx-auto px-4">
                    <Footer />
                </div>
            </div>
        </div>

        </>
    );
}

export default LandingPage;

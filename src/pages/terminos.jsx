import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/language-context";

export function Terminos() {
    const { language } = useLanguage();
    const isEs = language === "es";

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
                    {isEs ? "Empezar gratis" : "Get started free"}
                </Link>
            </nav>

            {/* Content */}
            <main style={{ maxWidth: 760, margin: "0 auto", padding: "60px 24px 80px" }}>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800, color: "#0f172a", letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 8 }}>
                    {isEs ? "Términos y Condiciones" : "Terms and Conditions"}
                </h1>
                <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 40 }}>
                    {isEs ? "Última actualización: abril de 2026" : "Last updated: April 2026"}
                </p>

                {[
                    {
                        title: isEs ? "1. Aceptación de los términos" : "1. Acceptance of Terms",
                        body: isEs
                            ? "Al acceder y utilizar Ankard (ankard.com), aceptas quedar vinculado por estos Términos y Condiciones. Si no estás de acuerdo con alguno de ellos, por favor no utilices el servicio."
                            : "By accessing and using Ankard (ankard.com), you agree to be bound by these Terms and Conditions. If you disagree with any of them, please do not use the service.",
                    },
                    {
                        title: isEs ? "2. Descripción del servicio" : "2. Description of Service",
                        body: isEs
                            ? "Ankard es una plataforma de estudio basada en inteligencia artificial que permite a los usuarios subir documentos y generar flashcards, baterías de preguntas y simulacros de examen de forma automática."
                            : "Ankard is an AI-based study platform that allows users to upload documents and automatically generate flashcards, question batteries, and exam simulations.",
                    },
                    {
                        title: isEs ? "3. Cuenta de usuario" : "3. User Account",
                        body: isEs
                            ? "Para acceder a las funcionalidades completas de Ankard debes crear una cuenta. Eres responsable de mantener la confidencialidad de tus credenciales y de todas las actividades realizadas bajo tu cuenta."
                            : "To access the full features of Ankard you must create an account. You are responsible for maintaining the confidentiality of your credentials and all activities carried out under your account.",
                    },
                    {
                        title: isEs ? "4. Contenido del usuario" : "4. User Content",
                        body: isEs
                            ? "Conservas todos los derechos sobre los documentos que subes a Ankard. Al subir contenido, nos concedes una licencia limitada para procesarlo con el fin de generar el material de estudio solicitado. No compartimos tu contenido con terceros."
                            : "You retain all rights to the documents you upload to Ankard. By uploading content, you grant us a limited license to process it in order to generate the requested study material. We do not share your content with third parties.",
                    },
                    {
                        title: isEs ? "5. Uso aceptable" : "5. Acceptable Use",
                        body: isEs
                            ? "Aceptas no utilizar Ankard para fines ilegales, subir contenido que viole derechos de terceros, intentar vulnerar la seguridad de la plataforma, o hacer un uso abusivo que perjudique a otros usuarios."
                            : "You agree not to use Ankard for illegal purposes, upload content that violates third-party rights, attempt to breach platform security, or make abusive use that harms other users.",
                    },
                    {
                        title: isEs ? "6. Planes y pagos" : "6. Plans and Payments",
                        body: isEs
                            ? "Los planes de pago (Premium, Pro Team) se facturan mensualmente. Puedes cancelar tu suscripción en cualquier momento desde tu perfil. No realizamos reembolsos por el período ya facturado, salvo que la ley aplicable lo exija."
                            : "Paid plans (Premium, Pro Team) are billed monthly. You can cancel your subscription at any time from your profile. We do not offer refunds for the already-billed period, unless required by applicable law.",
                    },
                    {
                        title: isEs ? "7. Limitación de responsabilidad" : "7. Limitation of Liability",
                        body: isEs
                            ? "Ankard se proporciona 'tal cual'. No garantizamos que el contenido generado por IA sea exacto o completo. En ningún caso seremos responsables de daños indirectos, incidentales o consecuentes derivados del uso del servicio."
                            : "Ankard is provided 'as is'. We do not guarantee that AI-generated content is accurate or complete. In no event shall we be liable for indirect, incidental, or consequential damages arising from use of the service.",
                    },
                    {
                        title: isEs ? "8. Modificaciones" : "8. Modifications",
                        body: isEs
                            ? "Nos reservamos el derecho de modificar estos términos en cualquier momento. Te notificaremos los cambios significativos por correo o mediante aviso en la plataforma. El uso continuado del servicio tras la notificación implica la aceptación de los nuevos términos."
                            : "We reserve the right to modify these terms at any time. We will notify you of significant changes by email or through a notice on the platform. Continued use of the service after notification implies acceptance of the new terms.",
                    },
                    {
                        title: isEs ? "9. Ley aplicable" : "9. Governing Law",
                        body: isEs
                            ? "Estos términos se rigen por la legislación española. Cualquier disputa se someterá a la jurisdicción de los tribunales de Madrid, España."
                            : "These terms are governed by Spanish law. Any dispute shall be submitted to the jurisdiction of the courts of Madrid, Spain.",
                    },
                ].map((section, i) => (
                    <div key={i} style={{ marginBottom: 32 }}>
                        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>{section.title}</h2>
                        <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.75 }}>{section.body}</p>
                    </div>
                ))}

                <div style={{ marginTop: 48, padding: "20px 24px", background: "#fff", borderRadius: 14, border: "1.5px solid #e2e8f0" }}>
                    <p style={{ fontSize: 14, color: "#475569" }}>
                        {isEs ? "¿Tienes preguntas sobre estos términos? " : "Questions about these terms? "}
                        <a href="mailto:legal@ankard.com" style={{ color: "rgb(57,73,171)", fontWeight: 600, textDecoration: "none" }}>legal@ankard.com</a>
                    </p>
                </div>
            </main>

            {/* Footer */}
            <footer style={{ background: "#070e1a", padding: "32px 24px", borderTop: "1px solid rgba(255,255,255,.05)", textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,.3)", marginBottom: 10 }}>© 2026 Ankard. {isEs ? "Todos los derechos reservados." : "All rights reserved."}</p>
                <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
                    <Link to="/" style={{ fontSize: 12, color: "rgba(255,255,255,.4)", textDecoration: "none" }}>{isEs ? "Inicio" : "Home"}</Link>
                    <Link to="/faq" style={{ fontSize: 12, color: "rgba(255,255,255,.4)", textDecoration: "none" }}>FAQ</Link>
                    <Link to="/privacidad" style={{ fontSize: 12, color: "rgba(255,255,255,.4)", textDecoration: "none" }}>{isEs ? "Privacidad" : "Privacy"}</Link>
                </div>
            </footer>
        </div>
    );
}

export default Terminos;

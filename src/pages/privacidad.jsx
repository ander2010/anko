import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/language-context";

export function Privacidad() {
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
                    {isEs ? "Política de Privacidad" : "Privacy Policy"}
                </h1>
                <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 40 }}>
                    {isEs ? "Última actualización: abril de 2026" : "Last updated: April 2026"}
                </p>

                {[
                    {
                        title: isEs ? "1. Responsable del tratamiento" : "1. Data Controller",
                        body: isEs
                            ? "Ankard es el responsable del tratamiento de los datos personales recogidos a través de la plataforma ankard.com. Puedes contactarnos en privacidad@ankard.com para cualquier consulta relativa a tus datos."
                            : "Ankard is the data controller for personal data collected through the ankard.com platform. You can contact us at privacy@ankard.com for any data-related inquiries.",
                    },
                    {
                        title: isEs ? "2. Datos que recopilamos" : "2. Data We Collect",
                        body: isEs
                            ? "Recopilamos los datos que nos proporcionas al registrarte (nombre, correo electrónico), los documentos que subes a la plataforma, los datos de uso y progreso de estudio, y datos técnicos del dispositivo (dirección IP, tipo de navegador) necesarios para el funcionamiento del servicio."
                            : "We collect data you provide when registering (name, email address), documents you upload to the platform, study usage and progress data, and technical device data (IP address, browser type) necessary for the service to function.",
                    },
                    {
                        title: isEs ? "3. Finalidad del tratamiento" : "3. Purpose of Processing",
                        body: isEs
                            ? "Utilizamos tus datos para prestarte el servicio de generación de flashcards y cuestionarios con IA, mejorar la plataforma, enviarte comunicaciones sobre el servicio (si lo consientes) y cumplir con nuestras obligaciones legales."
                            : "We use your data to provide you with the AI flashcard and quiz generation service, improve the platform, send you service communications (with your consent), and comply with our legal obligations.",
                    },
                    {
                        title: isEs ? "4. Conservación de datos" : "4. Data Retention",
                        body: isEs
                            ? "Conservamos tus datos mientras mantengas una cuenta activa en Ankard. Si eliminas tu cuenta, borraremos tus datos personales en un plazo de 30 días, salvo que la ley nos obligue a conservarlos durante más tiempo."
                            : "We retain your data for as long as you maintain an active Ankard account. If you delete your account, we will delete your personal data within 30 days, unless legally required to retain it longer.",
                    },
                    {
                        title: isEs ? "5. Tus derechos" : "5. Your Rights",
                        body: isEs
                            ? "Tienes derecho a acceder, rectificar y eliminar tus datos, así como a oponerte al tratamiento, solicitar la limitación o la portabilidad de tus datos. Para ejercer estos derechos, escríbenos a privacidad@ankard.com."
                            : "You have the right to access, rectify, and delete your data, as well as to object to processing, request restriction or data portability. To exercise these rights, write to us at privacy@ankard.com.",
                    },
                    {
                        title: isEs ? "6. Seguridad" : "6. Security",
                        body: isEs
                            ? "Aplicamos medidas técnicas y organizativas adecuadas para proteger tus datos frente a accesos no autorizados, pérdida o divulgación, incluyendo cifrado en tránsito y en reposo."
                            : "We apply appropriate technical and organizational measures to protect your data against unauthorized access, loss, or disclosure, including encryption in transit and at rest.",
                    },
                    {
                        title: isEs ? "7. Cookies" : "7. Cookies",
                        body: isEs
                            ? "Utilizamos cookies estrictamente necesarias para el funcionamiento de la plataforma (sesión, autenticación). No utilizamos cookies de publicidad de terceros."
                            : "We use strictly necessary cookies for the platform to function (session, authentication). We do not use third-party advertising cookies.",
                    },
                    {
                        title: isEs ? "8. Cambios en esta política" : "8. Changes to This Policy",
                        body: isEs
                            ? "Podemos actualizar esta política periódicamente. Te notificaremos cualquier cambio significativo por correo electrónico o mediante un aviso destacado en la plataforma."
                            : "We may update this policy periodically. We will notify you of any significant changes by email or through a prominent notice on the platform.",
                    },
                ].map((section, i) => (
                    <div key={i} style={{ marginBottom: 32 }}>
                        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>{section.title}</h2>
                        <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.75 }}>{section.body}</p>
                    </div>
                ))}

                <div style={{ marginTop: 48, padding: "20px 24px", background: "#fff", borderRadius: 14, border: "1.5px solid #e2e8f0" }}>
                    <p style={{ fontSize: 14, color: "#475569" }}>
                        {isEs ? "¿Tienes preguntas sobre esta política? " : "Questions about this policy? "}
                        <a href="mailto:privacidad@ankard.com" style={{ color: "rgb(57,73,171)", fontWeight: 600, textDecoration: "none" }}>privacidad@ankard.com</a>
                    </p>
                </div>
            </main>

            {/* Footer */}
            <footer style={{ background: "#070e1a", padding: "32px 24px", borderTop: "1px solid rgba(255,255,255,.05)", textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,.3)", marginBottom: 10 }}>© 2026 Ankard. {isEs ? "Todos los derechos reservados." : "All rights reserved."}</p>
                <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
                    <Link to="/" style={{ fontSize: 12, color: "rgba(255,255,255,.4)", textDecoration: "none" }}>{isEs ? "Inicio" : "Home"}</Link>
                    <Link to="/faq" style={{ fontSize: 12, color: "rgba(255,255,255,.4)", textDecoration: "none" }}>FAQ</Link>
                    <Link to="/terminos" style={{ fontSize: 12, color: "rgba(255,255,255,.4)", textDecoration: "none" }}>{isEs ? "Términos" : "Terms"}</Link>
                </div>
            </footer>
        </div>
    );
}

export default Privacidad;

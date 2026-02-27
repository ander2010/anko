import React, { useState } from "react";
import {
    Typography,
    Card,
    CardBody,
    Input,
    Textarea,
    Button,
} from "@material-tailwind/react";
import { useLanguage } from "@/context/language-context";
import { EnvelopeIcon, MapPinIcon, PhoneIcon } from "@heroicons/react/24/solid";
import supportService from "@/services/supportService";

export function ContactPage() {
    const { t, language } = useLanguage();
    const [formData, setFormData] = useState({
        name: "",
        email: "", // User mentioned "email" in their requirement object: "name", "phone", "message", "source"
        phone: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: "", message: "" });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: "", message: "" });

        try {
            await supportService.sendSupportRequest({
                ...formData,
                source: "contact_page",
            });
            setStatus({
                type: "success",
                message: t("contact_page.success_message"),
            });
            setFormData({ name: "", email: "", phone: "", message: "" });
        } catch (err) {
            // err may be an array of JSON-encoded bilingual strings, e.g.
            // ["{\"es\":\"Mensaje\",\"en\":\"Message\"}"]
            let errorMsg = t("contact_page.error_message");
            try {
                const raw = Array.isArray(err) ? err[0] : (err?.message?.[0] ?? err?.non_field_errors?.[0] ?? null);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    errorMsg = parsed[language] ?? parsed.en ?? errorMsg;
                }
            } catch (_) { }
            setStatus({
                type: "error",
                message: errorMsg,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-12 flex flex-col gap-10 max-w-6xl mx-auto">
            <div className="text-center">
                <Typography variant="h2" color="blue-gray" className="mb-2">
                    {t("contact_page.title")}
                </Typography>
                <Typography variant="lead" className="text-blue-gray-600 font-normal">
                    {t("contact_page.subtitle")}
                </Typography>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border border-blue-gray-50 shadow-sm overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                        <CardBody className="p-8 space-y-8">
                            <Typography variant="h4" color="white" className="mb-4">
                                {t("contact_page.info_title")}
                            </Typography>

                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 rounded-lg">
                                    <EnvelopeIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <Typography variant="small" className="opacity-70">Email</Typography>
                                    <Typography className="font-bold">{t("contact_page.email")}</Typography>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 rounded-lg">
                                    <MapPinIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <Typography variant="small" className="opacity-70">{language === "es" ? "Ubicación" : "Location"}</Typography>
                                    <Typography className="font-bold">{t("contact_page.location")}</Typography>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 rounded-lg">
                                    <PhoneIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <Typography variant="small" className="opacity-70">{language === "es" ? "Teléfono" : "Phone"}</Typography>
                                    <Typography className="font-bold">+1 (305) 123-4567</Typography>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card className="border border-blue-gray-50 shadow-sm">
                        <CardBody className="p-8">
                            <Typography variant="h4" color="blue-gray" className="mb-6">
                                {t("contact_page.form_title")}
                            </Typography>

                            {status.message && (
                                <div className={`p-4 mb-6 rounded-lg ${status.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
                                    {status.message}
                                </div>
                            )}

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label={language === "es" ? "Nombre Completo" : "Full Name"}
                                        size="lg"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Input
                                        label={language === "es" ? "Correo Electrónico" : "Email Address"}
                                        size="lg"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <Input
                                    label={language === "es" ? "Teléfono" : "Phone"}
                                    size="lg"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                                <Textarea
                                    label={language === "es" ? "Tu Mensaje" : "Your Message"}
                                    rows={6}
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                />
                                <Button
                                    variant="gradient"
                                    color="blue-gray"
                                    fullWidth
                                    size="lg"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? (language === "es" ? "Enviando..." : "Sending...") : (language === "es" ? "Enviar Mensaje" : "Send Message")}
                                </Button>
                            </form>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default ContactPage;

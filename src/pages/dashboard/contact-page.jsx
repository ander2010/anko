import React from "react";
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

export function ContactPage() {
    const { t, language } = useLanguage();

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
                                    <Typography className="font-bold">+1 (555) 123-4567</Typography>
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
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input label={language === "es" ? "Nombre Completo" : "Full Name"} size="lg" />
                                    <Input label={language === "es" ? "Correo Electrónico" : "Email Address"} size="lg" />
                                </div>
                                <Input label={language === "es" ? "Asunto" : "Subject"} size="lg" />
                                <Textarea label={language === "es" ? "Tu Mensaje" : "Your Message"} rows={6} />
                                <Button variant="gradient" color="blue-gray" fullWidth size="lg">
                                    {language === "es" ? "Enviar Mensaje" : "Send Message"}
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

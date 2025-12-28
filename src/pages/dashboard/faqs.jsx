import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    Typography,
    Accordion,
    AccordionHeader,
    AccordionBody,
    Card,
    CardBody,
    Button,
} from "@material-tailwind/react";
import { useLanguage } from "@/context/language-context";

export function Faqs() {
    const { t, language } = useLanguage();
    const [open, setOpen] = useState(0);

    const handleOpen = (value) => setOpen(open === value ? 0 : value);

    return (
        <div className="mt-12 flex flex-col gap-8 max-w-4xl mx-auto">
            <div className="text-center">
                <Typography variant="h2" color="blue-gray" className="mb-2">
                    {t("faqs_page.title")}
                </Typography>
                <Typography variant="lead" className="text-blue-gray-600 font-normal">
                    {t("faqs_page.subtitle")}
                </Typography>
            </div>

            <Card className="border border-blue-gray-50 shadow-sm overflow-hidden">
                <CardBody className="p-0">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Accordion
                            key={i}
                            open={open === i}
                            className={`border-b border-blue-gray-50 last:border-b-0 px-6 py-2 transition-colors ${open === i ? "bg-blue-gray-50/20" : ""
                                }`}
                        >
                            <AccordionHeader
                                onClick={() => handleOpen(i)}
                                className="border-b-0 text-blue-gray-700 hover:text-blue-500 transition-colors text-base md:text-lg"
                            >
                                {t(`faqs_page.questions.q${i}.q`)}
                            </AccordionHeader>
                            <AccordionBody className="text-blue-gray-600 font-normal text-base pb-6">
                                {t(`faqs_page.questions.q${i}.a`)}
                            </AccordionBody>
                        </Accordion>
                    ))}
                </CardBody>
            </Card>

            <div className="text-center mt-8 space-y-4">
                <Typography className="text-blue-gray-500">
                    {t("contact_page.info_title")}: <span className="font-bold text-blue-gray-700">{t("contact_page.email")}</span>
                </Typography>
                <Link to="/dashboard/contact-us">
                    <Button variant="outlined" color="blue" size="sm">
                        {language === "es" ? "¿Todavía tienes dudas? Contáctanos" : "Still have questions? Contact Us"}
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default Faqs;

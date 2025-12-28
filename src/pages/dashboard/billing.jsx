import React from "react";
import {
    Card,
    CardBody,
    Typography,
    Button,
    Chip,
} from "@material-tailwind/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "@/context/language-context";

export function Billing() {
    const { t, language } = useLanguage();

    const plans = [
        {
            id: "free",
            name: t("billing.plans.free.name"),
            price: t("billing.plans.free.price"),
            desc: t("billing.plans.free.desc"),
            cta: t("billing.plans.free.cta"),
            features: t("billing.plans.free.features"),
            color: "blue-gray",
            current: true,
        },
        {
            id: "pro",
            name: t("billing.plans.pro.name"),
            price: t("billing.plans.pro.price"),
            desc: t("billing.plans.pro.desc"),
            cta: t("billing.plans.pro.cta"),
            features: t("billing.plans.pro.features"),
            color: "blue",
            popular: true,
        },
        {
            id: "enterprise",
            name: t("billing.plans.enterprise.name"),
            price: t("billing.plans.enterprise.price"),
            desc: t("billing.plans.enterprise.desc"),
            cta: t("billing.plans.enterprise.cta"),
            features: t("billing.plans.enterprise.features"),
            color: "indigo",
        },
    ];

    return (
        <div className="mt-12 flex flex-col gap-8">
            <div className="text-center">
                <Typography variant="h2" color="blue-gray" className="mb-2">
                    {t("billing.title")}
                </Typography>
                <Typography variant="lead" className="text-blue-gray-600 font-normal">
                    {t("billing.subtitle")}
                </Typography>
            </div>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan) => (
                    <Card
                        key={plan.id}
                        variant="gradient"
                        color={plan.popular ? "white" : "white"}
                        className={`relative flex flex-col shadow-lg border ${plan.popular ? "border-blue-500 scale-105 z-10" : "border-blue-gray-50"
                            }`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <Chip
                                    value={language === "es" ? "MÁS POPULAR" : "MOST POPULAR"}
                                    color="blue"
                                    className="rounded-full"
                                />
                            </div>
                        )}
                        <CardBody className="flex flex-col flex-1 p-8">
                            <Typography
                                variant="small"
                                color={plan.popular ? "blue" : "blue-gray"}
                                className="font-bold uppercase mb-2"
                            >
                                {plan.name}
                            </Typography>
                            <div className="flex items-baseline gap-1 mb-4">
                                <Typography variant="h1" color="blue-gray" className="text-5xl font-black">
                                    {plan.price}
                                </Typography>
                                {plan.id !== "enterprise" && (
                                    <Typography variant="small" color="blue-gray" className="font-normal opacity-70">
                                        /{language === "es" ? "mes" : "mo"}
                                    </Typography>
                                )}
                            </div>
                            <Typography className="text-blue-gray-600 font-normal mb-8 min-h-[60px]">
                                {plan.desc}
                            </Typography>

                            <div className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className={`mt-1 p-0.5 rounded-full ${plan.popular ? "bg-blue-50 text-blue-500" : "bg-blue-gray-50 text-blue-gray-500"}`}>
                                            <CheckIcon className="h-3 w-3 stroke-[3]" />
                                        </div>
                                        <Typography variant="small" className="text-blue-gray-600 font-normal">
                                            {feature}
                                        </Typography>
                                    </div>
                                ))}
                            </div>

                            <Button
                                variant={plan.current ? "outlined" : "gradient"}
                                color={plan.color}
                                fullWidth
                                className="py-4"
                                disabled={plan.current}
                            >
                                {plan.cta}
                            </Button>
                        </CardBody>
                    </Card>
                ))}
            </div>

            <Card className="mt-8 border border-blue-gray-50 shadow-sm">
                <CardBody className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1">
                        <Typography variant="h5" color="blue-gray" className="mb-1">
                            {language === "es" ? "¿Necesitas ayuda para elegir?" : "Need help choosing?"}
                        </Typography>
                        <Typography className="text-blue-gray-600 font-normal">
                            {language === "es"
                                ? "Consulta nuestras preguntas frecuentes o contáctanos para una solución personalizada."
                                : "Check our FAQs or contact us for a customized solution."}
                        </Typography>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="text" color="blue-gray">
                            {language === "es" ? "Preguntas Frecuentes" : "FAQs"}
                        </Button>
                        <Button variant="gradient" color="blue">
                            {language === "es" ? "Contáctanos" : "Contact Us"}
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}

export default Billing;

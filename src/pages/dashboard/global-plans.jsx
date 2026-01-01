import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";
import { useLanguage } from "@/context/language-context";

export function GlobalPlans() {
    const { t } = useLanguage();
    return (
        <GlobalCrudPage
            title={t("global.pages.plans.title")}
            resource="plans"
            columns={[
                { header: t("global.pages.plans.columns.tier"), accessor: "tier" },
                { header: t("global.pages.plans.columns.name"), accessor: "name" },
                { header: t("global.pages.plans.columns.price_cents"), accessor: "price_cents" },
                { header: t("global.pages.plans.columns.is_active"), accessor: "is_active" },
            ]}
            fields={[
                { name: "tier", label: t("global.pages.plans.fields.tier"), type: "text" },
                { name: "name", label: t("global.pages.plans.fields.name"), type: "text" },
                { name: "description", label: t("global.pages.plans.fields.description"), type: "textarea" },
                { name: "price_cents", label: t("global.pages.plans.fields.price_cents"), type: "number" },
                { name: "currency", label: t("global.pages.plans.fields.currency"), type: "text", defaultValue: "USD" },
                { name: "billing_period", label: t("global.pages.plans.fields.billing_period"), type: "text", defaultValue: "monthly" },
                { name: "max_documents", label: t("global.pages.plans.fields.max_documents"), type: "number" },
                { name: "max_batteries", label: t("global.pages.plans.fields.max_batteries"), type: "number" },
                { name: "is_active", label: t("global.pages.plans.fields.is_active"), type: "boolean" },
            ]}
        />
    );
}

export default GlobalPlans;

import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";
import { useLanguage } from "@/context/language-context";

export function GlobalSupportRequests() {
    const { t } = useLanguage();
    return (
        <GlobalCrudPage
            title={t("global.pages.support-requests.title")}
            resource="support-requests"
            columns={[
                { header: t("global.pages.support-requests.columns.name"), accessor: "name" },
                { header: t("global.pages.support-requests.columns.email"), accessor: "email" },
                { header: t("global.pages.support-requests.columns.phone"), accessor: "phone" },
                { header: t("global.pages.support-requests.columns.message"), accessor: "message" },
                { header: t("global.pages.support-requests.columns.source"), accessor: "source" },
                { header: t("global.pages.support-requests.columns.created_at"), accessor: "created_at" },
            ]}
            fields={[
                { name: "name", label: t("global.pages.support-requests.fields.name"), type: "text" },
                { name: "email", label: t("global.pages.support-requests.fields.email"), type: "email" },
                { name: "phone", label: t("global.pages.support-requests.fields.phone"), type: "text" },
                { name: "message", label: t("global.pages.support-requests.fields.message"), type: "textarea" },
                { name: "source", label: t("global.pages.support-requests.fields.source"), type: "text" },
            ]}
        />
    );
}

export default GlobalSupportRequests;

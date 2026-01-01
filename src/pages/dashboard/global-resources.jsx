import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";
import { useLanguage } from "@/context/language-context";

export function GlobalResources() {
    const { t } = useLanguage();
    return (
        <GlobalCrudPage
            title={t("global.pages.resources.title")}
            resource="resources"
            columns={[
                { header: t("global.pages.resources.columns.key"), accessor: "key" },
                { header: t("global.pages.resources.columns.name"), accessor: "name" },
                { header: t("global.pages.resources.columns.description"), accessor: "description" },
            ]}
            fields={[
                { name: "key", label: t("global.pages.resources.fields.key"), type: "text" },
                { name: "name", label: t("global.pages.resources.fields.name"), type: "text" },
                { name: "description", label: t("global.pages.resources.fields.description"), type: "textarea" },
            ]}
        />
    );
}

export default GlobalResources;

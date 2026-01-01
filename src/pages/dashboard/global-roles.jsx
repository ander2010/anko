import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";
import { useLanguage } from "@/context/language-context";

export function GlobalRoles() {
    const { t } = useLanguage();
    return (
        <GlobalCrudPage
            title={t("global.pages.roles.title")}
            resource="roles"
            columns={[
                { header: t("global.pages.roles.columns.id"), accessor: "id" },
                { header: t("global.pages.roles.columns.name"), accessor: "name" },
                { header: t("global.pages.roles.columns.description"), accessor: "description" },
            ]}
            fields={[
                { name: "name", label: t("global.pages.roles.fields.name"), type: "text" },
                { name: "description", label: t("global.pages.roles.fields.description"), type: "textarea" },
            ]}
        />
    );
}

export default GlobalRoles;

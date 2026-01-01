import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";
import { useLanguage } from "@/context/language-context";

export function GlobalPermissions() {
    const { t } = useLanguage();
    return (
        <GlobalCrudPage
            title={t("global.pages.permissions.title")}
            resource="permissions"
            columns={[
                { header: t("global.pages.permissions.columns.resource"), accessor: "resource" },
                { header: t("global.pages.permissions.columns.action"), accessor: "action" },
                { header: t("global.pages.permissions.columns.code"), accessor: "code" },
            ]}
            fields={[
                {
                    name: "resource",
                    label: t("global.pages.permissions.fields.resource"),
                    type: "select-resource",
                    resource: "resources",
                    labelAccessor: "name",
                    valueAccessor: "id"
                },
                { name: "action", label: t("global.pages.permissions.fields.action"), type: "text" },
                { name: "code", label: t("global.pages.permissions.fields.code"), type: "text" },
            ]}
        />
    );
}

export default GlobalPermissions;

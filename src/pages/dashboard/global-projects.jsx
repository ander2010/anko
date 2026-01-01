import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";
import { useLanguage } from "@/context/language-context";

export function GlobalProjects() {
    const { t } = useLanguage();
    return (
        <GlobalCrudPage
            title={t("global.pages.projects.title")}
            resource="projects"
            columns={[
                { header: t("global.pages.projects.columns.name"), accessor: "name" },
                { header: t("global.pages.projects.columns.owner"), accessor: (item) => item.owner_details?.username || item.owner?.username || item.owner },
                { header: t("global.pages.projects.columns.created_at"), accessor: "created_at" },
                { header: t("global.pages.projects.columns.updated_at"), accessor: "updated_at" },
            ]}
            fields={[
                { name: "name", label: t("global.pages.projects.fields.name"), type: "text" },
                { name: "description", label: t("global.pages.projects.fields.description"), type: "textarea" },
                {
                    name: "owner",
                    label: t("global.pages.projects.fields.owner"),
                    type: "select-resource",
                    resource: "users",
                    labelAccessor: "username",
                    valueAccessor: "id"
                },
            ]}
        />
    );
}

export default GlobalProjects;

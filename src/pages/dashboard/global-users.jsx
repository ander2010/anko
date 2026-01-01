import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";
import { useLanguage } from "@/context/language-context";

export function GlobalUsers() {
    const { t } = useLanguage();
    return (
        <GlobalCrudPage
            title={t("global.pages.users.title")}
            resource="users"
            columns={[
                { header: t("global.pages.users.columns.username"), accessor: "username" },
                { header: t("global.pages.users.columns.email"), accessor: "email" },
                { header: t("global.pages.users.columns.first_name"), accessor: "first_name" },
                { header: t("global.pages.users.columns.last_name"), accessor: "last_name" },
                {
                    header: t("global.pages.users.columns.is_active"),
                    accessor: (item) => item.is_active ? "✅" : "❌"
                },
                {
                    header: t("global.pages.users.columns.is_staff"),
                    accessor: (item) => item.is_staff ? "⭐" : ""
                },
            ]}
            fields={[
                { name: "username", label: t("global.pages.users.fields.username"), type: "text", excludeOnUpdate: true },
                { name: "email", label: t("global.pages.users.fields.email"), type: "email" },
                { name: "first_name", label: t("global.pages.users.fields.first_name"), type: "text" },
                { name: "last_name", label: t("global.pages.users.fields.last_name"), type: "text" },
                { name: "is_active", label: t("global.pages.users.fields.is_active"), type: "boolean" },
                { name: "is_staff", label: t("global.pages.users.fields.is_staff"), type: "boolean" },
                {
                    name: "roles",
                    label: t("global.pages.users.fields.roles"),
                    type: "select-resource",
                    resource: "roles",
                    labelAccessor: "name",
                    valueAccessor: "id",
                    multiple: true
                },
                { name: "avatar", label: t("global.pages.users.fields.avatar"), type: "text", excludeOnUpdate: true },
                { name: "password", label: t("global.pages.users.fields.password"), type: "password", excludeOnUpdate: true },
            ]}
        />
    );
}

export default GlobalUsers;

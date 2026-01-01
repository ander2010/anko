import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";
import { useLanguage } from "@/context/language-context";

export function GlobalInvites() {
    const { t } = useLanguage();
    return (
        <GlobalCrudPage
            title={t("global.pages.invites.title")}
            resource="invites"
            columns={[
                { header: t("global.pages.invites.columns.email"), accessor: "email" },
                { header: t("global.pages.invites.columns.role"), accessor: "role" },
                { header: t("global.pages.invites.columns.invited_by"), accessor: "invited_by" },
                { header: t("global.pages.invites.columns.accepted"), accessor: "accepted" },
            ]}
            fields={[
                { name: "email", label: t("global.pages.invites.fields.email"), type: "email" },
                {
                    name: "role",
                    label: t("global.pages.invites.fields.role"),
                    type: "select-resource",
                    resource: "roles",
                    labelAccessor: "name",
                    valueAccessor: "id"
                },
                {
                    name: "invited_by",
                    label: t("global.pages.invites.fields.invited_by"),
                    type: "select-resource",
                    resource: "users",
                    labelAccessor: "email",
                    valueAccessor: "id"
                },
            ]}
        />
    );
}

export default GlobalInvites;

import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";
import { useLanguage } from "@/context/language-context";

export function GlobalSubscriptions() {
    const { t } = useLanguage();
    return (
        <GlobalCrudPage
            title={t("global.pages.subscriptions.title")}
            resource="subscriptions"
            columns={[
                { header: t("global.pages.subscriptions.columns.user"), accessor: "user" },
                { header: t("global.pages.subscriptions.columns.plan"), accessor: "plan" },
                { header: t("global.pages.subscriptions.columns.status"), accessor: "status" },
                { header: t("global.pages.subscriptions.columns.provider"), accessor: "provider" },
            ]}
            fields={[
                {
                    name: "user",
                    label: t("global.pages.subscriptions.fields.user"),
                    type: "select-resource",
                    resource: "users",
                    labelAccessor: "email",
                    valueAccessor: "id"
                },
                {
                    name: "plan",
                    label: t("global.pages.subscriptions.fields.plan"),
                    type: "select-resource",
                    resource: "plans",
                    labelAccessor: "name",
                    valueAccessor: "id"
                },
                { name: "status", label: t("global.pages.subscriptions.fields.status"), type: "text" },
                { name: "provider", label: t("global.pages.subscriptions.fields.provider"), type: "text" },
                { name: "provider_subscription_id", label: t("global.pages.subscriptions.fields.provider_subscription_id"), type: "text" },
            ]}
        />
    );
}

export default GlobalSubscriptions;

import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";
import { useLanguage } from "@/context/language-context";

export function GlobalBatteryShares() {
    const { t } = useLanguage();
    return (
        <GlobalCrudPage
            title={t("global.pages.battery-shares.title")}
            resource="battery-shares"
            columns={[
                { header: t("global.pages.battery-shares.columns.battery"), accessor: "battery" },
                { header: t("global.pages.battery-shares.columns.shared_with"), accessor: "shared_with" },
                { header: t("global.pages.battery-shares.columns.permission"), accessor: "permission" },
            ]}
            fields={[
                {
                    name: "battery",
                    label: t("global.pages.battery-shares.fields.battery"),
                    type: "select-resource",
                    resource: "batteries",
                    labelAccessor: "name",
                    valueAccessor: "id"
                },
                {
                    name: "shared_with",
                    label: t("global.pages.battery-shares.fields.shared_with"),
                    type: "select-resource",
                    resource: "users",
                    labelAccessor: "email",
                    valueAccessor: "id"
                },
                { name: "permission", label: t("global.pages.battery-shares.fields.permission"), type: "text" },
            ]}
        />
    );
}

export default GlobalBatteryShares;

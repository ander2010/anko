import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";
import { useLanguage } from "@/context/language-context";

export function GlobalPlanLimits() {
    const { t } = useLanguage();
    return (
        <GlobalCrudPage
            title={t("global.pages.plan-limits.title")}
            resource="plan-limits"
            columns={[
                { header: t("global.pages.plan-limits.columns.plan"), accessor: "plan" },
                { header: t("global.pages.plan-limits.columns.key"), accessor: "key" },
                { header: t("global.pages.plan-limits.columns.value_type"), accessor: "value_type" },
                { header: t("global.pages.plan-limits.columns.int_value"), accessor: "int_value" },
                { header: t("global.pages.plan-limits.columns.bool_value"), accessor: "bool_value" },
            ]}
            fields={[
                {
                    name: "plan",
                    label: t("global.pages.plan-limits.fields.plan"),
                    type: "select-resource",
                    resource: "plans",
                    labelAccessor: "name",
                    valueAccessor: "id"
                },
                { name: "key", label: t("global.pages.plan-limits.fields.key"), type: "text" },
                {
                    name: "value_type",
                    label: t("global.pages.plan-limits.fields.value_type"),
                    type: "select",
                    options: [
                        { value: "int", label: "Entero" },
                        { value: "bool", label: "Booleano" },
                        { value: "str", label: "Texto" }
                    ],
                    defaultValue: "int"
                },
                { name: "int_value", label: t("global.pages.plan-limits.fields.int_value"), type: "number" },
                { name: "bool_value", label: t("global.pages.plan-limits.fields.bool_value"), type: "boolean" },
                { name: "str_value", label: t("global.pages.plan-limits.fields.str_value"), type: "text" },
            ]}
        />
    );
}

export default GlobalPlanLimits;

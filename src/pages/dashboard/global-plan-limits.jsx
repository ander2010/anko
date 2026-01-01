import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";

export function GlobalPlanLimits() {
    return (
        <GlobalCrudPage
            title="Global Plan Limits"
            resource="plan-limits"
            columns={[
                { header: "Plan", accessor: "plan" },
                { header: "Key", accessor: "key" },
                { header: "Type", accessor: "value_type" },
                { header: "Int Value", accessor: "int_value" },
                { header: "Bool Value", accessor: "bool_value" },
            ]}
            fields={[
                {
                    name: "plan",
                    label: "Plan",
                    type: "select-resource",
                    resource: "plans",
                    labelAccessor: "name",
                    valueAccessor: "id"
                },
                { name: "key", label: "Key", type: "text" },
                { name: "value_type", label: "Type (int, bool, str)", type: "text", defaultValue: "int" },
                { name: "int_value", label: "Integer Value", type: "number" },
                { name: "bool_value", label: "Boolean Value", type: "boolean" },
                { name: "str_value", label: "String Value", type: "text" },
            ]}
        />
    );
}

export default GlobalPlanLimits;

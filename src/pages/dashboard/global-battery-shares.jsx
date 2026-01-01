import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";

export function GlobalBatteryShares() {
    return (
        <GlobalCrudPage
            title="Global Battery Shares"
            resource="battery-shares"
            columns={[
                { header: "Battery", accessor: "battery" },
                { header: "Shared With", accessor: "shared_with" },
                { header: "Permission", accessor: "permission" },
            ]}
            fields={[
                {
                    name: "battery",
                    label: "Battery",
                    type: "select-resource",
                    resource: "batteries",
                    labelAccessor: "name", // Assuming battery has name
                    valueAccessor: "id"
                },
                {
                    name: "shared_with",
                    label: "Shared With (User)",
                    type: "select-resource",
                    resource: "users",
                    labelAccessor: "email",
                    valueAccessor: "id"
                },
                { name: "permission", label: "Permission (view, edit)", type: "text" },
            ]}
        />
    );
}

export default GlobalBatteryShares;

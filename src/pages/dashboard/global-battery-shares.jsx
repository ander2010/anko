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
                { name: "battery", label: "Battery ID", type: "number" },
                { name: "shared_with", label: "User ID (Shared With)", type: "number" },
                { name: "permission", label: "Permission (view, edit)", type: "text" },
            ]}
        />
    );
}

export default GlobalBatteryShares;

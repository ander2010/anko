import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";

export function GlobalSavedBatteries() {
    return (
        <GlobalCrudPage
            title="Global Saved Batteries"
            resource="saved-batteries"
            columns={[
                { header: "User", accessor: "user" },
                { header: "Battery", accessor: "battery" },
                { header: "Saved At", accessor: "saved_at" },
            ]}
            fields={[
                { name: "user", label: "User ID", type: "number" },
                { name: "battery", label: "Battery ID", type: "number" },
            ]}
        />
    );
}

export default GlobalSavedBatteries;

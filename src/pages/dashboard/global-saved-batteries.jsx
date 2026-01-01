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
                {
                    name: "user",
                    label: "User",
                    type: "select-resource",
                    resource: "users",
                    labelAccessor: "email",
                    valueAccessor: "id"
                },
                {
                    name: "battery",
                    label: "Battery",
                    type: "select-resource",
                    resource: "batteries",
                    labelAccessor: "name",
                    valueAccessor: "id"
                },
            ]}
        />
    );
}

export default GlobalSavedBatteries;

import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";

export function GlobalPlans() {
    return (
        <GlobalCrudPage
            title="Global Plans"
            resource="plans"
            columns={[
                { header: "Tier", accessor: "tier" },
                { header: "Name", accessor: "name" },
                { header: "Price (Cents)", accessor: "price_cents" },
                { header: "Active", accessor: "is_active" },
            ]}
            fields={[
                { name: "tier", label: "Tier (free, premium, ultra)", type: "text" },
                { name: "name", label: "Name", type: "text" },
                { name: "description", label: "Description", type: "textarea" },
                { name: "price_cents", label: "Price (Cents)", type: "number" },
                { name: "currency", label: "Currency", type: "text", defaultValue: "USD" },
                { name: "billing_period", label: "Billing Period", type: "text", defaultValue: "monthly" },
                { name: "max_documents", label: "Max Documents", type: "number" },
                { name: "max_batteries", label: "Max Batteries", type: "number" },
                { name: "is_active", label: "Is Active", type: "boolean" },
            ]}
        />
    );
}

export default GlobalPlans;

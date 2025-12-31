import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";

export function GlobalSubscriptions() {
    return (
        <GlobalCrudPage
            title="Global Subscriptions"
            resource="subscriptions"
            columns={[
                { header: "User", accessor: "user" },
                { header: "Plan", accessor: "plan" },
                { header: "Status", accessor: "status" },
                { header: "Provider", accessor: "provider" },
            ]}
            fields={[
                { name: "user", label: "User ID", type: "number" },
                { name: "plan", label: "Plan ID", type: "number" },
                { name: "status", label: "Status (active, canceled, etc)", type: "text" },
                { name: "provider", label: "Provider (stripe, paypal)", type: "text" },
                { name: "provider_subscription_id", label: "Provider Sub ID", type: "text" },
            ]}
        />
    );
}

export default GlobalSubscriptions;

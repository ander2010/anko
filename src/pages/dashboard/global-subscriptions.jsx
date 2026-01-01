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
                {
                    name: "user",
                    label: "User",
                    type: "select-resource",
                    resource: "users",
                    labelAccessor: "email", // Assuming user has email
                    valueAccessor: "id"
                },
                {
                    name: "plan",
                    label: "Plan",
                    type: "select-resource",
                    resource: "plans",
                    labelAccessor: "name",
                    valueAccessor: "id"
                },
                { name: "status", label: "Status (active, canceled, etc)", type: "text" },
                { name: "provider", label: "Provider (stripe, paypal)", type: "text" },
                { name: "provider_subscription_id", label: "Provider Sub ID", type: "text" },
            ]}
        />
    );
}

export default GlobalSubscriptions;

import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";

export function GlobalInvites() {
    return (
        <GlobalCrudPage
            title="Global Invites"
            resource="invites"
            columns={[
                { header: "Email", accessor: "email" },
                { header: "Role", accessor: "role" },
                { header: "Invited By", accessor: "invited_by" },
                { header: "Accepted", accessor: "accepted" },
            ]}
            fields={[
                { name: "email", label: "Email", type: "email" },
                {
                    name: "role",
                    label: "Role",
                    type: "select-resource",
                    resource: "roles",
                    labelAccessor: "name",
                    valueAccessor: "id"
                },
                {
                    name: "invited_by",
                    label: "Invited By",
                    type: "select-resource",
                    resource: "users",
                    labelAccessor: "email",
                    valueAccessor: "id"
                },
            ]}
        />
    );
}

export default GlobalInvites;

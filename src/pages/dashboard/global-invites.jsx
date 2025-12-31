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
                { name: "role", label: "Role ID", type: "number" },
                { name: "invited_by", label: "Invited By (User ID)", type: "number" },
            ]}
        />
    );
}

export default GlobalInvites;

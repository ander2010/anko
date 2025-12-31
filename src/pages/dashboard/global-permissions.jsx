import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";

export function GlobalPermissions() {
    return (
        <GlobalCrudPage
            title="Global Permissions"
            resource="permissions"
            columns={[
                { header: "Resource", accessor: "resource" },
                { header: "Action", accessor: "action" },
                { header: "Code", accessor: "code" },
            ]}
            fields={[
                { name: "resource", label: "Resource ID", type: "number" },
                { name: "action", label: "Action (view, create, update, delete, manage, custom)", type: "text" },
                { name: "code", label: "Code (Optional)", type: "text" },
            ]}
        />
    );
}

export default GlobalPermissions;

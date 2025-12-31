import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";

export function GlobalRoles() {
    return (
        <GlobalCrudPage
            title="Global Roles"
            resource="roles"
            columns={[
                { header: "ID", accessor: "id" },
                { header: "Name", accessor: "name" },
                { header: "Description", accessor: "description" },
            ]}
            fields={[
                { name: "name", label: "Role Name", type: "text" },
                { name: "description", label: "Description", type: "textarea" },
            ]}
        />
    );
}

export default GlobalRoles;

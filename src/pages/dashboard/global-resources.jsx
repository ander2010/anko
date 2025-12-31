import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";

export function GlobalResources() {
    return (
        <GlobalCrudPage
            title="Global Resources"
            resource="resources"
            columns={[
                { header: "Key", accessor: "key" },
                { header: "Name", accessor: "name" },
                { header: "Description", accessor: "description" },
            ]}
            fields={[
                { name: "key", label: "Key (Slug)", type: "text" },
                { name: "name", label: "Name", type: "text" },
                { name: "description", label: "Description", type: "textarea" },
            ]}
        />
    );
}

export default GlobalResources;

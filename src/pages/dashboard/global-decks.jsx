import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";

export function GlobalDecks() {
    return (
        <GlobalCrudPage
            title="Global Decks"
            resource="decks"
            columns={[
                { header: "Name", accessor: "name" },
                { header: "Owner", accessor: "owner" },
                { header: "Public", accessor: "is_public" },
            ]}
            fields={[
                { name: "name", label: "Name", type: "text" },
                { name: "description", label: "Description", type: "textarea" },
                {
                    name: "owner",
                    label: "Owner",
                    type: "select-resource",
                    resource: "users",
                    labelAccessor: "email",
                    valueAccessor: "id"
                },
                { name: "is_public", label: "Is Public", type: "boolean" },
            ]}
        />
    );
}

export default GlobalDecks;

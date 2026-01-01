import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";

export function GlobalDeckShares() {
    return (
        <GlobalCrudPage
            title="Global Deck Shares"
            resource="deck-shares"
            columns={[
                { header: "Deck", accessor: "deck" },
                { header: "Shared With", accessor: "shared_with" },
                { header: "Permission", accessor: "permission" },
            ]}
            fields={[
                {
                    name: "deck",
                    label: "Deck",
                    type: "select-resource",
                    resource: "decks",
                    labelAccessor: "name",
                    valueAccessor: "id"
                },
                {
                    name: "shared_with",
                    label: "Shared With",
                    type: "select-resource",
                    resource: "users",
                    labelAccessor: "email",
                    valueAccessor: "id"
                },
                { name: "permission", label: "Permission", type: "text" },
            ]}
        />
    );
}

export default GlobalDeckShares;

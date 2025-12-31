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
                { name: "deck", label: "Deck ID", type: "number" },
                { name: "shared_with", label: "User ID", type: "number" },
                { name: "permission", label: "Permission", type: "text" },
            ]}
        />
    );
}

export default GlobalDeckShares;

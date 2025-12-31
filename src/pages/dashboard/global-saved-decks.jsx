import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";

export function GlobalSavedDecks() {
    return (
        <GlobalCrudPage
            title="Global Saved Decks"
            resource="saved-decks"
            columns={[
                { header: "User", accessor: "user" },
                { header: "Deck", accessor: "deck" },
                { header: "Saved At", accessor: "saved_at" },
            ]}
            fields={[
                { name: "user", label: "User ID", type: "number" },
                { name: "deck", label: "Deck ID", type: "number" },
            ]}
        />
    );
}

export default GlobalSavedDecks;

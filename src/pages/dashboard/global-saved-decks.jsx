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
                {
                    name: "user",
                    label: "User",
                    type: "select-resource",
                    resource: "users",
                    labelAccessor: "email",
                    valueAccessor: "id"
                },
                {
                    name: "deck",
                    label: "Deck",
                    type: "select-resource",
                    resource: "decks",
                    labelAccessor: "name",
                    valueAccessor: "id"
                },
            ]}
        />
    );
}

export default GlobalSavedDecks;

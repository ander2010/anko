import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";

export function GlobalFlashcards() {
    return (
        <GlobalCrudPage
            title="Global Flashcards"
            resource="flashcards"
            columns={[
                { header: "Deck", accessor: "deck" },
                { header: "Front", accessor: "front" },
                { header: "Back", accessor: "back" },
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
                { name: "front", label: "Front Content", type: "textarea" },
                { name: "back", label: "Back Content", type: "textarea" },
            ]}
        />
    );
}

export default GlobalFlashcards;

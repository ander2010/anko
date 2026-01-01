import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";
import { useLanguage } from "@/context/language-context";

export function GlobalFlashcards() {
    const { t } = useLanguage();
    return (
        <GlobalCrudPage
            title={t("global.pages.flashcards.title")}
            resource="flashcards"
            columns={[
                { header: t("global.pages.flashcards.columns.deck"), accessor: "deck" },
                { header: t("global.pages.flashcards.columns.front"), accessor: "front" },
                { header: t("global.pages.flashcards.columns.back"), accessor: "back" },
            ]}
            fields={[
                {
                    name: "deck",
                    label: t("global.pages.flashcards.fields.deck"),
                    type: "select-resource",
                    resource: "decks",
                    labelAccessor: "name",
                    valueAccessor: "id"
                },
                { name: "front", label: t("global.pages.flashcards.fields.front"), type: "textarea" },
                { name: "back", label: t("global.pages.flashcards.fields.back"), type: "textarea" },
            ]}
        />
    );
}

export default GlobalFlashcards;

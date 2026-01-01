import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";
import { useLanguage } from "@/context/language-context";

export function GlobalDecks() {
    const { t } = useLanguage();
    return (
        <GlobalCrudPage
            title={t("global.pages.decks.title")}
            resource="decks"
            columns={[
                { header: t("global.pages.decks.columns.name"), accessor: "name" },
                { header: t("global.pages.decks.columns.owner"), accessor: "owner" },
                { header: t("global.pages.decks.columns.is_public"), accessor: "is_public" },
            ]}
            fields={[
                { name: "name", label: t("global.pages.decks.fields.name"), type: "text" },
                { name: "description", label: t("global.pages.decks.fields.description"), type: "textarea" },
                {
                    name: "owner",
                    label: t("global.pages.decks.fields.owner"),
                    type: "select-resource",
                    resource: "users",
                    labelAccessor: "email",
                    valueAccessor: "id"
                },
                { name: "is_public", label: t("global.pages.decks.fields.is_public"), type: "boolean" },
            ]}
        />
    );
}

export default GlobalDecks;

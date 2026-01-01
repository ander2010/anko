import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";
import { useLanguage } from "@/context/language-context";

export function GlobalDeckShares() {
    const { t } = useLanguage();
    return (
        <GlobalCrudPage
            title={t("global.pages.deck-shares.title")}
            resource="deck-shares"
            columns={[
                { header: t("global.pages.deck-shares.columns.deck"), accessor: "deck" },
                { header: t("global.pages.deck-shares.columns.shared_with"), accessor: "shared_with" },
                { header: t("global.pages.deck-shares.columns.permission"), accessor: "permission" },
            ]}
            fields={[
                {
                    name: "deck",
                    label: t("global.pages.deck-shares.fields.deck"),
                    type: "select-resource",
                    resource: "decks",
                    labelAccessor: "name",
                    valueAccessor: "id"
                },
                {
                    name: "shared_with",
                    label: t("global.pages.deck-shares.fields.shared_with"),
                    type: "select-resource",
                    resource: "users",
                    labelAccessor: "email",
                    valueAccessor: "id"
                },
                { name: "permission", label: t("global.pages.deck-shares.fields.permission"), type: "text" },
            ]}
        />
    );
}

export default GlobalDeckShares;

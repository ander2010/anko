import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";
import { useLanguage } from "@/context/language-context";

export function GlobalDecks() {
    const { t } = useLanguage();
    return (
        <GlobalCrudPage
            title={t("global.pages.decks.title")}
            resource="admin/decks"
            disableCreate
            columns={[
                { header: "Título", accessor: "title" },
                { header: "Descripción", accessor: "description" },
                { header: "Tarjetas", accessor: "card_count" },
                { header: "Proyecto", accessor: (item) => item.project?.title || item.project?.name || item.project || "—" },
                { header: "Propietario", accessor: (item) => item.owner?.email || item.owner?.username || item.owner || "—" },
                { header: "Visibilidad", accessor: (item) => item.is_public ? "Público" : "Privado" },
                { header: "Job ID", accessor: (item) => item.external_job_id || item.job_id || "—" },
                { header: "Estado", accessor: "status" },
            ]}
            fields={[
                { name: "title", label: "Título", type: "text" },
                { name: "description", label: "Descripción", type: "textarea" },
                { name: "is_public", label: "Público", type: "boolean" },
                { name: "status", label: "Estado", type: "text" },
            ]}
        />
    );
}

export default GlobalDecks;

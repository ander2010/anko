import React from "react";
import GlobalCrudPage from "@/widgets/GlobalCrudPage";
import { useLanguage } from "@/context/language-context";

export function GlobalLearningPaths() {
    const { language } = useLanguage();

    return (
        <GlobalCrudPage
            title={language === "es" ? "Global Learning Paths" : "Global Learning Paths"}
            editTitle={language === "es" ? "Editar Learning Path" : "Edit Learning Path"}
            createTitle={language === "es" ? "Crear Learning Path" : "Create Learning Path"}
            resource="enterprise/learning-paths"
            columns={[
                { header: language === "es" ? "Título"       : "Title",       accessor: "title" },
                { header: language === "es" ? "Descripción"  : "Description", accessor: (item) => item.description ? item.description.slice(0, 60) + (item.description.length > 60 ? "…" : "") : "—" },
                { header: language === "es" ? "Empresa"      : "Company",     accessor: (item) => item.company_name || item.company?.name || item.company || "—" },
                { header: language === "es" ? "Publicado"    : "Published",   accessor: (item) => item.is_published ? "✅" : "❌" },
                { header: language === "es" ? "Módulos"      : "Modules",     accessor: (item) => item.modules_count ?? item.modules?.length ?? "—" },
                { header: language === "es" ? "Creado"       : "Created",     accessor: (item) => item.created_at ? new Date(item.created_at).toLocaleDateString() : "—" },
            ]}
            fields={[
                { name: "title",        label: language === "es" ? "Título"       : "Title",       type: "text" },
                { name: "description",  label: language === "es" ? "Descripción"  : "Description", type: "textarea" },
                { name: "is_published", label: language === "es" ? "Publicado"    : "Published",   type: "boolean" },
            ]}
        />
    );
}

export default GlobalLearningPaths;

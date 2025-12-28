import React, { useEffect, useState } from "react";
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
    IconButton,
    Chip,
    Spinner,
} from "@material-tailwind/react";
import { TrashIcon, TableCellsIcon } from "@heroicons/react/24/outline";
import projectService from "@/services/projectService";
import { ConfirmDialog } from "@/widgets/dialogs/confirm-dialog";
import { useLanguage } from "@/context/language-context";

export function GlobalSections() {
    const { t, language } = useLanguage();
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [selectedSection, setSelectedSection] = useState(null);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            setError(null);
            // 1. Fetch all projects
            let projectsData = await projectService.getProjects();
            const allProjects = Array.isArray(projectsData)
                ? projectsData
                : projectsData?.results || [];

            // 2. For each project, fetch documents with sections
            const sectionsPromises = allProjects.map(async (proj) => {
                try {
                    const docData = await projectService.getDocumentsWithSections(proj.id);
                    const docs = docData.documents || [];

                    // Extract sections from each document
                    return docs.flatMap(doc => {
                        if (!doc.sections || doc.sections.length === 0) return [];
                        return doc.sections.map(sec => ({
                            ...sec,
                            documentName: doc.filename || doc.file || `Doc ${doc.id}`,
                            projectName: proj.title || proj.name || `Project ${proj.id}`,
                            projectId: proj.id,
                            documentId: doc.id
                        }));
                    });
                } catch (e) {
                    console.error(`Failed to load sections for project ${proj.id}`, e);
                    return [];
                }
            });

            const results = await Promise.all(sectionsPromises);
            // Flatten arrays
            const allSections = results.flat();

            setSections(allSections);

        } catch (err) {
            setError(t("global.sections.loading_error"));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleDelete = (section) => {
        setSelectedSection(section);
        setConfirmDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedSection) return;
        try {
            await projectService.deleteSection(selectedSection.id);
            setConfirmDialogOpen(false);
            setSelectedSection(null);
            await fetchAllData();
        } catch (err) {
            alert("Failed to delete section");
        }
    };

    if (loading) {
        return (
            <div className="mt-12 flex flex-col items-center justify-center">
                <Spinner className="h-10 w-10 text-blue-500" />
                <Typography className="mt-4 text-blue-gray-500">{t("global.sections.loading")}</Typography>
            </div>
        );
    }

    return (
        <div className="mt-12 mb-8 flex flex-col gap-12">
            <Card>
                <CardHeader variant="gradient" color="blue" className="mb-8 p-6 flex items-center justify-between">
                    <div>
                        <Typography variant="h6" color="white">
                            {t("global.sections.title")}
                        </Typography>
                        <Typography variant="small" color="white" className="font-normal opacity-80">
                            {language === "es" ? `Se encontraron ${sections.length} secciones en total` : `All sections across ${sections.length} found`}
                        </Typography>
                    </div>
                    <Button size="sm" color="white" variant="text" onClick={fetchAllData}>
                        {t("global.sections.btn_refresh")}
                    </Button>
                </CardHeader>

                <CardBody className="px-0 pb-2">
                    {error && (
                        <div className="px-6 mb-4 text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    {sections.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <TableCellsIcon className="h-12 w-12 text-gray-400 mb-2" />
                            <Typography color="gray">{t("global.sections.no_sections")}</Typography>
                        </div>
                    ) : (
                        <div className="overflow-x-auto max-h-[70vh]">
                            <table className="w-full min-w-[640px] table-auto text-left">
                                <thead className="sticky top-0 bg-white z-10">
                                    <tr>
                                        {[
                                            "ID",
                                            t("global.sections.table.title"),
                                            t("global.sections.table.preview"),
                                            t("global.sections.table.document"),
                                            t("global.sections.table.project"),
                                            language === "es" ? "Acción" : "Action"
                                        ].map(
                                            (el) => (
                                                <th
                                                    key={el}
                                                    className="border-b border-blue-gray-50 py-3 px-5"
                                                >
                                                    <Typography
                                                        variant="small"
                                                        className="text-[11px] font-bold uppercase text-blue-gray-400"
                                                    >
                                                        {el}
                                                    </Typography>
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sections.map(
                                        (section, key) => {
                                            const className = `py-3 px-5 ${key === sections.length - 1
                                                ? ""
                                                : "border-b border-blue-gray-50"
                                                }`;

                                            return (
                                                <tr key={section.id} className="hover:bg-blue-gray-50/50">
                                                    <td className={className}>
                                                        <Typography className="text-xs font-semibold text-blue-gray-600">
                                                            {section.id}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <Typography className="text-xs font-semibold text-blue-gray-600 max-w-[150px] truncate" title={section.title}>
                                                            {section.title || (language === "es" ? "(Sin Título)" : "(No Title)")}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <Typography className="text-xs font-normal text-blue-gray-500 max-w-[200px] truncate">
                                                            {section.content}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <div className="flex flex-col">
                                                            <Typography className="text-xs font-medium text-blue-gray-900">
                                                                {section.documentName}
                                                            </Typography>
                                                            <Typography className="text-[10px] text-blue-gray-400">
                                                                ID: {section.documentId}
                                                            </Typography>
                                                        </div>
                                                    </td>
                                                    <td className={className}>
                                                        <div className="flex flex-col">
                                                            <Typography className="text-xs font-medium text-blue-600">
                                                                {section.projectName}
                                                            </Typography>
                                                            <Typography className="text-[10px] text-blue-gray-400">
                                                                ID: {section.projectId}
                                                            </Typography>
                                                        </div>
                                                    </td>
                                                    <td className={className}>
                                                        <IconButton
                                                            variant="text"
                                                            color="red"
                                                            onClick={() => handleDelete(section)}
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </IconButton>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardBody>
            </Card>

            <ConfirmDialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                title={language === "es" ? "Eliminar Sección" : "Delete Section"}
                message={language === "es"
                    ? `¿Estás seguro de que quieres eliminar la sección "${selectedSection?.title || selectedSection?.id}" del documento "${selectedSection?.documentName}"?`
                    : `Are you sure you want to delete section "${selectedSection?.title || selectedSection?.id}" from document "${selectedSection?.documentName}"?`}
                confirmText={language === "es" ? "Eliminar" : "Delete"}
                variant="danger"
            />
        </div>
    );
}

export default GlobalSections;

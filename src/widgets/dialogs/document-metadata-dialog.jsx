import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Typography,
    Chip,
    Spinner,
    Card,
    CardBody,
} from "@material-tailwind/react";
import {
    DocumentTextIcon,
    CalendarIcon,
    HashtagIcon,
    LanguageIcon,
    DocumentIcon,
    ViewColumnsIcon,
} from "@heroicons/react/24/outline";
import { useParams } from "react-router-dom";
import { useLanguage } from "@/context/language-context";
import projectService from "@/services/projectService";

export function DocumentMetadataDialog({ open, onClose, document }) {
    const { t, language } = useLanguage();
    // We assume projectId is available in URL/Params or pass it as prop if needed.
    // However, the cleanest way without refactoring parents is getting it from URL or prop.
    // DocumentMetadataDialog is used in ProjectDetail which presumably has :projectId param.
    const { projectId } = useParams();

    const [sections, setSections] = useState([]);
    const [loadingSections, setLoadingSections] = useState(false);
    const [errorSections, setErrorSections] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(false);

    useEffect(() => {
        if (open && document && projectId) {
            fetchSections();
            fetchSummary();
        } else {
            setSections([]);
            setErrorSections(null);
            setSummary(null);
        }
    }, [open, document, projectId]);

    const fetchSections = async () => {
        setLoadingSections(true);
        setErrorSections(null);
        try {
            // The API returns { projectId, documents: [ { id, sections: [...] }, ... ] }
            const data = await projectService.getDocumentsWithSections(projectId);

            // Find our specific document
            const docData = data.documents?.find(d => d.id === document.id);

            if (docData && docData.sections) {
                setSections(docData.sections);
            } else {
                setSections([]);
            }
        } catch (err) {
            console.error("Failed to fetch sections:", err);
            setErrorSections(typeof err === 'string' ? err : (err?.error || err?.detail || t("global.sections.loading_error")));
        } finally {
            setLoadingSections(false);
        }
    };

    const fetchSummary = async () => {
        setLoadingSummary(true);
        try {
            const data = await projectService.getDocumentSummary(document.id);
            setSummary(data.summary || null);
        } catch (err) {
            console.error("Failed to fetch summary:", err);
            setSummary(null);
        } finally {
            setLoadingSummary(false);
        }
    };

    if (!document) return null;

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString(language === "es" ? "es-ES" : "en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "ready": return "green";
            case "processing": return "blue";
            case "error": return "red";
            default: return "gray";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "ready": return language === "es" ? "Listo" : "Ready";
            case "processing": return language === "es" ? "Procesando" : "Processing";
            case "error": return language === "es" ? "Error" : "Error";
            default: return language === "es" ? "Desconocido" : "Unknown";
        }
    };

    return (
        <Dialog open={open} handler={onClose} size="xl" className="overflow-hidden flex flex-col max-h-[90vh]">
            <DialogHeader className="flex-none">
                <div className="flex items-center gap-3">
                    <DocumentTextIcon className="h-6 w-6 text-blue-500" />
                    <Typography variant="h5">{language === "es" ? "Metadatos y Contenido del Documento" : "Document Metadata & Content"}</Typography>
                </div>
            </DialogHeader>

            <DialogBody divider className="flex-1 overflow-y-auto p-0 flex flex-col md:flex-row">
                {/* Left Column: Metadata */}
                <div className="w-full md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-blue-gray-100 space-y-6 overflow-y-auto">

                    <div>
                        <Typography variant="small" className="text-blue-gray-500 mb-1">{language === "es" ? "Nombre de archivo" : "Filename"}</Typography>
                        <Typography className="font-medium text-blue-gray-900 break-words">{document.filename}</Typography>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Typography variant="small" className="text-blue-gray-500 mb-1">{language === "es" ? "Tipo" : "Type"}</Typography>
                            <Chip value={document.type} size="sm" color="blue" className="w-fit" />
                        </div>
                        <div>
                            <Typography variant="small" className="text-blue-gray-500 mb-1">{language === "es" ? "Tamaño" : "Size"}</Typography>
                            <Typography className="font-medium text-blue-gray-900">{formatFileSize(document.size)}</Typography>
                        </div>
                    </div>

                    <div>
                        <Typography variant="small" className="text-blue-gray-500 mb-1 flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" /> {language === "es" ? "Subido el" : "Uploaded At"}
                        </Typography>
                        <Typography className="font-medium text-blue-gray-900">{formatDate(document.uploadedAt)}</Typography>
                    </div>

                    <div>
                        <Typography variant="small" className="text-blue-gray-500 mb-1">{language === "es" ? "Estado de procesamiento" : "Processing Status"}</Typography>
                        <Chip value={getStatusLabel(document.status)} size="sm" color={getStatusColor(document.status)} className="w-fit" />
                    </div>

                    {/* Document Summary */}
                    <div>
                        <Typography variant="small" className="text-blue-gray-500 mb-1">{language === "es" ? "Resumen" : "Summary"}</Typography>
                        {loadingSummary ? (
                            <div className="flex items-center gap-2">
                                <Spinner className="h-4 w-4" />
                                <Typography variant="small" className="text-blue-gray-400">{language === "es" ? "Cargando..." : "Loading..."}</Typography>
                            </div>
                        ) : summary ? (
                            <div className="bg-blue-gray-50 p-3 rounded-lg border border-blue-gray-100">
                                <Typography variant="small" className="text-blue-gray-700 leading-relaxed">
                                    {summary}
                                </Typography>
                            </div>
                        ) : (
                            <Typography variant="small" className="text-blue-gray-400 italic">
                                {language === "es" ? "No disponible" : "Not available"}
                            </Typography>
                        )}
                    </div>

                    {document.tags && document.tags.length > 0 && (
                        <div>
                            <Typography variant="small" className="text-blue-gray-500 mb-2">Tags</Typography>
                            <div className="flex flex-wrap gap-2">
                                {document.tags.map((tag, index) => (
                                    <Chip key={index} value={tag} size="sm" variant="ghost" />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Sections content */}
                <div className="w-full md:w-2/3 p-6 bg-gray-50 overflow-y-auto">
                    <div className="flex items-center gap-2 mb-4">
                        <ViewColumnsIcon className="h-5 w-5 text-blue-gray-700" />
                        <Typography variant="h6" color="blue-gray">{language === "es" ? "Secciones Extraídas" : "Extracted Sections"}</Typography>
                    </div>

                    {loadingSections ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Spinner className="h-8 w-8 text-blue-500 mb-2" />
                            <Typography color="blue-gray" className="font-medium">{t("global.sections.loading")}</Typography>
                        </div>
                    ) : errorSections ? (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-500 text-sm text-center">
                            {errorSections}
                        </div>
                    ) : sections.length > 0 ? (
                        <div className="space-y-3">
                            {sections.map((section, index) => (
                                <div
                                    key={section.id}
                                    className="group relative bg-white rounded-xl border border-blue-gray-100 hover:border-indigo-200 transition-all duration-200 overflow-hidden hover:shadow-md"
                                >
                                    {/* Gradient accent bar */}
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                                    <div className="p-4 pl-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center flex-shrink-0">
                                                        <Typography className="text-xs font-black text-indigo-600">
                                                            {section.order}
                                                        </Typography>
                                                    </div>
                                                    <Typography variant="h6" className="font-bold text-blue-gray-900 truncate">
                                                        {section.title
                                                            ? section.title.charAt(0).toUpperCase() + section.title.slice(1)
                                                            : (language === "es" ? "Sección sin título" : "Untitled Section")}
                                                    </Typography>
                                                </div>
                                                {/* {section.content && (
                                                    <Typography variant="small" className="text-blue-gray-500 line-clamp-2 mt-2">
                                                        {section.content.substring(0, 120)}...
                                                    </Typography>
                                                )} */}
                                            </div>
                                            <Chip
                                                value={language === "es" ? "Sección" : "Section"}
                                                size="sm"
                                                variant="ghost"
                                                color="indigo"
                                                className="rounded-full flex-shrink-0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-blue-gray-400">
                            <DocumentIcon className="h-12 w-12 mb-3 opacity-50" />
                            <Typography>No sections found for this document.</Typography>
                        </div>
                    )}
                </div>
            </DialogBody>
            <DialogFooter className="flex-none border-t border-blue-gray-50">
                <Button variant="gradient" color="blue" onClick={onClose}>
                    {language === "es" ? "Cerrar" : "Close"}
                </Button>
            </DialogFooter>
        </Dialog>
    );
}

DocumentMetadataDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    document: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        filename: PropTypes.string.isRequired,
        type: PropTypes.string,
        size: PropTypes.number,
        uploadedAt: PropTypes.string,
        status: PropTypes.string,
        hash: PropTypes.string,
        language: PropTypes.string,
        pages: PropTypes.number,
        tags: PropTypes.arrayOf(PropTypes.string),
    }),
};

export default DocumentMetadataDialog;

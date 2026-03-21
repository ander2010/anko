import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Typography,
    IconButton,
    Spinner,
} from "@material-tailwind/react";
import {
    XMarkIcon,
    ArrowTopRightOnSquareIcon,
    DocumentIcon,
    ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "@/context/language-context";
import projectService, { API_BASE } from "@/services/projectService";

export function DocumentViewerDialog({ open, onClose, document, page }) {
    const { language } = useLanguage();
    const [fileUrl, setFileUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [docMetadata, setDocMetadata] = useState(document || {});

    useEffect(() => {
        setDocMetadata(document || {});
    }, [document]);

    useEffect(() => {
        if (open && document?.id) {
            fetchUrl();
        } else {
            // Cleanup blob URL if it exists
            if (fileUrl && fileUrl.startsWith('blob:')) {
                URL.revokeObjectURL(fileUrl);
            }
            setFileUrl(null);
            setError(null);
        }

        // Cleanup on unmount
        return () => {
            if (fileUrl && fileUrl.startsWith('blob:')) {
                URL.revokeObjectURL(fileUrl);
            }
        };
    }, [open, document?.id]);

    const fetchUrl = async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. Get the document URL from backend (presigned or internal)
            const data = await projectService.getDocumentDownloadUrl(document.id, 'view');
            let targetUrl = data.url;

            // Update metadata if we got a filename back
            if (data.filename) {
                setDocMetadata(prev => ({ ...prev, filename: data.filename }));
            }

            // Normalize relative URLs
            if (targetUrl && targetUrl.startsWith('/')) {
                const origin = API_BASE.replace('/api', '');
                targetUrl = `${origin}${targetUrl}`;
            }

            try {
                // 2. Attempt to fetch with Token to get a Blob (best for internal files)
                const blobUrl = await projectService.fetchDocumentWithAuth(targetUrl);
                setFileUrl(blobUrl);
            } catch (fetchErr) {
                console.warn("fetchDocumentWithAuth failed, falling back to direct URL:", fetchErr);
                setFileUrl(targetUrl);
            }
        } catch (err) {
            console.error("Error fetching document URL:", err);
            setError(language === "es" ? "Error al obtener la URL del documento" : "Error fetching document URL");
        } finally {
            setLoading(false);
        }
    };

    if (!document) return null;

    const isPDF =
        docMetadata.filename?.toLowerCase().endsWith(".pdf") ||
        docMetadata.type === "pdf" ||
        fileUrl?.toLowerCase().includes(".pdf");

    const iframeSrc = fileUrl
        ? isPDF && page
            ? `${fileUrl}#page=${page}`
            : fileUrl
        : null;

    return (
        <Dialog open={open} handler={onClose} size="xl" className="h-[90vh] flex flex-col">
            <DialogHeader className="flex justify-between items-center py-3 px-6 border-b border-blue-gray-50 flex-none">
                <div className="flex items-center gap-3">
                    <DocumentIcon className="h-6 w-6 text-blue-500" />
                    <Typography variant="small" color="blue-gray" className="truncate max-w-[45vw] font-bold md:text-lg">
                        {docMetadata.filename || (language === "es" ? "Cargando..." : "Loading...")}
                    </Typography>
                </div>
                <div className="flex items-center gap-2">
                    {fileUrl && (
                        <IconButton
                            variant="text"
                            color="blue-gray"
                            onClick={() => window.open(fileUrl, "_blank")}
                            title={language === "es" ? "Abrir en nueva pestaña" : "Open in new tab"}
                        >
                            <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                        </IconButton>
                    )}
                    <IconButton variant="text" color="blue-gray" onClick={onClose} className="rounded-full">
                        <XMarkIcon className="h-6 w-6" strokeWidth={2} />
                    </IconButton>
                </div>
            </DialogHeader>

            <DialogBody className="flex-1 p-0 overflow-hidden bg-blue-gray-50/20 relative">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <Spinner className="h-10 w-10 text-blue-500 mb-4" />
                        <Typography color="blue-gray" className="font-medium">
                            {language === "es" ? "Cargando documento..." : "Loading document..."}
                        </Typography>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full p-4 md:p-12 text-center">
                        <ExclamationCircleIcon className="h-16 w-16 text-red-400 mb-4" />
                        <Typography variant="h6" color="red" className="mb-2">
                            {error}
                        </Typography>
                        <Button color="blue" onClick={fetchUrl} className="mt-4">
                            {language === "es" ? "Reintentar" : "Retry"}
                        </Button>
                    </div>
                ) : iframeSrc ? (
                    <iframe
                        src={iframeSrc}
                        title={docMetadata.filename || "Document Viewer"}
                        className="w-full h-full border-none"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full p-4 md:p-12 text-center">
                        <DocumentIcon className="h-20 w-20 text-blue-gray-200 mb-4" />
                        <Typography variant="h6" color="blue-gray" className="mb-2">
                            {language === "es" ? "Vista previa no disponible" : "Preview not available"}
                        </Typography>
                        <Typography className="text-blue-gray-500 mb-6 max-w-sm">
                            {language === "es"
                                ? "No se pudo obtener la URL del documento."
                                : "Could not retrieve the document URL."
                            }
                        </Typography>
                    </div>
                )}
            </DialogBody>

            <DialogFooter className="py-3 px-6 border-t border-blue-gray-50 flex-none">
                <Button variant="gradient" color="blue" onClick={onClose}>
                    {language === "es" ? "Cerrar" : "Close"}
                </Button>
            </DialogFooter>
        </Dialog>
    );
}

DocumentViewerDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    page: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    document: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        filename: PropTypes.string,
        url: PropTypes.string,
        file: PropTypes.string,
        file_url: PropTypes.string,
        type: PropTypes.string,
    }),
};

export default DocumentViewerDialog;

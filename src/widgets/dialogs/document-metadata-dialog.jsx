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
import projectService from "../../services/projectService";
import { useParams } from "react-router-dom";

export function DocumentMetadataDialog({ open, onClose, document }) {
    // We assume projectId is available in URL/Params or pass it as prop if needed.
    // However, the cleanest way without refactoring parents is getting it from URL or prop.
    // DocumentMetadataDialog is used in ProjectDetail which presumably has :projectId param.
    const { projectId } = useParams();

    const [sections, setSections] = useState([]);
    const [loadingSections, setLoadingSections] = useState(false);
    const [errorSections, setErrorSections] = useState(null);

    useEffect(() => {
        if (open && document && projectId) {
            fetchSections();
        } else {
            setSections([]);
            setErrorSections(null);
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
            setErrorSections(typeof err === 'string' ? err : (err?.error || err?.detail || "Could not load sections. Check console/network."));
        } finally {
            setLoadingSections(false);
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
        return new Date(dateString).toLocaleString("en-US", {
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
            case "ready": return "Ready";
            case "processing": return "Processing";
            case "error": return "Error";
            default: return "Unknown";
        }
    };

    return (
        <Dialog open={open} handler={onClose} size="xl" className="overflow-hidden flex flex-col max-h-[90vh]">
            <DialogHeader className="flex-none">
                <div className="flex items-center gap-3">
                    <DocumentTextIcon className="h-6 w-6 text-blue-500" />
                    <Typography variant="h5">Document Metadata & Content</Typography>
                </div>
            </DialogHeader>

            <DialogBody divider className="flex-1 overflow-y-auto p-0 flex flex-col md:flex-row">
                {/* Left Column: Metadata */}
                <div className="w-full md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-blue-gray-100 space-y-6 overflow-y-auto">

                    <div>
                        <Typography variant="small" className="text-blue-gray-500 mb-1">Filename</Typography>
                        <Typography className="font-medium text-blue-gray-900 break-words">{document.filename}</Typography>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Typography variant="small" className="text-blue-gray-500 mb-1">Type</Typography>
                            <Chip value={document.type} size="sm" color="blue" className="w-fit" />
                        </div>
                        <div>
                            <Typography variant="small" className="text-blue-gray-500 mb-1">Size</Typography>
                            <Typography className="font-medium text-blue-gray-900">{formatFileSize(document.size)}</Typography>
                        </div>
                    </div>

                    <div>
                        <Typography variant="small" className="text-blue-gray-500 mb-1 flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" /> Uploaded At
                        </Typography>
                        <Typography className="font-medium text-blue-gray-900">{formatDate(document.uploadedAt)}</Typography>
                    </div>

                    <div>
                        <Typography variant="small" className="text-blue-gray-500 mb-1">Processing Status</Typography>
                        <Chip value={getStatusLabel(document.status)} size="sm" color={getStatusColor(document.status)} className="w-fit" />
                    </div>

                    <div>
                        <Typography variant="small" className="text-blue-gray-500 mb-1 flex items-center gap-1">
                            <HashtagIcon className="h-4 w-4" /> Internal ID
                        </Typography>
                        <Typography className="font-mono text-xs text-blue-gray-700 break-all">{document.hash || document.id}</Typography>
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
                        <Typography variant="h6" color="blue-gray">Extracted Sections</Typography>
                    </div>

                    {loadingSections ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Spinner className="h-8 w-8 text-blue-500 mb-2" />
                            <Typography color="blue-gray" className="font-medium">Loading sections...</Typography>
                        </div>
                    ) : errorSections ? (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-500 text-sm text-center">
                            {errorSections}
                        </div>
                    ) : sections.length > 0 ? (
                        <div className="space-y-4">
                            {sections.map((section) => (
                                <Card key={section.id} className="shadow-sm border border-blue-gray-100">
                                    <CardBody className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <Typography variant="subtitle1" className="font-bold text-blue-gray-900">
                                                {section.title || "Untitled Section"}
                                            </Typography>
                                            <Chip value={`Order: ${section.order}`} size="sm" variant="ghost" className="rounded-full" />
                                        </div>
                                        <div className="prose prose-sm max-w-none text-blue-gray-700 bg-gray-50 p-3 rounded border border-gray-100 overflow-x-auto">
                                            <pre className="whitespace-pre-wrap font-sans text-sm">{section.content}</pre>
                                        </div>
                                    </CardBody>
                                </Card>
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
                    Close
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

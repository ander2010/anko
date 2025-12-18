import React from "react";
import PropTypes from "prop-types";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Typography,
    Chip,
} from "@material-tailwind/react";
import {
    DocumentTextIcon,
    CalendarIcon,
    HashtagIcon,
    LanguageIcon,
    DocumentIcon,
} from "@heroicons/react/24/outline";

export function DocumentMetadataDialog({ open, onClose, document }) {
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
            case "ready":
                return "green";
            case "processing":
                return "blue";
            case "error":
                return "red";
            default:
                return "gray";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "ready":
                return "Ready";
            case "processing":
                return "Processing";
            case "error":
                return "Error";
            default:
                return "Unknown";
        }
    };

    return (
        <Dialog open={open} handler={onClose} size="md">
            <DialogHeader>
                <div className="flex items-center gap-3">
                    <DocumentTextIcon className="h-6 w-6 text-blue-500" />
                    <Typography variant="h5">Document Metadata</Typography>
                </div>
            </DialogHeader>
            <DialogBody divider className="space-y-4">
                {/* Filename */}
                <div>
                    <Typography variant="small" className="text-blue-gray-500 mb-1">
                        Filename
                    </Typography>
                    <Typography className="font-medium text-blue-gray-900">
                        {document.filename}
                    </Typography>
                </div>

                {/* Type and Size */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Typography variant="small" className="text-blue-gray-500 mb-1">
                            Type
                        </Typography>
                        <Chip value={document.type} size="sm" color="blue" className="w-fit" />
                    </div>
                    <div>
                        <Typography variant="small" className="text-blue-gray-500 mb-1">
                            Size
                        </Typography>
                        <Typography className="font-medium text-blue-gray-900">
                            {formatFileSize(document.size)}
                        </Typography>
                    </div>
                </div>

                {/* Upload Date */}
                <div>
                    <Typography variant="small" className="text-blue-gray-500 mb-1 flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        Uploaded At
                    </Typography>
                    <Typography className="font-medium text-blue-gray-900">
                        {formatDate(document.uploadedAt)}
                    </Typography>
                </div>

                {/* Status */}
                <div>
                    <Typography variant="small" className="text-blue-gray-500 mb-1">
                        Processing Status
                    </Typography>
                    <Chip
                        value={getStatusLabel(document.status)}
                        size="sm"
                        color={getStatusColor(document.status)}
                        className="w-fit"
                    />
                </div>

                {/* Hash/ID */}
                <div>
                    <Typography variant="small" className="text-blue-gray-500 mb-1 flex items-center gap-1">
                        <HashtagIcon className="h-4 w-4" />
                        Internal ID
                    </Typography>
                    <Typography className="font-mono text-sm text-blue-gray-700">
                        {document.hash}
                    </Typography>
                </div>

                {/* Language (if detected) */}
                {document.language && (
                    <div>
                        <Typography variant="small" className="text-blue-gray-500 mb-1 flex items-center gap-1">
                            <LanguageIcon className="h-4 w-4" />
                            Detected Language
                        </Typography>
                        <Typography className="font-medium text-blue-gray-900">
                            {document.language}
                        </Typography>
                    </div>
                )}

                {/* Pages (if PDF) */}
                {document.pages && (
                    <div>
                        <Typography variant="small" className="text-blue-gray-500 mb-1 flex items-center gap-1">
                            <DocumentIcon className="h-4 w-4" />
                            Pages
                        </Typography>
                        <Typography className="font-medium text-blue-gray-900">
                            {document.pages}
                        </Typography>
                    </div>
                )}

                {/* Tags */}
                <div>
                    <Typography variant="small" className="text-blue-gray-500 mb-2">
                        Tags
                    </Typography>
                    {document.tags && document.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {document.tags.map((tag, index) => (
                                <Chip key={index} value={tag} size="sm" variant="ghost" />
                            ))}
                        </div>
                    ) : (
                        <Typography variant="small" className="text-blue-gray-400 italic">
                            No tags assigned
                        </Typography>
                    )}
                </div>
            </DialogBody>
            <DialogFooter>
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
        id: PropTypes.string.isRequired,
        filename: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        size: PropTypes.number.isRequired,
        uploadedAt: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        hash: PropTypes.string.isRequired,
        language: PropTypes.string,
        pages: PropTypes.number,
        tags: PropTypes.arrayOf(PropTypes.string),
    }),
};

export default DocumentMetadataDialog;

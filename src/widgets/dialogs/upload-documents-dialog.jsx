import React, { useState } from "react";
import PropTypes from "prop-types";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Typography,
} from "@material-tailwind/react";
import {
    DocumentArrowUpIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";

export function UploadDocumentsDialog({ open, onClose, onUpload }) {
    const [files, setFiles] = useState([]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles((prev) => [...prev, ...selectedFiles]);
    };

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
    };

    const handleSubmit = () => {
        if (files.length > 0) {
            onUpload(files);
            setFiles([]);
            onClose();
        }
    };

    const handleClose = () => {
        setFiles([]);
        onClose();
    };

    return (
        <Dialog open={open} handler={handleClose} size="md">
            <DialogHeader>
                <Typography variant="h5">Upload Documents</Typography>
            </DialogHeader>
            <DialogBody divider className="space-y-4 max-h-[60vh] overflow-y-auto">
                {/* File Upload Zone */}
                <label
                    htmlFor="doc-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-blue-gray-200 border-dashed rounded-lg cursor-pointer bg-blue-gray-50 hover:bg-blue-gray-100 transition-colors"
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <DocumentArrowUpIcon className="w-10 h-10 mb-3 text-blue-gray-400" />
                        <Typography variant="small" className="text-blue-gray-600">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                        </Typography>
                        <Typography variant="small" className="text-blue-gray-500">
                            PDF, DOCX, TXT, etc.
                        </Typography>
                    </div>
                    <input
                        id="doc-upload"
                        type="file"
                        className="hidden"
                        multiple
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.txt,.md"
                    />
                </label>

                {/* Selected Files List */}
                {files.length > 0 && (
                    <div className="space-y-2">
                        <Typography variant="small" color="blue-gray" className="font-medium">
                            Selected Files ({files.length})
                        </Typography>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {files.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-2 bg-blue-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <DocumentArrowUpIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <Typography
                                                variant="small"
                                                className="font-medium text-blue-gray-900 truncate"
                                            >
                                                {file.name}
                                            </Typography>
                                            <Typography variant="small" className="text-blue-gray-500">
                                                {formatFileSize(file.size)}
                                            </Typography>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="text"
                                        color="red"
                                        className="p-2"
                                        onClick={() => removeFile(index)}
                                    >
                                        <XMarkIcon className="w-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </DialogBody>
            <DialogFooter className="gap-2">
                <Button variant="text" color="blue-gray" onClick={handleClose}>
                    Cancel
                </Button>
                <Button
                    variant="gradient"
                    color="blue"
                    onClick={handleSubmit}
                    disabled={files.length === 0}
                >
                    Upload {files.length > 0 && `(${files.length})`}
                </Button>
            </DialogFooter>
        </Dialog>
    );
}

UploadDocumentsDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onUpload: PropTypes.func.isRequired,
};

export default UploadDocumentsDialog;

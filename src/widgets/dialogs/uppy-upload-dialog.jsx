import React, { useState, useEffect } from "react";
import Uppy from "@uppy/core";
import { Dashboard } from "@uppy/react";
import AwsS3 from "@uppy/aws-s3";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    IconButton,
    Typography,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

// Import styles
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";

import projectService from "@/services/projectService";
import { useJobs } from "@/context/job-context";

// Helper to calculate SHA-256 hash of a file
async function calculateSHA256(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Helper to sanitize filename (matches server logic)
function sanitizeFilename(filename) {
    return filename
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9._-]/g, '')
        .replace(/_{2,}/g, '_');
}

export function UppyUploadDialog({ open, onClose, project }) {
    const { addJob } = useJobs();
    const [uppy] = useState(() => {
        const u = new Uppy({
            id: "uppy-uploader",
            autoProceed: false,
            restrictions: {
                maxFileSize: 500 * 1024 * 1024, // 500MB
                maxNumberOfFiles: 20,
            },
        });

        u.use(AwsS3, {
            endpoint: "/companion",
            limit: 5,
            shouldUseMultipart: () => true,
        });

        return u;
    });

    useEffect(() => {
        if (project && project.id) {
            const userId = project.owner?.id || project.owner_id;
            console.log("[Uppy] Setting meta:", { project_id: project.id, user_id: userId });
            uppy.setMeta({
                project_id: project.id,
                user_id: userId
            });
        }
    }, [project, uppy]);

    useEffect(() => {
        const handleFileAdded = (file) => {
            const sanitized = sanitizeFilename(file.name);
            console.log(`[Uppy] File added, sanitizing name: "${file.name}" -> "${sanitized}"`);
            uppy.setFileMeta(file.id, { name: sanitized });
        };
        uppy.on("file-added", handleFileAdded);
        return () => uppy.off("file-added", handleFileAdded);
    }, [uppy]);

    useEffect(() => {
        const handleComplete = async (result) => {
            console.log("Upload complete:", result.successful);
            if (result.successful.length > 0) {
                for (const file of result.successful) {
                    try {
                        const fileHash = await calculateSHA256(file.data);
                        const userId = project.owner?.id || project.owner_id;

                        // Extract the key from various possible locations in the result
                        let fileKey = file.s3Multipart?.key || file.meta.key || file.meta.name;

                        if (!fileKey && file.uploadURL) {
                            try {
                                const url = new URL(file.uploadURL);
                                fileKey = url.pathname.startsWith("/") ? url.pathname.substring(1) : url.pathname;
                            } catch (e) {
                                console.error("Error parsing uploadURL:", e);
                            }
                        }

                        // Ensure the fileKey includes the documents/{userId}/ prefix
                        if (fileKey && !fileKey.includes(`documents/${userId}/`)) {
                            if (!fileKey.includes("/")) {
                                fileKey = `documents/${userId}/${fileKey}`;
                            }
                        }

                        const registrationData = {
                            project_id: project.id,
                            filename: file.name, // Original name for display
                            file_key: fileKey || `documents/${userId}/${sanitizeFilename(file.name)}`,
                            size: file.size,
                            type: file.type === "application/pdf" ? "PDF" : "PDF",
                            hash: fileHash
                        };

                        console.log("[Uppy] Registering document:", registrationData);
                        const response = await projectService.registerDocument(registrationData);
                        console.log("[Uppy] Document registered response:", response);

                        if (response.ws_url && response.document?.id) {
                            addJob({
                                id: response.document.job_id || response.external?.job_id || `reg-${response.document.id}`,
                                type: "document",
                                projectId: project.id,
                                docId: response.document.id,
                                ws_url: response.ws_url
                            });
                        }
                    } catch (err) {
                        console.error("Error registering uploaded file:", file.name, err);
                    }
                }
            }
        };

        uppy.on("complete", handleComplete);
        return () => uppy.off("complete", handleComplete);
    }, [uppy, project, addJob]);

    return (
        <Dialog
            open={open}
            handler={onClose}
            size="lg"
            className="bg-white rounded-[2rem] overflow-hidden shadow-premium"
        >
            <DialogHeader className="flex items-center justify-between border-b border-zinc-100 px-8 py-6">
                <div>
                    <Typography variant="h4" className="text-zinc-900 font-black">
                        Upload Documents (S3 Multipart)
                    </Typography>
                    <Typography className="text-zinc-500 font-medium text-sm">
                        Powered by Uppy & AWS S3
                    </Typography>
                </div>
                <IconButton
                    variant="text"
                    color="zinc"
                    onClick={onClose}
                    className="rounded-full hover:bg-zinc-100 transition-colors"
                >
                    <XMarkIcon className="h-6 w-6" />
                </IconButton>
            </DialogHeader>

            <DialogBody className="p-0">
                <div className="bg-zinc-50/50">
                    <Dashboard
                        uppy={uppy}
                        width="100%"
                        height="450px"
                        inline={true}
                        proudlyDisplayPoweredByUppy={false}
                        showProgressDetails={true}
                        note="Files up to 500MB supported."
                        theme="light"
                    />
                </div>
            </DialogBody>
        </Dialog>
    );
}

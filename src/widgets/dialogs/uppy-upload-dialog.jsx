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

import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";

import projectService from "@/services/projectService";
import { useJobs } from "@/context/job-context";
import { useLanguage } from "@/context/language-context";

// -------------------- helpers --------------------
async function calculateSHA256(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function sanitizeFilename(filename) {
    return filename
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9._-]/g, "")
        .replace(/_{2,}/g, "_");
}

// -------------------- component --------------------
export function UppyUploadDialog({ open, onClose, project, onUploadSuccess }) {
    const { t } = useLanguage();
    const { addJob } = useJobs();

    const [uppy] = useState(() => {
        const u = new Uppy({
            id: "uppy-uploader",
            autoProceed: false,
            restrictions: {
                maxFileSize: 500 * 1024 * 1024,
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

    // ---------- meta ----------
    useEffect(() => {
        if (project?.id) {
            const userId = project.owner?.id || project.owner_id;
            uppy.setMeta({
                project_id: project.id,
                user_id: userId,
            });
        }
    }, [project, uppy]);

    // ---------- sanitize filenames ----------
    useEffect(() => {
        const handleFileAdded = (file) => {
            const sanitized = sanitizeFilename(file.name);
            uppy.setFileMeta(file.id, { name: sanitized });
        };

        uppy.on("file-added", handleFileAdded);
        return () => uppy.off("file-added", handleFileAdded);
    }, [uppy]);

    // ---------- upload complete ----------
    useEffect(() => {
        const handleComplete = async (result) => {
            if (!result.successful?.length) return;

            for (const file of result.successful) {
                try {
                    const userId = project.owner?.id || project.owner_id;
                    const fileHash = await calculateSHA256(file.data);

                    let fileKey =
                        file.s3Multipart?.key ||
                        file.meta?.key ||
                        file.meta?.name;

                    if (!fileKey && file.uploadURL) {
                        const url = new URL(file.uploadURL);
                        fileKey = url.pathname.replace(/^\//, "");
                    }

                    if (fileKey && !fileKey.includes(`documents/${userId}/`)) {
                        fileKey = `documents/${userId}/${fileKey}`;
                    }

                    const payload = {
                        project_id: project.id,
                        filename: file.name,
                        file_key:
                            fileKey ||
                            `documents/${userId}/${sanitizeFilename(file.name)}`,
                        size: file.size,
                        type: "PDF",
                        hash: fileHash,
                    };

                    const response =
                        await projectService.registerDocument(payload);

                    if (response?.ws_url && response?.document?.id) {
                        addJob({
                            id:
                                response.document.job_id ||
                                response.external?.job_id ||
                                `doc-${response.document.id}`,
                            type: "document",
                            projectId: project.id,
                            docId: response.document.id,
                            ws_url: response.ws_url,
                        });
                    }
                } catch (err) {
                    console.error("Register error:", err);
                }
            }

            if (onUploadSuccess) {
                setTimeout(onUploadSuccess, 800);
            }
        };

        uppy.on("complete", handleComplete);
        return () => uppy.off("complete", handleComplete);
    }, [uppy, project, addJob, onUploadSuccess]);

    // -------------------- UI --------------------
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
                        {t?.("project_detail.docs.btn_upload") ||
                            "Upload Documents"}
                    </Typography>

                </div>
                <IconButton
                    variant="text"
                    color="zinc"
                    onClick={onClose}
                    className="rounded-full hover:bg-zinc-100"
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
                        inline
                        proudlyDisplayPoweredByUppy={false}
                        showProgressDetails
                        note="Files up to 500MB supported."
                        theme="light"
                    />
                </div>
            </DialogBody>
        </Dialog>
    );
}

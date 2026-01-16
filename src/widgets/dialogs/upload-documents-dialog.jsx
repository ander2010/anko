import React, { useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Typography,
} from "@material-tailwind/react";
import { useLanguage } from "@/context/language-context";
import { API_BASE } from "../../services/projectService"; // Ensure this import works

import Uppy from "@uppy/core";
import XHRUpload from "@uppy/xhr-upload";
import { Dashboard } from "@uppy/react";

export function UploadDocumentsDialog({ open, onClose, onUpload, project }) {
  const { t } = useLanguage();

  const uppy = useMemo(() => {
    const u = new Uppy({
      id: 'doc-uploader',
      autoProceed: false,
      restrictions: {
        maxFileSize: 400 * 1024 * 1024,
        allowedFileTypes: ['.pdf', '.doc', '.docx', '.txt', '.md'],
      },
    }).use(XHRUpload, {
      endpoint: 'placeholder',
      formData: true,
      fieldName: 'files',
      fieldName: 'files',
      headers: {},
      bundle: true,
    });

    return u;
  }, []);

  // Update endpoint when project changes
  useEffect(() => {
    if (project?.id) {
      uppy.getPlugin('XHRUpload').setOptions({
        endpoint: `${API_BASE}/projects/${project.id}/documents/`
      });
    }
  }, [project, uppy]);

  // Inject fresh token before upload starts
  useEffect(() => {
    const handleUploadStart = () => {
      const token = localStorage.getItem("token");
      if (token) {
        uppy.getPlugin('XHRUpload').setOptions({
          headers: {
            Authorization: `Token ${token}`,
          }
        });
      }
    };

    uppy.on('upload', handleUploadStart);
    return () => {
      uppy.off('upload', handleUploadStart);
    };
  }, [uppy]);

  // Handle upload completion
  useEffect(() => {
    const handleComplete = (result) => {
      if (result.successful.length > 0) {
        if (onUpload) {
          // Extract response from the first successful file (bundle: true shares response)
          // or iterate if needed. Typically with bundle: true, it's one XHR.
          const response = result.successful[0].response?.body;
          onUpload(project.id, response);
        }
        onClose();
      }
    };

    uppy.on('complete', handleComplete);
    return () => {
      uppy.off('complete', handleComplete);
    };
  }, [uppy, onClose, onUpload]);

  const handleClose = () => {
    uppy.cancelAll();
    onClose();
  };

  if (!open) return null;

  return (
    <Dialog open={open} handler={handleClose} size="md">
      <DialogHeader>
        <div className="flex flex-col">
          <Typography variant="h5">{t("projects.dialogs.upload_docs_title")}</Typography>
          <Typography variant="small" className="text-blue-gray-500 font-normal">
            {t("projects.dialogs.upload_docs_to")}:{" "}
            <span className="font-medium">
              {project?.title || project?.name || "Project"}
            </span>
          </Typography>
        </div>
      </DialogHeader>

      <DialogBody divider className="p-0">
        <Dashboard
          uppy={uppy}
          width="100%"
          height={350}
          showProgressDetails={true}
          proudlyDisplayPoweredByUppy={false}
        />
      </DialogBody>

      <DialogFooter>
        <Button variant="text" color="blue-gray" onClick={handleClose}>
          {t("projects.dialogs.cancel")}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

UploadDocumentsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpload: PropTypes.func, // Make optional since we handle it internally now
  project: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    name: PropTypes.string,
  }),
};

export default UploadDocumentsDialog;



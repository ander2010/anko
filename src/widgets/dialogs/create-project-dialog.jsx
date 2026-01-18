import React, { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Input,
  Textarea,
  Typography,
} from "@material-tailwind/react";
import { FolderPlusIcon } from "@heroicons/react/24/outline";
import projectService, { API_BASE } from "../../services/projectService";
import { useLanguage } from "@/context/language-context";
import { useJobs } from "@/context/job-context";

import Uppy from "@uppy/core";
import XHRUpload from "@uppy/xhr-upload";
import { Dashboard } from "@uppy/react";

export function CreateProjectDialog({ open, onClose, onCreate }) {
  const { t, language } = useLanguage();
  const { addJob } = useJobs();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize Uppy
  const uppy = useMemo(() => {
    return new Uppy({
      id: 'create-project-uploader',
      autoProceed: false,
      restrictions: {
        maxFileSize: 400 * 1024 * 1024, // 400MB
        allowedFileTypes: ['.pdf', '.doc', '.docx', '.txt', '.md'],
      },
    }).use(XHRUpload, {
      endpoint: 'will-be-set-later', // Placeholder
      formData: true,
      fieldName: 'files',
      headers: {},
      // Bundle files in one request if backend supports it, otherwise separate requests
      // Standard local backend likely handles one-by-one or list.
      // Assuming 'files' takes multiple, bundle: true might be needed if the endpoint expects a list.
      // Checking projectService: sends FormData with multiple "files" entries.
      bundle: false,
    });
  }, []);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = language === "es" ? "El nombre del proyecto es obligatorio" : "Project name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // 1) Create project
      const created = await projectService.createProject({
        title: formData.name,
        description: formData.description,
      });

      // Capture job IDs from successful uploads if needed
      // Actually, since uppy.upload() is called, we should listen for success
      const successHandler = (file, response) => {
        const body = response.body;
        if (body.processing) {
          body.processing.forEach(p => {
            const jobId = p.external?.job_id;
            if (jobId) {
              addJob({
                id: String(jobId),
                type: 'document',
                projectId: String(created.id),
                docId: String(p.document?.id)
              });
            }
          });
        }
      };

      uppy.on('upload-success', successHandler);

      // 2) Upload documents if any added to Uppy
      const files = uppy.getFiles();
      if (files.length > 0) {
        // Update endpoint with new project ID
        uppy.getPlugin('XHRUpload').setOptions({
          endpoint: `${API_BASE}/projects/${created.id}/documents/`
        });

        await uppy.upload();
      }

      onCreate(created);
      handleClose();

    } catch (err) {
      console.error(err);
      const msg = err?.detail || err?.error || (language === "es" ? "Error al crear el proyecto" : "Failed to create project");
      setErrors((prev) => ({ ...prev, submit: msg }));
      // If upload failed but project created, we might want to warn user, but for now just show error.
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: "", description: "" });
    setErrors({});
    uppy.cancelAll(); // Clear files
    onClose();
  };

  return (
    <Dialog
      open={open}
      handler={handleClose}
      size="md"
      className="bg-white shadow-2xl rounded-3xl overflow-hidden ring-1 ring-zinc-900/5"
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <DialogHeader className="relative p-0 overflow-hidden bg-zinc-50 border-b border-zinc-100">
          <div className="px-6 py-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <FolderPlusIcon className="h-6 w-6" />
            </div>
            <div>
              <Typography variant="h5" className="text-zinc-900 font-black tracking-tight">
                {t("projects.dialogs.create_project_title") || "Create New Project"}
              </Typography>
              <Typography variant="tiny" className="text-zinc-500 font-medium">
                {language === "es" ? "Inicia un nuevo espacio de trabajo" : "Start a new workspace"}
              </Typography>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="space-y-6 p-6 overflow-y-auto max-h-[65vh]">
          <div>
            <Typography variant="small" className="font-bold text-zinc-900 mb-1.5 ml-1">
              {language === "es" ? "Nombre del Proyecto" : "Project Name"} <span className="text-red-500">*</span>
            </Typography>
            <Input
              placeholder={language === "es" ? "Ej. Microbiología 101" : "Ex. Microbiology 101"}
              className="!border-zinc-200 focus:!border-indigo-600 !bg-zinc-50/50 rounded-xl !text-zinc-900"
              value={formData.name}
              name="name"
              onChange={handleChange}
              error={!!errors.name}
              autoFocus
              labelProps={{ className: "hidden" }}
            />
            {errors.name && (
              <Typography variant="small" color="red" className="mt-1 font-medium flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-red-500" /> {errors.name}
              </Typography>
            )}
          </div>

          <div>
            <Typography variant="small" className="font-bold text-zinc-900 mb-1.5 ml-1">
              {language === "es" ? "Descripción (opcional)" : "Description (optional)"}
            </Typography>
            <Textarea
              placeholder={language === "es" ? "Describe brevemente el objetivo de este proyecto..." : "Briefly describe the goal of this project..."}
              className="!border-zinc-200 focus:!border-indigo-600 !bg-zinc-50/50 rounded-xl !text-zinc-900 min-h-[100px]"
              name="description"
              value={formData.description}
              onChange={handleChange}
              labelProps={{ className: "hidden" }}
            />
          </div>

          {/* Docs with Uppy */}
          <div>
            <Typography variant="small" className="font-bold text-zinc-900 mb-2 ml-1 flex items-center justify-between">
              <span>{language === "es" ? "Documentos Iniciales" : "Initial Documents"}</span>
              <span className="text-indigo-500 text-[10px] bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">{language === "es" ? "Opcional" : "Optional"}</span>
            </Typography>

            <div className="border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50">
              <Dashboard
                uppy={uppy}
                width="100%"
                height={250}
                hideUploadButton={true}
                showProgressDetails={true}
                theme="light"
              />
            </div>
          </div>

        </DialogBody>

        <DialogFooter className="border-t border-zinc-100 p-4 flex items-center justify-end gap-3 bg-zinc-50/50">
          <Button
            variant="text"
            color="blue-gray"
            onClick={handleClose}
            disabled={loading}
            className="normal-case font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
          >
            {t("projects.dialogs.cancel")}
          </Button>
          <Button
            type="submit"
            variant="gradient"
            color="indigo"
            disabled={loading}
            className="normal-case font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
          >
            {loading
              ? (language === "es" ? "Creando..." : "Creating Workspace...")
              : (t("projects.dialogs.create_project_title") || "Create Project")}
          </Button>
        </DialogFooter>

        {errors.submit && (
          <Typography variant="small" color="red" className="px-6 pb-4 text-center font-bold">
            {errors.submit}
          </Typography>
        )}
      </form>
    </Dialog>
  );
}

CreateProjectDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default CreateProjectDialog;

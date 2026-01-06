import React, { useState } from "react";
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
import { DocumentArrowUpIcon, XMarkIcon, FolderPlusIcon } from "@heroicons/react/24/outline";
import projectService from "../../services/projectService";
import { useLanguage } from "@/context/language-context";




export function CreateProjectDialog({ open, onClose, onCreate }) {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ✅ solo documentos
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
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
      // ✅ 1) crear proyecto (solo JSON)
      const created = await projectService.createProject({
        title: formData.name, // tu API usa title
        description: formData.description,
      });

      // ✅ 2) subir documentos (si hay)
      if (files.length > 0) {
        await projectService.uploadProjectDocuments(created.id, files);
      }

      onCreate(created);

      setFormData({ name: "", description: "" });
      setFiles([]);
      setErrors({});
      onClose();
    } catch (err) {
      const msg = err?.detail || err?.error || (language === "es" ? "Error al crear el proyecto" : "Failed to create project");
      setErrors((prev) => ({ ...prev, submit: msg }));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: "", description: "" });
    setFiles([]);
    setErrors({});
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

          {/* Docs */}
          <div>
            <Typography variant="small" className="font-bold text-zinc-900 mb-2 ml-1 flex items-center justify-between">
              <span>{language === "es" ? "Documentos Iniciales" : "Initial Documents"}</span>
              <span className="text-indigo-500 text-[10px] bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">{language === "es" ? "Opcional" : "Optional"}</span>
            </Typography>
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-200 border-dashed rounded-2xl cursor-pointer bg-zinc-50/50 hover:bg-zinc-50 hover:border-indigo-400/50 transition-all group"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="h-10 w-10 rounded-full bg-white shadow-sm border border-zinc-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <DocumentArrowUpIcon className="w-5 h-5 text-indigo-500" />
                </div>
                <Typography variant="small" className="text-zinc-600 font-medium">
                  <span className="text-indigo-600 font-bold hover:underline">{t("projects.dialogs.upload_docs_click")}</span> {t("projects.dialogs.upload_docs_drag") || "or drag and drop"}
                </Typography>
                <Typography variant="small" className="text-zinc-400 text-[10px] mt-1">
                  PDF, DOCX, TXT, MD (Max 10MB)
                </Typography>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                multiple
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,.md"
              />
            </label>
          </div>

          {files.length > 0 && (
            <div className="space-y-3">
              <Typography variant="small" className="font-bold text-zinc-900 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                {t("projects.dialogs.upload_docs_selected")} ({files.length})
              </Typography>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white border border-zinc-100 rounded-xl shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100 flex-shrink-0">
                        <DocumentArrowUpIcon className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Typography variant="small" className="font-bold text-zinc-900 truncate">
                          {file.name}
                        </Typography>
                        <Typography variant="tiny" className="text-zinc-400 font-medium">
                          {formatFileSize(file.size)}
                        </Typography>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="text"
                      color="red"
                      className="p-2 rounded-full hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors"
                      onClick={() => removeFile(index)}
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
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

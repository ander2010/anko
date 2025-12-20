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
import { DocumentArrowUpIcon, XMarkIcon } from "@heroicons/react/24/outline";
import projectService from "../../services/projectService";

export function CreateProjectDialog({ open, onClose, onCreate }) {
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
    if (!formData.name.trim()) newErrors.name = "Project name is required";
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
      const msg = err?.detail || err?.error || "Failed to create project";
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
    <Dialog open={open} handler={handleClose} size="md">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <Typography variant="h5">Create New Project</Typography>
        </DialogHeader>

        <DialogBody divider className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <Input
              label="Project Name *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              autoFocus
            />
            {errors.name && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.name}
              </Typography>
            )}
          </div>

          <div>
            <Textarea
              label="Description (optional)"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {/* Docs */}
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Documents (optional)
            </Typography>
            <label
              htmlFor="file-upload"
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
            <div className="space-y-2">
              <Typography variant="small" color="blue-gray" className="font-medium">
                Selected Files ({files.length})
              </Typography>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-blue-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <DocumentArrowUpIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Typography variant="small" className="font-medium text-blue-gray-900 truncate">
                          {file.name}
                        </Typography>
                        <Typography variant="small" className="text-blue-gray-500">
                          {formatFileSize(file.size)}
                        </Typography>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="text"
                      color="red"
                      className="p-2"
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

        <DialogFooter className="gap-2">
          <Button variant="text" color="blue-gray" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="gradient" color="blue" disabled={loading}>
            {loading ? "Creating..." : "Create Project"}
          </Button>
        </DialogFooter>

        {errors.submit && (
          <Typography variant="small" color="red" className="p-4 text-center">
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

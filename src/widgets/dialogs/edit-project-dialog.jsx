import React, { useState, useEffect } from "react";
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
import projectService from "../../services/projectService";
import { useLanguage } from "@/context/language-context";

export function EditProjectDialog({ open, onClose, onSave, project }) {
    const { t, language } = useLanguage();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (project) {
            setTitle(project.title || project.name || "");
            setDescription(project.description || "");
        }
    }, [project]);

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
        if (error) setError("");
    };

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value);
        if (error) setError("");
    };

    const validate = () => {
        if (!title.trim()) {
            setError(language === "es" ? "El nombre del proyecto es obligatorio" : "Project name is required");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            setLoading(true);
            try {
                await projectService.updateProject(project.id, {
                    title: title.trim(),
                    description: description.trim(),
                });
                onSave({ title: title.trim(), description: description.trim() });
                setError("");
                onClose();
            } catch (err) {
                setError(err?.error || (language === "es" ? "Error al actualizar el proyecto" : "Failed to update project"));
            } finally {
                setLoading(false);
            }
        }
    };

    const handleClose = () => {
        setTitle(project?.title || project?.name || "");
        setDescription(project?.description || "");
        setError("");
        onClose();
    };

    return (
        <Dialog open={open} handler={handleClose} size="sm">
            <form onSubmit={handleSubmit}>
                <DialogHeader>
                    <Typography variant="h5">{language === "es" ? "Editar Proyecto" : "Edit Project"}</Typography>
                </DialogHeader>
                <DialogBody divider className="space-y-4">
                    <div>
                        <Input
                            label={`${language === "es" ? "Nombre del Proyecto" : "Project Name"} *`}
                            value={title}
                            onChange={handleTitleChange}
                            error={!!error}
                            autoFocus
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <Textarea
                            label={`${language === "es" ? "Descripción" : "Description"}`}
                            value={description}
                            onChange={handleDescriptionChange}
                            rows={4}
                            disabled={loading}
                        />
                    </div>
                    {error && (
                        <Typography variant="small" color="red" className="mt-1">
                            {error}
                        </Typography>
                    )}
                </DialogBody>
                <DialogFooter className="gap-2">
                    <Button variant="text" color="blue-gray" onClick={handleClose} disabled={loading}>
                        {t("projects.dialogs.cancel")}
                    </Button>
                    <Button type="submit" variant="gradient" color="blue" loading={loading}>
                        {t("projects.dialogs.save_changes")}
                    </Button>
                </DialogFooter>
            </form>
        </Dialog>
    );
}

EditProjectDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    project: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string,
        name: PropTypes.string,
        description: PropTypes.string,
    }),
};

export default EditProjectDialog;

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Input,
    Typography,
} from "@material-tailwind/react";

export function EditProjectDialog({ open, onClose, onSave, project }) {
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (project) {
            setName(project.name);
        }
    }, [project]);

    const handleChange = (e) => {
        setName(e.target.value);
        if (error) setError("");
    };

    const validate = () => {
        if (!name.trim()) {
            setError("Project name is required");
            return false;
        }
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSave({ name: name.trim() });
            setError("");
            onClose();
        }
    };

    const handleClose = () => {
        setName(project?.name || "");
        setError("");
        onClose();
    };

    return (
        <Dialog open={open} handler={handleClose} size="sm">
            <form onSubmit={handleSubmit}>
                <DialogHeader>
                    <Typography variant="h5">Edit Project Name</Typography>
                </DialogHeader>
                <DialogBody divider>
                    <div>
                        <Input
                            label="Project Name *"
                            value={name}
                            onChange={handleChange}
                            error={!!error}
                            autoFocus
                        />
                        {error && (
                            <Typography variant="small" color="red" className="mt-1">
                                {error}
                            </Typography>
                        )}
                    </div>
                </DialogBody>
                <DialogFooter className="gap-2">
                    <Button variant="text" color="blue-gray" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="gradient" color="blue">
                        Save Changes
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
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
    }),
};

export default EditProjectDialog;

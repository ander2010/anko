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
    Select,
    Option,
} from "@material-tailwind/react";
import { useLanguage } from "@/context/language-context";

export function CreateDeckDialog({ open, onClose, onCreate, deck = null }) {
    const { t, language } = useLanguage();
    const [formData, setFormData] = useState({
        title: "",
        visibility: "private",
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (deck) {
            setFormData({
                title: deck.title || "",
                visibility: deck.visibility || "private",
            });
        } else {
            setFormData({
                title: "",
                visibility: "private",
            });
        }
    }, [deck, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleSelectChange = (value) => {
        setFormData((prev) => ({ ...prev, visibility: value }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.title.trim()) {
            newErrors.title = language === "es" ? "El título es obligatorio" : "Title is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onCreate(formData);
            onClose();
        }
    };

    return (
        <Dialog open={open} handler={onClose} size="sm">
            <form onSubmit={handleSubmit}>
                <DialogHeader>
                    <Typography variant="h5">
                        {deck
                            ? (language === "es" ? "Editar Mazo" : "Edit Deck")
                            : (language === "es" ? "Crear Nuevo Mazo" : "Create New Deck")
                        }
                    </Typography>
                </DialogHeader>
                <DialogBody divider>
                    <div className="space-y-4">
                        <div>
                            <Input
                                label={`${language === "es" ? "Título" : "Title"} *`}
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                error={!!errors.title}
                                autoFocus
                            />
                            {errors.title && (
                                <Typography variant="small" color="red" className="mt-1">
                                    {errors.title}
                                </Typography>
                            )}
                        </div>

                        <div>
                            <Select
                                label={language === "es" ? "Visibilidad" : "Visibility"}
                                value={formData.visibility}
                                onChange={handleSelectChange}
                            >
                                <Option value="private">{t("project_detail.decks.visibility.private")}</Option>
                                <Option value="shared">{t("project_detail.decks.visibility.shared")}</Option>
                                <Option value="public">{t("project_detail.decks.visibility.public")}</Option>
                            </Select>
                        </div>
                    </div>
                </DialogBody>
                <DialogFooter className="gap-2">
                    <Button variant="text" color="blue-gray" onClick={onClose}>
                        {t("projects.dialogs.cancel")}
                    </Button>
                    <Button type="submit" variant="gradient" color="blue">
                        {deck ? t("global.actions.save") : t("projects.dialogs.create")}
                    </Button>
                </DialogFooter>
            </form>
        </Dialog>
    );
}

CreateDeckDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onCreate: PropTypes.func.isRequired,
    deck: PropTypes.object,
};

export default CreateDeckDialog;

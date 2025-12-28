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
    Checkbox,
    Accordion,
    AccordionHeader,
    AccordionBody,
    Spinner,
} from "@material-tailwind/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import projectService from "@/services/projectService";
import { useLanguage } from "@/context/language-context";

function Icon({ id, open }) {
    return (
        <ChevronDownIcon
            className={`${id === open ? "rotate-180" : ""} h-5 w-5 transition-transform`}
        />
    );
}

export function CreateTopicDialog({ open, onClose, onCreate, projectId }) {
    const { t, language } = useLanguage();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        question_count_target: 10,
        related_sections: [],
    });
    const [openAccordion, setOpenAccordion] = useState(0);
    const [scannedDocuments, setScannedDocuments] = useState([]);
    const [loadingSections, setLoadingSections] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (open && projectId) {
            fetchSections();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, projectId]);

    const fetchSections = async () => {
        try {
            setLoadingSections(true);
            const data = await projectService.getDocumentsWithSections(projectId);
            // data.documents -> [{ id, filename, sections: [{id, title}, ...] }]
            setScannedDocuments(data.documents || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingSections(false);
        }
    };

    const handleOpenAccordion = (value) => setOpenAccordion(openAccordion === value ? 0 : value);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleSectionToggle = (sectionId) => {
        setFormData((prev) => {
            const current = prev.related_sections;
            const updated = current.includes(sectionId)
                ? current.filter((id) => id !== sectionId)
                : [...current, sectionId];
            return { ...prev, related_sections: updated };
        });
        if (errors.sections) {
            setErrors((prev) => ({ ...prev, sections: "" }));
        }
    };

    const handleDocumentToggle = (doc) => {
        if (!doc.sections) return;

        const allSectionIds = doc.sections.map(s => s.id);
        const currentSelected = formData.related_sections;

        // Are all sections of this doc selected?
        const isAllSelected = allSectionIds.every(id => currentSelected.includes(id));

        if (isAllSelected) {
            // Unselect all
            setFormData(prev => ({
                ...prev,
                related_sections: prev.related_sections.filter(id => !allSectionIds.includes(id))
            }));
        } else {
            // Select all (union)
            const newSelection = [...new Set([...currentSelected, ...allSectionIds])];
            setFormData(prev => ({ ...prev, related_sections: newSelection }));
        }

        if (errors.sections) {
            setErrors((prev) => ({ ...prev, sections: "" }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = language === "es" ? "El nombre del tema es obligatorio" : "Topic name is required";
        }
        if (formData.question_count_target < 1 || formData.question_count_target > 100) {
            newErrors.question_count_target = language === "es" ? "La cantidad de preguntas debe estar entre 1 y 100" : "Questions count must be between 1 and 100";
        }
        if (formData.related_sections.length === 0) {
            newErrors.sections = language === "es" ? "Debes seleccionar al menos una sección" : "At least one section must be selected";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onCreate(formData);
            resetForm();
            onClose();
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            question_count_target: 10,
            related_sections: [],
        });
        setErrors({});
        setScannedDocuments([]);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Dialog open={open} handler={handleClose} size="lg">
            <form onSubmit={handleSubmit} className="flex flex-col h-[90vh] md:h-auto">
                <DialogHeader>
                    <Typography variant="h5">{t("projects.dialogs.create_topic_title")}</Typography>
                </DialogHeader>
                <DialogBody divider className="flex-1 overflow-y-auto pr-2">
                    <div className="space-y-4">
                        <div>
                            <Input
                                label={`${language === "es" ? "Nombre del Tema" : "Topic Name"} *`}
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
                                label={`${language === "es" ? "Descripción (opcional)" : "Description (optional)"}`}
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={2}
                            />
                        </div>

                        <div>
                            <Input
                                type="number"
                                label={`${language === "es" ? "Cantidad Objetivo de Preguntas" : "Target Questions Count"} *`}
                                name="question_count_target"
                                value={formData.question_count_target}
                                onChange={handleChange}
                                error={!!errors.question_count_target}
                                min="1"
                                max="100"
                            />
                            {errors.question_count_target && (
                                <Typography variant="small" color="red" className="mt-1">
                                    {errors.question_count_target}
                                </Typography>
                            )}
                        </div>

                        <div>
                            <Typography variant="h6" color="blue-gray" className="mb-2">
                                {language === "es" ? "Seleccionar Secciones de Contenido *" : "Select Content Sections *"}
                            </Typography>
                            {errors.sections && (
                                <Typography variant="small" color="red" className="mb-2">
                                    {errors.sections}
                                </Typography>
                            )}

                            {loadingSections ? (
                                <div className="flex justify-center p-4">
                                    <Spinner />
                                </div>
                            ) : scannedDocuments.length === 0 ? (
                                <Typography variant="small" color="gray" className="italic">
                                    {language === "es"
                                        ? "No se encontraron documentos con secciones. Por favor, procesa algunos documentos primero."
                                        : "No documents with sections found. Please process some documents first."}
                                </Typography>
                            ) : (
                                <div className="border border-blue-gray-100 rounded-lg max-h-[400px] overflow-y-auto">
                                    {scannedDocuments.map((doc, index) => {
                                        const docHasSections = doc.sections && doc.sections.length > 0;
                                        if (!docHasSections) return null;

                                        const allSelected = doc.sections.every(s =>
                                            formData.related_sections.includes(s.id)
                                        );
                                        const someSelected = doc.sections.some(s =>
                                            formData.related_sections.includes(s.id)
                                        );

                                        return (
                                            <Accordion
                                                key={doc.id}
                                                open={openAccordion === index + 1}
                                                icon={<Icon id={index + 1} open={openAccordion} />}
                                            >
                                                <AccordionHeader
                                                    onClick={() => handleOpenAccordion(index + 1)}
                                                    className="py-3 px-4 hover:bg-gray-50 text-sm"
                                                >
                                                    <div className="flex items-center gap-3 w-full" onClick={e => e.stopPropagation()}>
                                                        <Checkbox
                                                            checked={allSelected}
                                                            indeterminate={someSelected && !allSelected}
                                                            onChange={() => handleDocumentToggle(doc)}
                                                            containerProps={{ className: "p-0" }}
                                                        />
                                                        <Typography variant="small" className="font-semibold flex-1 text-left">
                                                            {doc.filename}
                                                        </Typography>
                                                        <Typography variant="small" color="gray" className="font-normal">
                                                            {doc.sections.length} {language === "es" ? "secciones" : "sections"}
                                                        </Typography>
                                                    </div>
                                                </AccordionHeader>
                                                <AccordionBody className="py-2 px-4 bg-gray-50/50">
                                                    <div className="flex flex-col gap-2 pl-8">
                                                        {doc.sections.map(section => (
                                                            <div key={section.id} className="flex items-start gap-3 p-2 rounded hover:bg-gray-100">
                                                                <Checkbox
                                                                    checked={formData.related_sections.includes(section.id)}
                                                                    onChange={() => handleSectionToggle(section.id)}
                                                                    containerProps={{ className: "p-0 mt-1" }}
                                                                />
                                                                <div>
                                                                    <Typography variant="small" color="blue-gray" className="font-medium">
                                                                        {section.title || (language === "es" ? "Sección sin título" : "Untitled Section")}
                                                                    </Typography>
                                                                    <Typography variant="small" color="gray" className="line-clamp-2 text-xs">
                                                                        {section.content}
                                                                    </Typography>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </AccordionBody>
                                            </Accordion>
                                        );
                                    })}
                                </div>
                            )}
                            <div className="flex justify-between items-center mt-2">
                                <Typography variant="small" color="gray">
                                    {formData.related_sections.length} {language === "es" ? "secciones seleccionadas" : "sections selected"}
                                </Typography>
                            </div>
                        </div>
                    </div>
                </DialogBody>
                <DialogFooter className="gap-2 border-t border-blue-gray-50">
                    <Button variant="text" color="blue-gray" onClick={handleClose}>
                        {t("projects.dialogs.cancel")}
                    </Button>
                    <Button type="submit" variant="gradient" color="blue" disabled={loadingSections}>
                        {t("projects.dialogs.create")}
                    </Button>
                </DialogFooter>
            </form>
        </Dialog>
    );
}

CreateTopicDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onCreate: PropTypes.func.isRequired,
    projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default CreateTopicDialog;

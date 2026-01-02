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
    Switch,
    IconButton,
    Chip,
} from "@material-tailwind/react";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import projectService from "@/services/projectService";
import { useLanguage } from "@/context/language-context";

function Icon({ id, open }) {
    return (
        <ChevronDownIcon
            className={`${id === open ? "rotate-180" : ""} h-5 w-5 transition-transform`}
        />
    );
}

export function CreateDeckDialog({ open, onClose, onCreate, projectId, deck = null }) {
    const { t, language } = useLanguage();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        visibility: "private",
        section_ids: [],
        document_ids: [],
        cards_count: 20,
    });
    const [openAccordion, setOpenAccordion] = useState(0);
    const [scannedDocuments, setScannedDocuments] = useState([]);
    const [loadingSections, setLoadingSections] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (open) {
            if (deck) {
                setFormData({
                    title: deck.title || "",
                    description: deck.description || "",
                    visibility: deck.visibility || "private",
                    section_ids: (deck.section_ids || []).map(Number),
                    document_ids: (deck.document_ids || []).map(Number),
                    cards_count: deck.flashcards_count || deck.cards_count || 20,
                });
            } else {
                setFormData({
                    title: "",
                    description: "",
                    visibility: "private",
                    section_ids: [],
                    document_ids: [],
                    cards_count: 20,
                });
            }
            if (projectId) {
                fetchSections();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, projectId, deck]);

    const fetchSections = async () => {
        try {
            setLoadingSections(true);
            const data = await projectService.getDocumentsWithSections(projectId);
            setScannedDocuments(data.documents || []);
        } catch (err) {
            console.error("Error fetching sections:", err);
        } finally {
            setLoadingSections(false);
        }
    };

    const handleOpenAccordion = (value) => setOpenAccordion(openAccordion === value ? 0 : value);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleVisibilityChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            visibility: e.target.checked ? "public" : "private"
        }));
    };

    const handleSectionToggle = (sectionId, docId) => {
        const sId = Number(sectionId);
        const dId = Number(docId);

        setFormData((prev) => {
            const currentSelected = prev.section_ids;
            const updated = currentSelected.includes(sId)
                ? currentSelected.filter((id) => id !== sId)
                : [...currentSelected, sId];

            // Re-infer document selection
            const doc = scannedDocuments.find(d => Number(d.id) === dId);
            const docSectionIds = (doc?.sections || []).map(s => Number(s.id));
            const allDocSectionsSelected = docSectionIds.length > 0 && docSectionIds.every(id => updated.includes(id));

            let newDocIds = prev.document_ids;
            if (allDocSectionsSelected) {
                if (!newDocIds.includes(dId)) newDocIds = [...newDocIds, dId];
            } else {
                newDocIds = newDocIds.filter(id => id !== dId);
            }

            return {
                ...prev,
                section_ids: updated,
                document_ids: newDocIds
            };
        });
    };

    const handleDocumentToggle = (doc) => {
        const docId = Number(doc.id);
        const docSectionIds = (doc.sections || []).map(s => Number(s.id));

        setFormData((prev) => {
            const isDocSelected = prev.document_ids.includes(docId);
            const allSectionsSelected = docSectionIds.length > 0 && docSectionIds.every(id => prev.section_ids.includes(id));

            // Toggle based on current effective selection (if doc is selected OR all its sections are selected)
            const shouldDeselect = isDocSelected || allSectionsSelected;

            let newDocIds = shouldDeselect
                ? prev.document_ids.filter(id => id !== docId)
                : [...new Set([...prev.document_ids, docId])];

            let newSectionIds = prev.section_ids;
            if (shouldDeselect) {
                newSectionIds = prev.section_ids.filter(id => !docSectionIds.includes(id));
            } else {
                newSectionIds = [...new Set([...prev.section_ids, ...docSectionIds])];
            }

            return {
                ...prev,
                document_ids: newDocIds,
                section_ids: newSectionIds
            };
        });
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
        <Dialog open={open} handler={onClose} size="lg">
            <form onSubmit={handleSubmit} className="flex flex-col h-[90vh] md:h-auto">
                <DialogHeader className="flex justify-between items-center bg-blue-gray-50/20 px-6 py-4 border-b border-blue-gray-50">
                    <Typography variant="h5" color="blue-gray">
                        {deck && deck.id
                            ? (language === "es" ? "Editar Mazo" : "Edit Deck")
                            : (language === "es" ? "Crear Mazo" : "Create Deck")
                        }
                    </Typography>
                    <IconButton variant="text" color="blue-gray" onClick={onClose} className="rounded-full">
                        <XMarkIcon className="h-6 w-6" strokeWidth={2} />
                    </IconButton>
                </DialogHeader>
                <DialogBody divider className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label={language === "es" ? "Título" : "Title"} name="title" value={formData.title} onChange={handleChange} error={!!errors.title} />
                            <Input label={t("project_detail.decks.cards_count")} type="number" name="cards_count" value={formData.cards_count} onChange={handleChange} />
                        </div>
                        <Textarea label={t("project_detail.decks.description")} name="description" value={formData.description} onChange={handleChange} rows={2} />

                        <div className="flex items-center gap-4 py-2 border-y border-gray-100">
                            <Typography variant="small" color="blue-gray" className="font-bold flex-1">
                                {t("project_detail.decks.visibility_label")}
                            </Typography>
                            <Switch label={formData.visibility === "public" ? "Public" : "Private"} checked={formData.visibility === "public"} onChange={handleVisibilityChange} color="blue" />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Typography variant="h6" color="blue-gray">
                                    {t("project_detail.decks.documents")} & {t("project_detail.decks.sections")}
                                </Typography>
                                <Chip variant="ghost" color="blue" value={`${formData.section_ids.length} ${t("project_detail.docs.table.sections")}`} />
                            </div>

                            {loadingSections ? (
                                <div className="flex justify-center p-8"><Spinner /></div>
                            ) : scannedDocuments.length === 0 ? (
                                <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed">
                                    <Typography variant="small" color="gray" className="italic">
                                        {language === "es" ? "No hay documentos con secciones procesadas." : "No documents with processed sections."}
                                    </Typography>
                                </div>
                            ) : (
                                <div className="border border-blue-gray-100 rounded-lg overflow-hidden shadow-sm">
                                    {scannedDocuments.map((doc, index) => {
                                        const docId = Number(doc.id);
                                        const docSections = doc.sections || [];
                                        const docSectionIds = docSections.map(s => Number(s.id));

                                        const allSelected = docSectionIds.length > 0 && docSectionIds.every(id => formData.section_ids.includes(id));
                                        const someSelected = docSectionIds.some(id => formData.section_ids.includes(id));

                                        return (
                                            <Accordion
                                                key={docId}
                                                open={openAccordion === index + 1}
                                                icon={<Icon id={index + 1} open={openAccordion} />}
                                                className={`border-b last:border-b-0 ${allSelected ? "bg-blue-50/30" : ""}`}
                                            >
                                                <AccordionHeader className="py-2 px-4 hover:bg-gray-50/50 transition-colors border-b-0">
                                                    <div className="flex items-center gap-4 w-full" onClick={e => e.stopPropagation()}>
                                                        <Checkbox
                                                            color="blue"
                                                            checked={allSelected}
                                                            indeterminate={someSelected && !allSelected}
                                                            onChange={() => handleDocumentToggle(doc)}
                                                            containerProps={{ className: "p-0" }}
                                                        />
                                                        <div className="flex-1 text-left" onClick={() => handleOpenAccordion(index + 1)}>
                                                            <Typography variant="small" className="font-bold text-blue-gray-800">
                                                                {doc.filename}
                                                            </Typography>
                                                            <Typography variant="small" className="font-normal text-[10px] text-gray-500">
                                                                {docSections.length} {t("project_detail.docs.table.sections")}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </AccordionHeader>
                                                <AccordionBody className="py-1 px-4 bg-gray-50/30">
                                                    <div className="flex flex-col gap-1 pl-10 pr-2 pb-2">
                                                        {docSections.map(section => (
                                                            <div
                                                                key={section.id}
                                                                className={`flex items-start gap-4 p-2 rounded-lg hover:bg-white cursor-pointer ${formData.section_ids.includes(Number(section.id)) ? "bg-white shadow-sm ring-1 ring-blue-100" : ""}`}
                                                                onClick={() => handleSectionToggle(section.id, docId)}
                                                            >
                                                                <Checkbox
                                                                    color="blue"
                                                                    checked={formData.section_ids.includes(Number(section.id))}
                                                                    onChange={() => handleSectionToggle(section.id, docId)}
                                                                    containerProps={{ className: "p-0 mt-0.5" }}
                                                                />
                                                                <div className="flex-1">
                                                                    <Typography variant="small" className="font-medium text-xs text-blue-gray-900">
                                                                        {section.title || (language === "es" ? "Sin título" : "Untitled")}
                                                                    </Typography>
                                                                    {section.content && (
                                                                        <Typography variant="small" className="text-[10px] text-gray-500 line-clamp-1">
                                                                            {section.content}
                                                                        </Typography>
                                                                    )}
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
                        </div>
                    </div>
                </DialogBody>
                <DialogFooter className="gap-2 bg-gray-50/50 px-6 py-4">
                    <Button variant="text" color="blue-gray" onClick={onClose}>{t("projects.dialogs.cancel")}</Button>
                    <Button type="submit" variant="gradient" color="blue" disabled={loadingSections}>
                        {deck && deck.id ? t("global.actions.save") : t("projects.dialogs.create")}
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
    projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    deck: PropTypes.object,
};

export default CreateDeckDialog;

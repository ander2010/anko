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
    Tabs,
    TabsHeader,
    TabsBody,
    Tab,
    TabPanel,
} from "@material-tailwind/react";
import { ChevronDownIcon, XMarkIcon, RectangleStackIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import projectService from "@/services/projectService";
import { useLanguage } from "@/context/language-context";

function Icon({ id, open }) {
    return (
        <ChevronDownIcon
            className={`${id === open ? "rotate-180" : ""} h-5 w-5 transition-transform text-zinc-400`}
        />
    );
}

export function CreateDeckDialog({ open, onClose, onCreate, projectId, deck = null }) {
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState("ai");
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        visibility: "private",
        section_ids: [],
        document_ids: [],
        cards_count: 3,
        cards: [], // For manual mode
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
                    cards_count: deck.flashcards_count || deck.cards_count || 3,
                    cards: [],
                });
                setActiveTab("ai"); // Default to AI for editing, or maybe we don't support converting yet?
            } else {
                setFormData({
                    title: "",
                    description: "",
                    visibility: "private",
                    section_ids: [],
                    document_ids: [],
                    cards_count: 3,
                    cards: [], // Start with empty list
                });
                setActiveTab("ai");
            }
            if (projectId) {
                fetchSections();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, projectId, deck]);

    useEffect(() => {
        const loadCardsIfNeeded = async () => {
            if (activeTab === "manual" && deck?.id && formData.cards.length === 0) {
                try {
                    const cards = await projectService.getDeckFlashcards(deck.id);
                    if (cards && cards.length > 0) {
                        setFormData(prev => ({
                            ...prev,
                            cards: cards.map(c => ({
                                front: c.front || c.question || "",
                                back: c.back || c.answer || "",
                                notes: c.explanation || c.notes || ""
                            }))
                        }));
                    }
                } catch (err) {
                    console.error("Failed to load existing flashcards", err);
                }
            }
        };
        loadCardsIfNeeded();
    }, [activeTab, deck, formData.cards.length]);

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

    // --- Manual Card Management ---
    const [currentCard, setCurrentCard] = useState({ front: "", back: "", notes: "" });

    const handleCurrentCardChange = (e) => {
        const { name, value } = e.target;
        setCurrentCard(prev => ({ ...prev, [name]: value }));
    };

    const addCard = () => {
        if (!currentCard.front.trim() || !currentCard.back.trim()) return;

        setFormData(prev => ({
            ...prev,
            cards: [...prev.cards, { ...currentCard }]
        }));
        setCurrentCard({ front: "", back: "", notes: "" });
    };

    const removeCard = (index) => {
        setFormData(prev => ({
            ...prev,
            cards: prev.cards.filter((_, i) => i !== index)
        }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.title.trim()) {
            newErrors.title = language === "es" ? "El título es obligatorio" : "Title is required";
        }

        if (activeTab === "manual") {
            if (formData.cards.length === 0) {
                newErrors.general = language === "es" ? "Debes agregar al menos una ficha." : "You must add at least one card.";
            }
        } else {
            // AI Generation mode
            // Case A: No documents/sections available to process
            if (scannedDocuments.length === 0) {
                newErrors.general = language === "es"
                    ? "Usted no tiene secciones disponibles. Debe subir un documento para que el sistema procese el contenido."
                    : "You don't have any sections available. You should upload a document so the system can process the content.";
            }
            // Case B: Sections exist but none selected
            else if (formData.section_ids.length === 0) {
                newErrors.general = language === "es"
                    ? "Usted debe seleccionar al menos una sección para generar las fichas."
                    : "You must select at least one section to generate the cards.";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            // Include activeTab in onCreate so parent knows which service method to use
            onCreate({ ...formData, mode: activeTab });
            // Don't close immediately here because parent handles logic and loading/errors
            // But currently the dialog expects to close or handle errors inside.
            // The parent `handleCreateDeck` triggers async service calls.
            // Ideally we'd have a loading state passed in. 
            // For now, we assume parent closes dialog on success.
            // But looking at existing code: `onCreate(formData); onClose();`
            // So we'll keep onClose here.
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            handler={onClose}
            size="lg"
            className="bg-white shadow-2xl rounded-3xl overflow-hidden ring-1 ring-zinc-900/5 h-[90vh] flex flex-col"
        >
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <DialogHeader className="relative p-0 overflow-hidden bg-zinc-50 border-b border-zinc-100 flex-none">
                    <div className="px-6 py-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
                            <RectangleStackIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <Typography variant="h6" className="text-zinc-900 font-black tracking-tight">
                                {deck && deck.id
                                    ? (language === "es" ? "Editar Mazo" : "Edit Deck")
                                    : (language === "es" ? "Crear Mazo" : "Create Deck")
                                }
                            </Typography>
                        </div>
                        <IconButton variant="text" color="blue-gray" onClick={onClose} className="rounded-full hover:bg-zinc-200/50">
                            <XMarkIcon className="h-6 w-6 text-zinc-400" strokeWidth={2} />
                        </IconButton>
                    </div>

                    {!deck && (
                        <div className="px-6 pb-0">
                            <Tabs value={activeTab}>
                                <TabsHeader
                                    className="bg-zinc-100/50 p-1 rounded-xl"
                                    indicatorProps={{ className: "bg-white shadow-sm rounded-lg" }}
                                >
                                    <Tab value="ai" onClick={() => setActiveTab("ai")} className="py-2 text-xs font-bold font-sans whitespace-nowrap">
                                        {language === "es" ? "Generar con IA" : "AI Generation"}
                                    </Tab>
                                    <Tab value="manual" onClick={() => setActiveTab("manual")} className="py-2 text-xs font-bold font-sans whitespace-nowrap">
                                        {language === "es" ? "Generar Manualmente" : "Manual Generation"}
                                    </Tab>
                                </TabsHeader>
                            </Tabs>
                        </div>
                    )}
                </DialogHeader>

                <DialogBody className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    {/* Common Fields */}
                    {/* Layout differs by tab for better space usage */}
                    {activeTab === "manual" ? (
                        <>
                            {/* Manual Mode: Title + Visibility in one row */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <Typography variant="small" className="font-bold text-zinc-900 mb-1.5 ml-1">
                                        {language === "es" ? "Título" : "Title"} <span className="text-red-500">*</span>
                                    </Typography>
                                    <Input
                                        placeholder={language === "es" ? "Ej. Anatomía del Corazón" : "Ex. Heart Anatomy"}
                                        className="!border-zinc-200 focus:!border-indigo-600 !bg-zinc-50/50 rounded-xl !text-zinc-900"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        error={!!errors.title}
                                        labelProps={{ className: "hidden" }}
                                    />
                                    {errors.title && (
                                        <Typography variant="small" color="red" className="mt-1 font-medium flex items-center gap-1">
                                            <span className="h-1 w-1 rounded-full bg-red-500" /> {errors.title}
                                        </Typography>
                                    )}
                                </div>
                                <div className="flex-none min-w-[180px]">
                                    <Typography variant="small" className="font-bold text-zinc-900 mb-1.5 ml-1">
                                        {t("project_detail.decks.visibility_label")}
                                    </Typography>
                                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 h-[44px]">
                                        <Typography variant="tiny" className="text-zinc-500 font-medium mr-2">
                                            {formData.visibility === "public" ? "Public" : "Private"}
                                        </Typography>
                                        <Switch
                                            checked={formData.visibility === "public"}
                                            onChange={handleVisibilityChange}
                                            color="indigo"
                                            className="h-full w-full checked:bg-indigo-500"
                                            containerProps={{ className: "w-8 h-5" }}
                                            circleProps={{ className: "before:hidden left-0.5 border-none h-4 w-4" }}
                                            ripple={false}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* AI Mode: Standard Layout */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Typography variant="small" className="font-bold text-zinc-900 mb-1.5 ml-1">
                                    {language === "es" ? "Título" : "Title"} <span className="text-red-500">*</span>
                                </Typography>
                                <Input
                                    placeholder={language === "es" ? "Ej. Anatomía del Corazón" : "Ex. Heart Anatomy"}
                                    className="!border-zinc-200 focus:!border-indigo-600 !bg-zinc-50/50 rounded-xl !text-zinc-900"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    error={!!errors.title}
                                    labelProps={{ className: "hidden" }}
                                />
                                {errors.title && (
                                    <Typography variant="small" color="red" className="mt-1 font-medium flex items-center gap-1">
                                        <span className="h-1 w-1 rounded-full bg-red-500" /> {errors.title}
                                    </Typography>
                                )}
                            </div>
                            <div>
                                <Typography variant="small" className="font-bold text-zinc-900 mb-1.5 ml-1">
                                    {t("project_detail.decks.cards_count")}
                                </Typography>
                                <Input
                                    type="number"
                                    className="!border-zinc-200 focus:!border-indigo-600 !bg-zinc-50/50 rounded-xl !text-zinc-900"
                                    name="cards_count"
                                    value={formData.cards_count}
                                    onChange={handleChange}
                                    labelProps={{ className: "hidden" }}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <Typography variant="small" className="font-bold text-zinc-900 mb-1.5 ml-1">
                            {t("project_detail.decks.description")}
                        </Typography>
                        <Textarea
                            placeholder={language === "es" ? "Describe este mazo..." : "Describe this deck..."}
                            className="!border-zinc-200 focus:!border-indigo-600 !bg-zinc-50/50 rounded-xl !text-zinc-900 min-h-[80px]"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={2}
                            labelProps={{ className: "hidden" }}
                        />
                    </div>

                    {/* AI Mode: Visibility is separate below description */}
                    {activeTab === "ai" && (
                        <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                            <div className="flex flex-col">
                                <Typography variant="small" className="font-bold text-zinc-900">
                                    {t("project_detail.decks.visibility_label")}
                                </Typography>
                                <Typography variant="tiny" className="text-zinc-500 font-medium">
                                    {formData.visibility === "public"
                                        ? (language === "es" ? "Visible para todos los usuarios" : "Visible to all users")
                                        : (language === "es" ? "Solo visible para ti" : "Visible only to you")
                                    }
                                </Typography>
                            </div>
                            <Switch
                                checked={formData.visibility === "public"}
                                onChange={handleVisibilityChange}
                                color="indigo"
                                className="h-full w-full checked:bg-indigo-500"
                                containerProps={{ className: "w-11 h-6" }}
                                circleProps={{ className: "before:hidden left-0.5 border-none" }}
                            />
                        </div>
                    )}

                    {/* AI SECTIONS SELECTION */}
                    {activeTab === "ai" && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between mb-4">
                                <Typography variant="h6" className="font-black text-zinc-900">
                                    {t("project_detail.decks.documents")} & {t("project_detail.decks.sections")}
                                </Typography>
                                <Chip
                                    variant="ghost"
                                    color="indigo"
                                    className="rounded-lg border-indigo-100 bg-indigo-50 text-indigo-700 font-bold"
                                    value={`${formData.section_ids.length} ${t("project_detail.docs.table.sections")}`}
                                />
                            </div>

                            {loadingSections ? (
                                <div className="flex justify-center p-8 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <Spinner className="h-6 w-6 text-indigo-500" />
                                </div>
                            ) : scannedDocuments.length === 0 ? (
                                <div className="p-8 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                                    <Typography variant="small" className="text-zinc-500 font-medium italic">
                                        {language === "es"
                                            ? "Usted no tiene secciones disponibles. Debe subir un documento para que el sistema procese el contenido."
                                            : "You don't have any sections available. You should upload a document so the system can process the content."}
                                    </Typography>
                                </div>
                            ) : (
                                <div className={`border rounded-2xl overflow-hidden bg-white shadow-sm transition-colors ${errors.general ? "border-red-500 bg-red-50/5" : "border-zinc-200"} `}>
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
                                                className="border-b border-zinc-100 last:border-b-0"
                                            >
                                                <AccordionHeader
                                                    className={`py-3 px-4 hover:bg-zinc-50 transition-colors border-b-0 ${openAccordion === index + 1 ? "bg-zinc-50" : ""}`}
                                                    onClick={() => handleOpenAccordion(index + 1)}
                                                >
                                                    <div className="flex items-center gap-4 w-full">
                                                        <div onClick={(e) => e.stopPropagation()}>
                                                            <Checkbox
                                                                color="indigo"
                                                                checked={allSelected}
                                                                indeterminate={someSelected && !allSelected}
                                                                onChange={() => handleDocumentToggle(doc)}
                                                                className="h-4 w-4 rounded-md border-zinc-300 bg-white transition-all hover:scale-105 hover:before:opacity-0"
                                                                containerProps={{ className: "p-0" }}
                                                            />
                                                        </div>
                                                        <div className="flex-1 text-left flex items-center justify-between">
                                                            <Typography variant="small" className="font-bold text-zinc-900">
                                                                {doc.filename}
                                                            </Typography>
                                                            <Typography variant="small" className="font-bold text-zinc-400 text-[10px] bg-white border border-zinc-100 px-2 py-0.5 rounded-md">
                                                                {docSections.length} {t("project_detail.docs.table.sections")}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </AccordionHeader>
                                                <AccordionBody className="py-2 px-4 bg-zinc-50/50">
                                                    <div className="flex flex-col gap-1 pl-8 pr-2 pb-2">
                                                        {docSections.map(section => (
                                                            <div
                                                                key={section.id}
                                                                className={`flex items-start gap-4 p-2 rounded-lg cursor-pointer transition-all border border-transparent ${formData.section_ids.includes(Number(section.id)) ? "bg-white shadow-sm border-zinc-200" : "hover:bg-zinc-100"}`}
                                                                onClick={() => handleSectionToggle(section.id, docId)}
                                                            >
                                                                <Checkbox
                                                                    color="indigo"
                                                                    checked={formData.section_ids.includes(Number(section.id))}
                                                                    readOnly
                                                                    className="h-4 w-4 rounded-md border-zinc-300 pointer-events-none"
                                                                    containerProps={{ className: "p-0 mt-0.5 pointer-events-none" }}
                                                                    ripple={false}
                                                                />
                                                                <div className="flex-1">
                                                                    <Typography variant="small" className="font-bold text-xs text-zinc-900 mb-0.5 capitalize">
                                                                        {section.title || (language === "es" ? "Sin título" : "Untitled")}
                                                                    </Typography>
                                                                    {section.content && (
                                                                        <Typography variant="small" className="text-[10px] text-zinc-500 line-clamp-2 leading-tight">
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
                    )}

                    {/* MANUAL CARDS ENTRY */}
                    {activeTab === "manual" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Input Form Area */}
                            <div className="p-5 bg-zinc-50/80 rounded-2xl border border-zinc-200 space-y-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <Typography variant="small" className="font-black text-zinc-900 uppercase tracking-wider text-[10px]">
                                        {language === "es" ? "Nueva Ficha" : "New Card"}
                                    </Typography>
                                    <Chip
                                        value={formData.cards.length}
                                        size="sm"
                                        variant="ghost"
                                        color="indigo"
                                        className="rounded-full"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label={language === "es" ? "Frente (Pregunta)" : "Front (Question)"}
                                        name="front"
                                        value={currentCard.front}
                                        onChange={handleCurrentCardChange}
                                        className="bg-white"
                                    />
                                    <Input
                                        label={language === "es" ? "Reverso (Respuesta)" : "Back (Answer)"}
                                        name="back"
                                        value={currentCard.back}
                                        onChange={handleCurrentCardChange}
                                        className="bg-white"
                                    />
                                </div>
                                <Input
                                    label={language === "es" ? "Notas (Opcional)" : "Notes (Optional)"}
                                    name="notes"
                                    value={currentCard.notes}
                                    onChange={handleCurrentCardChange}
                                    className="bg-white"
                                />
                                <div className="flex justify-end">
                                    <Button
                                        size="sm"
                                        color="indigo"
                                        className="flex items-center gap-2 normal-case"
                                        onClick={addCard}
                                        disabled={!currentCard.front.trim() || !currentCard.back.trim()}
                                    >
                                        <PlusIcon className="h-3 w-3" />
                                        {language === "es" ? "Agregar a la lista" : "Add to list"}
                                    </Button>
                                </div>
                            </div>

                            {/* Added Cards List */}
                            {formData.cards.length > 0 && (
                                <div className="space-y-3">
                                    <Typography variant="small" className="font-bold text-zinc-500 text-xs uppercase tracking-wider ml-1">
                                        {language === "es" ? "Fichas Agregadas" : "Added Cards"}
                                    </Typography>
                                    {formData.cards.map((card, index) => (
                                        <div key={index} className="flex items-start justify-between p-4 bg-white rounded-xl border border-zinc-100 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md group">
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Typography variant="small" className="font-bold text-zinc-900 text-xs mb-1">
                                                        {language === "es" ? "Frente" : "Front"}
                                                    </Typography>
                                                    <Typography variant="small" className="text-zinc-600 leading-snug">
                                                        {card.front}
                                                    </Typography>
                                                </div>
                                                <div>
                                                    <Typography variant="small" className="font-bold text-zinc-900 text-xs mb-1">
                                                        {language === "es" ? "Reverso" : "Back"}
                                                    </Typography>
                                                    <Typography variant="small" className="text-zinc-600 leading-snug">
                                                        {card.back}
                                                    </Typography>
                                                </div>
                                            </div>
                                            <IconButton
                                                size="sm"
                                                color="red"
                                                variant="text"
                                                className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => removeCard(index)}
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </IconButton>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {errors.general && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100 flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                    {errors.general}
                                </div>
                            )}
                        </div>
                    )}
                </DialogBody>
                <DialogFooter className="bg-zinc-50/50 border-t border-zinc-100 p-4 flex justify-end gap-3 flex-none">
                    <Button
                        variant="text"
                        color="blue-gray"
                        onClick={onClose}
                        className="normal-case font-bold text-zinc-600 hover:bg-zinc-200/50"
                    >
                        {t("projects.dialogs.cancel")}
                    </Button>
                    <Button
                        type="submit"
                        variant="gradient"
                        color="indigo"
                        disabled={loadingSections && activeTab === 'ai'}
                        className="normal-case font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
                    >
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

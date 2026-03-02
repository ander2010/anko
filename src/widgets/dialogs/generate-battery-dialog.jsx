import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Input,
    Typography,
    IconButton,
    Chip,
    Spinner,
    Select,
    Option,
    Accordion,
    AccordionHeader,
    AccordionBody,
    Checkbox,
} from "@material-tailwind/react";
import {
    XMarkIcon,
    BoltIcon,
    ExclamationCircleIcon,
    ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "@/context/language-context";
import projectService from "@/services/projectService";

function Icon({ id, open }) {
    return (
        <ChevronDownIcon
            className={`${id === open ? "rotate-180" : ""} h-5 w-5 transition-transform text-zinc-400`}
        />
    );
}

export function GenerateBatteryDialog({
    open,
    onClose,
    onGenerate,
    projectId,
    existingBatteries = [],
    rules = [],
}) {
    const { t, language } = useLanguage();
    const [loadingSections, setLoadingSections] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [scannedDocuments, setScannedDocuments] = useState([]);
    const [openAccordion, setOpenAccordion] = useState(0);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        rule: "",
        query_text: "",
        sections: [],
        quantity: 10,
        difficulty: "medium",
        question_format: "true_false",
    });

    useEffect(() => {
        if (open) {
            setErrors({});
            setSubmitting(false);
            setOpenAccordion(0);
            setFormData({
                rule: "",
                query_text: "",
                sections: [],
                quantity: 10,
                difficulty: "medium",
                question_format: "true_false",
            });
            if (projectId) {
                fetchSections();
            }
        }
    }, [open, projectId]);

    const fetchSections = async () => {
        try {
            setLoadingSections(true);
            const data = await projectService.getDocumentsWithSections(projectId);
            setScannedDocuments(data.documents || []);
        } catch (err) {
            console.error("Failed to fetch sections", err);
        } finally {
            setLoadingSections(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));

        if (name === "query_text") {
            const nameToCheck = value.trim() || (language === "es" ? "Batería" : "Battery");
            if (existingBatteries.some((b) => (b.name || "").toLowerCase() === nameToCheck.toLowerCase())) {
                setErrors((prev) => ({
                    ...prev,
                    query_text:
                        language === "es"
                            ? "Ya existe una batería con este nombre."
                            : "A battery with this name already exists.",
                }));
            }
        }
    };

    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const handleOpenAccordion = (value) => setOpenAccordion(openAccordion === value ? 0 : value);

    const handleSectionToggle = (sectionId) => {
        const sId = Number(sectionId);
        setFormData((prev) => {
            const exists = prev.sections.includes(sId);
            const updated = exists
                ? prev.sections.filter((id) => id !== sId)
                : [...prev.sections, sId];

            if (updated.length > 0 && errors.sections) {
                setErrors(prevErrors => ({ ...prevErrors, sections: null }));
            }
            return { ...prev, sections: updated };
        });
    };

    const handleDocumentToggle = (doc) => {
        const docSections = doc.sections || [];
        const docSectionIds = docSections.map(s => Number(s.id));

        setFormData((prev) => {
            const allSelected = docSectionIds.length > 0 && docSectionIds.every(id => prev.sections.includes(id));

            let newSectionIds;
            if (allSelected) {
                newSectionIds = prev.sections.filter(id => !docSectionIds.includes(id));
            } else {
                newSectionIds = [...new Set([...prev.sections, ...docSectionIds])];
            }

            if (newSectionIds.length > 0 && errors.sections) {
                setErrors(prevErrors => ({ ...prevErrors, sections: null }));
            }

            return { ...prev, sections: newSectionIds };
        });
    };

    const validate = () => {
        const newErrors = {};
        if (scannedDocuments.length === 0) {
            newErrors.sections =
                language === "es"
                    ? "No hay secciones disponibles. Sube un documento primero."
                    : "No sections available. Upload a document first.";
        } else if (formData.sections.length === 0) {
            newErrors.sections =
                language === "es" ? "Debes seleccionar al menos una sección." : "You must select at least one section.";
        }

        const nameToCheck = formData.query_text.trim() || (language === "es" ? "Batería" : "Battery");
        if (existingBatteries.some((b) => (b.name || "").toLowerCase() === nameToCheck.toLowerCase())) {
            newErrors.query_text =
                language === "es"
                    ? "Ya existe una batería con este nombre."
                    : "A battery with this name already exists.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            setSubmitting(true);

            // Reconstruct section objects from IDs to match parent expectation
            const allSections = scannedDocuments.flatMap(doc => doc.sections || []);
            const selectedSections = formData.sections
                .map(id => allSections.find(s => s.id === id))
                .filter(Boolean);

            onGenerate({
                ...formData,
                sections: selectedSections
            });
        }
    };

    return (
        <Dialog
            open={open}
            handler={onClose}
            size="lg"
            className="bg-white shadow-2xl rounded-3xl overflow-hidden ring-1 ring-zinc-900/5 max-h-[90vh] flex flex-col"
        >
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <DialogHeader className="relative p-0 overflow-hidden bg-zinc-50 border-b border-zinc-100 flex-none">
                    <div className="px-6 py-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
                            <BoltIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <Typography variant="h6" className="text-zinc-900 font-black tracking-tight">
                                {language === "es" ? "Generar Nueva Batería" : "Generate New Battery"}
                            </Typography>
                        </div>
                        <IconButton variant="text" color="blue-gray" onClick={onClose} className="rounded-full hover:bg-zinc-200/50">
                            <XMarkIcon className="h-6 w-6 text-zinc-400" strokeWidth={2} />
                        </IconButton>
                    </div>
                </DialogHeader>

                <DialogBody className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    {/* Query Text */}
                    <div>
                        <Typography variant="small" className="font-bold text-zinc-900 mb-1.5 ml-1">
                            {language === "es" ? "¿Sobre qué quieres las preguntas?" : "What do you want questions about?"} <span className="text-zinc-400 font-normal">({language === "es" ? "opcional" : "optional"})</span>
                        </Typography>
                        <Input
                            placeholder={language === "es" ? "Ej: Barca, Historia de España, etc." : "E.g: Barcelona, Spanish History, etc."}
                            className={`!bg-zinc-50/50 rounded-xl !text-zinc-900 ${errors.query_text ? "!border-red-500 focus:!border-red-600" : "!border-zinc-200 focus:!border-indigo-600"}`}
                            name="query_text"
                            value={formData.query_text}
                            onChange={handleInputChange}
                            labelProps={{ className: "hidden" }}
                        />
                        {errors.query_text && (
                            <Typography variant="small" color="red" className="mt-1 font-medium flex items-center gap-1">
                                <span className="h-1 w-1 rounded-full bg-red-500" /> {errors.query_text}
                            </Typography>
                        )}
                    </div>

                    {/* Sections Selection */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Typography variant="small" className="font-bold text-zinc-900 ml-1">
                                {language === "es" ? "Documentos & Secciones" : "Documents & Sections"} <span className="text-red-500">*</span>
                            </Typography>
                            {formData.sections.length > 0 && (
                                <Chip
                                    variant="ghost"
                                    color="indigo"
                                    className="rounded-lg border-indigo-100 bg-indigo-50 text-indigo-700 font-bold"
                                    value={`${formData.sections.length} ${language === "es" ? "seleccionadas" : "selected"}`}
                                />
                            )}
                        </div>

                        {loadingSections ? (
                            <div className="flex justify-center p-8 bg-zinc-50 rounded-2xl border border-zinc-100">
                                <Spinner className="h-6 w-6 text-indigo-500" />
                            </div>
                        ) : scannedDocuments.length === 0 ? (
                            <div className="p-8 text-center bg-red-50/50 rounded-2xl border border-dashed border-red-200">
                                <div className="flex flex-col items-center gap-2">
                                    <ExclamationCircleIcon className="h-8 w-8 text-red-400 mb-1" />
                                    <Typography variant="small" className="text-red-900 font-bold max-w-[280px] mx-auto leading-relaxed">
                                        {language === "es"
                                            ? "No hay secciones disponibles. Sube un documento para procesar el contenido."
                                            : "No sections available. Upload a document to process the content."}
                                    </Typography>
                                </div>
                            </div>
                        ) : (
                            <div className={`border rounded-2xl overflow-y-auto max-h-72 bg-white shadow-sm transition-colors ${errors.sections ? "border-red-500 bg-red-50/5" : "border-zinc-200"}`}>
                                {scannedDocuments.map((doc, index) => {
                                    const docId = Number(doc.id);
                                    const docSections = doc.sections || [];
                                    const docSectionIds = docSections.map(s => Number(s.id));

                                    const allSelected = docSectionIds.length > 0 && docSectionIds.every(id => formData.sections.includes(id));
                                    const someSelected = docSectionIds.some(id => formData.sections.includes(id));

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
                                                            {doc.filename || doc.name}
                                                        </Typography>
                                                        <Typography variant="small" className="font-bold text-zinc-400 text-[10px] bg-white border border-zinc-100 px-2 py-0.5 rounded-md">
                                                            {docSections.length} {language === "es" ? "secciones" : "sections"}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            </AccordionHeader>
                                            <AccordionBody className="py-2 px-4 bg-zinc-50/50">
                                                <div className="flex flex-col gap-1 pl-8 pr-2 pb-2">
                                                    {docSections.map(section => (
                                                        <div
                                                            key={section.id}
                                                            className={`flex items-start gap-4 p-2 rounded-lg cursor-pointer transition-all border border-transparent ${formData.sections.includes(Number(section.id)) ? "bg-white shadow-sm border-zinc-200" : "hover:bg-zinc-100"}`}
                                                            onClick={() => handleSectionToggle(section.id)}
                                                        >
                                                            <Checkbox
                                                                color="indigo"
                                                                checked={formData.sections.includes(Number(section.id))}
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
                        {errors.sections && (
                            <Typography variant="small" color="red" className="mt-1 font-medium flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> {errors.sections}
                            </Typography>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Rule Selection */}
                        <div>
                            <Typography variant="small" className="font-bold text-zinc-900 mb-1.5 ml-1">
                                {language === "es" ? "Regla" : "Rule"} <span className="text-zinc-400 font-normal">({language === "es" ? "opcional" : "optional"})</span>
                            </Typography>
                            <div className="relative">
                                <select
                                    className="w-full p-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-indigo-600 focus:ring-0 appearance-none transition-colors"
                                    value={formData.rule}
                                    onChange={(e) => handleSelectChange("rule", e.target.value)}
                                >
                                    <option value="">{language === "es" ? "Sin regla" : "No rule"}</option>
                                    {rules.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <ChevronDownIcon className="h-4 w-4 text-zinc-500" strokeWidth={2.5} />
                                </div>
                            </div>
                        </div>

                        {/* Quantity */}
                        {!formData.rule && (
                            <div>
                                <Typography variant="small" className="font-bold text-zinc-900 mb-1.5 ml-1">
                                    {language === "es" ? "Cantidad de Preguntas" : "Number of Questions"}
                                </Typography>
                                <Input
                                    type="number"
                                    min="1"
                                    max="100"
                                    className="!border-zinc-200 focus:!border-indigo-600 !bg-zinc-50/50 rounded-xl"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    labelProps={{ className: "hidden" }}
                                />
                            </div>
                        )}

                        {/* Difficulty */}
                        <div>
                            <Typography variant="small" className="font-bold text-zinc-900 mb-1.5 ml-1">
                                {language === "es" ? "Dificultad" : "Difficulty"}
                            </Typography>
                            <Select
                                value={formData.difficulty}
                                onChange={(val) => handleSelectChange("difficulty", val)}
                                className="!border-zinc-200 focus:!border-indigo-600 !bg-zinc-50/50 rounded-xl"
                                labelProps={{ className: "hidden" }}
                            >
                                <Option value="easy">{language === "es" ? "Fácil" : "Easy"}</Option>
                                <Option value="medium">{language === "es" ? "Medio" : "Medium"}</Option>
                                <Option value="hard">{language === "es" ? "Difícil" : "Hard"}</Option>
                            </Select>
                        </div>

                        {/* Question Format */}
                        <div>
                            <Typography variant="small" className="font-bold text-zinc-900 mb-1.5 ml-1">
                                {language === "es" ? "Formato de Pregunta" : "Question Format"}
                            </Typography>
                            <Select
                                value={formData.question_format}
                                onChange={(val) => handleSelectChange("question_format", val)}
                                className="!border-zinc-200 focus:!border-indigo-600 !bg-zinc-50/50 rounded-xl"
                                labelProps={{ className: "hidden" }}
                            >
                                <Option value="true_false">{language === "es" ? "Verdadero/Falso" : "True/False"}</Option>
                                <Option value="single_choice">{language === "es" ? "Opción Única" : "Single Choice"}</Option>
                                <Option value="multiple_choice">{language === "es" ? "Selección Múltiple" : "Multiple Choice"}</Option>
                                <Option value="variety">{language === "es" ? "Variado" : "Variety"}</Option>
                            </Select>
                        </div>
                    </div>
                </DialogBody>

                <DialogFooter className="bg-zinc-50/50 border-t border-zinc-100 p-4 flex justify-end gap-3 flex-none">
                    <Button
                        variant="text"
                        color="blue-gray"
                        onClick={onClose}
                        className="normal-case font-bold text-zinc-600 hover:bg-zinc-200/50"
                    >
                        {language === "es" ? "Cancelar" : "Cancel"}
                    </Button>
                    <Button
                        type="submit"
                        variant="gradient"
                        color="indigo"
                        disabled={submitting || loadingSections || (scannedDocuments.length === 0)}
                        className="normal-case font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
                    >
                        {submitting ? <Spinner className="h-4 w-4" /> : (language === "es" ? "Generar Batería" : "Generate Battery")}
                    </Button>
                </DialogFooter>
            </form>
        </Dialog>
    );
}

GenerateBatteryDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onGenerate: PropTypes.func.isRequired,
    projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    existingBatteries: PropTypes.array,
    rules: PropTypes.array,
};

export default GenerateBatteryDialog;

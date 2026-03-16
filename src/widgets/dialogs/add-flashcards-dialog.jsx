import React, { useState, useEffect, useRef } from "react";
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
    IconButton,
    Chip,
    Spinner,
} from "@material-tailwind/react";
import {
    XMarkIcon,
    RectangleStackIcon,
    PlusIcon,
    TrashIcon,
    PhotoIcon,
    DocumentTextIcon,
} from "@heroicons/react/24/outline";
import projectService from "@/services/projectService";
import { useLanguage } from "@/context/language-context";

export function AddFlashcardsDialog({ open, onClose, onSuccess, deckId, deckTitle }) {
    const { t, language } = useLanguage();

    // Mode: "text" | "rich"
    const [mode, setMode] = useState("text");

    // Text mode
    const [cards, setCards] = useState([]);
    const [currentCard, setCurrentCard] = useState({ front: "", back: "", notes: "" });

    // Rich mode
    const [richCards, setRichCards] = useState([]);
    const [richForm, setRichForm] = useState({ front: "", back: "", notes: "" });
    const [richImageFile, setRichImageFile] = useState(null);
    const [richPreviewUrl, setRichPreviewUrl] = useState(null);
    const [imageConstraints, setImageConstraints] = useState(null);
    const [uploadWarnings, setUploadWarnings] = useState([]);
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [submitProgress, setSubmitProgress] = useState(null); // "2/5"
    const [error, setError] = useState(null);

    // Load image constraints once when dialog opens
    useEffect(() => {
        if (open) {
            projectService.getRichCardConfig()
                .then(data => setImageConstraints(data?.image_constraints || null))
                .catch(() => {});
        }
    }, [open]);

    // Cleanup preview URLs on close
    useEffect(() => {
        if (!open) {
            richCards.forEach(c => c.previewUrl && URL.revokeObjectURL(c.previewUrl));
            if (richPreviewUrl) URL.revokeObjectURL(richPreviewUrl);
        }
    }, [open]);

    // ---- Text mode handlers ----
    const handleCurrentCardChange = (e) => {
        const { name, value } = e.target;
        setCurrentCard(prev => ({ ...prev, [name]: value }));
    };

    const addCardToBatch = () => {
        if (!currentCard.front.trim() || !currentCard.back.trim()) return;
        setCards(prev => [...prev, { ...currentCard }]);
        setCurrentCard({ front: "", back: "", notes: "" });
    };

    const removeCardFromBatch = (index) => setCards(prev => prev.filter((_, i) => i !== index));

    // ---- Rich mode handlers ----
    const handleRichFormChange = (e) => {
        const { name, value } = e.target;
        setRichForm(prev => ({ ...prev, [name]: value }));
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (richPreviewUrl) URL.revokeObjectURL(richPreviewUrl);
        setRichImageFile(file);
        setRichPreviewUrl(URL.createObjectURL(file));
    };

    const clearImage = () => {
        if (richPreviewUrl) URL.revokeObjectURL(richPreviewUrl);
        setRichImageFile(null);
        setRichPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const richCardValid = richForm.front.trim() && (richImageFile || richForm.back.trim());

    const addRichCardToBatch = () => {
        if (!richCardValid) return;
        setRichCards(prev => [...prev, {
            front: richForm.front,
            back: richForm.back,
            notes: richForm.notes,
            file: richImageFile,
            previewUrl: richPreviewUrl,
        }]);
        setRichForm({ front: "", back: "", notes: "" });
        setRichImageFile(null);
        setRichPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeRichCard = (index) => {
        const card = richCards[index];
        if (card?.previewUrl) URL.revokeObjectURL(card.previewUrl);
        setRichCards(prev => prev.filter((_, i) => i !== index));
    };

    // ---- Submit ----
    const handleSubmit = async () => {
        const total = mode === "text" ? cards.length : richCards.length;
        if (total === 0) {
            setError(language === "es" ? "Debes agregar al menos una ficha." : "You must add at least one card.");
            return;
        }
        setLoading(true);
        setError(null);
        setUploadWarnings([]);
        try {
            if (mode === "text") {
                await projectService.addFlashcards({ deck_id: deckId, cards });
            } else {
                const warnings = [];
                for (let i = 0; i < richCards.length; i++) {
                    setSubmitProgress(`${i + 1}/${richCards.length}`);
                    const card = richCards[i];
                    const formData = new FormData();
                    formData.append("front", card.front);
                    if (card.back) formData.append("back", card.back);
                    if (card.notes) formData.append("notes", card.notes);
                    if (card.file) formData.append("back_image", card.file);
                    const result = await projectService.addRichCard(deckId, formData);
                    if (result?.card?.backImageWarnings?.length) {
                        warnings.push(...result.card.backImageWarnings);
                    }
                }
                if (warnings.length) setUploadWarnings([...new Set(warnings)]);
            }
            setCards([]);
            setRichCards([]);
            onSuccess && onSuccess();
            if (uploadWarnings.length === 0) onClose();
        } catch (err) {
            setError(err?.error || (language === "es" ? "Error al agregar fichas." : "Failed to add flashcards."));
        } finally {
            setLoading(false);
            setSubmitProgress(null);
        }
    };

    const handleClear = () => {
        setCards([]);
        setRichCards([]);
        setCurrentCard({ front: "", back: "", notes: "" });
        setRichForm({ front: "", back: "", notes: "" });
        clearImage();
        setError(null);
        setUploadWarnings([]);
        onClose();
    };

    const switchMode = (newMode) => {
        if (newMode === mode) return;
        setMode(newMode);
        setError(null);
    };

    const totalBatch = mode === "text" ? cards.length : richCards.length;

    return (
        <Dialog
            open={open}
            handler={handleClear}
            size="lg"
            className="bg-white shadow-2xl rounded-3xl overflow-hidden ring-1 ring-zinc-900/5 h-[85vh] flex flex-col"
        >
            <div className="flex flex-col h-full">
                {/* Header */}
                <DialogHeader className="relative p-0 overflow-hidden bg-zinc-50 border-b border-zinc-100 flex-none">
                    <div className="px-6 py-4 flex items-center gap-4 w-full">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
                            <RectangleStackIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <Typography variant="h6" className="text-zinc-900 font-black tracking-tight">
                                {language === "es" ? "Añadir Fichas a:" : "Add Flashcards to:"}
                            </Typography>
                            <Typography variant="small" className="text-indigo-600 font-bold -mt-1 truncate max-w-[400px]">
                                {deckTitle || "..."}
                            </Typography>
                        </div>
                        <IconButton variant="text" color="blue-gray" onClick={handleClear} className="rounded-full hover:bg-zinc-200/50">
                            <XMarkIcon className="h-6 w-6 text-zinc-400" strokeWidth={2} />
                        </IconButton>
                    </div>

                    {/* Mode toggle */}
                    <div className="px-6 pb-4 grid grid-cols-2 gap-3">
                        <button
                            onClick={() => switchMode("text")}
                            className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-left transition-all duration-200 group ${
                                mode === "text"
                                    ? "border-indigo-500 bg-indigo-50 shadow-sm shadow-indigo-100"
                                    : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/60"
                            }`}
                        >
                            <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${mode === "text" ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30" : "bg-zinc-100 text-zinc-400 group-hover:bg-zinc-200"}`}>
                                <DocumentTextIcon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                            </div>
                            <div className="min-w-0">
                                <p className={`text-xs font-black tracking-tight leading-tight ${mode === "text" ? "text-indigo-700" : "text-zinc-700"}`}>
                                    {language === "es" ? "Solo texto" : "Text only"}
                                </p>
                                <p className={`text-[10px] font-medium leading-tight mt-0.5 ${mode === "text" ? "text-indigo-400" : "text-zinc-400"}`}>
                                    {language === "es" ? "Frente y reverso en texto" : "Front & back as text"}
                                </p>
                            </div>
                            {mode === "text" && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-indigo-500" />}
                        </button>

                        <button
                            onClick={() => switchMode("rich")}
                            className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-left transition-all duration-200 group ${
                                mode === "rich"
                                    ? "border-purple-500 bg-purple-50 shadow-sm shadow-purple-100"
                                    : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/60"
                            }`}
                        >
                            <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${mode === "rich" ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/30" : "bg-zinc-100 text-zinc-400 group-hover:bg-zinc-200"}`}>
                                <PhotoIcon className="h-[18px] w-[18px]" />
                            </div>
                            <div className="min-w-0">
                                <p className={`text-xs font-black tracking-tight leading-tight ${mode === "rich" ? "text-purple-700" : "text-zinc-700"}`}>
                                    {language === "es" ? "Con imagen" : "With image"}
                                </p>
                                <p className={`text-[10px] font-medium leading-tight mt-0.5 ${mode === "rich" ? "text-purple-400" : "text-zinc-400"}`}>
                                    {language === "es" ? "Imagen + texto en el reverso" : "Image + text on back"}
                                </p>
                            </div>
                            {mode === "rich" && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-purple-500" />}
                        </button>
                    </div>
                </DialogHeader>

                <DialogBody className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

                    {/* ===== TEXT MODE FORM ===== */}
                    {mode === "text" && (
                        <div className="p-5 bg-zinc-50/80 rounded-2xl border border-zinc-200 space-y-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <Typography variant="small" className="font-black text-zinc-900 uppercase tracking-wider text-[10px]">
                                    {language === "es" ? "Nueva Ficha" : "New Card"}
                                </Typography>
                                <Chip value={cards.length} size="sm" variant="ghost" color="indigo" className="rounded-full" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label={language === "es" ? "Frente (Pregunta)" : "Front (Question)"}
                                    name="front"
                                    value={currentCard.front}
                                    onChange={handleCurrentCardChange}
                                    className="bg-white"
                                    labelProps={{ className: "text-zinc-500 font-bold" }}
                                />
                                <Input
                                    label={language === "es" ? "Reverso (Respuesta)" : "Back (Answer)"}
                                    name="back"
                                    value={currentCard.back}
                                    onChange={handleCurrentCardChange}
                                    className="bg-white"
                                    labelProps={{ className: "text-zinc-500 font-bold" }}
                                />
                            </div>
                            <Input
                                label={language === "es" ? "Notas (Opcional)" : "Notes (Optional)"}
                                name="notes"
                                value={currentCard.notes}
                                onChange={handleCurrentCardChange}
                                className="bg-white"
                                labelProps={{ className: "text-zinc-500 font-bold" }}
                            />
                            <div className="flex justify-end">
                                <Button
                                    size="sm"
                                    color="indigo"
                                    className="flex items-center gap-2 normal-case font-bold"
                                    onClick={addCardToBatch}
                                    disabled={!currentCard.front.trim() || !currentCard.back.trim() || loading}
                                >
                                    <PlusIcon className="h-3 w-3" strokeWidth={3} />
                                    {language === "es" ? "Agregar a la lista" : "Add to list"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* ===== RICH MODE FORM ===== */}
                    {mode === "rich" && (
                        <div className="p-5 bg-zinc-50/80 rounded-2xl border border-zinc-200 space-y-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <Typography variant="small" className="font-black text-zinc-900 uppercase tracking-wider text-[10px]">
                                    {language === "es" ? "Nueva Ficha con Imagen" : "New Rich Card"}
                                </Typography>
                                <Chip value={richCards.length} size="sm" variant="ghost" color="indigo" className="rounded-full" />
                            </div>

                            {/* Front */}
                            <Input
                                label={language === "es" ? "Frente (Pregunta) *" : "Front (Question) *"}
                                name="front"
                                value={richForm.front}
                                onChange={handleRichFormChange}
                                className="bg-white"
                                labelProps={{ className: "text-zinc-500 font-bold" }}
                            />

                            {/* Image picker */}
                            <div>
                                <Typography variant="small" className="font-bold text-zinc-600 text-xs mb-2">
                                    {language === "es" ? "Imagen del reverso (opcional si hay texto)" : "Back image (optional if back text is provided)"}
                                </Typography>

                                {richPreviewUrl ? (
                                    <div className="relative inline-block">
                                        <img
                                            src={richPreviewUrl}
                                            alt="preview"
                                            className="h-36 rounded-xl object-contain border border-zinc-200 bg-zinc-100"
                                        />
                                        <button
                                            onClick={clearImage}
                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow hover:bg-red-600"
                                        >
                                            <XMarkIcon className="h-3.5 w-3.5" />
                                        </button>
                                        <Typography variant="small" className="text-zinc-400 text-[10px] mt-1">
                                            {richImageFile?.name} · {(richImageFile?.size / 1024).toFixed(0)} KB
                                        </Typography>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center h-24 rounded-xl border-2 border-dashed border-zinc-300 hover:border-indigo-400 cursor-pointer transition-colors bg-white hover:bg-indigo-50/30">
                                        <PhotoIcon className="h-7 w-7 text-zinc-300 mb-1" />
                                        <Typography variant="small" className="text-zinc-400 text-xs font-medium">
                                            {language === "es" ? "Haz clic para subir imagen" : "Click to upload image"}
                                        </Typography>
                                        {imageConstraints && (
                                            <Typography className="text-[10px] text-zinc-300 mt-0.5">
                                                {imageConstraints.allowed_formats?.join(", ").toUpperCase()} · max {imageConstraints.max_file_size_mb} MB · min {imageConstraints.min_resolution?.width}×{imageConstraints.min_resolution?.height}px
                                            </Typography>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpg,image/jpeg,image/png,image/webp"
                                            className="hidden"
                                            onChange={handleImageSelect}
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Back text */}
                            <Textarea
                                label={language === "es" ? "Texto del reverso (opcional)" : "Back text (optional)"}
                                name="back"
                                value={richForm.back}
                                onChange={handleRichFormChange}
                                rows={2}
                                className="bg-white"
                                labelProps={{ className: "text-zinc-500 font-bold" }}
                            />

                            <Input
                                label={language === "es" ? "Notas (Opcional)" : "Notes (Optional)"}
                                name="notes"
                                value={richForm.notes}
                                onChange={handleRichFormChange}
                                className="bg-white"
                                labelProps={{ className: "text-zinc-500 font-bold" }}
                            />

                            {!richCardValid && richForm.front.trim() && (
                                <Typography className="text-[11px] text-amber-600 font-medium">
                                    {language === "es" ? "Agrega imagen o texto de reverso." : "Add a back image or back text."}
                                </Typography>
                            )}

                            <div className="flex justify-end">
                                <Button
                                    size="sm"
                                    color="indigo"
                                    className="flex items-center gap-2 normal-case font-bold"
                                    onClick={addRichCardToBatch}
                                    disabled={!richCardValid || loading}
                                >
                                    <PlusIcon className="h-3 w-3" strokeWidth={3} />
                                    {language === "es" ? "Agregar a la lista" : "Add to list"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* ===== BATCH LIST ===== */}
                    {mode === "text" && cards.length > 0 && (
                        <div className="space-y-3">
                            <Typography variant="small" className="font-bold text-zinc-500 text-xs uppercase tracking-wider ml-1">
                                {language === "es" ? "Fichas para agregar" : "Cards to add"}
                            </Typography>
                            <div className="space-y-2">
                                {cards.map((card, index) => (
                                    <div key={index} className="flex items-start justify-between p-4 bg-white rounded-xl border border-zinc-100 shadow-sm hover:border-indigo-100 hover:shadow-md group transition-all">
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Typography variant="small" className="font-bold text-zinc-900 text-xs mb-1">
                                                    {language === "es" ? "Frente" : "Front"}
                                                </Typography>
                                                <Typography variant="small" className="text-zinc-600 leading-snug">{card.front}</Typography>
                                            </div>
                                            <div>
                                                <Typography variant="small" className="font-bold text-zinc-900 text-xs mb-1">
                                                    {language === "es" ? "Reverso" : "Back"}
                                                </Typography>
                                                <Typography variant="small" className="text-zinc-600 leading-snug">{card.back}</Typography>
                                            </div>
                                        </div>
                                        <IconButton size="sm" color="red" variant="text" className="ml-2 opacity-50 group-hover:opacity-100 transition-opacity" onClick={() => removeCardFromBatch(index)} disabled={loading}>
                                            <TrashIcon className="h-4 w-4" />
                                        </IconButton>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {mode === "rich" && richCards.length > 0 && (
                        <div className="space-y-3">
                            <Typography variant="small" className="font-bold text-zinc-500 text-xs uppercase tracking-wider ml-1">
                                {language === "es" ? "Fichas para agregar" : "Cards to add"}
                            </Typography>
                            <div className="space-y-2">
                                {richCards.map((card, index) => (
                                    <div key={index} className="flex items-start justify-between p-4 bg-white rounded-xl border border-zinc-100 shadow-sm hover:border-indigo-100 group transition-all gap-3">
                                        {card.previewUrl && (
                                            <img src={card.previewUrl} alt="back" className="h-14 w-14 rounded-lg object-cover border border-zinc-200 flex-shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <Typography variant="small" className="font-bold text-zinc-900 text-xs truncate">{card.front}</Typography>
                                            {card.back && <Typography variant="small" className="text-zinc-500 text-xs truncate">{card.back}</Typography>}
                                            {!card.previewUrl && <Typography className="text-[10px] text-zinc-300 italic">{language === "es" ? "Sin imagen" : "No image"}</Typography>}
                                        </div>
                                        <IconButton size="sm" color="red" variant="text" className="opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={() => removeRichCard(index)} disabled={loading}>
                                            <TrashIcon className="h-4 w-4" />
                                        </IconButton>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Warnings after upload */}
                    {uploadWarnings.length > 0 && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                            <Typography variant="small" className="font-bold text-amber-800 text-xs uppercase tracking-wider">
                                {language === "es" ? "Advertencias de imagen" : "Image warnings"}
                            </Typography>
                            {uploadWarnings.map((w, i) => (
                                <Typography key={i} variant="small" className="text-amber-700 text-xs">{w}</Typography>
                            ))}
                            <Button size="sm" variant="text" color="amber" className="normal-case font-bold mt-2 px-0" onClick={handleClear}>
                                {language === "es" ? "Cerrar" : "Close"}
                            </Button>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                            {error}
                        </div>
                    )}
                </DialogBody>

                <DialogFooter className="bg-zinc-50/50 border-t border-zinc-100 p-4 flex justify-end gap-3 flex-none">
                    <Button variant="text" color="blue-gray" onClick={handleClear} className="normal-case font-bold text-zinc-600 hover:bg-zinc-200/50" disabled={loading}>
                        {t("projects.dialogs.cancel")}
                    </Button>
                    <Button
                        variant="gradient"
                        color="indigo"
                        onClick={handleSubmit}
                        disabled={loading || totalBatch === 0}
                        className="normal-case font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 flex items-center gap-2"
                    >
                        {loading && <Spinner className="h-4 w-4" />}
                        {loading && submitProgress
                            ? (language === "es" ? `Subiendo ${submitProgress}...` : `Uploading ${submitProgress}...`)
                            : (language === "es" ? `Guardar ${totalBatch} fichas` : `Save ${totalBatch} cards`)}
                    </Button>
                </DialogFooter>
            </div>
        </Dialog>
    );
}

AddFlashcardsDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func,
    deckId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    deckTitle: PropTypes.string,
};

export default AddFlashcardsDialog;

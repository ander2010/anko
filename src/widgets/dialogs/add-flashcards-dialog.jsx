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
} from "@heroicons/react/24/outline";
import projectService from "@/services/projectService";
import { useLanguage } from "@/context/language-context";

export function AddFlashcardsDialog({ open, onClose, onSuccess, deckId, deckTitle }) {
    const { t, language } = useLanguage();

    // Unified batch: each card has { front, back, notes, file?, previewUrl? }
    const [cards, setCards] = useState([]);
    const [form, setForm] = useState({ front: "", back: "", notes: "" });
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [imageConstraints, setImageConstraints] = useState(null);
    const [uploadWarnings, setUploadWarnings] = useState([]);
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [submitProgress, setSubmitProgress] = useState(null);
    const [error, setError] = useState(null);

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
            cards.forEach(c => c.previewUrl && URL.revokeObjectURL(c.previewUrl));
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        }
    }, [open]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const clearImage = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setImageFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Back is required only when there's no image
    const isValid = form.front.trim() && (imageFile || form.back.trim());

    const addCardToBatch = () => {
        if (!isValid) return;
        setCards(prev => [...prev, {
            front: form.front,
            back: form.back,
            notes: form.notes,
            file: imageFile,
            previewUrl: previewUrl,
        }]);
        setForm({ front: "", back: "", notes: "" });
        setImageFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeCard = (index) => {
        const card = cards[index];
        if (card?.previewUrl) URL.revokeObjectURL(card.previewUrl);
        setCards(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (cards.length === 0) {
            setError(language === "es" ? "Debes agregar al menos una ficha." : "You must add at least one card.");
            return;
        }
        setLoading(true);
        setError(null);
        setUploadWarnings([]);

        try {
            const textCards = cards.filter(c => !c.file);
            const richCards = cards.filter(c => c.file);

            // Submit text-only cards in one batch
            if (textCards.length > 0) {
                await projectService.addFlashcards({
                    deck_id: deckId,
                    cards: textCards.map(c => ({ front: c.front, back: c.back, notes: c.notes })),
                });
            }

            // Submit rich cards one by one
            const warnings = [];
            for (let i = 0; i < richCards.length; i++) {
                setSubmitProgress(`${textCards.length + i + 1}/${cards.length}`);
                const card = richCards[i];
                const formData = new FormData();
                formData.append("front", card.front);
                if (card.back) formData.append("back", card.back);
                if (card.notes) formData.append("notes", card.notes);
                formData.append("back_image", card.file);
                const result = await projectService.addRichCard(deckId, formData);
                if (result?.card?.backImageWarnings?.length) {
                    warnings.push(...result.card.backImageWarnings);
                }
            }

            if (warnings.length) setUploadWarnings([...new Set(warnings)]);

            setCards([]);
            onSuccess && onSuccess();
            if (warnings.length === 0) onClose();
        } catch (err) {
            setError(err?.error || (language === "es" ? "Error al agregar fichas." : "Failed to add flashcards."));
        } finally {
            setLoading(false);
            setSubmitProgress(null);
        }
    };

    const handleClear = () => {
        cards.forEach(c => c.previewUrl && URL.revokeObjectURL(c.previewUrl));
        setCards([]);
        setForm({ front: "", back: "", notes: "" });
        clearImage();
        setError(null);
        setUploadWarnings([]);
        onClose();
    };

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
                </DialogHeader>

                <DialogBody className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

                    {/* Form */}
                    <div className="p-5 bg-zinc-50/80 rounded-2xl border border-zinc-200 space-y-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <Typography variant="small" className="font-black text-zinc-900 uppercase tracking-wider text-[10px]">
                                {language === "es" ? "Nueva Ficha" : "New Card"}
                            </Typography>
                            <Chip value={cards.length} size="sm" variant="ghost" color="indigo" className="rounded-full" />
                        </div>

                        {/* Front */}
                        <Input
                            label={language === "es" ? "Frente (Pregunta) *" : "Front (Question) *"}
                            name="front"
                            value={form.front}
                            onChange={handleFormChange}
                            className="bg-white"
                            labelProps={{ className: "text-zinc-500 font-bold" }}
                        />

                        {/* Image picker */}
                        <div>
                            <Typography variant="small" className="font-bold text-zinc-600 text-xs mb-2">
                                {language === "es" ? "Imagen del reverso (opcional)" : "Back image (optional)"}
                            </Typography>
                            {previewUrl ? (
                                <div className="relative inline-block">
                                    <img
                                        src={previewUrl}
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
                                        {imageFile?.name} · {(imageFile?.size / 1024).toFixed(0)} KB
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
                                            {imageConstraints.allowed_formats?.join(", ").toUpperCase()} · max {imageConstraints.max_file_size_mb} MB
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
                            label={imageFile
                                ? (language === "es" ? "Texto del reverso (opcional)" : "Back text (optional)")
                                : (language === "es" ? "Reverso (Respuesta) *" : "Back (Answer) *")}
                            name="back"
                            value={form.back}
                            onChange={handleFormChange}
                            rows={2}
                            className="bg-white"
                            labelProps={{ className: "text-zinc-500 font-bold" }}
                        />

                        {/* Notes */}
                        <Input
                            label={language === "es" ? "Notas (Opcional)" : "Notes (Optional)"}
                            name="notes"
                            value={form.notes}
                            onChange={handleFormChange}
                            className="bg-white"
                            labelProps={{ className: "text-zinc-500 font-bold" }}
                        />

                        {!isValid && form.front.trim() && (
                            <Typography className="text-[11px] text-amber-600 font-medium">
                                {language === "es" ? "Agrega texto de reverso o una imagen." : "Add back text or an image."}
                            </Typography>
                        )}

                        <div className="flex justify-end">
                            <Button
                                size="sm"
                                color="indigo"
                                className="flex items-center gap-2 normal-case font-bold"
                                onClick={addCardToBatch}
                                disabled={!isValid || loading}
                            >
                                <PlusIcon className="h-3 w-3" strokeWidth={3} />
                                {language === "es" ? "Agregar a la lista" : "Add to list"}
                            </Button>
                        </div>
                    </div>

                    {/* Batch list */}
                    {cards.length > 0 && (
                        <div className="space-y-3">
                            <Typography variant="small" className="font-bold text-zinc-500 text-xs uppercase tracking-wider ml-1">
                                {language === "es" ? "Fichas para agregar" : "Cards to add"}
                            </Typography>
                            <div className="space-y-2">
                                {cards.map((card, index) => (
                                    <div key={index} className="flex items-start justify-between p-4 bg-white rounded-xl border border-zinc-100 shadow-sm hover:border-indigo-100 group transition-all gap-3">
                                        {card.previewUrl && (
                                            <img src={card.previewUrl} alt="back" className="h-14 w-14 rounded-lg object-cover border border-zinc-200 flex-shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <Typography variant="small" className="font-bold text-zinc-900 text-xs truncate">{card.front}</Typography>
                                            {card.back && <Typography variant="small" className="text-zinc-500 text-xs truncate">{card.back}</Typography>}
                                            {!card.previewUrl && !card.back && (
                                                <Typography className="text-[10px] text-zinc-300 italic">{language === "es" ? "Sin reverso" : "No back"}</Typography>
                                            )}
                                        </div>
                                        <IconButton size="sm" color="red" variant="text" className="opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={() => removeCard(index)} disabled={loading}>
                                            <TrashIcon className="h-4 w-4" />
                                        </IconButton>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Warnings */}
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
                        disabled={loading || cards.length === 0}
                        className="normal-case font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 flex items-center gap-2"
                    >
                        {loading && <Spinner className="h-4 w-4" />}
                        {loading && submitProgress
                            ? (language === "es" ? `Subiendo ${submitProgress}...` : `Uploading ${submitProgress}...`)
                            : (language === "es" ? `Guardar ${cards.length} fichas` : `Save ${cards.length} cards`)}
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

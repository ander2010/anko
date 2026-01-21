import React, { useState } from "react";
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
} from "@material-tailwind/react";
import {
    XMarkIcon,
    RectangleStackIcon,
    PlusIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";
import projectService from "@/services/projectService";
import { useLanguage } from "@/context/language-context";

export function AddFlashcardsDialog({ open, onClose, onSuccess, deckId, deckTitle }) {
    const { t, language } = useLanguage();
    const [cards, setCards] = useState([]);
    const [currentCard, setCurrentCard] = useState({ front: "", back: "", notes: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCurrentCardChange = (e) => {
        const { name, value } = e.target;
        setCurrentCard((prev) => ({ ...prev, [name]: value }));
    };

    const addCardToBatch = () => {
        if (!currentCard.front.trim() || !currentCard.back.trim()) return;
        setCards((prev) => [...prev, { ...currentCard }]);
        setCurrentCard({ front: "", back: "", notes: "" });
    };

    const removeCardFromBatch = (index) => {
        setCards((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (cards.length === 0) {
            setError(language === "es" ? "Debes agregar al menos una ficha." : "You must add at least one card.");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await projectService.addFlashcards({
                deck_id: deckId,
                cards: cards,
            });
            setCards([]);
            onSuccess && onSuccess();
            onClose();
        } catch (err) {
            console.error("[AddFlashcardsDialog] Error:", err);
            setError(err?.error || (language === "es" ? "Error al agregar fichas." : "Failed to add flashcards."));
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setCards([]);
        setCurrentCard({ front: "", back: "", notes: "" });
        setError(null);
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
                        <IconButton
                            variant="text"
                            color="blue-gray"
                            onClick={handleClear}
                            className="rounded-full hover:bg-zinc-200/50"
                        >
                            <XMarkIcon className="h-6 w-6 text-zinc-400" strokeWidth={2} />
                        </IconButton>
                    </div>
                </DialogHeader>

                <DialogBody className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    {/* Form area */}
                    <div className="p-5 bg-zinc-50/80 rounded-2xl border border-zinc-200 space-y-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <Typography variant="small" className="font-black text-zinc-900 uppercase tracking-wider text-[10px]">
                                {language === "es" ? "Nueva Ficha" : "New Card"}
                            </Typography>
                            <Chip
                                value={cards.length}
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

                    {/* Batch List */}
                    {cards.length > 0 && (
                        <div className="space-y-3">
                            <Typography variant="small" className="font-bold text-zinc-500 text-xs uppercase tracking-wider ml-1">
                                {language === "es" ? "Fichas para agregar" : "Cards to add"}
                            </Typography>
                            <div className="space-y-2">
                                {cards.map((card, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start justify-between p-4 bg-white rounded-xl border border-zinc-100 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md group"
                                    >
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
                                            className="ml-2 opacity-50 group-hover:opacity-100 transition-opacity"
                                            onClick={() => removeCardFromBatch(index)}
                                            disabled={loading}
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </IconButton>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            {error}
                        </div>
                    )}
                </DialogBody>

                <DialogFooter className="bg-zinc-50/50 border-t border-zinc-100 p-4 flex justify-end gap-3 flex-none">
                    <Button
                        variant="text"
                        color="blue-gray"
                        onClick={handleClear}
                        className="normal-case font-bold text-zinc-600 hover:bg-zinc-200/50"
                        disabled={loading}
                    >
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
                        {language === "es" ? `Guardar ${cards.length} fichas` : `Save ${cards.length} cards`}
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

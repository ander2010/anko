import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Typography,
    IconButton,
    Spinner,
} from "@material-tailwind/react";
import {
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ArrowPathIcon,
    LightBulbIcon,
    DocumentTextIcon,
} from "@heroicons/react/24/outline";
import projectService from "@/services/projectService";
import { useLanguage } from "@/context/language-context";

export function FlashcardViewDialog({ open, onClose, deckId, deckTitle }) {
    const { t, language } = useLanguage();
    const [flashcards, setFlashcards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showNotes, setShowNotes] = useState(false);

    useEffect(() => {
        if (open && deckId) {
            fetchFlashcards();
        }
    }, [open, deckId]);

    const fetchFlashcards = async () => {
        try {
            setLoading(true);
            const data = await projectService.getDeckFlashcards(deckId);
            setFlashcards(data || []);
            setCurrentIndex(0);
            setIsFlipped(false);
            setShowNotes(false);
        } catch (err) {
            console.error("Error fetching flashcards:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (currentIndex < flashcards.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
            setShowNotes(false);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setIsFlipped(false);
            setShowNotes(false);
        }
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const currentCard = flashcards[currentIndex];

    return (
        <Dialog open={open} handler={onClose} size="xl" className="bg-transparent shadow-none">
            <div className="flex flex-col h-[85vh] max-h-[700px] bg-white rounded-xl overflow-hidden">
                <DialogHeader className="flex justify-between items-center border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                    <div>
                        <Typography variant="h5" color="blue-gray">
                            {deckTitle}
                        </Typography>
                        <Typography variant="small" color="gray" className="font-normal">
                            {flashcards.length > 0 ? `${currentIndex + 1} / ${flashcards.length}` : "No cards"}
                        </Typography>
                    </div>
                    <IconButton variant="text" color="blue-gray" onClick={onClose} className="rounded-full">
                        <XMarkIcon className="h-6 w-6" />
                    </IconButton>
                </DialogHeader>

                <DialogBody className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 overflow-hidden relative">
                    {loading ? (
                        <div className="flex flex-col items-center gap-4">
                            <Spinner className="h-10 w-10 text-blue-500" />
                            <Typography color="gray" className="italic">
                                {language === "es" ? "Cargando fichas..." : "Loading cards..."}
                            </Typography>
                        </div>
                    ) : flashcards.length === 0 ? (
                        <div className="text-center">
                            <Typography variant="h6" color="blue-gray">
                                {language === "es" ? "No hay fichas en este mazo" : "No flashcards in this deck"}
                            </Typography>
                        </div>
                    ) : (
                        <div className="w-full max-w-2xl h-full flex flex-col perspective-1000">
                            {/* Card Container with Flip Animation */}
                            <div
                                className={`relative w-full aspect-[4/3] transition-transform duration-500 transform-style-3d cursor-pointer ${isFlipped ? "rotate-y-180" : ""}`}
                                onClick={handleFlip}
                            >
                                {/* Front Side */}
                                <div className="absolute inset-0 backface-hidden bg-white border-2 border-blue-100 rounded-2xl shadow-xl flex flex-col p-8 items-center justify-center text-center">
                                    <div className="absolute top-4 left-6">
                                        <Typography variant="small" color="blue" className="font-bold uppercase tracking-wider text-[10px]">
                                            {t("global.actions.front")}
                                        </Typography>
                                    </div>
                                    <Typography variant="h3" color="blue-gray" className="leading-tight break-words overflow-y-auto max-h-full">
                                        {currentCard.front || currentCard.question}
                                    </Typography>
                                    <div className="absolute bottom-6 text-blue-gray-300 flex items-center gap-2">
                                        <ArrowPathIcon className="h-4 w-4" />
                                        <Typography variant="small" className="font-medium text-[11px]">
                                            {language === "es" ? "Haz clic para girar" : "Click to flip"}
                                        </Typography>
                                    </div>
                                </div>

                                {/* Back Side */}
                                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-blue-50 border-2 border-blue-200 rounded-2xl shadow-xl flex flex-col p-8 items-center justify-center text-center">
                                    <div className="absolute top-4 left-6">
                                        <Typography variant="small" color="blue" className="font-bold uppercase tracking-wider text-[10px]">
                                            {t("global.actions.back")}
                                        </Typography>
                                    </div>
                                    <Typography variant="h4" color="blue-gray" className="leading-snug break-words overflow-y-auto max-h-full mb-4">
                                        {currentCard.back || currentCard.answer}
                                    </Typography>

                                    {currentCard.explanation && (
                                        <div className="mt-4 p-4 bg-white/60 rounded-lg border border-blue-100 w-full overflow-y-auto max-h-[150px]">
                                            <div className="flex items-center gap-2 mb-1 justify-center">
                                                <LightBulbIcon className="h-4 w-4 text-amber-500" />
                                                <Typography variant="small" className="font-bold text-blue-gray-800 text-[10px]">
                                                    {t("global.actions.explanation")}
                                                </Typography>
                                            </div>
                                            <Typography variant="small" className="text-blue-gray-700 text-xs italic">
                                                {currentCard.explanation}
                                            </Typography>
                                        </div>
                                    )}

                                    <div className="absolute bottom-6 text-blue-300 flex items-center gap-2">
                                        <ArrowPathIcon className="h-4 w-4" />
                                        <Typography variant="small" className="font-medium text-[11px]">
                                            {language === "es" ? "Haz clic para volver" : "Click to go back"}
                                        </Typography>
                                    </div>
                                </div>
                            </div>

                            {/* Flashcard Actions (Notes) */}
                            <div className="mt-8 flex justify-center gap-4">
                                {currentCard.notes && (
                                    <Button
                                        variant={showNotes ? "gradient" : "outlined"}
                                        color="amber"
                                        size="sm"
                                        className="flex items-center gap-2 rounded-full normal-case"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowNotes(!showNotes);
                                        }}
                                    >
                                        <DocumentTextIcon className="h-4 w-4" />
                                        {t("global.actions.notes")}
                                    </Button>
                                )}
                            </div>

                            {showNotes && currentCard.notes && (
                                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg animate-fade-in">
                                    <Typography variant="small" color="amber" className="font-bold mb-1 text-[11px] uppercase">
                                        {t("global.actions.notes")}
                                    </Typography>
                                    <Typography variant="small" color="blue-gray" className="text-xs">
                                        {currentCard.notes}
                                    </Typography>
                                </div>
                            )}
                        </div>
                    )}
                </DialogBody>

                <DialogFooter className="justify-between border-t border-gray-100 bg-gray-50/30 px-6 py-4">
                    <Button
                        variant="text"
                        color="blue-gray"
                        className="flex items-center gap-2 normal-case"
                        onClick={handlePrev}
                        disabled={currentIndex === 0 || loading}
                    >
                        <ChevronLeftIcon className="h-4 w-4 stroke-2" />
                        {language === "es" ? "Anterior" : "Previous"}
                    </Button>

                    <div className="hidden sm:block">
                        <div className="flex gap-1">
                            {flashcards.slice(Math.max(0, currentIndex - 2), Math.min(flashcards.length, currentIndex + 3)).map((_, idx) => {
                                const actualIdx = Math.max(0, currentIndex - 2) + idx;
                                return (
                                    <div
                                        key={actualIdx}
                                        className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${actualIdx === currentIndex ? "bg-blue-500 w-4" : "bg-gray-300"}`}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    <Button
                        variant="text"
                        color="blue-gray"
                        className="flex items-center gap-2 normal-case"
                        onClick={handleNext}
                        disabled={currentIndex === flashcards.length - 1 || loading}
                    >
                        {language === "es" ? "Siguiente" : "Next"}
                        <ChevronRightIcon className="h-4 w-4 stroke-2" />
                    </Button>
                </DialogFooter>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .perspective-1000 {
                    perspective: 1000px;
                }
                .transform-style-3d {
                    transform-style: preserve-3d;
                }
                .backface-hidden {
                    backface-visibility: hidden;
                }
                .rotate-y-180 {
                    transform: rotateY(180deg);
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </Dialog>
    );
}

FlashcardViewDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    deckId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    deckTitle: PropTypes.string,
};

export default FlashcardViewDialog;

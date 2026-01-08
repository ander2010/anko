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
    HandThumbUpIcon,
    HandThumbDownIcon,
} from "@heroicons/react/24/solid";
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

                <DialogBody className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 overflow-hidden relative bg-gray-50/50">
                    {loading ? (
                        <div className="flex flex-col items-center gap-4">
                            <Spinner className="h-10 w-10 text-indigo-500" />
                            <Typography color="gray" className="italic font-medium">
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
                        <div className="w-full max-w-2xl h-full flex flex-col items-center justify-center perspective-1000">
                            {/* Card Container with Flip Animation */}
                            <div
                                className={`relative w-full aspect-[3/2] md:aspect-[16/9] transition-transform duration-700 transform-style-3d cursor-pointer ${isFlipped ? "rotate-y-180" : ""}`}
                                onClick={handleFlip}
                            >
                                {/* Front Side */}
                                <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-2xl hover:shadow-indigo-500/10 transition-shadow duration-300 flex flex-col p-8 md:p-12 items-center justify-center text-center border border-zinc-100">
                                    <div className="absolute top-6 left-8">
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-100">
                                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                            <Typography variant="small" className="font-bold uppercase tracking-widest text-[10px] text-zinc-500">
                                                {t("global.actions.front")}
                                            </Typography>
                                        </div>
                                    </div>
                                    <Typography variant="h3" className="text-zinc-800 font-bold leading-tight break-words overflow-y-auto max-h-full">
                                        {currentCard.front || currentCard.question}
                                    </Typography>
                                    <div className="absolute bottom-6 text-zinc-400 flex items-center gap-2 animate-bounce-slow">
                                        <ArrowPathIcon className="h-4 w-4" />
                                        <Typography variant="small" className="font-medium text-[11px]">
                                            {language === "es" ? "Clic para girar" : "Click to flip"}
                                        </Typography>
                                    </div>
                                </div>

                                {/* Back Side */}
                                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-50 via-white to-blue-50 rounded-3xl shadow-2xl border border-indigo-100/50 flex flex-col p-8 md:p-12 items-center justify-center text-center">
                                    <div className="absolute top-6 left-8">
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-indigo-100 shadow-sm">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                            <Typography variant="small" className="font-bold uppercase tracking-widest text-[10px] text-indigo-900/60">
                                                {t("global.actions.back")}
                                            </Typography>
                                        </div>
                                    </div>
                                    <Typography variant="h4" className="text-zinc-800 font-semibold leading-snug break-words overflow-y-auto max-h-full mb-6">
                                        {currentCard.back || currentCard.answer}
                                    </Typography>

                                    {currentCard.explanation && (
                                        <div className="mt-2 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-indigo-50/50 w-full overflow-y-auto max-h-[120px] shadow-sm">
                                            <div className="flex items-center gap-2 mb-2 justify-center text-amber-500">
                                                <LightBulbIcon className="h-4 w-4" />
                                                <Typography variant="small" className="font-bold text-[10px] uppercase tracking-wide text-amber-600/80">
                                                    {t("global.actions.explanation")}
                                                </Typography>
                                            </div>
                                            <Typography variant="small" className="text-zinc-600 text-xs leading-relaxed">
                                                {currentCard.explanation}
                                            </Typography>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Response / Feedback Actions */}
                            <div className={`mt-10 flex items-center gap-6 transition-all duration-500 ${isFlipped ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
                                <Button
                                    size="lg"
                                    color="red"
                                    variant="gradient"
                                    className="rounded-full p-4 hover:scale-110 active:scale-95 transition-transform shadow-lg shadow-red-500/20"
                                    onClick={() => handleNext()}
                                >
                                    <HandThumbDownIcon className="h-6 w-6 text-white" />
                                </Button>
                                <Typography className="font-medium text-zinc-400 text-sm uppercase tracking-widest">
                                    {language === "es" ? "Valorar" : "Rate"}
                                </Typography>
                                <Button
                                    size="lg"
                                    color="green"
                                    variant="gradient"
                                    className="rounded-full p-4 hover:scale-110 active:scale-95 transition-transform shadow-lg shadow-green-500/20"
                                    onClick={() => handleNext()}
                                >
                                    <HandThumbUpIcon className="h-6 w-6 text-white" />
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogBody>

                <DialogFooter className="justify-between border-t border-zinc-100 bg-white px-8 py-5">
                    <Button
                        variant="text"
                        color="blue-gray"
                        className="flex items-center gap-2 normal-case font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                        onClick={handlePrev}
                        disabled={currentIndex === 0 || loading}
                    >
                        <ChevronLeftIcon className="h-4 w-4 stroke-2" />
                        {language === "es" ? "Anterior" : "Previous"}
                    </Button>

                    <div className="hidden sm:block">
                        <div className="flex gap-1.5">
                            {flashcards.slice(Math.max(0, currentIndex - 2), Math.min(flashcards.length, currentIndex + 3)).map((_, idx) => {
                                const actualIdx = Math.max(0, currentIndex - 2) + idx;
                                return (
                                    <div
                                        key={actualIdx}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${actualIdx === currentIndex ? "bg-indigo-500 w-6" : "bg-zinc-200 w-1.5"}`}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    <Button
                        variant="text"
                        color="blue-gray"
                        className="flex items-center gap-2 normal-case font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
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
                .animate-bounce-slow {
                    animation: bounce 3s infinite;
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

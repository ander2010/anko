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

export function FlashcardLearnDialog({ open, onClose, deckId, deckTitle }) {
    const { t, language } = useLanguage();
    const [card, setCard] = useState(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(false);
    const [finished, setFinished] = useState(false);
    const [seq, setSeq] = useState(0);
    const [jobId, setJobId] = useState(null);
    const [startTime, setStartTime] = useState(Date.now());

    useEffect(() => {
        if (open && deckId) {
            setCard(null);
            setFinished(false);
            setSeq(0);
            setJobId(null);
            loadNextCard(0);
        }
    }, [open, deckId]);

    const loadNextCard = async (lastSeq) => {
        try {
            setLoading(true);
            // Assuming pullFlashcard returns { card: {...}, seq: ... } or just the card object
            // Adjust based on actual API response structure.
            // If the user code returns generic JSON, I'll assume it returns the card directly or inside a wrapper.
            // Safe bet: The API generally returns the card data directly or 204/null if done.
            const data = await projectService.wsPullCard({ deckId, lastSeq });

            // Backend returns: { message_type: "card", card: { ... }, seq: ..., job_id: ... }
            if (!data || !data.card) {
                setFinished(true);
                setCard(null);
            } else {
                // The card data is nested in data.card
                // We also attach the seq to the card object so we can use it later if needed, 
                // though we also store it in state.
                const cardData = { ...data.card, seq: data.seq };
                setCard(cardData);
                setIsFlipped(false);
                setStartTime(Date.now());
                if (data.seq) setSeq(data.seq);
                if (data.job_id) setJobId(data.job_id);
            }
        } catch (err) {
            console.error("Error pulling flashcard:", err);
            // If error 404 or empty, maybe finished?
            setFinished(true);
        } finally {
            setLoading(false);
        }
    };

    const handleRate = async (rating) => {
        if (!card) return;
        const timeToAnswer = Date.now() - startTime;

        try {
            // Optimistic update: loading state while fetching next
            setLoading(true);

            await projectService.wsPushFeedback({
                deckId,
                jobId,
                seq: card.seq || seq, // Use card's seq if available
                cardId: card.id,
                rating,
                timeToAnswerMs: timeToAnswer
            });

            // Fetch next
            await loadNextCard(card.seq || seq);

        } catch (err) {
            console.error("Error pushing feedback:", err);
            setLoading(false); // Stop loading if error, let user retry
        }
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <Dialog open={open} handler={onClose} size="xl" className="bg-transparent shadow-none">
            <div className="flex flex-col h-[85vh] max-h-[700px] bg-white rounded-xl overflow-hidden">
                <DialogHeader className="flex justify-between items-center border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                    <div>
                        <Typography variant="h5" color="blue-gray">
                            {deckTitle}
                        </Typography>
                        <Typography variant="small" color="gray" className="font-normal flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            {language === "es" ? "Modo Aprendizaje" : "Learning Mode"}
                        </Typography>
                    </div>
                    <IconButton variant="text" color="blue-gray" onClick={onClose} className="rounded-full">
                        <XMarkIcon className="h-6 w-6" />
                    </IconButton>
                </DialogHeader>

                <DialogBody className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 overflow-hidden relative bg-gray-50/50">
                    {loading && !card ? (
                        <div className="flex flex-col items-center gap-4">
                            <Spinner className="h-10 w-10 text-indigo-500" />
                            <Typography color="gray" className="italic font-medium">
                                {language === "es" ? "Cargando siguiente..." : "Loading next..."}
                            </Typography>
                        </div>
                    ) : finished ? (
                        <div className="text-center">
                            <Typography variant="h4" color="blue-gray" className="mb-2">
                                {language === "es" ? "¡Sesión Completada!" : "Session Complete!"}
                            </Typography>
                            <Typography color="gray" className="mb-6">
                                {language === "es" ? "No hay más fichas por ahora." : "No more cards for now."}
                            </Typography>
                            <div className="flex justify-center gap-4">
                                <Button color="indigo" onClick={onClose} variant="outlined">
                                    {language === "es" ? "Volver" : "Back"}
                                </Button>
                                <Button
                                    color="indigo"
                                    onClick={async () => {
                                        try {
                                            setLoading(true);
                                            await projectService.shuffleDeckCards(deckId);
                                            setFinished(false);
                                            setSeq(0);
                                            setJobId(null);
                                            await loadNextCard(0);
                                        } catch (error) {
                                            console.error("Shuffle failed:", error);
                                            setLoading(false);
                                        }
                                    }}
                                    className="flex items-center gap-2"
                                >
                                    <ArrowPathIcon className="h-4 w-4" />
                                    {language === "es" ? "Barajar" : "Shuffle"}
                                </Button>
                            </div>
                        </div>
                    ) : card ? (
                        <div className="w-full max-w-3xl h-full flex flex-col items-center justify-center perspective-1000">
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
                                        {card.front || card.question}
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
                                        {card.back || card.answer}
                                    </Typography>

                                    {card.explanation && (
                                        <div className="mt-2 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-indigo-50/50 w-full overflow-y-auto max-h-[120px] shadow-sm">
                                            <div className="flex items-center gap-2 mb-2 justify-center text-amber-500">
                                                <LightBulbIcon className="h-4 w-4" />
                                                <Typography variant="small" className="font-bold text-[10px] uppercase tracking-wide text-amber-600/80">
                                                    {t("global.actions.explanation")}
                                                </Typography>
                                            </div>
                                            <Typography variant="small" className="text-zinc-600 text-xs leading-relaxed">
                                                {card.explanation}
                                            </Typography>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Response / Feedback Actions */}
                            {/* Response / Feedback Actions */}
                            <div className="mt-10 flex items-center gap-3 justify-center min-h-[60px]">
                                {!isFlipped ? (
                                    <Button
                                        size="lg"
                                        color="indigo"
                                        variant="gradient"
                                        className="rounded-full px-12 shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:scale-105"
                                        onClick={(e) => { e.stopPropagation(); handleRate(2); }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>{language === "es" ? "Siguiente" : "Next"}</span>
                                            <ChevronRightIcon className="h-4 w-4 stroke-2" />
                                        </div>
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            size="md"
                                            color="red"
                                            variant="gradient"
                                            className="rounded-full px-8 shadow-md hover:shadow-red-500/20 transition-all transform hover:scale-105"
                                            onClick={(e) => { e.stopPropagation(); handleRate(0); }}
                                        >
                                            {language === "es" ? "Difícil" : "Hard"}
                                        </Button>
                                        <Button
                                            size="md"
                                            color="green"
                                            variant="gradient"
                                            className="rounded-full px-8 shadow-md hover:shadow-green-500/20 transition-all transform hover:scale-105"
                                            onClick={(e) => { e.stopPropagation(); handleRate(1); }}
                                        >
                                            {language === "es" ? "Bien" : "Good"}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : null}
                </DialogBody>
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

FlashcardLearnDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    deckId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    deckTitle: PropTypes.string,
};

export default FlashcardLearnDialog;

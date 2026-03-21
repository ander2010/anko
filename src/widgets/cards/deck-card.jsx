import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
    Card,
    CardBody,
    Typography,
    IconButton,
    Menu,
    MenuHandler,
    MenuList,
    MenuItem,
    Chip,
    Button,
    Progress,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
} from "@material-tailwind/react";
import {
    EllipsisVerticalIcon,
    PencilIcon,
    TrashIcon,
    Square2StackIcon,
    ClockIcon,
    BookOpenIcon,
    PlusIcon,
    CheckBadgeIcon,
    HandThumbUpIcon,
    ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "@/context/language-context";
import { useAuth } from "@/context/auth-context";
import projectService from "@/services/projectService";

export function DeckCard({
    deck,
    onEdit,
    onDelete,
    onStudy,
    onLearn,
    onAddCards,
    onUpdateVisibility,
    job,
    onJobComplete,
    currentProgress,
}) {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const hasNotifiedComplete = useRef(false);

    // Derive progress data from the SSE-fed currentProgress prop
    const progress = parseFloat(currentProgress?.progress ?? 0);
    const status = currentProgress?.status ?? "queued";
    const isCompleted = !job || (parseFloat(currentProgress?.progress ?? 0) >= 100) ||
        ["completed", "done", "finished", "success"].includes(String(currentProgress?.status ?? "").toLowerCase());

    const [summary, setSummary] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [showAiSummary, setShowAiSummary] = useState(false);

    const [showPrintModal, setShowPrintModal] = useState(false);
    const [printMode, setPrintMode] = useState("book");
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        if (downloading) return;
        setDownloading(true);
        try {
            await projectService.downloadDeckPdf(deck.id, language, printMode);
            setShowPrintModal(false);
        } catch (err) {
            console.error("Download failed:", err);
        } finally {
            setDownloading(false);
        }
    };

    const handleToggleSummary = async (e) => {
        e.stopPropagation();
        // If already showing, just hide
        if (showAiSummary) {
            setShowAiSummary(false);
            return;
        }
        // If summary already loaded, just show it
        if (summary) {
            setShowAiSummary(true);
            return;
        }
        // Fetch on first click
        if (!deck?.id) return;
        setLoadingSummary(true);
        try {
            const data = await projectService.getDeckSummary(deck.id, language);
            if (data?.summary) {
                setSummary(data.summary);
                setShowAiSummary(true);
            }
        } catch (error) {
            console.debug(`[DeckCard] No summary found for deck ${deck.id}`);
        } finally {
            setLoadingSummary(false);
        }
    };

    // Reset notification guard when job changes
    useEffect(() => {
        if (!job) {
            hasNotifiedComplete.current = false;
        }
    }, [job]);

    useEffect(() => {
        if (job && isCompleted && onJobComplete && !hasNotifiedComplete.current) {
            console.log("[DeckCard] Job completed via SSE, notifying parent. Job:", job?.job_id);
            hasNotifiedComplete.current = true;
            onJobComplete(currentProgress);
        }
    }, [job, isCompleted, onJobComplete, currentProgress]);

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return "—";

        return date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const getVisibilityColor = (visibility) => {
        switch (visibility) {
            case "public": return "green";
            case "shared": return "blue";
            case "private": return "gray";
            default: return "blue-gray";
        }
    };

    const isShared = deck.visibility === "shared";
    const isOwner = user?.id && deck.ownerId && String(user.id) === String(deck.ownerId);

    return (
        <>
        <Card className="border border-zinc-200 shadow-sm hover:shadow-premium transition-all duration-300 group bg-white">
            <CardBody className="p-3 md:p-5 flex flex-col h-full">
                <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div className="flex-1 min-w-0 pr-3">
                        <Typography variant="h6" className="mb-1.5 truncate text-zinc-900 font-bold tracking-tight">
                            {deck.title}
                        </Typography>
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">
                                    {language === "es" ? "Visibilidad:" : "Visibility:"}
                                </span>

                                {onUpdateVisibility && isOwner ? (
                                    <Menu placement="bottom-start">
                                        <MenuHandler>
                                            <div className="cursor-pointer transition-all hover:scale-105">
                                                <Chip
                                                    value={deck.visibility || "private"}
                                                    size="sm"
                                                    color={getVisibilityColor(deck.visibility)}
                                                    variant="ghost"
                                                    className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                                                />
                                            </div>
                                        </MenuHandler>
                                        <MenuList className="border border-zinc-200 shadow-xl rounded-xl p-2 min-w-[140px]">
                                            <MenuItem onClick={() => onUpdateVisibility(deck.id, "private")} className="flex items-center gap-2 rounded-lg py-2">
                                                <Chip value="private" size="sm" color="gray" variant="ghost" className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase" />
                                                <Typography className="text-xs font-bold text-zinc-600">{language === "es" ? "Solo yo" : "Only me"}</Typography>
                                            </MenuItem>
                                            <MenuItem onClick={() => onUpdateVisibility(deck.id, "shared")} className="flex items-center gap-2 rounded-lg py-2">
                                                <Chip value="shared" size="sm" color="blue" variant="ghost" className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase" />
                                                <Typography className="text-xs font-bold text-zinc-600">{language === "es" ? "Compartido" : "Shared"}</Typography>
                                            </MenuItem>
                                            <MenuItem onClick={() => onUpdateVisibility(deck.id, "public")} className="flex items-center gap-2 rounded-lg py-2">
                                                <Chip value="public" size="sm" color="green" variant="ghost" className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase" />
                                                <Typography className="text-xs font-bold text-zinc-600">{language === "es" ? "Público" : "Public"}</Typography>
                                            </MenuItem>
                                        </MenuList>
                                    </Menu>
                                ) : (
                                    <Chip
                                        value={t(`project_detail.decks.visibility.${deck.visibility}`)}
                                        size="sm"
                                        color={getVisibilityColor(deck.visibility)}
                                        variant="ghost"
                                        className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                                    />
                                )}

                                {deck.visibility === "shared" && (
                                    <div className="flex items-center gap-2 ml-2">
                                        <div className="flex items-center gap-1">
                                            <HandThumbUpIcon className="h-3 w-3 text-green-500" />
                                            <Typography className="text-[10px] font-bold text-green-600">
                                                {deck.approved_count || 0}
                                            </Typography>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded-md bg-zinc-50 border border-zinc-100">
                                <Square2StackIcon className="h-3 w-3 text-zinc-400" />
                                <Typography className="text-[10px] font-bold text-zinc-600">
                                    {deck.flashcards_count || deck.cardsCount || deck.flashcards?.length || deck.card_count || 0}
                                </Typography>
                                {onAddCards && isOwner && (
                                    <IconButton
                                        variant="text"
                                        size="sm"
                                        disabled={job && !isCompleted}
                                        className="h-5 w-5 rounded-md hover:bg-zinc-200 text-indigo-600 ml-1 disabled:opacity-30"
                                        onClick={() => onAddCards && onAddCards(deck)}
                                        title={language === "es" ? "Más fichas" : "More flashcards"}
                                    >
                                        <PlusIcon className="h-3 w-3" strokeWidth={3} />
                                    </IconButton>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <IconButton
                            variant="text"
                            size="sm"
                            className="rounded-full text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 -mt-1 transition-colors"
                            onClick={(e) => { e.stopPropagation(); setShowPrintModal(true); }}
                            title={language === "es" ? "Descargar PDF" : "Download PDF"}
                        >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                        </IconButton>

                    {isOwner && (
                        <Menu placement="bottom-end">
                            <MenuHandler>
                                <IconButton
                                    variant="text"
                                    size="sm"
                                    disabled={job && !isCompleted}
                                    className="rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 -mt-1 -mr-1 disabled:opacity-30"
                                >
                                    <EllipsisVerticalIcon className="h-5 w-5" />
                                </IconButton>
                            </MenuHandler>
                            <MenuList className="border border-zinc-200 shadow-xl rounded-xl p-2 min-w-[140px]">
                                <MenuItem onClick={() => onEdit && onEdit(deck)} className="flex items-center gap-3 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 font-medium text-sm py-2">
                                    <PencilIcon className="h-4 w-4" />
                                    {t("global.action.edit")}
                                </MenuItem>
                                <MenuItem onClick={() => onAddCards && onAddCards(deck)} className="flex items-center gap-3 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 font-medium text-sm py-2">
                                    <PlusIcon className="h-4 w-4" />
                                    {language === "es" ? "Añadir Fichas" : "Add Flashcards"}
                                </MenuItem>
                                <hr className="my-1 border-zinc-100" />
                                <MenuItem
                                    onClick={() => onDelete && onDelete(deck)}
                                    className="flex items-center gap-3 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 font-medium text-sm py-2"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                    {t("global.action.delete")}
                                </MenuItem>
                            </MenuList>
                        </Menu>
                    )}
                    </div>
                </div>

                {job && !isCompleted && (
                    <div className="mb-3 md:mb-5 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/50">
                        <div className="flex items-center justify-between mb-2">
                            {/* <Typography variant="small" className="text-indigo-600 font-bold capitalize text-xs">
                                {currentProgress?.current_step
                                    ? currentProgress.current_step.replace(/_/g, " ")
                                    : status.toLowerCase()}
                                ...
                            </Typography> */}
                            <Typography variant="small" className="text-indigo-900 font-bold text-xs">
                                {Math.round(progress)}%
                            </Typography>
                        </div>
                        <Progress
                            value={progress}
                            size="sm"
                            color="indigo"
                            className="h-1.5 bg-indigo-100"
                            barProps={{ className: "bg-indigo-500" }}
                        />
                        {currentProgress?.generated !== undefined && (
                            <Typography variant="small" className="text-indigo-400 font-medium text-[10px] mt-1">
                                {currentProgress.generated} / {currentProgress.total} {language === "es" ? "fichas" : "cards"}
                            </Typography>
                        )}
                    </div>
                )}

                {/* Description + AI Summary Section - always visible */}
                <div className="mb-3 md:mb-4">
                    <div className="flex items-center justify-end mb-2">
                        <button
                            onClick={handleToggleSummary}
                            disabled={loadingSummary || (job && !isCompleted)}
                            className={`text-[10px] px-2 py-0.5 rounded-full transition-colors border font-bold uppercase tracking-wider disabled:opacity-50 ${showAiSummary
                                    ? "bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200"
                                    : "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100"
                                }`}
                        >
                            {loadingSummary
                                ? (language === "es" ? "Cargando..." : "Loading...")
                                : showAiSummary
                                    ? (language === "es" ? "Ver Descripción" : "View Description")
                                    : (language === "es" ? "✨ Ver Resumen IA" : "✨ View AI Summary")}
                        </button>
                    </div>

                    {!showAiSummary && (
                        deck.description
                            ? <Typography variant="small" className="text-zinc-500 line-clamp-2 text-sm leading-relaxed">
                                {deck.description}
                            </Typography>
                            : <Typography variant="small" className="text-zinc-400 italic text-sm leading-relaxed">
                                {language === "es" ? "Sin descripción." : "No description."}
                            </Typography>
                    )}

                    {showAiSummary && summary && (
                        <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 p-3 rounded-lg border border-blue-100/50">
                            <Typography variant="small" className="text-zinc-600 text-xs leading-relaxed italic line-clamp-3 text-justify">
                                &ldquo;{summary}&rdquo;
                            </Typography>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 mt-auto">
                    {isOwner && onLearn && (
                        <Button
                            variant="outlined"
                            size="sm"
                            color="indigo"
                            disabled={job && !isCompleted}
                            className="flex items-center gap-2 px-3 py-2 normal-case rounded-lg hover:bg-indigo-50 border-indigo-200 text-indigo-600 transition-all disabled:opacity-50"
                            onClick={() => onLearn && onLearn(deck)}
                        >
                            <BookOpenIcon className="h-3.5 w-3.5" />
                            <span className="text-xs font-bold">{t("global.action.learn")}</span>
                        </Button>
                    )}
                    <Button
                        variant="gradient"
                        size="sm"
                        color="indigo"
                        disabled={job && !isCompleted}
                        className="flex items-center gap-2 px-4 py-2 normal-case rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all font-bold disabled:grayscale disabled:opacity-70"
                        onClick={() => onStudy && onStudy(deck)}
                    >
                        <BookOpenIcon className="h-3.5 w-3.5" />
                        <span className="text-xs font-bold">{t("global.action.study")}</span>
                    </Button>
                </div>
            </CardBody>
        </Card>

        {/* ---------------- PRINT MODE DIALOG ---------------- */}
        <Dialog open={showPrintModal} handler={() => setShowPrintModal(false)} size="xs">
            <DialogHeader className="text-base font-bold text-zinc-900">
                {language === "es" ? "Descargar PDF de Fichas" : "Download Flashcards PDF"}
            </DialogHeader>
            <DialogBody className="space-y-3 pt-0">
                <Typography className="text-sm text-zinc-500 mb-4">
                    {language === "es" ? "Elige el modo de impresión:" : "Choose print mode:"}
                </Typography>

                {[
                    {
                        value: "book",
                        label: language === "es" ? "Libro (giro horizontal)" : "Book (left/right flip)",
                        desc: language === "es" ? "Volteo normal izquierda/derecha. Recomendado para la mayoría de impresoras." : "Normal left/right page turn. Recommended for most printers.",
                    },
                    {
                        value: "notebook",
                        label: language === "es" ? "Cuaderno (giro vertical)" : "Notebook (top flip)",
                        desc: language === "es" ? "Volteo hacia arriba. Úsalo si los reversos salen invertidos con el modo Libro." : "Flip upward like a notebook. Use when backs appear inverted with Book mode.",
                    },
                ].map((opt) => (
                    <div
                        key={opt.value}
                        onClick={() => setPrintMode(opt.value)}
                        className={`cursor-pointer rounded-xl border-2 p-3 transition-all ${printMode === opt.value ? "border-indigo-500 bg-indigo-50" : "border-zinc-200 hover:border-zinc-300"}`}
                    >
                        <div className="flex items-center gap-2 mb-0.5">
                            <div className={`h-3.5 w-3.5 rounded-full border-2 flex-shrink-0 ${printMode === opt.value ? "border-indigo-600 bg-indigo-600" : "border-zinc-400"}`} />
                            <Typography className="text-sm font-bold text-zinc-800">{opt.label}</Typography>
                        </div>
                        <Typography className="text-xs text-zinc-500 pl-5">{opt.desc}</Typography>
                    </div>
                ))}
            </DialogBody>
            <DialogFooter className="gap-2 pt-2">
                <Button variant="text" color="blue-gray" onClick={() => setShowPrintModal(false)} disabled={downloading}>
                    {language === "es" ? "Cancelar" : "Cancel"}
                </Button>
                <Button
                    variant="gradient"
                    color="indigo"
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex items-center gap-2 normal-case"
                >
                    <ArrowDownTrayIcon className={`h-4 w-4 ${downloading ? "animate-bounce" : ""}`} />
                    {downloading
                        ? (language === "es" ? "Descargando..." : "Downloading...")
                        : (language === "es" ? "Descargar" : "Download")}
                </Button>
            </DialogFooter>
        </Dialog>
        </>
    );
}

DeckCard.propTypes = {
    deck: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        visibility: PropTypes.string.isRequired,
        created_at: PropTypes.string,
        flashcards_count: PropTypes.number,
    }).isRequired,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onStudy: PropTypes.func,
    onLearn: PropTypes.func,
    onAddCards: PropTypes.func,
    onUpdateVisibility: PropTypes.func,
    job: PropTypes.shape({
        job_id: PropTypes.string,
        ws_progress: PropTypes.string,
    }),
    onJobComplete: PropTypes.func,
};

export default DeckCard;

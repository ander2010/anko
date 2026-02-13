import React, { useEffect, useRef } from "react";
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
} from "@heroicons/react/24/outline";
import { useLanguage } from "@/context/language-context";
import { useFlashcardProgress } from "@/hooks/use-flashcard-progress";
import { useAuth } from "@/context/auth-context";

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
}) {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const { progress, status, isCompleted, lastData } = useFlashcardProgress(job?.ws_progress);
    const hasNotifiedComplete = useRef(false);

    // Reset notification guard if job changes or resets
    useEffect(() => {
        if (!isCompleted) {
            hasNotifiedComplete.current = false;
        }
    }, [isCompleted]);

    useEffect(() => {
        if (isCompleted && onJobComplete && !hasNotifiedComplete.current) {
            hasNotifiedComplete.current = true;
            onJobComplete(lastData);
        }
    }, [isCompleted, onJobComplete, lastData]);

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
    const isOwner = user?.id === deck.ownerId;

    return (
        <Card className="border border-zinc-200 shadow-sm hover:shadow-premium transition-all duration-300 group bg-white">
            <CardBody className="p-5 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
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
                                        className="h-5 w-5 rounded-md hover:bg-zinc-200 text-indigo-600 ml-1"
                                        onClick={() => onAddCards && onAddCards(deck)}
                                        title={language === "es" ? "Más fichas" : "More flashcards"}
                                    >
                                        <PlusIcon className="h-3 w-3" strokeWidth={3} />
                                    </IconButton>
                                )}
                            </div>
                        </div>
                    </div>

                    {isOwner && (
                        <Menu placement="bottom-end">
                            <MenuHandler>
                                <IconButton variant="text" size="sm" className="rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 -mt-1 -mr-1">
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

                {job && !isCompleted && (
                    <div className="mb-5 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/50">
                        <div className="flex items-center justify-between mb-2">
                            <Typography variant="small" className="text-indigo-600 font-bold capitalize text-xs">
                                {status.toLowerCase()}...
                            </Typography>
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
                    </div>
                )}

                {deck.description && (
                    <Typography variant="small" className="text-zinc-500 line-clamp-2 mb-4 text-sm leading-relaxed">
                        {deck.description}
                    </Typography>
                )}

                <div className="flex items-center gap-2 mt-auto">
                    <Button
                        variant="outlined"
                        size="sm"
                        color="indigo"
                        className="flex items-center gap-2 px-3 py-2 normal-case rounded-lg hover:bg-indigo-50 border-indigo-200 text-indigo-600 transition-all"
                        onClick={() => onLearn && onLearn(deck)}
                    >
                        <BookOpenIcon className="h-3.5 w-3.5" />
                        <span className="text-xs font-bold">{t("global.action.learn")}</span>
                    </Button>
                    <Button
                        variant="gradient"
                        size="sm"
                        color="indigo"
                        className="flex items-center gap-2 px-4 py-2 normal-case rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all font-bold"
                        onClick={() => onStudy && onStudy(deck)}
                    >
                        <BookOpenIcon className="h-3.5 w-3.5" />
                        <span className="text-xs font-bold">{t("global.action.study")}</span>
                    </Button>
                </div>
            </CardBody>
        </Card >
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

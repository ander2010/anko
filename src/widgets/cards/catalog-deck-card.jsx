import React from "react";
import PropTypes from "prop-types";
import {
    Card,
    CardBody,
    Typography,
    Chip,
    Button,
} from "@material-tailwind/react";
import {
    Square2StackIcon,
    BookOpenIcon,
    PlusIcon,
    CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "@/context/language-context";
import { useAuth } from "@/context/auth-context";

export function CatalogDeckCard({
    deck,
    onStudy,
    onLearn,
    onRequestAccess,
    isRequestPending = false
}) {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const isOwner = user?.id && deck.ownerId && String(user.id) === String(deck.ownerId);

    const getVisibilityColor = (visibility) => {
        switch (visibility) {
            case "public": return "green";
            case "shared": return "blue";
            default: return "blue-gray";
        }
    };

    const isShared = deck.visibility === "shared";

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
                                <Chip
                                    value={deck.visibility || "shared"}
                                    size="sm"
                                    color={getVisibilityColor(deck.visibility)}
                                    variant="ghost"
                                    className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                                />
                            </div>
                            <div className="flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded-md bg-zinc-50 border border-zinc-100">
                                <Square2StackIcon className="h-3 w-3 text-zinc-400" />
                                <Typography className="text-[10px] font-bold text-zinc-600">
                                    {deck.flashcards_count || deck.cardsCount || deck.flashcards?.length || deck.card_count || 0}
                                </Typography>
                            </div>
                        </div>
                    </div>
                </div>

                {deck.description && (
                    <Typography variant="small" className="text-zinc-500 line-clamp-2 mb-4 text-sm leading-relaxed">
                        {deck.description}
                    </Typography>
                )}

                <div className="flex items-center gap-2 mt-auto">
                    {isShared ? (
                        <Button
                            variant={isRequestPending ? "filled" : "outlined"}
                            size="sm"
                            color={isRequestPending ? "green" : "blue"}
                            disabled={isRequestPending}
                            className="flex items-center gap-2 px-4 py-2 normal-case rounded-lg font-bold hover:bg-blue-50 transition-all border-blue-100 disabled:opacity-70 flex-1 justify-center"
                            onClick={() => onRequestAccess && onRequestAccess(deck)}
                        >
                            {isRequestPending ? (
                                <>
                                    <CheckBadgeIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
                                    <span className="text-xs">{t("global.action.request_sent")}</span>
                                </>
                            ) : (
                                <>
                                    <PlusIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
                                    <span className="text-xs">{t("global.action.request_access")}</span>
                                </>
                            )}
                        </Button>
                    ) : (
                        <>
                            {((deck.visibility === "public") || (isOwner && (deck.visibility === "private" || !deck.visibility))) && (
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
                            )}
                            <Button
                                variant="gradient"
                                size="sm"
                                color="indigo"
                                className="flex items-center gap-2 px-4 py-2 normal-case rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                                onClick={() => onStudy && onStudy(deck)}
                            >
                                <BookOpenIcon className="h-3.5 w-3.5" />
                                <span className="text-xs font-bold">{t("global.action.study")}</span>
                            </Button>
                        </>
                    )}
                </div>
            </CardBody>
        </Card >
    );
}

CatalogDeckCard.propTypes = {
    deck: PropTypes.object.isRequired,
    onStudy: PropTypes.func,
    onLearn: PropTypes.func,
    onRequestAccess: PropTypes.func,
    isRequestPending: PropTypes.bool,
};

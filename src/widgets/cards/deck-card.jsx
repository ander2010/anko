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
} from "@heroicons/react/24/outline";
import { useLanguage } from "@/context/language-context";
import { useFlashcardProgress } from "@/hooks/use-flashcard-progress";

export function DeckCard({ deck, onEdit, onDelete, onStudy, job, onJobComplete }) {
    const { t } = useLanguage();
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

    return (
        <Card className="border border-blue-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardBody className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                        <Typography variant="h6" color="blue-gray" className="mb-1 truncate">
                            {deck.title}
                        </Typography>
                        <div className="flex items-center gap-2">
                            <Chip
                                value={t(`project_detail.decks.visibility.${deck.visibility}`)}
                                size="sm"
                                color={getVisibilityColor(deck.visibility)}
                                variant="ghost"
                                className="rounded-full px-2 py-0.5 text-[10px]"
                            />
                            <Chip
                                value={`${deck.flashcards_count || 0} ${t("project_detail.decks.cards_count")}`}
                                size="sm"
                                variant="ghost"
                                color="blue-gray"
                                className="rounded-full px-2 py-0.5 text-[10px]"
                            />
                        </div>
                    </div>

                    <Menu placement="bottom-end">
                        <MenuHandler>
                            <IconButton variant="text" color="blue-gray" size="sm">
                                <EllipsisVerticalIcon className="h-5 w-5" />
                            </IconButton>
                        </MenuHandler>
                        <MenuList>
                            <MenuItem onClick={() => onEdit(deck)} className="flex items-center gap-2">
                                <PencilIcon className="h-4 w-4" />
                                {t("global.action.edit")}
                            </MenuItem>
                            <hr className="my-1" />
                            <MenuItem
                                onClick={() => onDelete(deck)}
                                className="flex items-center gap-2 text-red-500 hover:bg-red-50"
                            >
                                <TrashIcon className="h-4 w-4" />
                                {t("global.action.delete")}
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </div>

                {job && !isCompleted && (
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                            <Typography variant="small" className="text-blue-gray-600 font-medium capitalize">
                                {status.toLowerCase()}...
                            </Typography>
                            <Typography variant="small" className="text-blue-gray-600 font-medium">
                                {Math.round(progress)}%
                            </Typography>
                        </div>
                        <Progress
                            value={progress}
                            variant="gradient"
                            color={progress >= 100 ? "green" : "blue"}
                            className="h-1.5"
                        />
                    </div>
                )}

                {deck.description && (
                    <Typography variant="small" className="text-blue-gray-600 line-clamp-2 mb-3 mt-1">
                        {deck.description}
                    </Typography>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-blue-gray-50 mt-auto">
                    <div className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 text-blue-gray-400" />
                        <Typography variant="small" className="text-blue-gray-500 text-[11px]">
                            {formatDate(deck.created_at)}
                        </Typography>
                    </div>
                    <Button
                        variant="text"
                        size="sm"
                        color="blue"
                        className="flex items-center gap-2 px-3 lg:px-4 py-1.5 normal-case"
                        onClick={() => onStudy(deck)}
                    >
                        <BookOpenIcon className="h-4 w-4" />
                        {t("global.action.study")}
                    </Button>
                </div>
            </CardBody>
        </Card>
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
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onStudy: PropTypes.func,
    job: PropTypes.shape({
        job_id: PropTypes.string,
        ws_progress: PropTypes.string,
    }),
    onJobComplete: PropTypes.func,
};

export default DeckCard;

import React from "react";
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
} from "@material-tailwind/react";
import {
    EllipsisVerticalIcon,
    PencilIcon,
    TrashIcon,
    Square2StackIcon,
    ClockIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "@/context/language-context";

export function DeckCard({ deck, onEdit, onDelete }) {
    const { t } = useLanguage();

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
                                {t("global.actions.edit")}
                            </MenuItem>
                            <hr className="my-1" />
                            <MenuItem
                                onClick={() => onDelete(deck)}
                                className="flex items-center gap-2 text-red-500 hover:bg-red-50"
                            >
                                <TrashIcon className="h-4 w-4" />
                                {t("global.actions.delete")}
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-blue-gray-50 mt-4">
                    <ClockIcon className="h-4 w-4 text-blue-gray-400" />
                    <Typography variant="small" className="text-blue-gray-500 text-[11px]">
                        {formatDate(deck.created_at)}
                    </Typography>
                </div>
            </CardBody>
        </Card>
    );
}

DeckCard.propTypes = {
    deck: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string.isRequired,
        visibility: PropTypes.string.isRequired,
        created_at: PropTypes.string,
    }).isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default DeckCard;

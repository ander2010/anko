import React, { useMemo } from "react";
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
    DocumentTextIcon,
    QuestionMarkCircleIcon,
    Squares2X2Icon,
    TrashIcon,
    PlusIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "@/context/language-context";

export function TopicCard({ topic, allDocumentsWithSections, onEdit, onArchive, onDelete, onCreateDeck }) {
    const { t } = useLanguage();

    const stats = useMemo(() => {
        const relatedSectionIds = topic.related_sections || [];

        // 1. Find which documents are involved
        // A document is involved if any of its sections are in relatedSectionIds
        const involvedDocs = (allDocumentsWithSections || []).filter(doc =>
            doc.sections && doc.sections.some(s => relatedSectionIds.includes(s.id))
        );

        return {
            sectionsCount: relatedSectionIds.length,
            documentsCount: involvedDocs.length
        };
    }, [topic, allDocumentsWithSections]);

    return (
        <Card className="border border-blue-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardBody className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                        <Typography variant="h6" color="blue-gray" className="mb-1 truncate">
                            {topic.name}
                        </Typography>
                        {topic.description && (
                            <Typography
                                variant="small"
                                className="text-blue-gray-600 line-clamp-2"
                            >
                                {topic.description}
                            </Typography>
                        )}
                    </div>

                    {/* Actions Menu */}
                    <Menu placement="bottom-end">
                        <MenuHandler>
                            <IconButton variant="text" color="blue-gray" size="sm">
                                <EllipsisVerticalIcon className="h-5 w-5" />
                            </IconButton>
                        </MenuHandler>
                        <MenuList>
                            <MenuItem onClick={() => onEdit(topic)} className="flex items-center gap-2">
                                <PencilIcon className="h-4 w-4" />
                                {t("global.actions.edit")}
                            </MenuItem>
                            <MenuItem onClick={() => onCreateDeck(topic)} className="flex items-center gap-2">
                                <PlusIcon className="h-4 w-4" />
                                {t("project_detail.decks.btn_create")}
                            </MenuItem>
                            <hr className="my-1" />
                            <MenuItem onClick={() => onDelete(topic)} className="flex items-center gap-2 text-red-500 hover:bg-red-50">
                                <TrashIcon className="h-4 w-4" />
                                {t("global.actions.delete")}
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                        <DocumentTextIcon className="h-4 w-4 text-blue-gray-400" />
                        <Typography variant="small" className="text-blue-gray-600 text-xs">
                            {stats.documentsCount} {t("project_detail.documents")}
                        </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                        <Squares2X2Icon className="h-4 w-4 text-blue-gray-400" />
                        <Typography variant="small" className="text-blue-gray-600 text-xs">
                            {stats.sectionsCount} {t("project_detail.docs.table.sections")}
                        </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                        <QuestionMarkCircleIcon className="h-4 w-4 text-blue-gray-400" />
                        <Typography variant="small" className="text-blue-gray-600 text-xs">
                            {topic.question_count_target ?? topic.questionsCount ?? 0} {t("global.rules.table.questions")}
                        </Typography>
                    </div>
                </div>

                {/* Batteries (placeholder) */}
                {topic.batteries && topic.batteries.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {topic.batteries.map((battery, index) => (
                            <Chip
                                key={index}
                                value={battery.name || `Battery ${index + 1}`}
                                size="sm"
                                variant="ghost"
                                color="blue-gray"
                                className="rounded-md px-2 py-1"
                            />
                        ))}
                    </div>
                )}
            </CardBody>
        </Card>
    );
}

TopicCard.propTypes = {
    topic: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        question_count_target: PropTypes.number,
        questionsCount: PropTypes.number, // legacy fallback
        related_sections: PropTypes.arrayOf(PropTypes.number), // IDs of sections
        batteries: PropTypes.array,
    }).isRequired,
    allDocumentsWithSections: PropTypes.array, // [{ id, sections: [{id}...] }]
    onEdit: PropTypes.func.isRequired,
    onArchive: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onCreateDeck: PropTypes.func,
};

export default TopicCard;

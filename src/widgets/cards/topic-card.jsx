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
        <Card className="border border-zinc-200 shadow-sm hover:shadow-premium transition-all duration-300 bg-white group hover:-translate-y-0.5">
            <CardBody className="p-3 md:p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-1.5 md:mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                        <p className="font-semibold truncate" style={{ fontSize: "12px", color: "#1a1a2e" }}>
                            {topic.name}
                        </p>
                        {topic.description && (
                            <p className="line-clamp-1 md:line-clamp-2" style={{ fontSize: "9px", color: "#888", marginTop: "2px" }}>
                                {topic.description}
                            </p>
                        )}
                    </div>

                    <Menu placement="bottom-end">
                        <MenuHandler>
                            <IconButton variant="text" size="sm" className="rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 -mt-1 -mr-1">
                                <EllipsisVerticalIcon className="h-5 w-5" />
                            </IconButton>
                        </MenuHandler>
                        <MenuList className="border border-zinc-200 shadow-xl rounded-xl p-2 min-w-[160px]">
                            <MenuItem onClick={() => onEdit(topic)} className="flex items-center gap-3 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 font-medium text-sm py-2">
                                <PencilIcon className="h-4 w-4" />
                                {t("global.actions.edit")}
                            </MenuItem>
                            {onCreateDeck && (
                                <MenuItem onClick={() => onCreateDeck(topic)} className="flex items-center gap-3 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 font-medium text-sm py-2">
                                    <PlusIcon className="h-4 w-4" />
                                    {t("project_detail.decks.btn_create")}
                                </MenuItem>
                            )}
                            <hr className="my-1 border-zinc-100" />
                            <MenuItem onClick={() => onDelete(topic)} className="flex items-center gap-3 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 font-medium text-sm py-2">
                                <TrashIcon className="h-4 w-4" />
                                {t("global.actions.delete")}
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </div>

                {/* Stats row — compact on mobile */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span style={{ fontSize: "9px", color: "#888", display: "flex", alignItems: "center", gap: "3px" }}>
                        <DocumentTextIcon className="h-3 w-3" />
                        {stats.documentsCount} {t("project_detail.documents")}
                    </span>
                    <span style={{ fontSize: "9px", color: "#ccc" }}>·</span>
                    <span style={{ fontSize: "9px", color: "#888", display: "flex", alignItems: "center", gap: "3px" }}>
                        <Squares2X2Icon className="h-3 w-3" />
                        {stats.sectionsCount} {t("project_detail.docs.table.sections")}
                    </span>
                    <span style={{ fontSize: "9px", color: "#ccc" }}>·</span>
                    <span style={{ fontSize: "9px", color: "#888", display: "flex", alignItems: "center", gap: "3px" }}>
                        <QuestionMarkCircleIcon className="h-3 w-3" />
                        {topic.question_count_target ?? topic.questionsCount ?? 0} {t("global.rules.table.questions")}
                    </span>
                </div>

                {/* Batteries chips — desktop only to keep mobile clean */}
                {topic.batteries && topic.batteries.length > 0 && (
                    <div className="hidden md:flex flex-wrap gap-1 mt-3">
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

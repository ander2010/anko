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
    ArchiveBoxIcon,
    DocumentTextIcon,
    QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

export function TopicCard({ topic, documentCount, onEdit, onArchive }) {
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
                                Edit Topic
                            </MenuItem>
                            <hr className="my-1" />
                            <MenuItem onClick={() => onArchive(topic)} className="flex items-center gap-2">
                                <ArchiveBoxIcon className="h-4 w-4" />
                                Archive
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                        <DocumentTextIcon className="h-5 w-5 text-blue-gray-400" />
                        <Typography variant="small" className="text-blue-gray-600">
                            {documentCount} {documentCount === 1 ? "document" : "documents"}
                        </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                        <QuestionMarkCircleIcon className="h-5 w-5 text-blue-gray-400" />
                        <Typography variant="small" className="text-blue-gray-600">
                            {topic.questionsCount} questions
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
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        questionsCount: PropTypes.number.isRequired,
        assignedDocuments: PropTypes.arrayOf(PropTypes.string),
        batteries: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string,
            })
        ),
    }).isRequired,
    documentCount: PropTypes.number.isRequired,
    onEdit: PropTypes.func.isRequired,
    onArchive: PropTypes.func.isRequired,
};

export default TopicCard;

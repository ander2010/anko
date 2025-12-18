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
    Progress,
} from "@material-tailwind/react";
import {
    EllipsisVerticalIcon,
    ArrowRightIcon,
    PencilIcon,
    DocumentDuplicateIcon,
    ArchiveBoxIcon,
    TrashIcon,
    DocumentTextIcon,
    ClockIcon,
} from "@heroicons/react/24/outline";

export function ProjectCard({
    project,
    documentCount = 0,
    progress = 0,
    isOwner,
    onEnter,
    onEdit,
    onDuplicate,
    onArchive,
    onDelete,
}) {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <Card className="border border-blue-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardBody className="p-4">
                {/* Header with Name and Actions */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                        <Typography variant="h6" color="blue-gray" className="mb-1 truncate">
                            {project.name}
                        </Typography>
                        <div className="flex items-center gap-2">
                            <Typography
                                variant="small"
                                className="font-normal text-blue-gray-500"
                            >
                                by {project.owner.name}
                            </Typography>
                            {isOwner && (
                                <Chip
                                    value="Owner"
                                    size="sm"
                                    color="blue"
                                    className="rounded-full px-2 py-0.5"
                                />
                            )}
                        </div>
                    </div>

                    {/* Actions Menu */}
                    <Menu placement="bottom-end">
                        <MenuHandler>
                            <IconButton variant="text" color="blue-gray" size="sm">
                                <EllipsisVerticalIcon className="h-5 w-5" />
                            </IconButton>
                        </MenuHandler>
                        <MenuList>
                            <MenuItem onClick={() => onEnter(project)} className="flex items-center gap-2">
                                <ArrowRightIcon className="h-4 w-4" />
                                Enter Project
                            </MenuItem>
                            {isOwner && (
                                <>
                                    <MenuItem onClick={() => onEdit(project)} className="flex items-center gap-2">
                                        <PencilIcon className="h-4 w-4" />
                                        Edit Name
                                    </MenuItem>
                                    <MenuItem onClick={() => onDuplicate(project)} className="flex items-center gap-2">
                                        <DocumentDuplicateIcon className="h-4 w-4" />
                                        Duplicate
                                    </MenuItem>
                                    <hr className="my-1" />
                                    <MenuItem onClick={() => onArchive(project)} className="flex items-center gap-2">
                                        <ArchiveBoxIcon className="h-4 w-4" />
                                        Archive
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => onDelete(project)}
                                        className="flex items-center gap-2 text-red-500 hover:bg-red-50"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                        Delete
                                    </MenuItem>
                                </>
                            )}
                        </MenuList>
                    </Menu>
                </div>

                {/* Documents Count */}
                <div className="mb-3 flex items-center gap-2">
                    <DocumentTextIcon className="h-5 w-5 text-blue-gray-400" />
                    <Typography variant="small" className="text-blue-gray-600">
                        {documentCount} {documentCount === 1 ? "document" : "documents"}
                    </Typography>
                </div>

                {/* Topics/Tags */}
                {project.topics && project.topics.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                        {project.topics.slice(0, 3).map((topic, index) => (
                            <Chip
                                key={index}
                                value={topic}
                                size="sm"
                                variant="ghost"
                                color="blue-gray"
                                className="rounded-md px-2 py-1"
                            />
                        ))}
                        {project.topics.length > 3 && (
                            <Chip
                                value={`+${project.topics.length - 3}`}
                                size="sm"
                                variant="ghost"
                                color="blue-gray"
                                className="rounded-md px-2 py-1"
                            />
                        )}
                    </div>
                )}

                {/* Progress Bar (optional) */}
                {documentCount > 0 && (
                    <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                            <Typography variant="small" className="text-blue-gray-600 font-medium">
                                Processing
                            </Typography>
                            <Typography variant="small" className="text-blue-gray-600 font-medium">
                                {progress}%
                            </Typography>
                        </div>
                        <Progress
                            value={progress}
                            variant="gradient"
                            color={progress === 100 ? "green" : "blue"}
                            className="h-1.5"
                        />
                    </div>
                )}

                {/* Last Activity */}
                <div className="flex items-center gap-2 pt-3 border-t border-blue-gray-50">
                    <ClockIcon className="h-4 w-4 text-blue-gray-400" />
                    <Typography variant="small" className="text-blue-gray-500">
                        Updated {formatDate(project.updatedAt)}
                    </Typography>
                </div>
            </CardBody>
        </Card>
    );
}

ProjectCard.propTypes = {
    project: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        owner: PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
        }).isRequired,
        members: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                name: PropTypes.string.isRequired,
                avatar: PropTypes.string,
            })
        ),
        createdAt: PropTypes.string.isRequired,
        updatedAt: PropTypes.string.isRequired,
        logo: PropTypes.string,
        topics: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
    documentCount: PropTypes.number,
    progress: PropTypes.number,
    isOwner: PropTypes.bool.isRequired,
    onEnter: PropTypes.func.isRequired,
    onEdit: PropTypes.func,
    onDuplicate: PropTypes.func,
    onArchive: PropTypes.func,
    onDelete: PropTypes.func,
};

export default ProjectCard;

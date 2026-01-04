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
  TrashIcon,
  DocumentTextIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import { ProjectProcessingProgress } from "@/widgets/project/project-processing-progress";

export function ProjectCard({
  project,
  documentCount = 0,
  progress = 0,
  processingJobs = [], // Array of { id, jobId }
  isOwner,
  onEnter,
  onEdit,
  onDelete,
  onUploadDocs,
  onJobComplete,
}) {
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "—";

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

  const ownerLabel =
    project?.owner?.name || project?.owner?.username || "Unknown";

  return (
    <Card
      className="border border-blue-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-default"
      onDoubleClick={() => onEnter(project)}
    >
      <CardBody className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <Typography
              variant="h6"
              color="blue-gray"
              className="mb-1 truncate cursor-pointer hover:text-blue-500 transition-colors"
              onClick={() => onEnter(project)}
            >
              {project.title || project.name || "Untitled"}
            </Typography>

            <div className="flex items-center gap-2">
              <Typography variant="small" className="font-normal text-blue-gray-500">
                by {ownerLabel}
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

          {/* Actions */}
          <Menu placement="bottom-end">
            <MenuHandler>
              <IconButton variant="text" color="blue-gray" size="sm">
                <EllipsisVerticalIcon className="h-5 w-5" />
              </IconButton>
            </MenuHandler>

            <MenuList>
              <MenuItem
                onClick={() => onEnter(project)}
                className="flex items-center gap-2"
              >
                <ArrowRightIcon className="h-4 w-4" />
                Enter Project
              </MenuItem>

              <MenuItem
                onClick={() => onUploadDocs(project)}
                className="flex items-center gap-2"
              >
                <DocumentDuplicateIcon className="h-4 w-4" />
                Upload Documents
              </MenuItem>

              {isOwner && (
                <>
                  <MenuItem
                    onClick={() => onEdit(project)}
                    className="flex items-center gap-2"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit
                  </MenuItem>

                  <hr className="my-1" />

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

        {/* Real-time Progress for Jobs */}
        {processingJobs.length > 0 && (
          <div className="mb-3 space-y-2">
            {processingJobs.map((job) => (
              <ProjectProcessingProgress
                key={job.jobId}
                jobId={job.jobId}
                onComplete={(jobId, dId) => onJobComplete && onJobComplete(project.id, jobId, dId)}
              />
            ))}
          </div>
        )}

        {/* Static Progress (legacy/backup) */}
        {documentCount > 0 && processingJobs.length === 0 && progress > 0 && (
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
            Updated {formatDate(project.updated_at || project.updatedAt)}
          </Typography>
        </div>
      </CardBody>
    </Card>
  );
}

ProjectCard.defaultProps = {
  onEdit: () => { },
  onDelete: () => { },
  onUploadDocs: () => { },
};

ProjectCard.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    owner: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      username: PropTypes.string,
    }),
    created_at: PropTypes.string,
    updated_at: PropTypes.string,
    updatedAt: PropTypes.string,
    logo: PropTypes.string,
  }).isRequired,

  documentCount: PropTypes.number,
  progress: PropTypes.number,
  processingJobs: PropTypes.arrayOf(
    PropTypes.shape({
      jobId: PropTypes.string.isRequired,
    })
  ),
  isOwner: PropTypes.bool.isRequired,

  onEnter: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onUploadDocs: PropTypes.func,
  onJobComplete: PropTypes.func,
};

export default ProjectCard;

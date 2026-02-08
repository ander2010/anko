import React, { useState, useEffect } from "react";
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
  BoltIcon,
  EllipsisVerticalIcon,
  ArrowRightIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  DocumentTextIcon,
  ClockIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/outline";

import { ProjectProcessingProgress } from "@/widgets/project/project-processing-progress";
import { useLanguage } from "@/context/language-context";
import projectService from "@/services/projectService";

export function ProjectCard({
  project,
  documentCount = 0,
  batteriesCount = 0,
  decksCount = 0,
  progress = 0,
  processingJobs = [], // Array of { id, jobId }
  isOwner,
  onEnter,
  onEdit,
  onDelete,
  onUploadDocs,
  onJobComplete,
}) {
  const { t, language } = useLanguage();
  const [counts, setCounts] = useState({
    documents: documentCount,
    batteries: batteriesCount,
    decks: decksCount,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const data = await projectService.getProjectCounts(project.id);
        setCounts({
          documents: data.documents_count ?? documentCount,
          batteries: data.batteries_count ?? 0,
          decks: data.decks_count ?? 0,
        });
      } catch (err) {
        console.error("[ProjectCard] Error fetching counts:", err);
      }
    };

    if (project.id) {
      fetchCounts();
    }
  }, [project.id, documentCount]);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString(language === "es" ? "es-ES" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const ownerLabel =
    project?.owner?.name || project?.owner?.username || "Unknown";

  return (
    <Card
      className="group border border-zinc-200/60 bg-white/70 backdrop-blur-sm shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-300 rounded-[2rem] overflow-hidden cursor-default"
      onDoubleClick={() => onEnter(project)}
    >
      <CardBody className="p-7">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 min-w-0">
            <Typography
              variant="h5"
              className="font-bold text-zinc-900 mb-1.5 truncate tracking-tight group-hover:text-indigo-600 transition-colors cursor-pointer"
              onClick={() => onEnter(project)}
            >
              {project.title || project.name || "Untitled"}
            </Typography>

            <div className="flex items-center gap-2">
              <Typography className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                {language === "es" ? "POR" : "BY"} {ownerLabel.toUpperCase()}
              </Typography>

              {isOwner && (
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" title="Owner" />
              )}
            </div>
          </div>

          {/* Actions */}
          <Menu placement="bottom-end">
            <MenuHandler>
              <IconButton variant="text" color="zinc" size="sm" className="rounded-xl hover:bg-zinc-100">
                <EllipsisVerticalIcon className="h-5 w-5 text-zinc-400 group-hover:text-zinc-600" />
              </IconButton>
            </MenuHandler>

            <MenuList className="p-2 border-zinc-200/60 shadow-xl rounded-2xl backdrop-blur-md bg-white/90">
              <MenuItem
                onClick={() => onEnter(project)}
                className="flex items-center gap-3 py-2.5 px-4 rounded-xl text-zinc-700 font-bold text-xs hover:bg-zinc-50 hover:text-zinc-900"
              >
                <ArrowRightIcon className="h-4 w-4 text-zinc-400" />
                {language === "es" ? "Entrar al Proyecto" : "Enter Project"}
              </MenuItem>

              <MenuItem
                onClick={() => onUploadDocs(project)}
                className="flex items-center gap-3 py-2.5 px-4 rounded-xl text-zinc-700 font-bold text-xs hover:bg-zinc-50 hover:text-zinc-900"
              >
                <DocumentDuplicateIcon className="h-4 w-4 text-zinc-400" />
                {language === "es" ? "Subir Documentos" : "Upload Documents"}
              </MenuItem>

              {isOwner && (
                <>
                  <MenuItem
                    onClick={() => onEdit(project)}
                    className="flex items-center gap-3 py-2.5 px-4 rounded-xl text-zinc-700 font-bold text-xs hover:bg-zinc-50 hover:text-zinc-900"
                  >
                    <PencilIcon className="h-4 w-4 text-zinc-400" />
                    {language === "es" ? "Editar Detalles" : "Edit Details"}
                  </MenuItem>

                  <div className="my-1 border-t border-zinc-100" />

                  <MenuItem
                    onClick={() => onDelete(project)}
                    className="flex items-center gap-3 py-2.5 px-4 rounded-xl text-red-500 font-bold text-xs hover:bg-red-50 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                    {language === "es" ? "Eliminar Proyecto" : "Delete Project"}
                  </MenuItem>
                </>
              )}
            </MenuList>
          </Menu>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div
            className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100 group-hover:border-indigo-100 group-hover:bg-indigo-50/30 transition-colors cursor-pointer"
            onClick={() => onEnter(project, "documents")}
          >
            <Typography className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1 truncate">
              {t("project_detail.tabs.documents")}
            </Typography>
            <div className="flex items-end gap-1">
              <Typography className="text-xl font-black text-zinc-900 leading-none">{counts.documents}</Typography>
              <DocumentTextIcon className="h-3.5 w-3.5 text-indigo-500 mb-0.5" />
            </div>
          </div>
          <div
            className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100 group-hover:border-purple-100 group-hover:bg-purple-50/30 transition-colors cursor-pointer"
            onClick={() => onEnter(project, "batteries")}
          >
            <Typography className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1 truncate">
              {t("project_detail.tabs.batteries")}
            </Typography>
            <div className="flex items-end gap-1">
              <Typography className="text-xl font-black text-zinc-900 leading-none">{counts.batteries}</Typography>
              <BoltIcon className="h-3.5 w-3.5 text-purple-500 mb-0.5" />
            </div>
          </div>
          <div
            className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100 group-hover:border-orange-100 group-hover:bg-orange-50/30 transition-colors cursor-pointer"
            onClick={() => onEnter(project, "decks")}
          >
            <Typography className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1 truncate">
              {t("project_detail.tabs.decks")}
            </Typography>
            <div className="flex items-end gap-1">
              <Typography className="text-xl font-black text-zinc-900 leading-none">{counts.decks}</Typography>
              <RectangleStackIcon className="h-3.5 w-3.5 text-orange-500 mb-0.5" />
            </div>
          </div>
        </div>

        {/* Real-time Progress for Jobs */}
        {/* Real-time Progress for Jobs - Hidden by request
        {processingJobs.length > 0 && (
          <div className="mb-6 space-y-3">
            {processingJobs.map((job) => (
              <ProjectProcessingProgress
                key={job.jobId}
                jobId={job.jobId}
                onComplete={(jobId, dId) => onJobComplete && onJobComplete(project.id, jobId, dId)}
              />
            ))}
          </div>
        )}
        */}

        {/* Static Progress (legacy/backup) */}
        {/* Static Progress (legacy/backup) - Hidden by request
        {documentCount > 0 && processingJobs.length === 0 && progress > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <Typography className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                {language === "es" ? "PROCESANDO" : "PROCESSING"}
              </Typography>
              <Typography className="text-[10px] font-black text-indigo-600 uppercase">
                {progress}%
              </Typography>
            </div>
            <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        */}

        {/* Last Activity */}
        <div className="flex items-center justify-between pt-5 border-t border-zinc-100">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-3.5 w-3.5 text-zinc-400" />
            <Typography className="text-[11px] font-medium text-zinc-500">
              {formatDate(project.updated_at || project.updatedAt)}
            </Typography>
          </div>

          <button
            onClick={() => onEnter(project)}
            className="h-8 w-8 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:bg-indigo-600 hover:scale-110 active:scale-95 transition-all shadow-lg shadow-zinc-200"
          >
            <ArrowRightIcon className="h-4 w-4" />
          </button>
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
  batteriesCount: PropTypes.number,
  decksCount: PropTypes.number,
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

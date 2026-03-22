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
  ChevronRightIcon,
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
      className="group border border-zinc-200/60 bg-white/70 backdrop-blur-sm shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-300 rounded-xl md:rounded-[2rem] overflow-hidden cursor-default"
      onDoubleClick={() => onEnter(project)}
    >
      <CardBody className="p-3 md:p-7">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-2 md:mb-6">
          <div className="flex-1 min-w-0" onClick={() => onEnter(project)} style={{ cursor: "pointer" }}>
            {/* Title */}
            <p className="truncate tracking-tight group-hover:text-indigo-600 transition-colors font-semibold"
              style={{ fontSize: "12px", color: "var(--ank-text)", marginBottom: 2 }}>
              {project.title || project.name || "Untitled"}
            </p>
            {/* Mobile: date under title */}
            <p className="block md:hidden" style={{ fontSize: "9px", color: "var(--ank-muted)" }}>
              {formatDate(project.updated_at || project.updatedAt)}
            </p>
            {/* Desktop: "BY owner" */}
            <div className="hidden md:flex items-center gap-2 mt-1">
              <Typography className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                {language === "es" ? "POR" : "BY"} {ownerLabel.toUpperCase()}
              </Typography>
              {isOwner && (
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" title="Owner" />
              )}
            </div>
          </div>

          {/* Mobile: chevron */}
          <button
            className="flex md:hidden items-center justify-center ml-2 flex-shrink-0"
            onClick={() => onEnter(project)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}
          >
            <ChevronRightIcon className="h-4 w-4 text-zinc-400" />
          </button>

          {/* Desktop: ellipsis menu */}
          <div className="hidden md:block">
            <Menu placement="bottom-end">
              <MenuHandler>
                <IconButton variant="text" color="zinc" size="sm" className="rounded-xl hover:bg-zinc-100">
                  <EllipsisVerticalIcon className="h-5 w-5 text-zinc-400 group-hover:text-zinc-600" />
                </IconButton>
              </MenuHandler>
              <MenuList className="p-2 border-zinc-200/60 shadow-xl rounded-2xl backdrop-blur-md bg-white/90">
                <MenuItem onClick={() => onEnter(project)} className="flex items-center gap-3 py-2.5 px-4 rounded-xl text-zinc-700 font-bold text-xs hover:bg-zinc-50 hover:text-zinc-900">
                  <ArrowRightIcon className="h-4 w-4 text-zinc-400" />
                  {language === "es" ? "Entrar al Proyecto" : "Enter Project"}
                </MenuItem>
                <MenuItem onClick={() => onUploadDocs(project)} className="flex items-center gap-3 py-2.5 px-4 rounded-xl text-zinc-700 font-bold text-xs hover:bg-zinc-50 hover:text-zinc-900">
                  <DocumentDuplicateIcon className="h-4 w-4 text-zinc-400" />
                  {language === "es" ? "Subir Documentos" : "Upload Documents"}
                </MenuItem>
                {isOwner && (
                  <>
                    <MenuItem onClick={() => onEdit(project)} className="flex items-center gap-3 py-2.5 px-4 rounded-xl text-zinc-700 font-bold text-xs hover:bg-zinc-50 hover:text-zinc-900">
                      <PencilIcon className="h-4 w-4 text-zinc-400" />
                      {language === "es" ? "Editar Detalles" : "Edit Details"}
                    </MenuItem>
                    <div className="my-1 border-t border-zinc-100" />
                    <MenuItem onClick={() => onDelete(project)} className="flex items-center gap-3 py-2.5 px-4 rounded-xl text-red-500 font-bold text-xs hover:bg-red-50 hover:text-red-600">
                      <TrashIcon className="h-4 w-4" />
                      {language === "es" ? "Eliminar Proyecto" : "Delete Project"}
                    </MenuItem>
                  </>
                )}
              </MenuList>
            </Menu>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-1.5 md:gap-3 mb-0 md:mb-8">
          <div
            className="rounded-lg md:rounded-2xl cursor-pointer md:bg-zinc-50 md:border md:border-zinc-100 md:group-hover:border-indigo-100 md:group-hover:bg-indigo-50/30 transition-colors"
            style={{ background: "var(--ank-bg)", padding: "5px", textAlign: "center" }}
            onClick={() => onEnter(project, "documents")}
          >
            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--ank-purple)", lineHeight: 1 }}>{counts.documents}</p>
            <p style={{ fontSize: "8px", color: "#aaa", marginTop: 2 }}>{t("project_detail.tabs.documents")}</p>
          </div>
          <div
            className="rounded-lg md:rounded-2xl cursor-pointer md:bg-zinc-50 md:border md:border-zinc-100 md:group-hover:border-purple-100 md:group-hover:bg-purple-50/30 transition-colors"
            style={{ background: "var(--ank-bg)", padding: "5px", textAlign: "center" }}
            onClick={() => onEnter(project, "batteries")}
          >
            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--ank-amber)", lineHeight: 1 }}>{counts.batteries}</p>
            <p style={{ fontSize: "8px", color: "#aaa", marginTop: 2 }}>{t("project_detail.tabs.batteries")}</p>
          </div>
          <div
            className="rounded-lg md:rounded-2xl cursor-pointer md:bg-zinc-50 md:border md:border-zinc-100 md:group-hover:border-orange-100 md:group-hover:bg-orange-50/30 transition-colors"
            style={{ background: "var(--ank-bg)", padding: "5px", textAlign: "center" }}
            onClick={() => onEnter(project, "decks")}
          >
            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--ank-teal)", lineHeight: 1 }}>{counts.decks}</p>
            <p style={{ fontSize: "8px", color: "#aaa", marginTop: 2 }}>{t("project_detail.tabs.decks")}</p>
          </div>
        </div>

        {/* ── Desktop footer: date + arrow (hidden on mobile) ── */}
        <div className="hidden md:flex items-center justify-between pt-5 border-t border-zinc-100">
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

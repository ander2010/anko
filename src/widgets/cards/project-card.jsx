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
  BookOpenIcon,
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
    <div
      className="group bg-white overflow-hidden transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
      style={{
        borderRadius: 18,
        border: "1.5px solid #e2e8f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 28px rgba(57,73,171,0.14)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"}
      onDoubleClick={() => onEnter(project)}
    >
      <div className="p-5">

        {/* ── Top row: icon + menu ── */}
        <div className="flex items-start justify-between mb-4">
          <div style={{
            width: 40, height: 40,
            background: "rgb(57, 73, 171)",
            borderRadius: 11,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid rgba(57,73,171,0.28)",
            flexShrink: 0,
          }}>
            <BookOpenIcon style={{ width: 17, height: 17, color: "#ffffffff", strokeWidth: 1.8 }} />
          </div>
          <Menu placement="bottom-end">
            <MenuHandler>
              <IconButton variant="text" size="sm" className="rounded-xl hover:bg-zinc-100">
                <EllipsisVerticalIcon className="h-5 w-5 text-zinc-400" />
              </IconButton>
            </MenuHandler>
            <MenuList className="p-2 border-zinc-200/60 shadow-xl rounded-2xl bg-white/90">
              <MenuItem onClick={() => onEnter(project)} className="flex items-center gap-3 py-2.5 px-4 rounded-xl text-zinc-700 font-bold text-xs hover:bg-zinc-50">
                <ArrowRightIcon className="h-4 w-4 text-zinc-400" />
                {language === "es" ? "Entrar al Proyecto" : "Enter Project"}
              </MenuItem>
              <MenuItem onClick={() => onUploadDocs(project)} className="flex items-center gap-3 py-2.5 px-4 rounded-xl text-zinc-700 font-bold text-xs hover:bg-zinc-50">
                <DocumentDuplicateIcon className="h-4 w-4 text-zinc-400" />
                {language === "es" ? "Subir Documentos" : "Upload Documents"}
              </MenuItem>
              {isOwner && (
                <>
                  <MenuItem onClick={() => onEdit(project)} className="flex items-center gap-3 py-2.5 px-4 rounded-xl text-zinc-700 font-bold text-xs hover:bg-zinc-50">
                    <PencilIcon className="h-4 w-4 text-zinc-400" />
                    {language === "es" ? "Editar Detalles" : "Edit Details"}
                  </MenuItem>
                  <div className="my-1 border-t border-zinc-100" />
                  <MenuItem onClick={() => onDelete(project)} className="flex items-center gap-3 py-2.5 px-4 rounded-xl text-red-500 font-bold text-xs hover:bg-red-50">
                    <TrashIcon className="h-4 w-4" />
                    {language === "es" ? "Eliminar Proyecto" : "Delete Project"}
                  </MenuItem>
                </>
              )}
            </MenuList>
          </Menu>
        </div>

        {/* ── Title + owner ── */}
        <p
          onClick={() => onEnter(project)}
          style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 3, letterSpacing: "-0.3px", cursor: "pointer" }}
        >
          {project.title || project.name || "Untitled"}
        </p>
        <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 14 }}>
          {language === "es" ? "Actualizado" : "Updated"} {formatDate(project.updated_at || project.updatedAt)}
        </p>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: "#e2e8f0", marginBottom: 14 }} />

        {/* ── Stats row ── */}
        <div style={{ display: "flex", marginBottom: 14 }}>
          {[
            { num: counts.documents, lbl: language === "es" ? "Docs" : "Docs", tab: "documents" },
            { num: counts.batteries, lbl: language === "es" ? "Baterías" : "Batteries", tab: "batteries" },
            { num: counts.decks, lbl: language === "es" ? "Mazos" : "Decks", tab: "decks" },
          ].map((s, i) => (
            <div
              key={i}
              onClick={() => onEnter(project, s.tab)}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, position: "relative", cursor: "pointer" }}
            >
              {i < 2 && <div style={{ position: "absolute", right: 0, top: "10%", width: 1, height: "80%", background: "#e2e8f0" }} />}
              <span style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>{s.num}</span>
              <span style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px", fontWeight: 500 }}>{s.lbl}</span>
            </div>
          ))}
        </div>

        {/* ── Footer: date + enter ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <ClockIcon style={{ width: 13, height: 13, color: "#94a3b8" }} />
            <span style={{ fontSize: 11, color: "#94a3b8" }}>
              {language === "es" ? "POR" : "BY"} {ownerLabel}
            </span>
          </div>
          <button
            onClick={() => onEnter(project)}
            style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "#3949AB", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <ArrowRightIcon style={{ width: 14, height: 14, color: "#fff" }} />
          </button>
        </div>

      </div>
    </div>
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

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusIcon, BookOpenIcon, AcademicCapIcon,
  ClockIcon, TrashIcon, ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { learningApi } from "../../api/enterpriseApi";
import { useEnterprise } from "../../context/enterprise-context";

// ─── Constants ────────────────────────────────────────────────────────────────

const PROCESS_TYPE_LABELS = {
  course:         "Course",
  tutorial:       "Tutorial",
  study_material: "Study Material",
};

const PROCESS_TYPE_COLORS = {
  course:         { bg: "rgba(94,106,210,0.12)", text: "#8B9CF4" },
  tutorial:       { bg: "rgba(34,197,94,0.1)",   text: "#4ade80" },
  study_material: { bg: "rgba(245,158,11,0.1)",  text: "#f59e0b" },
};

const DIFFICULTY_COLORS = {
  easy:   { bg: "rgba(74,222,128,0.1)",  text: "#4ade80" },
  medium: { bg: "rgba(245,158,11,0.1)", text: "#f59e0b" },
  hard:   { bg: "rgba(239,68,68,0.1)",  text: "#f87171" },
};

// ─── Pill badges ─────────────────────────────────────────────────────────────

function TypePill({ type }) {
  const c = PROCESS_TYPE_COLORS[type] || { bg: "var(--bg-elevated)", text: "var(--text-secondary)" };
  return (
    <span style={{ background: c.bg, color: c.text, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, letterSpacing: "0.03em" }}>
      {PROCESS_TYPE_LABELS[type] || type}
    </span>
  );
}

function DifficultyPill({ difficulty }) {
  const c = DIFFICULTY_COLORS[difficulty] || { bg: "var(--bg-elevated)", text: "var(--text-secondary)" };
  return (
    <span style={{ background: c.bg, color: c.text, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, textTransform: "capitalize" }}>
      {difficulty}
    </span>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyProcesos({ onNew }) {
  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8 }}
      className="flex flex-col items-center py-16 px-8 text-center">
      <div style={{ background: "var(--bg-elevated)", borderRadius: 10, padding: 14, marginBottom: 14 }}>
        <BookOpenIcon style={{ width: 28, height: 28, color: "var(--text-tertiary)" }} />
      </div>
      <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 14 }}>Aún no hay procesos</p>
      <p style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 4, maxWidth: 320, lineHeight: 1.6 }}>
        Crea tu primer Proceso de aprendizaje. Puedes subir documentos y el sistema los convierte en contenido estructurado.
      </p>
      <button onClick={onNew} className="ank-btn-accent text-xs mt-5">
        <PlusIcon className="h-3.5 w-3.5" /> Nuevo Proceso
      </button>
    </div>
  );
}

// ─── Module Row ───────────────────────────────────────────────────────────────

function ModuleRow({ mod, onDelete }) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm(`¿Eliminar el proceso "${mod.name}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    try { await learningApi.deleteModule(mod.id); onDelete(mod.id); }
    catch { setDeleting(false); }
  };

  return (
    <div
      onClick={() => navigate(`/enterprise/knowledge/${mod.id}`)}
      style={{
        background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8,
        padding: "14px 16px", cursor: "pointer", transition: "border-color 150ms, background 150ms",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.background = "var(--bg-elevated)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-surface)"; }}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left */}
        <div className="flex items-start gap-3 min-w-0">
          <div style={{ background: "var(--accent-muted)", borderRadius: 7, padding: 8, flexShrink: 0 }}>
            <BookOpenIcon style={{ width: 15, height: 15, color: "var(--accent)" }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 13 }}>{mod.name}</p>
              <TypePill type={mod.process_type} />
              <DifficultyPill difficulty={mod.difficulty} />
              {mod.is_required && (
                <span style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4 }}>
                  Required
                </span>
              )}
            </div>
            {mod.description && (
              <p style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 3, lineHeight: 1.5 }}
                className="truncate">{mod.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2" style={{ flexWrap: "wrap" }}>
              {mod.item_count != null && (
                <span style={{ color: "var(--text-tertiary)", fontSize: 11 }} className="flex items-center gap-1">
                  <AcademicCapIcon style={{ width: 11, height: 11 }} />
                  {mod.item_count} item{mod.item_count !== 1 ? "s" : ""}
                </span>
              )}
              {mod.estimated_duration_minutes && (
                <span style={{ color: "var(--text-tertiary)", fontSize: 11 }} className="flex items-center gap-1">
                  <ClockIcon style={{ width: 11, height: 11 }} />
                  {mod.estimated_duration_minutes} min
                </span>
              )}
              {mod.order != null && (
                <span style={{ color: "var(--text-tertiary)", fontSize: 11 }}>
                  Orden: #{mod.order}
                </span>
              )}
              {mod.created_at && (
                <span style={{ color: "var(--text-tertiary)", fontSize: 11 }}>
                  {new Date(mod.created_at).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{ color: "var(--text-tertiary)", padding: 5, borderRadius: 5, transition: "color 150ms, background 150ms" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; e.currentTarget.style.background = "transparent"; }}
          >
            {deleting
              ? <ArrowPathIcon style={{ width: 14, height: 14 }} className="animate-spin" />
              : <TrashIcon style={{ width: 14, height: 14 }} />
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Filters ──────────────────────────────────────────────────────────────────

function FilterChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "4px 10px", borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: "pointer",
      background: active ? "var(--accent)" : "var(--bg-elevated)",
      color: active ? "#fff" : "var(--text-secondary)",
      border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
      transition: "all 150ms",
    }}>
      {label}
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function KnowledgeSources() {
  const navigate = useNavigate();
  const { activeCompanyId } = useEnterprise();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [diffFilter, setDiffFilter] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (typeFilter) params.process_type = typeFilter;
    if (diffFilter) params.difficulty = diffFilter;
    learningApi.getModules(params)
      .then((d) => setItems(d.results || d || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [activeCompanyId, typeFilter, diffFilter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = (id) => setItems((prev) => prev.filter((m) => m.id !== id));

  const filtered = items; // server-filtered already

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 style={{ color: "var(--text-primary)" }} className="text-xl font-bold">Procesos</h1>
          <p style={{ color: "var(--text-secondary)" }} className="text-sm mt-0.5">
            Módulos de aprendizaje de tu empresa
          </p>
        </div>
        <button onClick={() => navigate("/enterprise/knowledge/new")} className="ank-btn-accent text-xs">
          <PlusIcon className="h-3.5 w-3.5" /> Nuevo Proceso
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span style={{ color: "var(--text-tertiary)", fontSize: 11 }}>Tipo:</span>
        <FilterChip label="Todos" active={typeFilter === ""} onClick={() => setTypeFilter("")} />
        <FilterChip label="Course" active={typeFilter === "course"} onClick={() => setTypeFilter("course")} />
        <FilterChip label="Tutorial" active={typeFilter === "tutorial"} onClick={() => setTypeFilter("tutorial")} />
        <FilterChip label="Study Material" active={typeFilter === "study_material"} onClick={() => setTypeFilter("study_material")} />

        <span style={{ color: "var(--border)", marginLeft: 4 }}>|</span>

        <span style={{ color: "var(--text-tertiary)", fontSize: 11 }}>Dificultad:</span>
        <FilterChip label="Todos" active={diffFilter === ""} onClick={() => setDiffFilter("")} />
        <FilterChip label="Easy" active={diffFilter === "easy"} onClick={() => setDiffFilter("easy")} />
        <FilterChip label="Medium" active={diffFilter === "medium"} onClick={() => setDiffFilter("medium")} />
        <FilterChip label="Hard" active={diffFilter === "hard"} onClick={() => setDiffFilter("hard")} />
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, height: 80 }}
              className="animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyProcesos onNew={() => navigate("/enterprise/knowledge/new")} />
      ) : (
        <div className="space-y-2">
          {filtered.map((mod) => (
            <ModuleRow key={mod.id} mod={mod} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Count */}
      {!loading && filtered.length > 0 && (
        <p style={{ color: "var(--text-tertiary)", fontSize: 11 }}>
          {filtered.length} proceso{filtered.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

export default KnowledgeSources;

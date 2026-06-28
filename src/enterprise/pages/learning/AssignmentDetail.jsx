import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon, CheckCircleIcon, LockClosedIcon, PlayIcon,
  ClockIcon, DocumentTextIcon, RectangleStackIcon, BoltIcon,
  ChevronRightIcon, ArrowPathIcon, BookOpenIcon, TagIcon,
} from "@heroicons/react/24/outline";
import { learningApi } from "../../api/enterpriseApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const STUDY_TABS = [
  { id: "documents",  label: "Documentos",  Icon: DocumentTextIcon },
  { id: "flashcards", label: "Flashcards",  Icon: RectangleStackIcon },
  { id: "battery",    label: "Batería",     Icon: BoltIcon },
];

// ─── Shared helpers ───────────────────────────────────────────────────────────

function ProgressBar({ value, color = "var(--accent)" }) {
  const pct = Math.max(0, Math.min(100, value || 0));
  return (
    <div style={{ height: 4, background: "var(--bg-elevated)", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 400ms" }} />
    </div>
  );
}

// ─── Flashcard flip component ─────────────────────────────────────────────────

function FlashCard({ item, index }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div onClick={() => setFlipped((v) => !v)}
      style={{ cursor: "pointer", background: flipped ? "rgba(94,106,210,0.08)" : "var(--bg-elevated)", border: `1px solid ${flipped ? "var(--accent)" : "var(--border)"}`, borderRadius: 8, padding: "16px 18px", minHeight: 90, transition: "all 200ms", userSelect: "none" }}>
      <div className="flex items-center justify-between mb-2">
        <span style={{ fontSize: 9, fontWeight: 700, color: flipped ? "var(--accent)" : "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {flipped ? "Respuesta" : `Pregunta ${index + 1}`}
        </span>
        <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>clic para voltear</span>
      </div>
      <p style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: flipped ? 400 : 500, lineHeight: 1.6 }}>
        {flipped
          ? (item.answer || item.back || item.content_back || "—")
          : (item.question || item.front || item.content_front || item.title || `Flashcard ${item.id}`)}
      </p>
    </div>
  );
}

// ─── Section content panel (right side) ──────────────────────────────────────

function SectionContent({ section, sectionItems, isCompleted, assignmentId, onComplete }) {
  const [activeTab, setActiveTab] = useState("documents");
  const [completing, setCompleting] = useState(false);
  const [doneNow, setDoneNow] = useState(false);

  const docs      = sectionItems.filter((i) => ["document", "pdf", "video", "link"].includes(i.item_type));
  const flashcards = sectionItems.filter((i) => ["deck", "flashcard"].includes(i.item_type));
  const batteries = sectionItems.filter((i) => i.item_type === "battery");

  const tabData = { documents: docs, flashcards, battery: batteries };
  const isDone = isCompleted || doneNow;

  const handleComplete = async () => {
    setCompleting(true);
    try {
      if (section.id && assignmentId) {
        await learningApi.completeModule(assignmentId, { module_id: section.id });
      }
      setDoneNow(true);
      onComplete(section.id);
    } catch {}
    setCompleting(false);
  };

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      {/* Section header */}
      <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 15 }}>
              {section.title || section.name}
            </p>
            {section.description && (
              <p style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 4, lineHeight: 1.6 }}>{section.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2">
              {docs.length > 0 && <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>{docs.length} doc{docs.length !== 1 ? "s" : ""}</span>}
              {flashcards.length > 0 && <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>{flashcards.length} flashcard{flashcards.length !== 1 ? "s" : ""}</span>}
              {batteries.length > 0 && <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>{batteries.length} batería{batteries.length !== 1 ? "s" : ""}</span>}
            </div>
          </div>
          {isDone && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#4ade80", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
              <CheckCircleIcon style={{ width: 14, height: 14 }} /> Completada
            </div>
          )}
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ background: "var(--bg-app)", borderBottom: "1px solid var(--border)", display: "flex", flexShrink: 0 }}>
        {STUDY_TABS.map(({ id, label, Icon }) => {
          const count = tabData[id]?.length ?? 0;
          return (
            <button key={id} onClick={() => setActiveTab(id)}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 16px", borderBottom: `2px solid ${activeTab === id ? "var(--accent)" : "transparent"}`, color: activeTab === id ? "var(--text-primary)" : "var(--text-tertiary)", fontWeight: activeTab === id ? 600 : 400, fontSize: 12, cursor: "pointer", background: "transparent", transition: "color 150ms" }}>
              <Icon style={{ width: 12, height: 12 }} /> {label}
              {count > 0 && (
                <span style={{ background: activeTab === id ? "var(--accent)" : "var(--bg-elevated)", color: activeTab === id ? "#fff" : "var(--text-tertiary)", fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3, marginLeft: 2 }}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 22px" }}>
        {activeTab === "documents" && (
          docs.length === 0 ? (
            <EmptyTab label="documentos" />
          ) : (
            <div className="space-y-2">
              {docs.map((item) => (
                <div key={item.id} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 7, padding: "12px 14px" }}
                  className="flex items-start gap-3">
                  <DocumentTextIcon style={{ width: 16, height: 16, color: "#60a5fa", flexShrink: 0, marginTop: 1 }} />
                  <div className="min-w-0 flex-1">
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                      {item.title || item.name || `Documento ${item.id}`}
                    </p>
                    {item.description && (
                      <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 3, lineHeight: 1.5 }}>{item.description}</p>
                    )}
                    {item.page_count && (
                      <p style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 4 }}>{item.page_count} páginas</p>
                    )}
                  </div>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noreferrer"
                      style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, flexShrink: 0, textDecoration: "none" }}>
                      Ver →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === "flashcards" && (
          flashcards.length === 0 ? (
            <EmptyTab label="flashcards" />
          ) : (
            <div className="space-y-3">
              <p style={{ color: "var(--text-tertiary)", fontSize: 11, marginBottom: 8 }}>
                {flashcards.length} tarjeta{flashcards.length !== 1 ? "s" : ""} · haz clic en cada una para ver la respuesta
              </p>
              {flashcards.map((item, i) => <FlashCard key={item.id} item={item} index={i} />)}
            </div>
          )
        )}

        {activeTab === "battery" && (
          batteries.length === 0 ? (
            <EmptyTab label="baterías" />
          ) : (
            <div className="space-y-3">
              {batteries.map((item) => (
                <div key={item.id} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 16px" }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div style={{ background: "rgba(239,68,68,0.12)", borderRadius: 6, padding: 8, flexShrink: 0 }}>
                      <BoltIcon style={{ width: 16, height: 16, color: "#f87171" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                        {item.title || item.name || `Batería ${item.id}`}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>
                        {item.question_count ?? item.total_questions ?? "?"} preguntas
                        {item.passing_score ? ` · Mínimo aprobatorio: ${item.passing_score}%` : ""}
                        {item.time_limit_minutes ? ` · ${item.time_limit_minutes} min` : ""}
                      </p>
                    </div>
                  </div>
                  <button className="ank-btn-accent text-xs w-full" style={{ justifyContent: "center" }}>
                    <BoltIcon className="h-3.5 w-3.5" /> Iniciar Batería
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Complete footer */}
      {!isDone && (
        <div style={{ borderTop: "1px solid var(--border)", padding: "12px 22px", background: "var(--bg-surface)", display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
          <button onClick={handleComplete} disabled={completing} className="ank-btn-accent text-xs" style={{ opacity: completing ? 0.7 : 1 }}>
            {completing ? <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" /> : <><CheckCircleIcon className="h-3.5 w-3.5" /> Marcar sección completada</>}
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyTab({ label }) {
  return (
    <div style={{ padding: "40px 0", textAlign: "center" }}>
      <p style={{ color: "var(--text-tertiary)", fontSize: 12 }}>Sin {label} en esta sección aún.</p>
      <p style={{ color: "var(--text-tertiary)", fontSize: 11, marginTop: 4 }}>Se generan automáticamente al procesar los documentos.</p>
    </div>
  );
}

// ─── Two-panel section viewer (opens when a process node is clicked) ──────────

function ProcessSectionViewer({ moduleId, assignmentId, alreadyCompleted }) {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState(null);
  const [completedSectionIds, setCompletedSectionIds] = useState(new Set());

  useEffect(() => {
    setLoading(true);
    learningApi.getModuleItems({ module: moduleId })
      .then((d) => {
        const items = d.results || d || [];
        setAllItems(items);
        // Auto-select first section
        const topics = items.filter((i) => i.item_type === "topic");
        if (topics.length > 0) setSelectedSection(topics[0]);
        else if (items.length > 0) {
          // No topics — treat the module itself as one section
          setSelectedSection({ id: moduleId, title: "Contenido", _synthetic: true });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [moduleId]);

  const handleSectionComplete = useCallback((sectionId) => {
    setCompletedSectionIds((prev) => new Set([...prev, sectionId]));
    // Auto-advance to next section
    const sections = getSections();
    const idx = sections.findIndex((s) => s.id === sectionId);
    const next = sections[idx + 1];
    if (next) setSelectedSection(next);
  }, [allItems]);

  const getSections = () => {
    const topics = allItems.filter((i) => i.item_type === "topic");
    if (topics.length > 0) return topics;
    return [{ id: moduleId, title: "Contenido", _synthetic: true }];
  };

  const getItemsForSection = (section) => {
    if (section._synthetic) {
      return allItems.filter((i) => i.item_type !== "topic");
    }
    return allItems.filter((i) =>
      i.topic === section.id || i.topic_id === section.id ||
      (i.item_type !== "topic" && !allItems.some((t) => t.item_type === "topic"))
    );
  };

  const sections = getSections();
  const totalSections = sections.length;
  const completedCount = alreadyCompleted ? totalSections : completedSectionIds.size;
  const pct = totalSections > 0 ? (completedCount / totalSections) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} className="w-6 h-6 border-2 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg-app)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
      {/* Module progress bar */}
      {totalSections > 1 && (
        <div style={{ padding: "10px 16px", background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-1.5">
            <span style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Progreso del proceso
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, color: pct === 100 ? "#4ade80" : "var(--accent)" }}>
              {completedCount}/{totalSections} secciones
            </span>
          </div>
          <ProgressBar value={pct} color={pct === 100 ? "#4ade80" : "var(--accent)"} />
        </div>
      )}

      {/* Two-panel layout */}
      <div style={{ display: "flex", minHeight: 460 }}>
        {/* Left: Section list */}
        <div style={{ width: 220, flexShrink: 0, borderRight: "1px solid var(--border)", overflowY: "auto", background: "var(--bg-surface)" }}>
          <div style={{ padding: "10px 12px 6px", borderBottom: "1px solid var(--border)" }}>
            <p style={{ fontSize: 9, fontWeight: 800, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Secciones ({sections.length})
            </p>
          </div>
          {sections.map((section, idx) => {
            const isSelected = selectedSection?.id === section.id;
            const isDone = alreadyCompleted || completedSectionIds.has(section.id);
            const isLocked = !isDone && idx > 0 && !completedSectionIds.has(sections[idx - 1]?.id) && !alreadyCompleted;
            return (
              <button key={section.id} onClick={() => !isLocked && setSelectedSection(section)}
                style={{
                  width: "100%", textAlign: "left", padding: "11px 14px",
                  background: isSelected ? "var(--bg-elevated)" : "transparent",
                  borderLeft: `3px solid ${isSelected ? "var(--accent)" : "transparent"}`,
                  borderBottom: "1px solid var(--border)",
                  cursor: isLocked ? "not-allowed" : "pointer", opacity: isLocked ? 0.45 : 1,
                  transition: "all 150ms",
                }}
                onMouseEnter={(e) => { if (!isLocked && !isSelected) e.currentTarget.style.background = "var(--bg-elevated)"; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}>
                <div className="flex items-start gap-2">
                  {/* Status dot */}
                  <div style={{ marginTop: 2, flexShrink: 0 }}>
                    {isDone ? (
                      <CheckCircleIcon style={{ width: 13, height: 13, color: "#4ade80" }} />
                    ) : isLocked ? (
                      <LockClosedIcon style={{ width: 13, height: 13, color: "var(--text-tertiary)" }} />
                    ) : isSelected ? (
                      <PlayIcon style={{ width: 13, height: 13, color: "var(--accent)" }} />
                    ) : (
                      <div style={{ width: 13, height: 13, borderRadius: "50%", border: "1.5px solid var(--border)" }} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p style={{ fontSize: 12, fontWeight: isSelected ? 600 : 400, color: isSelected ? "var(--text-primary)" : "var(--text-secondary)", lineHeight: 1.4 }}>
                      {section.title || section.name || `Sección ${idx + 1}`}
                    </p>
                    <p style={{ fontSize: 9, color: "var(--text-tertiary)", marginTop: 2 }}>
                      {isDone ? "Completada" : isLocked ? "Bloqueada" : isSelected ? "En progreso" : "Pendiente"}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Content */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          {selectedSection ? (
            <SectionContent
              key={selectedSection.id}
              section={selectedSection}
              sectionItems={getItemsForSection(selectedSection)}
              isCompleted={alreadyCompleted || completedSectionIds.has(selectedSection.id)}
              assignmentId={assignmentId}
              onComplete={handleSectionComplete}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p style={{ color: "var(--text-tertiary)", fontSize: 13 }}>Selecciona una sección</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Process node (for the path node chain) ───────────────────────────────────

function NodeIcon({ status }) {
  if (status === "completed") return (
    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(74,222,128,0.15)", border: "2px solid #4ade80", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <CheckCircleIcon style={{ width: 14, height: 14, color: "#4ade80" }} />
    </div>
  );
  if (status === "in_progress") return (
    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(94,106,210,0.2)", border: "2px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <PlayIcon style={{ width: 12, height: 12, color: "var(--accent)" }} />
    </div>
  );
  return (
    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--bg-elevated)", border: "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <LockClosedIcon style={{ width: 12, height: 12, color: "var(--text-tertiary)" }} />
    </div>
  );
}

function ProcessNode({ mod, index, status, isLast, isOpen, onClick, assignmentId }) {
  const typeColor = { document: "#60a5fa", topic: "#a855f7", deck: "#f59e0b", battery: "#f87171", course: "#4ade80" }[mod.process_type] || "var(--text-tertiary)";
  const locked = status === "locked";
  const borderColor = status === "completed" ? "#4ade80" : status === "in_progress" ? "var(--accent)" : "var(--border)";

  return (
    <div>
      <div className="flex gap-3">
        {/* Connector */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 30, flexShrink: 0 }}>
          <NodeIcon status={status} />
          {!isLast && (
            <div style={{ width: 2, flex: 1, minHeight: 16, background: status === "completed" ? "rgba(74,222,128,0.3)" : "var(--border)", margin: "4px 0", borderRadius: 1 }} />
          )}
        </div>

        {/* Card */}
        <div style={{ flex: 1, marginBottom: isLast ? 0 : 12 }}>
          <div onClick={() => !locked && onClick()}
            style={{ background: isOpen ? "var(--bg-elevated)" : "var(--bg-surface)", border: `1px solid ${isOpen ? borderColor : "var(--border)"}`, borderRadius: 7, padding: "11px 14px", cursor: locked ? "not-allowed" : "pointer", opacity: locked ? 0.45 : 1, transition: "all 150ms" }}
            onMouseEnter={(e) => { if (!locked) { e.currentTarget.style.borderColor = borderColor; e.currentTarget.style.background = "var(--bg-elevated)"; } }}
            onMouseLeave={(e) => { if (!locked) { e.currentTarget.style.borderColor = isOpen ? borderColor : "var(--border)"; e.currentTarget.style.background = isOpen ? "var(--bg-elevated)" : "var(--bg-surface)"; } }}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", flexShrink: 0 }}>#{index + 1}</span>
                <div className="min-w-0">
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }} className="truncate">{mod.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {mod.process_type && <span style={{ fontSize: 9, fontWeight: 700, color: typeColor, textTransform: "uppercase" }}>{mod.process_type}</span>}
                    {(mod.estimated_duration_minutes || 0) > 0 && (
                      <span style={{ fontSize: 10, color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: 3 }}>
                        <ClockIcon style={{ width: 9, height: 9 }} /> {mod.estimated_duration_minutes} min
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRightIcon style={{ width: 14, height: 14, color: "var(--text-tertiary)", flexShrink: 0, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 200ms" }} />
            </div>
          </div>

          {/* Section viewer — expands inline below the node */}
          {isOpen && !locked && (
            <div style={{ marginTop: 10 }}>
              <ProcessSectionViewer
                moduleId={mod.id}
                assignmentId={assignmentId}
                alreadyCompleted={status === "completed"}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main AssignmentDetail ────────────────────────────────────────────────────

export function AssignmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [pathData, setPathData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openNodeId, setOpenNodeId] = useState(null);
  const [completedModIds, setCompletedModIds] = useState(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, prog] = await Promise.all([
        learningApi.getAssignment(id),
        learningApi.getMyProgress(id).catch(() => null),
      ]);
      setAssignment(a);

      const doneIds = new Set(
        prog?.completed_module_ids ||
        prog?.completed_modules?.map?.((m) => (typeof m === "object" ? m.id : m)) ||
        []
      );
      setCompletedModIds(doneIds);

      const pathId = a.learning_path || a.learning_path_id;
      if (pathId) {
        const pd = await learningApi.getLearningPath(pathId);
        setPathData(pd);
        const mods = pd.modules || [];
        const firstOpen = mods.find((m) => !doneIds.has(m.id));
        if (firstOpen) setOpenNodeId(firstOpen.id);
        else if (mods.length > 0) setOpenNodeId(mods[0].id);
      }
    } catch {}
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const getModuleStatus = (mod, idx, mods) => {
    if (completedModIds.has(mod.id)) return "completed";
    const prevOk = idx === 0 || completedModIds.has(mods[idx - 1]?.id);
    return prevOk ? "in_progress" : "locked";
  };

  const mods = pathData?.modules || [];
  const totalMods = mods.length || 1;
  const completedCount = mods.filter((m) => completedModIds.has(m.id)).length;
  const isDone = assignment?.status === "completed";
  const dueStr = assignment?.due_date
    ? new Date(assignment.due_date).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" })
    : null;

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} className="w-7 h-7 border-2 rounded-full animate-spin" />
    </div>
  );

  if (!assignment) return (
    <div className="flex flex-col items-center py-24">
      <p style={{ color: "var(--text-primary)", fontWeight: 600 }}>Asignación no encontrada.</p>
      <button onClick={() => navigate("/enterprise/learning/assignments")} className="ank-btn-ghost text-xs mt-4">
        <ArrowLeftIcon className="h-3.5 w-3.5" /> Volver
      </button>
    </div>
  );

  return (
    <div className="w-full space-y-5">
      {/* Back */}
      <button onClick={() => navigate("/enterprise/learning/assignments")}
        style={{ color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: 5, fontSize: 12, cursor: "pointer" }}
        className="hover:opacity-70 transition-opacity">
        <ArrowLeftIcon style={{ width: 13, height: 13 }} /> Mis Tareas
      </button>

      {/* Header */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "18px 22px" }}>
        <div className="flex items-start gap-3">
          <div style={{ background: isDone ? "rgba(74,222,128,0.12)" : "var(--accent-muted)", borderRadius: 8, padding: 10, flexShrink: 0 }}>
            <RectangleStackIcon style={{ width: 20, height: 20, color: isDone ? "#4ade80" : "var(--accent)" }} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 17 }}>
              {assignment.learning_path_name || assignment.path_name || assignment.name || "Asignación"}
            </h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {assignment.assigned_by_username && (
                <span style={{ color: "var(--text-tertiary)", fontSize: 11 }}>por {assignment.assigned_by_username}</span>
              )}
              {dueStr && (
                <span style={{ color: "var(--text-tertiary)", fontSize: 11, display: "flex", alignItems: "center", gap: 3 }}>
                  <ClockIcon style={{ width: 10, height: 10 }} /> Límite: {dueStr}
                </span>
              )}
            </div>
            {mods.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-tertiary)", fontSize: 11 }}>{completedCount} de {totalMods} procesos completados</span>
                  <span style={{ color: isDone ? "#4ade80" : "var(--accent)", fontSize: 11, fontWeight: 700 }}>
                    {Math.round((completedCount / totalMods) * 100)}%
                  </span>
                </div>
                <ProgressBar value={(completedCount / totalMods) * 100} color={isDone ? "#4ade80" : "var(--accent)"} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Process nodes */}
      {mods.length > 0 ? (
        <div>
          <p style={{ color: "var(--text-tertiary)", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
            Procesos del Learning Path
          </p>
          {mods.map((mod, idx) => (
            <ProcessNode
              key={mod.id}
              mod={mod}
              index={idx}
              status={getModuleStatus(mod, idx, mods)}
              isLast={idx === mods.length - 1}
              isOpen={openNodeId === mod.id}
              onClick={() => setOpenNodeId(openNodeId === mod.id ? null : mod.id)}
              assignmentId={id}
            />
          ))}
        </div>
      ) : (
        /* Single module assignment */
        <div>
          <p style={{ color: "var(--text-tertiary)", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
            Contenido del Proceso
          </p>
          {(assignment.learning_module || assignment.module) ? (
            <ProcessSectionViewer
              moduleId={assignment.learning_module || assignment.module}
              assignmentId={id}
              alreadyCompleted={isDone}
            />
          ) : (
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "40px 24px", textAlign: "center" }}>
              <BookOpenIcon style={{ width: 20, height: 20, color: "var(--text-tertiary)", margin: "0 auto 8px" }} />
              <p style={{ color: "var(--text-tertiary)", fontSize: 13 }}>No se encontraron módulos para esta asignación.</p>
            </div>
          )}
        </div>
      )}

      {/* Completed banner */}
      {isDone && (
        <div style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.25)", borderRadius: 8, padding: "16px 20px", display: "flex", alignItems: "center", gap: 10 }}>
          <CheckCircleIcon style={{ width: 18, height: 18, color: "#4ade80", flexShrink: 0 }} />
          <div>
            <p style={{ color: "#4ade80", fontWeight: 700, fontSize: 13 }}>¡Learning Path completado!</p>
            <p style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 2 }}>Has terminado todos los procesos de esta asignación.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignmentDetail;

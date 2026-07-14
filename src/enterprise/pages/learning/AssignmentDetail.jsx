import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon, CheckCircleIcon, LockClosedIcon, PlayIcon,
  ClockIcon, BoltIcon,
  ChevronRightIcon, ArrowPathIcon, BookOpenIcon, RectangleStackIcon,
  ViewColumnsIcon, XMarkIcon, ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { learningApi, knowledgeApi } from "../../api/enterpriseApi";
import { ExamSimulatorDialog } from "@/widgets/dialogs/index";
import { FlashcardViewDialog } from "@/widgets/dialogs/flashcard-view-dialog";
import { FlashcardLearnDialog } from "@/widgets/dialogs/flashcard-learn-dialog";

// ─── Shared helpers ───────────────────────────────────────────────────────────

function ProgressBar({ value, color = "var(--accent)" }) {
  const pct = Math.max(0, Math.min(100, value || 0));
  return (
    <div style={{ height: 4, background: "var(--bg-elevated)", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 400ms" }} />
    </div>
  );
}

// ─── Documents (read-only: viewable, not uploadable) ──────────────────────────

function DocumentsMiniPanel({ documents, onView }) {
  if (!documents || documents.length === 0) return null;
  return (
    <div style={{ background: "var(--bg-app)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
      <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
          Documentos ({documents.length})
        </p>
      </div>
      <div style={{ padding: 8 }}>
        {documents.map((doc) => {
          const ext = doc.type?.toUpperCase() || (doc.filename?.split(".").pop()?.toUpperCase()) || "FILE";
          return (
            <button key={doc.id} onClick={() => onView(doc)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 7, background: "transparent", border: "none", cursor: "pointer", textAlign: "left", transition: "background 150ms" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-elevated)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              <div style={{ width: 26, height: 30, background: ext === "PDF" ? "#DC2626" : "#3B82F6", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: "#fff", fontSize: 6, fontWeight: 800 }}>{ext.slice(0, 4)}</span>
              </div>
              <span style={{ flex: 1, minWidth: 0, fontSize: 12, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {doc.filename}
              </span>
              <span style={{ fontSize: 10, color: "var(--text-tertiary)", flexShrink: 0 }}>Ver →</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DocumentViewDialog({ doc, onClose }) {
  if (!doc) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 560, maxHeight: "80vh", display: "flex", flexDirection: "column", background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ height: 2, background: "linear-gradient(90deg, #6366F1, #818CF8, #A78BFA)", flexShrink: 0 }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.filename}</p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B", flexShrink: 0 }}>
            <XMarkIcon style={{ width: 16, height: 16 }} />
          </button>
        </div>
        {doc.url && (
          <div style={{ padding: "10px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
            <a href={doc.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#818CF8", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5, textDecoration: "none" }}>
              Abrir archivo original <ArrowTopRightOnSquareIcon style={{ width: 12, height: 12 }} />
            </a>
          </div>
        )}
        <div style={{ padding: "14px 18px", overflowY: "auto" }}>
          {(!doc.sections || doc.sections.length === 0) ? (
            <p style={{ fontSize: 12, color: "#475569", textAlign: "center", padding: "20px 0" }}>Sin secciones extraídas para este documento.</p>
          ) : (
            <div className="space-y-3">
              {doc.sections.map((s) => (
                <div key={s.id}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#E2E8F0", marginBottom: 4 }}>{s.title || "Sin título"}</p>
                  {s.content && <p style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.6 }}>{s.content}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Read-only deck / battery rows (Learn/Study/Simular only) ─────────────────

function ReadOnlyDeckRow({ deck, onLearn, onStudy }) {
  const cardCount = deck.flashcards_count ?? deck.cardsCount ?? deck.card_count ?? 0;
  return (
    <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, marginBottom: 6, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
      <div style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <ViewColumnsIcon style={{ width: 13, height: 13, color: "#818CF8" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: "#F1F5F9", flexShrink: 0, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={deck.title}>{deck.title}</span>
      <span style={{ padding: "1px 7px", borderRadius: 20, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.15)", color: "#818CF8", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{cardCount} cards</span>
      <span style={{ flex: 1, fontSize: 11, color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>
        {deck.description || "Conjunto de tarjetas de estudio para este tópico"}
      </span>
      <button onClick={() => onLearn?.(deck)}
        style={{ padding: "4px 10px", borderRadius: 6, background: "transparent", border: "1px solid rgba(99,102,241,0.25)", color: "#818CF8", fontSize: 11, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(99,102,241,0.1)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
        Learn
      </button>
      <button onClick={() => onStudy?.(deck)}
        style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#818CF8", fontSize: 11, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(99,102,241,0.18)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(99,102,241,0.1)"; }}>
        Study
      </button>
    </div>
  );
}

function ReadOnlyBatteryRow({ battery, onSimulate }) {
  const questionCount = battery.question_count ?? 0;
  const pct = battery.last_attempt?.percent ?? null;
  const hasAttempt = pct !== null;
  const pctRounded = hasAttempt ? Math.round(pct) : 0;
  const pctColor = pctRounded >= 80 ? "#4ade80" : pctRounded >= 50 ? "#f59e0b" : "#818CF8";
  return (
    <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, marginBottom: 6, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
      <div style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(94,106,210,0.12)", border: "1px solid rgba(94,106,210,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <BoltIcon style={{ width: 13, height: 13, color: "#818CF8" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: "#F1F5F9", flexShrink: 0, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={battery.name || battery.title}>{battery.name || battery.title}</span>
      <span style={{ padding: "1px 7px", borderRadius: 20, background: "rgba(94,106,210,0.1)", border: "1px solid rgba(94,106,210,0.15)", color: "#818CF8", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{questionCount} preguntas</span>
      <span style={{ flex: 1, fontSize: 11, color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>
        {battery.description || "Evaluación o práctica relacionada con este tópico"}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
        <div style={{ width: 52, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${hasAttempt ? pctRounded : 0}%`, background: pctColor, borderRadius: 2 }} />
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: hasAttempt ? pctColor : "#334155", minWidth: 28, textAlign: "right" }}>
          {hasAttempt ? `${pctRounded}%` : "—"}
        </span>
      </div>
      <button onClick={() => onSimulate?.(battery)}
        style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(94,106,210,0.1)", border: "1px solid rgba(94,106,210,0.2)", color: "#818CF8", fontSize: 11, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(94,106,210,0.18)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(94,106,210,0.1)"; }}>
        Simular
      </button>
    </div>
  );
}

function ReadOnlyTopicSection({ topic, index, decks, batteries, isLast, onStudy, onLearn, onSimulate }) {
  const [expanded, setExpanded] = useState(true);
  const tagCount = topic.tags?.length || 0;
  const description = topic.tags?.slice(0, 5).join(", ") || "";

  return (
    <div style={{ display: "flex", minWidth: 0 }}>
      <div style={{ width: 22, display: "flex", flexDirection: "column", alignItems: "center", marginRight: 14, flexShrink: 0 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#4ade80", border: "2px solid #0F172A", flexShrink: 0, marginTop: 7 }} />
        {!isLast && <div style={{ width: 2, flex: 1, background: "rgba(255,255,255,0.08)", minHeight: 24, marginTop: 4 }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingBottom: isLast ? 8 : 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: expanded ? 8 : 0 }}>
          <button onClick={() => setExpanded((v) => !v)} style={{ color: "#64748B", cursor: "pointer", padding: 0, background: "none", border: "none", display: "flex", alignItems: "center", flexShrink: 0 }}>
            {expanded ? <ChevronRightIcon style={{ width: 13, height: 13, transform: "rotate(90deg)" }} /> : <ChevronRightIcon style={{ width: 13, height: 13 }} />}
          </button>
          <span style={{ fontWeight: 700, color: "#F1F5F9", fontSize: 13, flexShrink: 0 }}>Tópico {index + 1}</span>
          <span style={{ padding: "1px 7px", borderRadius: 20, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", color: "#64748B", fontSize: 10, fontWeight: 600, flexShrink: 0 }}>{tagCount} temas</span>
          <span style={{ fontSize: 11, color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>{description}</span>
        </div>
        {expanded && (
          <div style={{ marginLeft: 6 }}>
            {decks.map((d) => <ReadOnlyDeckRow key={d.id} deck={d} onLearn={onLearn} onStudy={onStudy} />)}
            {batteries.map((b) => <ReadOnlyBatteryRow key={b.id} battery={b} onSimulate={onSimulate} />)}
            {decks.length === 0 && batteries.length === 0 && (
              <p style={{ fontSize: 11, color: "#475569", padding: "4px 0" }}>Sin contenido generado para este tópico aún.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Process knowledge view (replaces the old empty legacy tabs) ──────────────
// Reads the module's real Knowledge Source structure (topics/decks/batteries),
// same data ProcessDetail.jsx uses, but strictly read-only: no upload, no
// auto-generate, no add/delete — just Learn/Study/Simular + document viewing.

function ProcessKnowledgeView({ ksId, moduleId, assignmentId, alreadyCompleted, onComplete, onProgress }) {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [topics, setTopics] = useState([]);
  const [contentByTopic, setContentByTopic] = useState({});
  const [viewingDoc, setViewingDoc] = useState(null);
  const [studyDeck, setStudyDeck] = useState(null);
  const [learnDeck, setLearnDeck] = useState(null);
  const [simulationBattery, setSimulationBattery] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [doneNow, setDoneNow] = useState(false);

  const loadContent = useCallback(({ silent } = {}) => {
    if (!ksId) { setLoading(false); return; }
    if (!silent) setLoading(true);

    return Promise.all([
      knowledgeApi.getDocumentsWithSections(ksId).catch(() => ({ documents: [] })),
      // NOTE: topics/decks/batteries for a KS process come from /results/, not
      // from collectionApi.getTagGroups — TagGroup.collection_id is always
      // null for KS-generated tag groups, so the tag-groups-by-collection
      // endpoint is always empty here (see project-ks-project-collection-model
      // memory). /results/ returns the real flat topics/decks/batteries,
      // matched via each deck/battery's own tag_group_id.
      knowledgeApi.getResults(ksId).catch(() => ({ topics: [], decks: [], batteries: [] })),
    ]).then(([docsRes, results]) => {
      setDocuments(docsRes.documents || []);
      const topicList = results.topics || [];
      setTopics(topicList);

      const contentMap = {};
      topicList.forEach((topic) => {
        contentMap[topic.id] = {
          decks: (results.decks || []).filter((d) => String(d.tag_group_id) === String(topic.id)),
          batteries: (results.batteries || []).filter((b) => String(b.tag_group_id) === String(topic.id)),
        };
      });
      setContentByTopic(contentMap);
    }).finally(() => setLoading(false));
  }, [ksId]);

  useEffect(() => { loadContent(); }, [loadContent]);

  // Average battery completion for this process — same calculation (and same
  // Number() fix to avoid NaN from the string "percent" the API returns) as
  // "Completitud del proceso" on the admin Knowledge Source page.
  const avgBatteryPercent = useMemo(() => {
    const allBatteries = Object.values(contentByTopic).flatMap((c) => c.batteries || []);
    if (allBatteries.length === 0) return null;
    const withAttempts = allBatteries.filter((b) => b.last_attempt?.percent != null);
    const sum = withAttempts.reduce((s, b) => s + Number(b.last_attempt.percent), 0);
    return Math.round(sum / allBatteries.length);
  }, [contentByTopic]);

  useEffect(() => {
    onProgress?.(moduleId, avgBatteryPercent);
  }, [avgBatteryPercent, moduleId, onProgress]);

  const isDone = alreadyCompleted || doneNow;

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await learningApi.completeModule(assignmentId, { module_id: moduleId });
      setDoneNow(true);
      onComplete?.(moduleId);
    } catch {}
    setCompleting(false);
  };

  if (!ksId) {
    return (
      <div style={{ background: "var(--bg-app)", border: "1px solid var(--border)", borderRadius: 8, padding: "28px 20px", textAlign: "center" }}>
        <BookOpenIcon style={{ width: 18, height: 18, color: "var(--text-tertiary)", margin: "0 auto 8px" }} />
        <p style={{ color: "var(--text-tertiary)", fontSize: 12 }}>Este proceso aún no está vinculado a una fuente de conocimiento.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} className="w-6 h-6 border-2 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg-app)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ padding: "16px 18px" }}>
        <DocumentsMiniPanel documents={documents} onView={setViewingDoc} />

        <p style={{ fontSize: 10, fontWeight: 800, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
          Estructura de conocimiento
        </p>

        {topics.length === 0 ? (
          <p style={{ fontSize: 12, color: "var(--text-tertiary)", padding: "12px 0" }}>Sin tópicos generados para este proceso aún.</p>
        ) : (
          topics.map((topic, i) => (
            <ReadOnlyTopicSection
              key={topic.id}
              topic={topic}
              index={i}
              isLast={i === topics.length - 1}
              decks={contentByTopic[topic.id]?.decks || []}
              batteries={contentByTopic[topic.id]?.batteries || []}
              onLearn={setLearnDeck}
              onStudy={setStudyDeck}
              onSimulate={setSimulationBattery}
            />
          ))
        )}
      </div>

      {!isDone && (
        <div style={{ borderTop: "1px solid var(--border)", padding: "12px 18px", background: "var(--bg-surface)", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={handleComplete} disabled={completing} className="ank-btn-accent text-xs" style={{ opacity: completing ? 0.7 : 1 }}>
            {completing ? <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" /> : <><CheckCircleIcon className="h-3.5 w-3.5" /> Marcar proceso completado</>}
          </button>
        </div>
      )}
      {isDone && (
        <div style={{ borderTop: "1px solid var(--border)", padding: "10px 18px", background: "var(--bg-surface)", display: "flex", alignItems: "center", gap: 6, color: "#4ade80", fontSize: 11, fontWeight: 700 }}>
          <CheckCircleIcon style={{ width: 13, height: 13 }} /> Completado
        </div>
      )}

      <DocumentViewDialog doc={viewingDoc} onClose={() => setViewingDoc(null)} />
      <FlashcardViewDialog open={!!studyDeck} onClose={() => setStudyDeck(null)} deckId={studyDeck?.id} deckTitle={studyDeck?.title} />
      <FlashcardLearnDialog open={!!learnDeck} onClose={() => setLearnDeck(null)} deckId={learnDeck?.id} deckTitle={learnDeck?.title} jobId={learnDeck?.external_job_id} />
      <ExamSimulatorDialog open={!!simulationBattery} handler={() => setSimulationBattery(null)} battery={simulationBattery} onFinish={() => loadContent({ silent: true })} />
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

function ProcessNode({ mod, index, status, isLast, isOpen, onClick, assignmentId, onModuleComplete, onModuleProgress }) {
  const typeColor = { document: "#60a5fa", topic: "#a855f7", deck: "#f59e0b", battery: "#f87171", course: "#4ade80" }[mod.process_type] || "var(--text-tertiary)";
  const locked = status === "locked";
  const borderColor = status === "completed" ? "#4ade80" : status === "in_progress" ? "var(--accent)" : "var(--border)";

  return (
    <div>
      <div className="flex gap-3">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 30, flexShrink: 0 }}>
          <NodeIcon status={status} />
          {!isLast && (
            <div style={{ width: 2, flex: 1, minHeight: 16, background: status === "completed" ? "rgba(74,222,128,0.3)" : "var(--border)", margin: "4px 0", borderRadius: 1 }} />
          )}
        </div>

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

          {isOpen && !locked && (
            <div style={{ marginTop: 10 }}>
              <ProcessKnowledgeView
                ksId={mod.knowledge_source}
                moduleId={mod.id}
                assignmentId={assignmentId}
                alreadyCompleted={status === "completed"}
                onComplete={onModuleComplete}
                onProgress={onModuleProgress}
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
  const [singleModule, setSingleModule] = useState(null);
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

      const pathId = a.learning_path;
      if (pathId) {
        const pd = await learningApi.getLearningPath(pathId);
        setPathData(pd);
        const mods = pd.modules || [];
        const firstOpen = mods.find((m) => !doneIds.has(m.id));
        if (firstOpen) setOpenNodeId(firstOpen.id);
        else if (mods.length > 0) setOpenNodeId(mods[0].id);
      } else if (a.learning_module) {
        const mod = await learningApi.getModule(a.learning_module).catch(() => null);
        setSingleModule(mod);
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

  const handleModuleComplete = useCallback((moduleId) => {
    setCompletedModIds((prev) => new Set([...prev, moduleId]));
    const mods = pathData?.modules || [];
    const idx = mods.findIndex((m) => m.id === moduleId);
    const next = mods[idx + 1];
    if (next) setOpenNodeId(next.id);
  }, [pathData]);

  // Battery-average progress per module, reported up by each ProcessNode's
  // ProcessKnowledgeView as its own topics/batteries load (see avgBatteryPercent
  // there — same Number()-safe average as "Completitud del proceso" on the
  // admin Knowledge Source page). A module only contributes once its node has
  // been opened at least once (its content is fetched lazily on expand).
  const [moduleBatteryProgress, setModuleBatteryProgress] = useState({});
  const handleModuleProgress = useCallback((moduleId, percent) => {
    setModuleBatteryProgress((prev) => (prev[moduleId] === percent ? prev : { ...prev, [moduleId]: percent }));
  }, []);

  const mods = pathData?.modules || [];
  const totalMods = mods.length || 1;
  const completedCount = mods.filter((m) => completedModIds.has(m.id)).length;
  const moduleProgressValues = mods.map((m) => moduleBatteryProgress[m.id]).filter((v) => v != null);
  const overallBatteryPercent = moduleProgressValues.length > 0
    ? Math.round(moduleProgressValues.reduce((s, v) => s + v, 0) / moduleProgressValues.length)
    : 0;
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
                    {overallBatteryPercent}%
                  </span>
                </div>
                <ProgressBar value={overallBatteryPercent} color={isDone ? "#4ade80" : "var(--accent)"} />
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
              onModuleComplete={handleModuleComplete}
              onModuleProgress={handleModuleProgress}
            />
          ))}
        </div>
      ) : (
        /* Single module assignment */
        <div>
          <p style={{ color: "var(--text-tertiary)", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
            Contenido del Proceso
          </p>
          {assignment.learning_module ? (
            <ProcessKnowledgeView
              ksId={singleModule?.knowledge_source}
              moduleId={assignment.learning_module}
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
        <div style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.25)", borderRadius: 8, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div className="flex items-center gap-2.5">
            <CheckCircleIcon style={{ width: 18, height: 18, color: "#4ade80", flexShrink: 0 }} />
            <div>
              <p style={{ color: "#4ade80", fontWeight: 700, fontSize: 13 }}>¡Learning Path completado!</p>
              <p style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 2 }}>Has terminado todos los procesos de esta asignación.</p>
            </div>
          </div>
          {assignment.issued_certification_id && (
            <button onClick={() => navigate(`/enterprise/certifications/${assignment.issued_certification_id}`)}
              className="ank-btn-accent text-xs" style={{ flexShrink: 0 }}>
              Ver mi certificado
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default AssignmentDetail;

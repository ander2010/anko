import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon, PlusIcon, DocumentArrowUpIcon,
  BookOpenIcon, SparklesIcon, ViewColumnsIcon,
  BoltIcon, TrashIcon, ArrowPathIcon, EllipsisHorizontalIcon,
  ClockIcon, AcademicCapIcon, CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { learningApi } from "../../api/enterpriseApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_COLORS = {
  course:         { bg: "rgba(94,106,210,0.15)", text: "#8B9CF4" },
  tutorial:       { bg: "rgba(34,197,94,0.12)",  text: "#4ade80" },
  study_material: { bg: "rgba(245,158,11,0.12)", text: "#f59e0b" },
};
const TYPE_LABELS = { course: "Course", tutorial: "Tutorial", study_material: "Study Material" };

const DIFF_COLORS = {
  easy:   { bg: "rgba(74,222,128,0.12)", text: "#4ade80" },
  medium: { bg: "rgba(245,158,11,0.12)", text: "#f59e0b" },
  hard:   { bg: "rgba(239,68,68,0.12)",  text: "#f87171" },
};

// ─── Small Components ─────────────────────────────────────────────────────────

function Pill({ label, style }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, ...style }}>
      {label}
    </span>
  );
}

function TabButton({ label, icon: Icon, count, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "8px 14px", borderBottom: `2px solid ${active ? "var(--accent)" : "transparent"}`,
      color: active ? "var(--text-primary)" : "var(--text-tertiary)",
      fontWeight: active ? 600 : 500, fontSize: 12.5, cursor: "pointer",
      background: "transparent", transition: "color 150ms, border-color 150ms",
      whiteSpace: "nowrap",
    }}>
      <Icon style={{ width: 14, height: 14 }} />
      {label}
      {count != null && (
        <span style={{
          background: active ? "var(--accent-muted)" : "var(--bg-elevated)",
          color: active ? "var(--accent)" : "var(--text-tertiary)",
          fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10,
        }}>
          {count}
        </span>
      )}
    </button>
  );
}

function EmptyTab({ icon: Icon, title, message, cta, onCta }) {
  return (
    <div className="flex flex-col items-center py-14 text-center">
      <div style={{ background: "var(--bg-elevated)", borderRadius: 10, padding: 14, marginBottom: 12 }}>
        <Icon style={{ width: 26, height: 26, color: "var(--text-tertiary)" }} />
      </div>
      <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 13 }}>{title}</p>
      <p style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 3, maxWidth: 280, lineHeight: 1.6 }}>{message}</p>
      {cta && (
        <button onClick={onCta} className="ank-btn-accent text-xs mt-4">
          <PlusIcon className="h-3.5 w-3.5" /> {cta}
        </button>
      )}
    </div>
  );
}

// ─── Documents Tab ────────────────────────────────────────────────────────────

function DocumentsTab({ items, onAdd }) {
  const docItems = items.filter((i) => i.item_type === "document" || i.content_type === "document");

  if (docItems.length === 0) {
    return (
      <EmptyTab
        icon={DocumentArrowUpIcon}
        title="No hay documentos asociados"
        message="Adjunta documentos de referencia a este Proceso. Se usarán para generar tópicos y baterías automáticamente."
        cta="Adjuntar documento"
        onCta={onAdd}
      />
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-end mb-2">
        <button onClick={onAdd} className="ank-btn-ghost text-xs">
          <PlusIcon className="h-3.5 w-3.5" /> Adjuntar
        </button>
      </div>
      {docItems.map((d) => (
        <div key={d.id}
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 6, padding: "10px 14px" }}
          className="flex items-center gap-3">
          <DocumentArrowUpIcon style={{ width: 15, height: 15, color: "var(--text-secondary)", flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }} className="truncate">
              {d.title || d.name || `Documento #${d.id}`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Topics Tab ───────────────────────────────────────────────────────────────

function TopicsTab({ items }) {
  const topicItems = items.filter((i) => i.item_type === "topic" || i.content_type === "topic");

  if (topicItems.length === 0) {
    return (
      <EmptyTab
        icon={SparklesIcon}
        title="Sin tópicos generados"
        message="Los tópicos se extraen automáticamente cuando procesas un documento con IA. También puedes crearlos manualmente."
        cta="Crear tópico"
        onCta={() => {}}
      />
    );
  }

  return (
    <div className="space-y-2">
      {topicItems.map((t) => (
        <div key={t.id}
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 6, padding: "12px 14px" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
            {t.title || t.name || `Tópico #${t.id}`}
          </p>
          {t.description && (
            <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 3 }}>{t.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Decks Tab ────────────────────────────────────────────────────────────────

function DecksTab({ items }) {
  const deckItems = items.filter((i) => i.item_type === "deck" || i.content_type === "deck");

  if (deckItems.length === 0) {
    return (
      <EmptyTab
        icon={ViewColumnsIcon}
        title="Sin decks"
        message="Los decks de flashcards se generan automáticamente a partir de los tópicos procesados."
        cta="Crear deck"
        onCta={() => {}}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {deckItems.map((d) => (
        <div key={d.id}
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 6, padding: "12px 14px" }}>
          <div className="flex items-center gap-2 mb-1">
            <ViewColumnsIcon style={{ width: 13, height: 13, color: "var(--accent)" }} />
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
              {d.title || d.name || `Deck #${d.id}`}
            </p>
          </div>
          {d.card_count != null && (
            <p style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{d.card_count} tarjetas</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Batteries Tab ────────────────────────────────────────────────────────────

function BatteriesTab({ items }) {
  const battItems = items.filter((i) => i.item_type === "battery" || i.content_type === "battery");

  if (battItems.length === 0) {
    return (
      <EmptyTab
        icon={BoltIcon}
        title="Sin baterías"
        message="Las baterías de preguntas se generan automáticamente al procesar los documentos con IA."
        cta="Generar batería"
        onCta={() => {}}
      />
    );
  }

  return (
    <div className="space-y-2">
      {battItems.map((b) => (
        <div key={b.id}
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 6, padding: "12px 14px" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
            {b.title || b.name || `Batería #${b.id}`}
          </p>
          {b.question_count != null && (
            <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 3 }}>{b.question_count} preguntas</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Items Tab (module items) ─────────────────────────────────────────────────

function ItemsTab({ moduleId, items, onRefresh }) {
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", item_type: "lesson", order: items.length + 1 });
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await learningApi.createModuleItem({ ...form, module: moduleId });
      setForm({ title: "", item_type: "lesson", order: items.length + 2 });
      setCreating(false);
      onRefresh();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este item?")) return;
    await learningApi.deleteModuleItem(id);
    onRefresh();
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button onClick={() => setCreating((v) => !v)} className="ank-btn-ghost text-xs">
          <PlusIcon className="h-3.5 w-3.5" /> Agregar item
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--accent)", borderRadius: 6, padding: "12px 14px" }}
          className="space-y-3">
          <input
            autoFocus
            placeholder="Título del item…"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            style={{ width: "100%", background: "var(--bg-app)", border: "1px solid var(--border)", borderRadius: 5, padding: "7px 10px", color: "var(--text-primary)", fontSize: 12, outline: "none" }}
            onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setCreating(false); }}
          />
          <div className="flex gap-2 items-center">
            <select value={form.item_type} onChange={(e) => setForm((f) => ({ ...f, item_type: e.target.value }))}
              style={{ background: "var(--bg-app)", border: "1px solid var(--border)", borderRadius: 5, padding: "6px 10px", color: "var(--text-primary)", fontSize: 12, outline: "none" }}>
              <option value="lesson">Lección</option>
              <option value="quiz">Quiz</option>
              <option value="video">Video</option>
              <option value="document">Documento</option>
              <option value="flashcard">Flashcard</option>
            </select>
            <div className="flex gap-2 ml-auto">
              <button onClick={() => setCreating(false)} className="ank-btn-ghost text-xs">Cancelar</button>
              <button onClick={handleCreate} disabled={saving} className="ank-btn-accent text-xs">
                {saving ? <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" /> : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items list */}
      {items.length === 0 && !creating ? (
        <EmptyTab
          icon={AcademicCapIcon}
          title="Sin items"
          message="Los items son las unidades de contenido dentro del proceso. Agrégalos manualmente o genéralos desde documentos."
          cta="Agregar primer item"
          onCta={() => setCreating(true)}
        />
      ) : (
        <div className="space-y-1.5">
          {items.map((item, idx) => (
            <div key={item.id}
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 6, padding: "10px 14px" }}
              className="flex items-center gap-3 group">
              <span style={{ color: "var(--text-tertiary)", fontSize: 11, width: 20, textAlign: "right", flexShrink: 0 }}>
                {item.order ?? idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text-primary)" }}>{item.title}</p>
                {item.item_type && (
                  <span style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "capitalize" }}>{item.item_type}</span>
                )}
              </div>
              <button onClick={() => handleDelete(item.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: "var(--text-tertiary)", padding: 4, borderRadius: 4 }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; e.currentTarget.style.background = "transparent"; }}>
                <TrashIcon style={{ width: 13, height: 13 }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const TABS = [
  { key: "documents",  label: "Documentos", Icon: DocumentArrowUpIcon   },
  { key: "topics",     label: "Tópicos",    Icon: SparklesIcon           },
  { key: "decks",      label: "Decks",      Icon: ViewColumnsIcon        },
  { key: "batteries",  label: "Baterías",   Icon: BoltIcon               },
];

export function ProcessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [module, setModule] = useState(null);
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("documents");

  const loadModule = useCallback(async () => {
    try {
      const [mod, its] = await Promise.all([
        learningApi.getModule(id),
        learningApi.getModuleItems({ module: id }).then((d) => d.results || d || []),
      ]);
      setModule(mod);
      setItems(its);
    } catch (e) {
      // module not found
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadModule(); }, [loadModule]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
          className="w-7 h-7 border-2 rounded-full animate-spin" />
      </div>
    );
  }

  if (!module) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <p style={{ color: "var(--text-primary)", fontWeight: 600 }}>Proceso no encontrado</p>
        <button onClick={() => navigate("/enterprise/knowledge")} className="ank-btn-ghost text-xs mt-4">
          <ArrowLeftIcon className="h-3.5 w-3.5" /> Volver a Procesos
        </button>
      </div>
    );
  }

  const typeColor = TYPE_COLORS[module.process_type] || { bg: "var(--bg-elevated)", text: "var(--text-secondary)" };
  const diffColor = DIFF_COLORS[module.difficulty] || { bg: "var(--bg-elevated)", text: "var(--text-secondary)" };
  const initial = (module.name || "P").charAt(0).toUpperCase();

  return (
    <div className="space-y-0 w-full">
      {/* Back */}
      <button onClick={() => navigate("/enterprise/knowledge")}
        style={{ color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: 5, fontSize: 12, marginBottom: 20, cursor: "pointer" }}
        className="hover:opacity-70 transition-opacity">
        <ArrowLeftIcon style={{ width: 13, height: 13 }} /> Volver a Procesos
      </button>

      {/* Header card */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "20px 24px" }}>
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div style={{ width: 44, height: 44, borderRadius: 8, background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20, flexShrink: 0 }}>
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 18 }}>{module.name}</h1>
              <Pill label={TYPE_LABELS[module.process_type] || module.process_type} style={{ background: typeColor.bg, color: typeColor.text }} />
              <Pill label={module.difficulty} style={{ background: diffColor.bg, color: diffColor.text, textTransform: "capitalize" }} />
              {module.is_required && (
                <Pill label="Required" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }} />
              )}
            </div>
            {module.description && (
              <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 5, lineHeight: 1.6 }}>
                {module.description}
              </p>
            )}
            {/* Meta */}
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              {module.item_count != null && (
                <span style={{ color: "var(--text-tertiary)", fontSize: 11 }} className="flex items-center gap-1.5">
                  <AcademicCapIcon style={{ width: 12, height: 12 }} />
                  {module.item_count} items
                </span>
              )}
              {module.estimated_duration_minutes && (
                <span style={{ color: "var(--text-tertiary)", fontSize: 11 }} className="flex items-center gap-1.5">
                  <ClockIcon style={{ width: 12, height: 12 }} />
                  {module.estimated_duration_minutes} min
                </span>
              )}
              {module.minimum_passing_score != null && (
                <span style={{ color: "var(--text-tertiary)", fontSize: 11 }} className="flex items-center gap-1.5">
                  <CheckCircleIcon style={{ width: 12, height: 12 }} />
                  Aprobación: {module.minimum_passing_score}%
                </span>
              )}
              {module.order != null && (
                <span style={{ color: "var(--text-tertiary)", fontSize: 11 }}>
                  Orden: #{module.order}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs header */}
      <div style={{ borderBottom: "1px solid var(--border)", display: "flex", gap: 0, marginTop: 0 }}>
        {TABS.map(({ key, label, Icon }) => (
          <TabButton
            key={key} label={label} icon={Icon}
            count={key === "items" ? items.length : undefined}
            active={activeTab === key}
            onClick={() => setActiveTab(key)}
          />
        ))}
      </div>

      {/* Tab content */}
      <div style={{ paddingTop: 20 }}>
        {activeTab === "documents" && <DocumentsTab items={items} onAdd={() => {}} />}
        {activeTab === "topics"    && <TopicsTab items={items} />}
        {activeTab === "decks"     && <DecksTab items={items} />}
        {activeTab === "batteries" && <BatteriesTab items={items} />}
      </div>
    </div>
  );
}

export default ProcessDetail;

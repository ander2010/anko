import React, { useEffect, useState } from "react";
import { PlusIcon, RectangleStackIcon, XMarkIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { learningApi } from "../../api/enterpriseApi";
import { useEnterprise } from "../../context/enterprise-context";
import { EmptyState } from "../../components/EmptyState";
import { TableSkeleton } from "../../components/LoadingSkeleton";

const STATUS_TONE = {
  draft:     { bg: "rgba(255,255,255,0.06)", text: "#8B8B9C" },
  published: { bg: "rgba(74,222,128,0.12)",  text: "#4ade80" },
  archived:  { bg: "rgba(245,158,11,0.12)",  text: "#f59e0b" },
};

const INPUT = {
  width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "#F1F5F9", outline: "none", boxSizing: "border-box",
};

function NewProgramForm({ onCreated, onCancel }) {
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required."); return; }
    setSaving(true);
    setError("");
    try {
      const created = await learningApi.createProgram({ name: form.name.trim(), description: form.description.trim() });
      onCreated(created);
    } catch (err) {
      setError(err?.detail || err?.name?.[0] || "Could not create program.");
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: 20 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <p style={{ fontWeight: 700, color: "#C7D2FE", fontSize: 14 }}>New Training Program</p>
        <button type="button" onClick={onCancel} style={{ color: "#818CF8", background: "none", border: "none", cursor: "pointer" }}>
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", display: "block", marginBottom: 5 }}>Name *</label>
        <input style={INPUT} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", display: "block", marginBottom: 5 }}>Description (optional)</label>
        <textarea rows={2} style={{ ...INPUT, resize: "vertical" }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      {error && <p style={{ fontSize: 12, color: "#f87171" }}>{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="ank-btn-ghost text-xs">Cancel</button>
        <button type="submit" disabled={saving} className="ank-btn-accent text-xs" style={{ opacity: saving ? 0.7 : 1 }}>
          {saving ? "Creating…" : "Create Program"}
        </button>
      </div>
    </form>
  );
}

function PublishVersionModal({ program, onClose, onPublished }) {
  const [paths, setPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    learningApi.getPaths({ status: "published" })
      .then((d) => setPaths(d.results || d || []))
      .catch(() => {});
  }, []);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!selectedPath) { setError("Select a learning path."); return; }
    setSaving(true);
    setError("");
    try {
      await learningApi.publishProgram(program.id, { learning_path: parseInt(selectedPath), notes });
      onPublished();
      onClose();
    } catch (err) {
      setError(err?.detail || "Failed to publish version.");
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, width: "100%", maxWidth: 440, padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }} className="space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 14 }}>Publish New Version</p>
          <button onClick={onClose} style={{ color: "var(--text-tertiary)", background: "none", border: "none", cursor: "pointer" }}><XMarkIcon className="h-5 w-5" /></button>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
          Select the learning path for this program version. A new version will be created and marked as current.
        </p>
        <form onSubmit={handlePublish} className="space-y-4">
          <select style={{ ...INPUT, cursor: "pointer" }} value={selectedPath} onChange={(e) => setSelectedPath(e.target.value)} required>
            <option value="">Select a published learning path...</option>
            {paths.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <textarea rows={2} placeholder="Release notes (optional)" style={{ ...INPUT, resize: "vertical" }} value={notes} onChange={(e) => setNotes(e.target.value)} />
          {error && <p style={{ fontSize: 12, color: "#f87171" }}>{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="ank-btn-ghost text-xs">Cancel</button>
            <button type="submit" disabled={saving} className="ank-btn-accent text-xs" style={{ background: "linear-gradient(135deg, #22C55E, #4ade80)", opacity: saving ? 0.7 : 1 }}>
              <CheckBadgeIcon className="h-3.5 w-3.5" /> {saving ? "Publishing…" : "Publish Version"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProgramCard({ program, onPublishVersion }) {
  const hasAI = program.metadata?.knowledge_source_id;
  const currentVersion = program.versions?.find((v) => v.is_current);
  const [expanded, setExpanded] = useState(false);
  const tone = STATUS_TONE[program.status] || STATUS_TONE.draft;

  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: 18 }}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3 min-w-0">
            <div style={{ padding: 8, background: "rgba(192,132,252,0.12)", borderRadius: 8, marginTop: 2, flexShrink: 0 }}>
              <RectangleStackIcon style={{ width: 18, height: 18, color: "#C084FC" }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 14 }}>{program.name}</p>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: tone.bg, color: tone.text }}>
                  {program.status}
                </span>
                {hasAI && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: "rgba(192,132,252,0.12)", color: "#C084FC" }}>
                    <SparklesIcon style={{ width: 10, height: 10 }} /> AI
                  </span>
                )}
              </div>
              {program.description && (
                <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 3 }}>{program.description}</p>
              )}
              <div className="flex gap-3 mt-1.5">
                <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{program.version_count ?? program.versions?.length ?? 0} version(s)</span>
                {currentVersion && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#4ade80" }}>Current: v{currentVersion.version_number}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => onPublishVersion(program)}
              style={{ fontSize: 11, fontWeight: 700, color: "#4ade80", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)", borderRadius: 6, padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              <CheckBadgeIcon style={{ width: 13, height: 13 }} /> New Version
            </button>
            {program.versions?.length > 0 && (
              <button onClick={() => setExpanded((v) => !v)}
                style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 10px", cursor: "pointer" }}>
                History
              </button>
            )}
          </div>
        </div>
      </div>

      {expanded && program.versions?.length > 0 && (
        <div style={{ borderTop: "1px solid var(--border)", background: "var(--bg-app)", padding: "12px 18px" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Version History</p>
          <div className="space-y-2">
            {program.versions.map((v) => (
              <div key={v.id} className="flex items-center gap-3" style={{ fontSize: 12 }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, background: v.is_current ? "#22C55E" : "var(--bg-elevated)", color: v.is_current ? "#fff" : "var(--text-tertiary)" }}>
                  {v.version_number}
                </span>
                <span style={{ color: "var(--text-secondary)" }}>{v.learning_path_name || "—"}</span>
                {v.is_current && <span style={{ fontSize: 10, fontWeight: 700, color: "#4ade80" }}>Current</span>}
                <span style={{ color: "var(--text-tertiary)", fontSize: 11, marginLeft: "auto" }}>{v.created_at ? new Date(v.created_at).toLocaleDateString() : "—"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function TrainingPrograms() {
  const { activeCompanyId } = useEnterprise();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [publishTarget, setPublishTarget] = useState(null);

  const load = () => {
    setLoading(true);
    learningApi.getPrograms()
      .then((d) => setPrograms(d.results || d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [activeCompanyId]);

  const handleCreated = (created) => {
    setShowForm(false);
    setPrograms((prev) => [created, ...prev]);
  };

  return (
    <div className="space-y-5">
      {publishTarget && (
        <PublishVersionModal
          program={publishTarget}
          onClose={() => setPublishTarget(null)}
          onPublished={() => { load(); setPublishTarget(null); }}
        />
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 800 }}>Training Programs</h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: 12, marginTop: 2 }}>Programs group learning paths into versioned training packages</p>
        </div>
        <button onClick={() => setShowForm(true)} className="ank-btn-accent text-xs">
          <PlusIcon className="h-3.5 w-3.5" /> New Program
        </button>
      </div>

      {showForm && <NewProgramForm onCreated={handleCreated} onCancel={() => setShowForm(false)} />}

      {loading ? (
        <div className="space-y-3"><TableSkeleton rows={3} cols={1} /></div>
      ) : programs.length === 0 && !showForm ? (
        <EmptyState icon={RectangleStackIcon} title="No training programs"
          message="Create a training program to bundle learning paths into versioned packages." />
      ) : (
        <div className="space-y-3">
          {programs.map((prog) => (
            <ProgramCard key={prog.id} program={prog} onPublishVersion={setPublishTarget} />
          ))}
        </div>
      )}
    </div>
  );
}

export default TrainingPrograms;

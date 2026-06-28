import React, { useEffect, useState } from "react";
import { Typography, Button, Input, Textarea, Select, Option } from "@material-tailwind/react";
import { PlusIcon, RectangleStackIcon, XMarkIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { learningApi } from "../../api/enterpriseApi";
import { useEnterprise } from "../../context/enterprise-context";
import { EmptyState } from "../../components/EmptyState";
import { TableSkeleton } from "../../components/LoadingSkeleton";

const STATUS_COLORS = {
  draft:     "bg-zinc-100 text-zinc-500",
  published: "bg-green-100 text-green-700",
  archived:  "bg-amber-100 text-amber-700",
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
    <form onSubmit={handleSubmit} className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Typography className="font-bold text-indigo-900">New Training Program</Typography>
        <button type="button" onClick={onCancel} className="text-indigo-400 hover:text-indigo-600">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      <Textarea label="Description (optional)" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      {error && <Typography variant="small" className="text-red-500">{error}</Typography>}
      <div className="flex justify-end gap-3">
        <Button variant="text" color="blue-gray" className="normal-case" onClick={onCancel} type="button">Cancel</Button>
        <Button type="submit" color="indigo" className="normal-case" loading={saving}>Create Program</Button>
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
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <Typography className="font-bold text-zinc-900">Publish New Version</Typography>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600"><XMarkIcon className="h-5 w-5" /></button>
        </div>
        <Typography variant="small" className="text-zinc-400">
          Select the learning path for this program version. A new version will be created and marked as current.
        </Typography>
        <form onSubmit={handlePublish} className="space-y-4">
          <select
            className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-700"
            value={selectedPath} onChange={(e) => setSelectedPath(e.target.value)} required>
            <option value="">Select a published learning path...</option>
            {paths.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <Textarea label="Release notes (optional)" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          {error && <Typography variant="small" className="text-red-500">{error}</Typography>}
          <div className="flex justify-end gap-3">
            <Button variant="text" color="blue-gray" className="normal-case" onClick={onClose} type="button">Cancel</Button>
            <Button type="submit" color="green" className="normal-case flex items-center gap-2" loading={saving}>
              <CheckBadgeIcon className="h-4 w-4" /> Publish Version
            </Button>
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

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2 bg-purple-50 rounded-xl mt-0.5 flex-shrink-0">
              <RectangleStackIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Typography className="font-bold text-zinc-900">{program.name}</Typography>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[program.status] || "bg-zinc-100 text-zinc-500"}`}>
                  {program.status}
                </span>
                {hasAI && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">
                    <SparklesIcon className="h-3 w-3" /> AI
                  </span>
                )}
              </div>
              {program.description && (
                <Typography variant="small" className="text-zinc-400 mt-0.5">{program.description}</Typography>
              )}
              <div className="flex gap-3 mt-1">
                <span className="text-xs text-zinc-400">{program.version_count ?? program.versions?.length ?? 0} version(s)</span>
                {currentVersion && (
                  <span className="text-xs text-green-600 font-semibold">Current: v{currentVersion.version_number}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button size="sm" color="green" variant="outlined" className="normal-case text-xs flex items-center gap-1"
              onClick={() => onPublishVersion(program)}>
              <CheckBadgeIcon className="h-3.5 w-3.5" /> New Version
            </Button>
            {program.versions?.length > 0 && (
              <Button size="sm" variant="text" color="blue-gray" className="normal-case text-xs"
                onClick={() => setExpanded((v) => !v)}>
                History
              </Button>
            )}
          </div>
        </div>
      </div>

      {expanded && program.versions?.length > 0 && (
        <div className="border-t border-zinc-100 bg-zinc-50 px-5 py-3">
          <Typography variant="small" className="font-bold text-zinc-500 uppercase tracking-wide mb-2">Version History</Typography>
          <div className="space-y-2">
            {program.versions.map((v) => (
              <div key={v.id} className="flex items-center gap-3 text-sm">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${v.is_current ? "bg-green-500 text-white" : "bg-zinc-200 text-zinc-500"}`}>
                  {v.version_number}
                </span>
                <span className="text-zinc-600">{v.learning_path_name || "—"}</span>
                {v.is_current && <span className="text-xs text-green-600 font-semibold">Current</span>}
                <span className="text-zinc-400 text-xs ml-auto">{v.created_at ? new Date(v.created_at).toLocaleDateString() : "—"}</span>
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
    <div className="space-y-6">
      {publishTarget && (
        <PublishVersionModal
          program={publishTarget}
          onClose={() => setPublishTarget(null)}
          onPublished={() => { load(); setPublishTarget(null); }}
        />
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Typography variant="h5" className="font-extrabold text-zinc-900">Training Programs</Typography>
          <Typography variant="small" className="text-zinc-400">Programs group learning paths into versioned training packages</Typography>
        </div>
        <Button color="indigo" className="normal-case flex items-center gap-2" onClick={() => setShowForm(true)}>
          <PlusIcon className="h-4 w-4" /> New Program
        </Button>
      </div>

      {showForm && <NewProgramForm onCreated={handleCreated} onCancel={() => setShowForm(false)} />}

      {loading ? (
        <div className="space-y-3"><TableSkeleton rows={3} cols={1} /></div>
      ) : programs.length === 0 && !showForm ? (
        <EmptyState icon={RectangleStackIcon} title="No training programs"
          message="Create a training program to bundle learning paths into versioned packages." />
      ) : (
        <div className="space-y-4">
          {programs.map((prog) => (
            <ProgramCard key={prog.id} program={prog} onPublishVersion={setPublishTarget} />
          ))}
        </div>
      )}
    </div>
  );
}

export default TrainingPrograms;

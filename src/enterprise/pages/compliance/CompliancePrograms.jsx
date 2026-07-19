import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusIcon, ShieldCheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { complianceApi } from "../../api/enterpriseApi";
import { useEnterprise } from "../../context/enterprise-context";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";
import { TableSkeleton } from "../../components/LoadingSkeleton";
import { useCompanyRole } from "../../hooks/useCompanyRole";

const INPUT = {
  width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "#F1F5F9", outline: "none", boxSizing: "border-box",
};
const LABEL = { fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", display: "block", marginBottom: 5 };

const COMPLIANCE_TYPES = [
  { value: "regulatory", label: "Regulatory" },
  { value: "internal", label: "Internal Policy" },
  { value: "certification", label: "Certification" },
  { value: "safety", label: "Safety" },
  { value: "other", label: "Other" },
];
const FREQUENCIES = [
  { value: "one_time", label: "One Time" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "biannual", label: "Bi-Annual" },
  { value: "annual", label: "Annual" },
  { value: "custom", label: "Custom" },
];

// ─── Shared program form fields (used by create modal here, and by the edit
// form on ComplianceProgramDetail) ──────────────────────────────────────────
export function ProgramFormFields({ form, onChange }) {
  const set = (field, value) => onChange({ ...form, [field]: value });
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label style={LABEL} htmlFor="cp-name">Name *</label>
          <input id="cp-name" style={INPUT} value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </div>
        <div>
          <label style={LABEL} htmlFor="cp-code">Code *</label>
          <input id="cp-code" style={{ ...INPUT, fontFamily: "monospace" }} placeholder="e.g. FAA-SAFETY-01" value={form.code} onChange={(e) => set("code", e.target.value)} required />
        </div>
      </div>

      <div>
        <label style={LABEL} htmlFor="cp-description">Description (optional)</label>
        <textarea id="cp-description" rows={2} style={{ ...INPUT, resize: "vertical" }} value={form.description} onChange={(e) => set("description", e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label style={LABEL} htmlFor="cp-type">Compliance Type</label>
          <select id="cp-type" style={{ ...INPUT, cursor: "pointer" }} value={form.compliance_type} onChange={(e) => set("compliance_type", e.target.value)}>
            {COMPLIANCE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label style={LABEL} htmlFor="cp-frequency">Frequency</label>
          <select id="cp-frequency" style={{ ...INPUT, cursor: "pointer" }} value={form.frequency} onChange={(e) => set("frequency", e.target.value)}>
            {FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label style={LABEL} htmlFor="cp-effective">Effective Date (optional)</label>
          <input id="cp-effective" type="date" style={{ ...INPUT, colorScheme: "dark" }} value={form.effective_date} onChange={(e) => set("effective_date", e.target.value)} />
        </div>
        <div>
          <label style={LABEL} htmlFor="cp-expiry">Expiry Date (optional)</label>
          <input id="cp-expiry" type="date" style={{ ...INPUT, colorScheme: "dark" }} value={form.expiry_date} onChange={(e) => set("expiry_date", e.target.value)} />
        </div>
      </div>

      <div>
        <label style={LABEL} htmlFor="cp-validity">Validity (days after completion)</label>
        <input id="cp-validity" type="number" min="1" style={INPUT} value={form.validity_days} onChange={(e) => set("validity_days", e.target.value)} />
        <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>How many days a completed assignment stays valid before it must be renewed.</p>
      </div>

      <div className="flex items-center gap-2">
        <input id="cp-mandatory" type="checkbox" checked={form.is_mandatory} onChange={(e) => set("is_mandatory", e.target.checked)} style={{ width: 15, height: 15, cursor: "pointer" }} />
        <label htmlFor="cp-mandatory" style={{ fontSize: 12.5, color: "var(--text-primary)", cursor: "pointer" }}>Mandatory for assigned users/teams</label>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input id="cp-requires-score" type="checkbox" checked={form.requires_score} onChange={(e) => set("requires_score", e.target.checked)} style={{ width: 15, height: 15, cursor: "pointer" }} />
          <label htmlFor="cp-requires-score" style={{ fontSize: 12.5, color: "var(--text-primary)", cursor: "pointer" }}>Requires a minimum passing score</label>
        </div>
        {form.requires_score && (
          <div>
            <label style={LABEL} htmlFor="cp-passing-score">Passing Score (0–100)</label>
            <input id="cp-passing-score" type="number" min="0" max="100" style={INPUT} value={form.passing_score} onChange={(e) => set("passing_score", e.target.value)} />
          </div>
        )}
      </div>
    </>
  );
}

export const emptyProgramForm = () => ({
  name: "", code: "", description: "",
  compliance_type: "regulatory", frequency: "annual",
  validity_days: "365", is_mandatory: true,
  requires_score: false, passing_score: "",
  effective_date: "", expiry_date: "",
});

export function programToForm(p) {
  return {
    name: p.name || "",
    code: p.code || "",
    description: p.description || "",
    compliance_type: p.compliance_type || "regulatory",
    frequency: p.frequency || "annual",
    validity_days: p.validity_days != null ? String(p.validity_days) : "365",
    is_mandatory: !!p.is_mandatory,
    requires_score: !!p.requires_score,
    passing_score: p.passing_score != null ? String(p.passing_score) : "",
    effective_date: p.effective_date || "",
    expiry_date: p.expiry_date || "",
  };
}

export function programFormToPayload(form) {
  const payload = {
    name: form.name.trim(),
    code: form.code.trim(),
    compliance_type: form.compliance_type,
    frequency: form.frequency,
    is_mandatory: form.is_mandatory,
    requires_score: form.requires_score,
  };
  if (form.description.trim()) payload.description = form.description.trim();
  if (form.validity_days) payload.validity_days = parseInt(form.validity_days, 10);
  if (form.requires_score && form.passing_score !== "") payload.passing_score = parseFloat(form.passing_score);
  if (form.effective_date) payload.effective_date = form.effective_date;
  if (form.expiry_date) payload.expiry_date = form.expiry_date;
  return payload;
}

// ─── Create Program Modal ───────────────────────────────────────────────────

function CreateProgramModal({ onClose, onCreated }) {
  const [form, setForm] = useState(emptyProgramForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) { setError("Name and code are required."); return; }
    setSaving(true);
    setError("");
    try {
      const created = await complianceApi.createProgram(programFormToPayload(form));
      onCreated(created);
    } catch (err) {
      setError(err?.detail || err?.code?.[0] || err?.name?.[0] || err?.non_field_errors?.[0] || "Could not create program.");
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "88vh", overflowY: "auto", padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }} className="space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 15 }}>New Compliance Program</p>
          <button type="button" onClick={onClose} style={{ color: "var(--text-tertiary)", background: "none", border: "none", cursor: "pointer" }} aria-label="Close">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ProgramFormFields form={form} onChange={setForm} />
          {error && <p style={{ fontSize: 12, color: "#f87171" }}>{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="ank-btn-ghost text-xs">Cancel</button>
            <button type="submit" disabled={saving} className="ank-btn-accent text-xs" style={{ opacity: saving ? 0.7 : 1 }}>
              {saving ? "Creating…" : "Create Program"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export function CompliancePrograms() {
  const navigate = useNavigate();
  const { activeCompanyId } = useEnterprise();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const { hasMinRole } = useCompanyRole();
  const canEdit = hasMinRole("manager");

  const load = () => {
    setLoading(true);
    const params = statusFilter ? { status: statusFilter } : {};
    complianceApi.getPrograms(params).then((d) => setPrograms(d.results || d || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [activeCompanyId, statusFilter]);

  const handleCreated = (created) => {
    setShowCreate(false);
    setPrograms((prev) => [created, ...prev]);
    navigate(`/enterprise/compliance/programs/${created.id}`);
  };

  const activate = async (e, id) => { e.stopPropagation(); await complianceApi.activateProgram(id); load(); };
  const archive = async (e, id) => { e.stopPropagation(); await complianceApi.archiveProgram(id); load(); };

  const btn = { fontSize: 11, fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: "4px 8px" };

  return (
    <div className="space-y-5">
      {showCreate && <CreateProgramModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 800 }}>Compliance Programs</h1>
        <div className="flex gap-2 items-center flex-wrap">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            style={{ fontSize: 12, background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, padding: "7px 10px", color: "var(--text-secondary)", outline: "none", cursor: "pointer" }}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          {canEdit && (
            <button onClick={() => setShowCreate(true)} className="ank-btn-accent text-xs">
              <PlusIcon className="h-3.5 w-3.5" /> New Program
            </button>
          )}
        </div>
      </div>

      {loading ? <TableSkeleton rows={5} cols={6} /> : programs.length === 0 ? (
        <EmptyState icon={ShieldCheckIcon} title="No compliance programs" message={canEdit ? "Create your first compliance program." : "No programs available."}
          action={canEdit ? "New Program" : undefined} onAction={canEdit ? () => setShowCreate(true) : undefined} />
      ) : (
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="w-full" style={{ fontSize: 13, borderCollapse: "collapse" }}>
              <thead style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                <tr>
                  {["Code", "Name", "Type", "Frequency", "Status", "Mandatory", "Requirements", ...(canEdit ? ["Actions"] : [])].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {programs.map((p) => (
                  <tr key={p.id} onClick={() => navigate(`/enterprise/compliance/programs/${p.id}`)}
                    style={{ borderBottom: "1px solid var(--border)", cursor: "pointer", transition: "background 150ms" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                    <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 11, color: "var(--text-tertiary)" }}>{p.code}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-primary)" }}>{p.name}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text-secondary)", textTransform: "capitalize" }}>{p.compliance_type}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text-secondary)", textTransform: "capitalize" }}>{p.frequency}</td>
                    <td style={{ padding: "12px 16px" }}><StatusBadge status={p.status} /></td>
                    <td style={{ padding: "12px 16px" }}>
                      {p.is_mandatory ? (
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#f87171", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", padding: "1px 8px", borderRadius: 20 }}>Required</span>
                      ) : (
                        <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Optional</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-tertiary)", fontSize: 12 }}>{p.requirement_count ?? 0}</td>
                    {canEdit && (
                      <td style={{ padding: "12px 16px" }}>
                        <div className="flex gap-1 flex-wrap">
                          {p.status === "draft" && <button style={{ ...btn, color: "#4ade80" }} onClick={(e) => activate(e, p.id)}>Activate</button>}
                          {p.status === "active" && <button style={{ ...btn, color: "var(--text-tertiary)" }} onClick={(e) => archive(e, p.id)}>Archive</button>}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompliancePrograms;

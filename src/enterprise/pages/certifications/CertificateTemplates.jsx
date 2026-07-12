import React, { useEffect, useState } from "react";
import { PlusIcon, AcademicCapIcon, XMarkIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { certApi, companyApi } from "../../api/enterpriseApi";
import { useEnterprise } from "../../context/enterprise-context";
import { EmptyState } from "../../components/EmptyState";
import { TableSkeleton } from "../../components/LoadingSkeleton";

const INPUT = {
  width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "#F1F5F9", outline: "none", boxSizing: "border-box",
};

function IssueCertModal({ template, onClose, onIssued }) {
  const { activeCompanyId } = useEnterprise();
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [score, setScore] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    companyApi.getMembers(activeCompanyId, { status: "active" })
      .then((d) => setMembers(d.results || d || []))
      .catch(() => setMembers([]))
      .finally(() => setLoadingMembers(false));
  }, [activeCompanyId]);

  const handleIssue = async () => {
    if (!selectedUserId) { setError("Selecciona un usuario."); return; }
    setSaving(true);
    setError("");
    try {
      const payload = { user_id: selectedUserId };
      if (template.requires_score && score !== "") payload.score = score;
      await certApi.issueCert(template.id, payload);
      setSuccess("Certificado emitido correctamente.");
      onIssued?.();
      setTimeout(onClose, 1200);
    } catch (err) {
      setError(err?.detail || err?.score?.[0] || err?.user_id?.[0] || "No se pudo emitir el certificado.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ height: 2, background: "linear-gradient(90deg, #6366F1, #818CF8, #A78BFA)" }} />
        <div style={{ padding: "18px 20px" }} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 14 }}>Emitir Certificado</p>
              <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>{template.name}</p>
            </div>
            <button onClick={onClose} style={{ color: "var(--text-tertiary)", background: "none", border: "none", cursor: "pointer" }}><XMarkIcon className="h-5 w-5" /></button>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>Usuario</label>
            {loadingMembers ? (
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", padding: "8px 0" }}>Cargando miembros…</div>
            ) : (
              <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 8 }}>
                {members.map((m) => {
                  const sel = selectedUserId === m.user;
                  return (
                    <button key={m.id} type="button" onClick={() => setSelectedUserId(m.user)}
                      style={{ width: "100%", textAlign: "left", padding: "9px 12px", background: sel ? "rgba(99,102,241,0.12)" : "transparent", border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, fontWeight: sel ? 700 : 500, color: sel ? "#C7D2FE" : "var(--text-secondary)" }}>
                        {m.full_name || m.username}
                      </span>
                      {sel && <CheckBadgeIcon style={{ width: 14, height: 14, color: "#818CF8" }} />}
                    </button>
                  );
                })}
                {members.length === 0 && <p style={{ fontSize: 12, color: "var(--text-tertiary)", padding: "10px 12px" }}>Sin miembros activos.</p>}
              </div>
            )}
          </div>

          {template.requires_score && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>
                Nota (mínimo requerido: {template.minimum_score}%)
              </label>
              <input style={INPUT} type="number" min="0" max="100" value={score} onChange={(e) => setScore(e.target.value)} />
            </div>
          )}

          {error && <p style={{ fontSize: 12, color: "#f87171" }}>{error}</p>}
          {success && <p style={{ fontSize: 12, color: "#4ade80", fontWeight: 700 }}>{success}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="ank-btn-ghost text-xs">Cancelar</button>
            <button type="button" onClick={handleIssue} disabled={saving || !selectedUserId} className="ank-btn-accent text-xs" style={{ opacity: saving || !selectedUserId ? 0.6 : 1 }}>
              {saving ? "Emitiendo…" : "Emitir"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CertificateTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issuingTemplate, setIssuingTemplate] = useState(null);
  const navigate = useNavigate();

  const load = () => {
    certApi.getTemplates().then((d) => setTemplates(d.results || d || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggle = async (t) => {
    if (t.is_active) await certApi.deactivateTemplate(t.id);
    else await certApi.activateTemplate(t.id);
    load();
  };

  const btn = { fontSize: 11, fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: "4px 8px" };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 800 }}>Certificate Templates</h1>
        <button onClick={() => navigate("/enterprise/certifications/templates/new")} className="ank-btn-accent text-xs">
          <PlusIcon className="h-3.5 w-3.5" /> New Template
        </button>
      </div>

      {loading ? <TableSkeleton rows={4} cols={6} /> : templates.length === 0 ? (
        <EmptyState icon={AcademicCapIcon} title="No templates" message="Create your first certificate template." action="New Template" onAction={() => navigate("/enterprise/certifications/templates/new")} />
      ) : (
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="w-full" style={{ fontSize: 13, borderCollapse: "collapse" }}>
              <thead style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                <tr>
                  {["Code", "Name", "Type", "Validity", "Req. Score", "Active", "Issued", "Actions"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 11, color: "var(--text-tertiary)" }}>{t.code}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-primary)" }}>{t.name}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text-secondary)", textTransform: "capitalize" }}>{t.certificate_type}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{t.validity_days === 0 ? "No expiry" : `${t.validity_days}d`}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{t.requires_score ? `${t.minimum_score}%` : "—"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: t.is_active ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.06)", color: t.is_active ? "#4ade80" : "#8B8B9C" }}>
                        {t.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{t.issued_count ?? 0}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div className="flex gap-1 flex-wrap">
                        <button style={{ ...btn, color: "#818CF8" }} onClick={() => navigate(`/enterprise/certifications/templates/${t.id}/edit`)}>Edit</button>
                        <button style={{ ...btn, color: t.is_active ? "var(--text-tertiary)" : "#4ade80" }} onClick={() => toggle(t)}>
                          {t.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button style={{ ...btn, color: "#818CF8" }} onClick={() => setIssuingTemplate(t)}>Issue</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {issuingTemplate && (
        <IssueCertModal
          template={issuingTemplate}
          onClose={() => setIssuingTemplate(null)}
          onIssued={load}
        />
      )}
    </div>
  );
}

export default CertificateTemplates;

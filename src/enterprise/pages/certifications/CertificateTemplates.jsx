import React, { useEffect, useState } from "react";
import { PlusIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { certApi } from "../../api/enterpriseApi";
import { EmptyState } from "../../components/EmptyState";
import { TableSkeleton } from "../../components/LoadingSkeleton";

export function CertificateTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
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
                        <button style={{ ...btn, color: "#818CF8" }}>Issue</button>
                      </div>
                    </td>
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

export default CertificateTemplates;

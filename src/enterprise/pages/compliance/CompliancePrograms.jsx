import React, { useEffect, useState } from "react";
import { PlusIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { complianceApi } from "../../api/enterpriseApi";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";
import { TableSkeleton } from "../../components/LoadingSkeleton";
import { useCompanyRole } from "../../hooks/useCompanyRole";

export function CompliancePrograms() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const { hasMinRole } = useCompanyRole();
  const canEdit = hasMinRole("manager");

  const load = () => {
    const params = statusFilter ? { status: statusFilter } : {};
    complianceApi.getPrograms(params).then((d) => setPrograms(d.results || d || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter]);

  const activate = async (id) => { await complianceApi.activateProgram(id); load(); };
  const archive = async (id) => { await complianceApi.archiveProgram(id); load(); };

  const btn = { fontSize: 11, fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: "4px 8px" };

  return (
    <div className="space-y-5">
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
            <button className="ank-btn-accent text-xs">
              <PlusIcon className="h-3.5 w-3.5" /> New Program
            </button>
          )}
        </div>
      </div>

      {loading ? <TableSkeleton rows={5} cols={6} /> : programs.length === 0 ? (
        <EmptyState icon={ShieldCheckIcon} title="No compliance programs" message={canEdit ? "Create your first compliance program." : "No programs available."} />
      ) : (
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="w-full" style={{ fontSize: 13, borderCollapse: "collapse" }}>
              <thead style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                <tr>
                  {["Code", "Name", "Type", "Frequency", "Status", "Mandatory", ...(canEdit ? ["Actions"] : [])].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {programs.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
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
                    {canEdit && (
                      <td style={{ padding: "12px 16px" }}>
                        <div className="flex gap-1 flex-wrap">
                          <button style={{ ...btn, color: "#818CF8" }}>Edit</button>
                          {p.status === "draft" && <button style={{ ...btn, color: "#4ade80" }} onClick={() => activate(p.id)}>Activate</button>}
                          {p.status === "active" && <button style={{ ...btn, color: "var(--text-tertiary)" }} onClick={() => archive(p.id)}>Archive</button>}
                          <button style={{ ...btn, color: "#818CF8" }}>Assign User</button>
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

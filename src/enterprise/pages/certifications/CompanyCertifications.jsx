import React, { useEffect, useState } from "react";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import { certApi } from "../../api/enterpriseApi";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";
import { TableSkeleton } from "../../components/LoadingSkeleton";

export function CompanyCertifications() {
  const [certs, setCerts] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = statusFilter ? { status: statusFilter } : {};
    certApi.allCertifications(params).then((d) => setCerts(d.results || d || [])).catch(() => {}).finally(() => setLoading(false));
  }, [statusFilter]);

  const btn = { fontSize: 11, fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: "4px 8px" };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 800 }}>Company Certifications</h1>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          style={{ fontSize: 12, background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, padding: "7px 10px", color: "var(--text-secondary)", outline: "none", cursor: "pointer" }}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="expiring">Expiring</option>
          <option value="expired">Expired</option>
          <option value="revoked">Revoked</option>
        </select>
      </div>

      {loading ? <TableSkeleton rows={6} cols={7} /> : certs.length === 0 ? (
        <EmptyState icon={AcademicCapIcon} title="No certifications found" message="No certifications match the current filter." />
      ) : (
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="w-full" style={{ fontSize: 13, borderCollapse: "collapse" }}>
              <thead style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                <tr>
                  {["Holder", "Template", "Cert #", "Status", "Issued", "Expires", "Score", "Actions"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {certs.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-primary)" }}>{c.holder_name}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{c.template_name}</td>
                    <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 11, color: "var(--text-tertiary)" }}>#{c.certificate_number}</td>
                    <td style={{ padding: "12px 16px" }}><StatusBadge status={c.status} /></td>
                    <td style={{ padding: "12px 16px", color: "var(--text-tertiary)", fontSize: 11 }}>{c.issued_at ? new Date(c.issued_at).toLocaleDateString() : "—"}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text-tertiary)", fontSize: 11 }}>{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "No expiry"}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "#818CF8" }}>{c.score != null ? `${c.score}%` : "—"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div className="flex gap-1">
                        <button style={{ ...btn, color: "#818CF8" }}>View</button>
                        {c.status === "active" && <button style={{ ...btn, color: "#f87171" }}>Revoke</button>}
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

export default CompanyCertifications;

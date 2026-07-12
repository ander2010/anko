import React, { useEffect, useState } from "react";
import { retentionApi } from "../../api/enterpriseApi";
import { EmptyState } from "../../components/EmptyState";
import { TableSkeleton } from "../../components/LoadingSkeleton";

function scoreTone(s) {
  if (s >= 70) return "#4ade80";
  if (s >= 40) return "#f59e0b";
  return "#f87171";
}

export function TeamRetention() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    retentionApi.teamRetention().then((d) => setMembers(d.members || d.results || d || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <h1 style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 800 }}>Team Retention</h1>

      {loading ? <TableSkeleton rows={6} cols={5} /> : members.length === 0 ? (
        <EmptyState title="No team data" />
      ) : (
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="w-full" style={{ fontSize: 13, borderCollapse: "collapse" }}>
              <thead style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                <tr>
                  {["Name", "Retention Score", "Risk Score", "Open Gaps", "Last Assessment"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const tone = scoreTone(m.retention_score ?? 0);
                  return (
                    <tr key={m.user_id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {m.name}
                        {(m.risk_score ?? 0) > 60 && (
                          <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, color: "#f87171", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", padding: "1px 8px", borderRadius: 20 }}>At Risk</span>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: `${tone}22`, color: tone }}>{m.retention_score ?? 0}%</span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{m.risk_score ?? 0}%</td>
                      <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{m.open_gaps ?? 0}</td>
                      <td style={{ padding: "12px 16px", color: "var(--text-tertiary)", fontSize: 11 }}>{m.last_assessment ? new Date(m.last_assessment).toLocaleDateString() : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamRetention;

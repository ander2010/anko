import React, { useEffect, useState } from "react";
import { complianceApi } from "../../api/enterpriseApi";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";
import { DashboardSkeleton } from "../../components/LoadingSkeleton";

export function MyCompliance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    complianceApi.myCompliance().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (!data) return <EmptyState title="No compliance data" />;

  const assignments = data.assignments || [];

  return (
    <div className="space-y-5">
      <h1 style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 800 }}>My Compliance</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Programs", value: data.total, color: "var(--text-primary)" },
          { label: "Compliant", value: data.compliant, color: "#4ade80" },
          { label: "Non-Compliant", value: data.non_compliant, color: "#f87171" },
          { label: "Pending", value: data.pending, color: "#f59e0b" },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value ?? 0}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Compliance rate */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
        <div className="flex items-center justify-between mb-2.5">
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Compliance Rate</p>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#818CF8" }}>{data.compliance_rate ?? 0}%</span>
        </div>
        <div style={{ height: 8, background: "var(--bg-elevated)", borderRadius: 20, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${data.compliance_rate ?? 0}%`, background: "#6366F1", borderRadius: 20, transition: "width 400ms" }} />
        </div>
      </div>

      {/* Assignments list */}
      <div className="space-y-3">
        {assignments.map((a) => {
          const danger = a.status === "non_compliant";
          const warn = a.days_until_expiry <= 30;
          return (
            <div key={a.id}
              style={{ background: "var(--bg-surface)", border: `1px solid ${danger ? "rgba(239,68,68,0.3)" : warn ? "rgba(245,158,11,0.3)" : "var(--border)"}`, borderRadius: 12, padding: 16 }}
              className="flex items-center justify-between gap-4 flex-wrap"
            >
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{a.program_name}</p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <StatusBadge status={a.status} />
                  {a.due_date && <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Due: {a.due_date}</span>}
                  {a.expires_at && <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Expires: {a.expires_at}</span>}
                  {a.score !== null && a.score !== undefined && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)" }}>Score: {a.score}%</span>
                  )}
                </div>
              </div>
              <button style={{
                fontSize: 11, fontWeight: 700, padding: "6px 12px", borderRadius: 6, flexShrink: 0, cursor: "pointer",
                background: a.status === "expired" ? "#EF4444" : "rgba(99,102,241,0.1)",
                color: a.status === "expired" ? "#fff" : "#818CF8",
                border: a.status === "expired" ? "none" : "1px solid rgba(99,102,241,0.25)",
              }}>
                {a.status === "expired" ? "Renew" : "View"}
              </button>
            </div>
          );
        })}
        {assignments.length === 0 && <EmptyState title="No compliance assignments" />}
      </div>
    </div>
  );
}

export default MyCompliance;

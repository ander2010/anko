import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { complianceApi } from "../../api/enterpriseApi";
import { EmptyState } from "../../components/EmptyState";

function rateColor(rate) {
  if (rate >= 80) return "#4ade80";
  if (rate >= 60) return "#f59e0b";
  return "#f87171";
}

function StatTile({ label, value, color }) {
  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 10px", textAlign: "center" }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || "var(--text-primary)" }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 4 }}>{label}</div>
    </div>
  );
}

export function ComplianceAuditReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    complianceApi.auditReport(id).then(setReport).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} className="w-7 h-7 border-2 rounded-full animate-spin" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center py-24">
        <EmptyState title="Report not found" />
        <button onClick={() => navigate(`/enterprise/compliance/programs/${id}`)} className="ank-btn-ghost text-xs mt-2">
          <ArrowLeftIcon className="h-3.5 w-3.5" /> Back to Program
        </button>
      </div>
    );
  }

  const rate = report.compliance_rate ?? 0;

  return (
    <div className="w-full max-w-4xl space-y-5">
      <button onClick={() => navigate(`/enterprise/compliance/programs/${id}`)}
        style={{ color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: 5, fontSize: 12, cursor: "pointer", background: "none", border: "none" }}
        className="hover:opacity-70 transition-opacity">
        <ArrowLeftIcon style={{ width: 13, height: 13 }} /> Back to Program
      </button>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 18 }}>{report.program_name}</h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: 12, fontFamily: "monospace", marginTop: 2 }}>
            {report.program_code} · <span style={{ textTransform: "capitalize" }}>{report.compliance_type}</span>
          </p>
        </div>
        <button onClick={() => window.print()} className="ank-btn-ghost text-xs">
          <PrinterIcon className="h-3.5 w-3.5" /> Print
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        <StatTile label="Total" value={report.total_assignments ?? 0} />
        <StatTile label="Compliant" value={report.compliant ?? 0} color="#4ade80" />
        <StatTile label="Non-Compliant" value={report.non_compliant ?? 0} color="#f87171" />
        <StatTile label="Pending" value={report.pending ?? 0} color="#f59e0b" />
        <StatTile label="Expired" value={report.expired ?? 0} color="var(--text-tertiary)" />
        <StatTile label="Rate" value={`${rate}%`} color={rateColor(rate)} />
      </div>

      {/* Compliance Rate */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "24px", textAlign: "center" }}>
        <p style={{ color: "var(--text-tertiary)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
          Overall Compliance Rate
        </p>
        <div style={{ fontSize: 48, fontWeight: 800, color: rateColor(rate) }}>{rate}%</div>
      </div>

      {/* Reviews breakdown */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "18px 20px" }}>
        <p style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 13, marginBottom: 14 }}>Review Results</p>
        <div className="flex gap-8">
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#4ade80" }}>{report.passed_reviews ?? 0}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", marginTop: 4 }}>Passed</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#f87171" }}>{report.failed_reviews ?? 0}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", marginTop: 4 }}>Failed</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>{report.total_reviews ?? 0}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", marginTop: 4 }}>Total</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplianceAuditReport;

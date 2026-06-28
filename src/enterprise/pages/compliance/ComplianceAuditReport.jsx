import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Typography, Button } from "@material-tailwind/react";
import { PrinterIcon } from "@heroicons/react/24/outline";
import { complianceApi } from "../../api/enterpriseApi";
import { EmptyState } from "../../components/EmptyState";

export function ComplianceAuditReport() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    complianceApi.auditReport(id).then(setReport).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent" /></div>;
  if (!report) return <EmptyState title="Report not found" />;

  const rate = report.compliance_rate ?? 0;

  return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="h5" className="font-extrabold text-zinc-900">{report.program_name}</Typography>
            <Typography variant="small" className="text-zinc-400 font-mono">{report.program_code} · {report.compliance_type}</Typography>
          </div>
          <Button variant="outlined" color="zinc" className="normal-case flex items-center gap-2" onClick={() => window.print()}>
            <PrinterIcon className="h-4 w-4" /> Print
          </Button>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { label: "Total", value: report.total, color: "text-zinc-900" },
            { label: "Compliant", value: report.compliant, color: "text-green-600" },
            { label: "Non-Compliant", value: report.non_compliant, color: "text-red-600" },
            { label: "Pending", value: report.pending, color: "text-amber-600" },
            { label: "Expired", value: report.expired, color: "text-gray-600" },
            { label: "Rate", value: `${rate}%`, color: rate >= 80 ? "text-green-600" : rate >= 60 ? "text-amber-600" : "text-red-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-zinc-200 p-4 text-center">
              <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-xs font-semibold text-zinc-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Compliance Rate */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 text-center">
          <Typography variant="small" className="text-zinc-400 font-semibold uppercase text-xs tracking-wide mb-2">Overall Compliance Rate</Typography>
          <div className={`text-6xl font-extrabold ${rate >= 80 ? "text-green-600" : rate >= 60 ? "text-amber-600" : "text-red-600"}`}>{rate}%</div>
        </div>

        {/* Reviews breakdown */}
        {report.reviews && (
          <div className="bg-white rounded-2xl border border-zinc-200 p-6">
            <Typography variant="h6" className="font-bold text-zinc-900 mb-4">Review Results</Typography>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-extrabold text-green-600">{report.reviews.passed ?? 0}</div>
                <div className="text-xs font-semibold text-zinc-400">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-extrabold text-red-600">{report.reviews.failed ?? 0}</div>
                <div className="text-xs font-semibold text-zinc-400">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-extrabold text-zinc-700">{report.reviews.total ?? 0}</div>
                <div className="text-xs font-semibold text-zinc-400">Total</div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}

export default ComplianceAuditReport;

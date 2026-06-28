import React, { useEffect, useState } from "react";
import { Typography, Card, CardBody } from "@material-tailwind/react";
import { complianceApi } from "../../api/enterpriseApi";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";
import { TableSkeleton, KPICardSkeleton } from "../../components/LoadingSkeleton";

export function TeamCompliance() {
  const [members, setMembers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      complianceApi.teamCompliance(),
      complianceApi.teamComplianceSummary(),
    ]).then(([m, s]) => {
      setMembers(m.results || m || []);
      setSummary(s);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
      <div className="space-y-6">
        <Typography variant="h5" className="font-extrabold text-zinc-900">Team Compliance</Typography>

        {loading ? (
          <div className="grid grid-cols-3 gap-4"><KPICardSkeleton /><KPICardSkeleton /><KPICardSkeleton /></div>
        ) : summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Compliant", value: summary.compliant ?? 0, color: "text-green-600" },
              { label: "Non-Compliant", value: summary.non_compliant ?? 0, color: "text-red-600" },
              { label: "Pending", value: summary.pending ?? 0, color: "text-amber-600" },
              { label: "Avg Rate", value: `${summary.avg_compliance_rate ?? 0}%`, color: "text-indigo-600" },
            ].map((s) => (
              <Card key={s.label} className="border border-zinc-200/60 shadow-sm">
                <CardBody className="p-4 text-center">
                  <div className={`text-3xl font-extrabold ${s.color}`}>{s.value}</div>
                  <div className="text-xs font-semibold text-zinc-400 mt-1">{s.label}</div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {loading ? <TableSkeleton rows={5} cols={5} /> : members.length === 0 ? (
          <EmptyState title="No team compliance data" />
        ) : (
          <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  {["Member", "Compliance Rate", "Compliant", "Non-Compliant", "Pending", "Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-zinc-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.user_id} className={`border-b border-zinc-50 hover:bg-zinc-50 ${m.compliance_rate < 60 ? "bg-red-50/30" : ""}`}>
                    <td className="px-4 py-3 font-semibold text-zinc-800">{m.user_name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-zinc-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${m.compliance_rate >= 80 ? "bg-green-500" : m.compliance_rate >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                            style={{ width: `${m.compliance_rate}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-zinc-700">{m.compliance_rate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-green-600 font-bold">{m.compliant ?? 0}</td>
                    <td className="px-4 py-3 text-red-600 font-bold">{m.non_compliant ?? 0}</td>
                    <td className="px-4 py-3 text-amber-600 font-bold">{m.pending ?? 0}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={m.compliance_rate >= 80 ? "compliant" : m.compliance_rate >= 60 ? "pending" : "non_compliant"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
  );
}

export default TeamCompliance;

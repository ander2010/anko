import React, { useEffect, useState } from "react";
import { Typography, Select, Option, Button } from "@material-tailwind/react";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { complianceApi } from "../../api/enterpriseApi";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";
import { TableSkeleton } from "../../components/LoadingSkeleton";

export function ComplianceAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    const params = statusFilter ? { status: statusFilter } : {};
    complianceApi.getAssignments(params).then((d) => setAssignments(d.results || d || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter]);

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Typography variant="h5" className="font-extrabold text-zinc-900">Compliance Assignments</Typography>
          <div className="w-40">
            <Select label="Status" value={statusFilter} onChange={setStatusFilter}>
              <Option value="">All</Option>
              <Option value="pending">Pending</Option>
              <Option value="compliant">Compliant</Option>
              <Option value="non_compliant">Non-Compliant</Option>
              <Option value="expiring">Expiring</Option>
              <Option value="expired">Expired</Option>
              <Option value="exempted">Exempted</Option>
            </Select>
          </div>
        </div>

        {loading ? <TableSkeleton rows={6} cols={7} /> : assignments.length === 0 ? (
          <EmptyState icon={ShieldCheckIcon} title="No assignments found" message="No compliance assignments match the current filter." />
        ) : (
          <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  {["User", "Program", "Status", "Due Date", "Completed", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-zinc-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id} className={`border-b border-zinc-50 hover:bg-zinc-50 ${a.status === "non_compliant" ? "bg-red-50/30" : ""}`}>
                    <td className="px-4 py-3 font-semibold text-zinc-800">{a.user_name}</td>
                    <td className="px-4 py-3 text-zinc-600">{a.program_name}</td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{a.due_date || "—"}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{a.completed_at ? new Date(a.completed_at).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="text" color="indigo" className="normal-case text-xs py-1 px-2">Review</Button>
                        {["pending", "non_compliant"].includes(a.status) && (
                          <Button size="sm" variant="text" color="green" className="normal-case text-xs py-1 px-2">Mark Compliant</Button>
                        )}
                      </div>
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

export default ComplianceAssignments;

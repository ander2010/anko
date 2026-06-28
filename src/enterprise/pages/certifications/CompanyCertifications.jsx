import React, { useEffect, useState } from "react";
import { Typography, Select, Option, Button } from "@material-tailwind/react";
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

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Typography variant="h5" className="font-extrabold text-zinc-900">Company Certifications</Typography>
          <div className="w-40">
            <Select label="Status" value={statusFilter} onChange={setStatusFilter}>
              <Option value="">All</Option>
              <Option value="active">Active</Option>
              <Option value="expiring">Expiring</Option>
              <Option value="expired">Expired</Option>
              <Option value="revoked">Revoked</Option>
            </Select>
          </div>
        </div>

        {loading ? <TableSkeleton rows={6} cols={7} /> : certs.length === 0 ? (
          <EmptyState icon={AcademicCapIcon} title="No certifications found" message="No certifications match the current filter." />
        ) : (
          <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  {["Holder", "Template", "Cert #", "Status", "Issued", "Expires", "Score", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-zinc-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {certs.map((c) => (
                  <tr key={c.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                    <td className="px-4 py-3 font-semibold text-zinc-800">{c.holder_name}</td>
                    <td className="px-4 py-3 text-zinc-600">{c.template_name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">#{c.certificate_number}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{c.issued_at ? new Date(c.issued_at).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "No expiry"}</td>
                    <td className="px-4 py-3 font-bold text-indigo-600">{c.score != null ? `${c.score}%` : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="text" color="indigo" className="normal-case text-xs py-1 px-2">View</Button>
                        {c.status === "active" && <Button size="sm" variant="text" color="red" className="normal-case text-xs py-1 px-2">Revoke</Button>}
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

export default CompanyCertifications;

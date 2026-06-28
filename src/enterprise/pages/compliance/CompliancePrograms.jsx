import React, { useEffect, useState } from "react";
import { Typography, Button, Select, Option } from "@material-tailwind/react";
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Typography variant="h5" className="font-extrabold text-zinc-900">Compliance Programs</Typography>
        <div className="flex gap-2 items-center flex-wrap">
          <div className="w-36">
            <Select label="Status" value={statusFilter} onChange={setStatusFilter}>
              <Option value="">All</Option>
              <Option value="active">Active</Option>
              <Option value="draft">Draft</Option>
              <Option value="archived">Archived</Option>
            </Select>
          </div>
          {canEdit && (
            <Button color="indigo" className="normal-case flex items-center gap-2">
              <PlusIcon className="h-4 w-4" /> New Program
            </Button>
          )}
        </div>
      </div>

      {loading ? <TableSkeleton rows={5} cols={6} /> : programs.length === 0 ? (
        <EmptyState icon={ShieldCheckIcon} title="No compliance programs" message={canEdit ? "Create your first compliance program." : "No programs available."} />
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                {["Code", "Name", "Type", "Frequency", "Status", "Mandatory", ...(canEdit ? ["Actions"] : [])].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-zinc-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {programs.map((p) => (
                <tr key={p.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">{p.code}</td>
                  <td className="px-4 py-3 font-semibold text-zinc-800">{p.name}</td>
                  <td className="px-4 py-3 text-zinc-500 capitalize">{p.compliance_type}</td>
                  <td className="px-4 py-3 text-zinc-500 capitalize">{p.frequency}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3">
                    {p.is_mandatory ? (
                      <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">Required</span>
                    ) : (
                      <span className="text-xs text-zinc-400">Optional</span>
                    )}
                  </td>
                  {canEdit && (
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        <Button size="sm" variant="text" color="indigo" className="normal-case text-xs py-1 px-2">Edit</Button>
                        {p.status === "draft" && <Button size="sm" variant="text" color="green" className="normal-case text-xs py-1 px-2" onClick={() => activate(p.id)}>Activate</Button>}
                        {p.status === "active" && <Button size="sm" variant="text" color="zinc" className="normal-case text-xs py-1 px-2" onClick={() => archive(p.id)}>Archive</Button>}
                        <Button size="sm" variant="text" color="indigo" className="normal-case text-xs py-1 px-2">Assign User</Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CompliancePrograms;

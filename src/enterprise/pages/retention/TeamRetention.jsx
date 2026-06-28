import React, { useEffect, useState } from "react";
import { Typography } from "@material-tailwind/react";
import { retentionApi } from "../../api/enterpriseApi";
import { EmptyState } from "../../components/EmptyState";
import { TableSkeleton } from "../../components/LoadingSkeleton";

function scoreStyle(s) {
  if (s >= 70) return "text-green-700 bg-green-100";
  if (s >= 40) return "text-amber-700 bg-amber-100";
  return "text-red-700 bg-red-100";
}

export function TeamRetention() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    retentionApi.teamRetention().then((d) => setMembers(d.members || d.results || d || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
      <div className="space-y-6">
        <Typography variant="h5" className="font-extrabold text-zinc-900">Team Retention</Typography>

        {loading ? <TableSkeleton rows={6} cols={5} /> : members.length === 0 ? (
          <EmptyState title="No team data" />
        ) : (
          <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  {["Name", "Retention Score", "Risk Score", "Open Gaps", "Last Assessment"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-zinc-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.user_id} className="border-b border-zinc-50 hover:bg-zinc-50">
                    <td className="px-4 py-3 font-semibold text-zinc-800">
                      {m.name}
                      {(m.risk_score ?? 0) > 60 && <span className="ml-2 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">At Risk</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${scoreStyle(m.retention_score ?? 0)}`}>{m.retention_score ?? 0}%</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{m.risk_score ?? 0}%</td>
                    <td className="px-4 py-3 text-zinc-600">{m.open_gaps ?? 0}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{m.last_assessment ? new Date(m.last_assessment).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
  );
}

export default TeamRetention;

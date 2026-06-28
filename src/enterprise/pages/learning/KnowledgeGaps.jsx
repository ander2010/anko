import React, { useEffect, useState } from "react";
import { Typography, Button, Select, Option } from "@material-tailwind/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { learningApi } from "../../api/enterpriseApi";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";
import { TableSkeleton } from "../../components/LoadingSkeleton";

export function KnowledgeGaps() {
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const [acting, setActing] = useState(null);

  const load = () => {
    setLoading(true);
    const params = {};
    if (severity) params.severity = severity;
    if (status) params.status = status;
    learningApi.getKnowledgeGaps(params).then((d) => setGaps(d.results || d || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [severity, status]);

  const act = async (id, action) => {
    setActing(id);
    try {
      await (action === "acknowledge" ? learningApi.acknowledgeGap(id) : learningApi.resolveGap(id));
      load();
    } finally { setActing(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Typography variant="h5" className="font-extrabold text-zinc-900">Knowledge Gaps</Typography>
        <div className="flex gap-2 flex-wrap">
          <div className="w-36">
            <Select label="Severity" value={severity} onChange={setSeverity}>
              <Option value="">All</Option>
              {["critical", "high", "medium", "low"].map((s) => <Option key={s} value={s} className="capitalize">{s}</Option>)}
            </Select>
          </div>
          <div className="w-36">
            <Select label="Status" value={status} onChange={setStatus}>
              <Option value="">All</Option>
              {["open", "acknowledged", "resolved"].map((s) => <Option key={s} value={s} className="capitalize">{s}</Option>)}
            </Select>
          </div>
        </div>
      </div>

      {loading ? <TableSkeleton rows={5} cols={5} /> : gaps.length === 0 ? (
        <EmptyState icon={ExclamationTriangleIcon} title="No knowledge gaps" message="Great! No gaps detected." />
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                {["Severity", "Topic", "Retention Score", "Detected", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gaps.map((g) => (
                <tr key={g.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                  <td className="px-4 py-3"><StatusBadge status={g.severity} /></td>
                  <td className="px-4 py-3 font-semibold text-zinc-800">{g.topic}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${g.retention_score < 40 ? "text-red-600" : g.retention_score < 70 ? "text-amber-600" : "text-green-600"}`}>
                      {g.retention_score}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{g.detected_at ? new Date(g.detected_at).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={g.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {g.status === "open" && (
                        <Button size="sm" variant="outlined" color="amber" className="normal-case text-xs py-1 px-2" loading={acting === g.id} onClick={() => act(g.id, "acknowledge")}>
                          Acknowledge
                        </Button>
                      )}
                      {g.status !== "resolved" && (
                        <Button size="sm" variant="outlined" color="green" className="normal-case text-xs py-1 px-2" loading={acting === g.id} onClick={() => act(g.id, "resolve")}>
                          Resolve
                        </Button>
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

export default KnowledgeGaps;

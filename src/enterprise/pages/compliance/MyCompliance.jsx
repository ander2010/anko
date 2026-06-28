import React, { useEffect, useState } from "react";
import { Typography, Card, CardBody, Progress, Button } from "@material-tailwind/react";
import { complianceApi } from "../../api/enterpriseApi";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";
import { DashboardSkeleton, KPICardSkeleton } from "../../components/LoadingSkeleton";

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
    <div className="space-y-6">
      <Typography variant="h5" className="font-extrabold text-zinc-900">My Compliance</Typography>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Programs", value: data.total, color: "text-zinc-900" },
          { label: "Compliant ✅", value: data.compliant, color: "text-green-600" },
          { label: "Non-Compliant ❌", value: data.non_compliant, color: "text-red-600" },
          { label: "Pending ⏳", value: data.pending, color: "text-amber-600" },
        ].map((s) => (
          <Card key={s.label} className="border border-zinc-200/60 shadow-sm">
            <CardBody className="p-4 text-center">
              <div className={`text-3xl font-extrabold ${s.color}`}>{s.value ?? 0}</div>
              <div className="text-xs font-semibold text-zinc-400 mt-1">{s.label}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Compliance rate */}
      <Card className="border border-zinc-200/60 shadow-sm">
        <CardBody className="p-5">
          <div className="flex items-center justify-between mb-2">
            <Typography variant="h6" className="font-bold text-zinc-900">Compliance Rate</Typography>
            <span className="text-2xl font-extrabold text-indigo-600">{data.compliance_rate ?? 0}%</span>
          </div>
          <Progress value={data.compliance_rate ?? 0} size="lg" color="indigo" />
        </CardBody>
      </Card>

      {/* Assignments list */}
      <div className="space-y-3">
        {assignments.map((a) => (
          <Card
            key={a.id}
            className={`border shadow-sm ${a.status === "non_compliant" ? "border-red-200 bg-red-50/20" : a.days_until_expiry <= 30 ? "border-amber-200 bg-amber-50/20" : "border-zinc-200/60"}`}
          >
            <CardBody className="p-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <Typography variant="h6" className="font-bold text-zinc-900 text-sm">{a.program_name}</Typography>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <StatusBadge status={a.status} />
                  {a.due_date && <Typography variant="small" className="text-zinc-400 text-xs">Due: {a.due_date}</Typography>}
                  {a.expires_at && <Typography variant="small" className="text-zinc-400 text-xs">Expires: {a.expires_at}</Typography>}
                  {a.score !== null && a.score !== undefined && (
                    <Typography variant="small" className="text-zinc-600 text-xs font-bold">Score: {a.score}%</Typography>
                  )}
                </div>
              </div>
              <Button size="sm" variant={a.status === "expired" ? "filled" : "outlined"} color={a.status === "expired" ? "red" : "indigo"} className="normal-case text-xs py-1.5 px-3 flex-shrink-0">
                {a.status === "expired" ? "Renew" : "View"}
              </Button>
            </CardBody>
          </Card>
        ))}
        {assignments.length === 0 && <EmptyState title="No compliance assignments" />}
      </div>
    </div>
  );
}

export default MyCompliance;

import React, { useEffect, useState } from "react";
import { Typography, Card, CardBody } from "@material-tailwind/react";
import ReactApexChart from "react-apexcharts";
import { UsersIcon, CheckCircleIcon, AcademicCapIcon, ShieldCheckIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { analyticsApi } from "../../api/enterpriseApi";
import { KPICard } from "../../components/KPICard";
import { CompanyHealthScore } from "../../components/CompanyHealthScore";
import { EmptyState } from "../../components/EmptyState";
import { DashboardSkeleton } from "../../components/LoadingSkeleton";

export function ExecutiveDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.executiveDashboard().then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (!data) return <EmptyState title="Could not load executive dashboard" />;

  const trends = data.retention_trend || [];
  const teams = data.team_breakdown || [];

  const lineOptions = {
    chart: { type: "line", toolbar: { show: false }, fontFamily: "inherit" },
    stroke: { curve: "smooth", width: [2, 2] },
    colors: ["#4f46e5", "#dc2626"],
    xaxis: {
      categories: trends.map((t) => t.date),
      labels: { style: { fontSize: "10px" }, rotate: -30 },
    },
    yaxis: { min: 0, max: 100, labels: { formatter: (v) => `${v}%` } },
    legend: { position: "top" },
    tooltip: { shared: true, y: { formatter: (v) => `${v}%` } },
    grid: { borderColor: "#f3f4f6" },
    dataLabels: { enabled: false },
  };

  const lineSeries = [
    { name: "Avg Retention", data: trends.map((t) => t.avg_retention ?? 0) },
    { name: "Avg Risk", data: trends.map((t) => t.avg_risk ?? 0) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h5" className="font-extrabold text-zinc-900">Executive Dashboard</Typography>
        <Typography variant="small" className="text-zinc-400">Company-wide knowledge retention health</Typography>
      </div>

      {/* Company Health */}
      <CompanyHealthScore
        score={data.health_score ?? 0}
        breakdown={{
          compliance: data.compliance_rate ?? 0,
          retention: data.avg_retention ?? 0,
          certifications: data.cert_coverage ?? 0,
          no_critical_gaps: data.no_critical_gaps_score ?? 0,
        }}
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard title="Headcount" value={data.headcount ?? 0} icon={UsersIcon} color="indigo" />
        <KPICard title="Completion Rate" value={`${data.completion_rate ?? 0}%`} icon={CheckCircleIcon} color="blue" />
        <KPICard title="Avg Retention" value={`${data.avg_retention ?? 0}%`} icon={ChartBarIcon} color="purple" />
        <KPICard title="Compliance Rate" value={`${data.compliance_rate ?? 0}%`} icon={ShieldCheckIcon} color="green" />
        <KPICard title="Active Certs" value={data.active_certs ?? 0} icon={AcademicCapIcon} color="amber" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Retention Trend */}
        <Card className="border border-zinc-200/60 shadow-sm">
          <CardBody className="p-5">
            <Typography variant="h6" className="font-bold text-zinc-900 mb-1">Retention Trend (30d)</Typography>
            <Typography variant="small" className="text-zinc-400 mb-4">Avg retention vs. risk over time</Typography>
            {trends.length === 0 ? (
              <EmptyState title="No trend data yet" />
            ) : (
              <ReactApexChart options={lineOptions} series={lineSeries} type="line" height={220} />
            )}
          </CardBody>
        </Card>

        {/* Team Breakdown */}
        <Card className="border border-zinc-200/60 shadow-sm">
          <CardBody className="p-5">
            <Typography variant="h6" className="font-bold text-zinc-900 mb-4">Team Breakdown</Typography>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100">
                    <th className="text-left py-2 text-xs font-bold text-zinc-400 uppercase">Team</th>
                    <th className="text-center py-2 text-xs font-bold text-zinc-400 uppercase">Members</th>
                    <th className="text-center py-2 text-xs font-bold text-zinc-400 uppercase">Avg Compliance</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((t) => (
                    <tr key={t.team_id} className="border-b border-zinc-50 hover:bg-zinc-50">
                      <td className="py-2.5 font-semibold text-zinc-800">{t.name}</td>
                      <td className="py-2.5 text-center text-zinc-600">{t.members}</td>
                      <td className="py-2.5 text-center">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${t.avg_compliance >= 80 ? "text-green-700 bg-green-100 border-green-200" : t.avg_compliance >= 60 ? "text-amber-700 bg-amber-100 border-amber-200" : "text-red-700 bg-red-100 border-red-200"}`}>
                          {t.avg_compliance}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {teams.length === 0 && <EmptyState title="No team data" />}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Bottom KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-zinc-200/60 shadow-sm">
          <CardBody className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
              <ChartBarIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <Typography variant="small" className="text-zinc-400 font-semibold">Open Knowledge Gaps</Typography>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-zinc-900">{data.open_gaps ?? 0}</span>
                {(data.critical_gaps ?? 0) > 0 && (
                  <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">{data.critical_gaps} critical</span>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="border border-zinc-200/60 shadow-sm">
          <CardBody className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <ShieldCheckIcon className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <Typography variant="small" className="text-zinc-400 font-semibold">Non-Compliant Assignments</Typography>
              <span className="text-2xl font-extrabold text-zinc-900">{data.non_compliant_assignments ?? 0}</span>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default ExecutiveDashboard;

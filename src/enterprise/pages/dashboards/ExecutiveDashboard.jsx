import React, { useEffect, useState } from "react";
import { Typography, Card, CardBody } from "@material-tailwind/react";
import ReactApexChart from "react-apexcharts";
import { UsersIcon, CheckCircleIcon, AcademicCapIcon, ShieldCheckIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { analyticsApi } from "../../api/enterpriseApi";
import { useLanguage } from "../../../context/language-context";
import { KPICard } from "../../components/KPICard";
import { CompanyHealthScore } from "../../components/CompanyHealthScore";
import { EmptyState } from "../../components/EmptyState";
import { DashboardSkeleton } from "../../components/LoadingSkeleton";

export function ExecutiveDashboard() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.executiveDashboard().then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (!data) return <EmptyState title={t("enterprise.dashboards.executive.notLoaded")} />;

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
    { name: t("enterprise.dashboards.executive.avgRetention"), data: trends.map((t) => t.avg_retention ?? 0) },
    { name: t("enterprise.dashboards.executive.avgRisk"), data: trends.map((t) => t.avg_risk ?? 0) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h5" className="font-extrabold text-zinc-900">{t("enterprise.dashboards.executive.title")}</Typography>
        <Typography variant="small" className="text-zinc-400">{t("enterprise.dashboards.executive.subtitle")}</Typography>
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
        <KPICard title={t("enterprise.dashboards.executive.kpi.headcount")} value={data.headcount ?? 0} icon={UsersIcon} color="indigo" />
        <KPICard title={t("enterprise.dashboards.executive.kpi.completionRate")} value={`${data.completion_rate ?? 0}%`} icon={CheckCircleIcon} color="blue" />
        <KPICard title={t("enterprise.dashboards.executive.kpi.avgRetention")} value={`${data.avg_retention ?? 0}%`} icon={ChartBarIcon} color="purple" />
        <KPICard title={t("enterprise.dashboards.executive.kpi.complianceRate")} value={`${data.compliance_rate ?? 0}%`} icon={ShieldCheckIcon} color="green" />
        <KPICard title={t("enterprise.dashboards.executive.kpi.activeCerts")} value={data.active_certs ?? 0} icon={AcademicCapIcon} color="amber" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Retention Trend */}
        <Card className="border border-zinc-200/60 shadow-sm">
          <CardBody className="p-5">
            <Typography variant="h6" className="font-bold text-zinc-900 mb-1">{t("enterprise.dashboards.executive.trend.title")}</Typography>
            <Typography variant="small" className="text-zinc-400 mb-4">{t("enterprise.dashboards.executive.trend.subtitle")}</Typography>
            {trends.length === 0 ? (
              <EmptyState title={t("enterprise.dashboards.executive.trend.empty")} />
            ) : (
              <ReactApexChart options={lineOptions} series={lineSeries} type="line" height={220} />
            )}
          </CardBody>
        </Card>

        {/* Team Breakdown */}
        <Card className="border border-zinc-200/60 shadow-sm">
          <CardBody className="p-5">
            <Typography variant="h6" className="font-bold text-zinc-900 mb-4">{t("enterprise.dashboards.executive.teamBreakdown.title")}</Typography>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100">
                    <th className="text-left py-2 text-xs font-bold text-zinc-400 uppercase">{t("enterprise.dashboards.executive.teamBreakdown.team")}</th>
                    <th className="text-center py-2 text-xs font-bold text-zinc-400 uppercase">{t("enterprise.dashboards.executive.teamBreakdown.members")}</th>
                    <th className="text-center py-2 text-xs font-bold text-zinc-400 uppercase">{t("enterprise.dashboards.executive.teamBreakdown.avgCompliance")}</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((t2) => (
                    <tr key={t2.team_id} className="border-b border-zinc-50 hover:bg-zinc-50">
                      <td className="py-2.5 font-semibold text-zinc-800">{t2.name}</td>
                      <td className="py-2.5 text-center text-zinc-600">{t2.members}</td>
                      <td className="py-2.5 text-center">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${t2.avg_compliance >= 80 ? "text-green-700 bg-green-100 border-green-200" : t2.avg_compliance >= 60 ? "text-amber-700 bg-amber-100 border-amber-200" : "text-red-700 bg-red-100 border-red-200"}`}>
                          {t2.avg_compliance}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {teams.length === 0 && <EmptyState title={t("enterprise.dashboards.executive.teamBreakdown.empty")} />}
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
              <Typography variant="small" className="text-zinc-400 font-semibold">{t("enterprise.dashboards.executive.openGaps")}</Typography>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-zinc-900">{data.open_gaps ?? 0}</span>
                {(data.critical_gaps ?? 0) > 0 && (
                  <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">{t("enterprise.dashboards.executive.criticalCount", { n: data.critical_gaps })}</span>
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
              <Typography variant="small" className="text-zinc-400 font-semibold">{t("enterprise.dashboards.executive.nonCompliantAssignments")}</Typography>
              <span className="text-2xl font-extrabold text-zinc-900">{data.non_compliant_assignments ?? 0}</span>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default ExecutiveDashboard;

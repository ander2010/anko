import React, { useEffect, useState } from "react";
import { Typography, Card, CardBody, Button } from "@material-tailwind/react";
import { BookOpenIcon, UsersIcon, CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import ReactApexChart from "react-apexcharts";
import { analyticsApi } from "../../api/enterpriseApi";
import { useLanguage } from "../../../context/language-context";
import { KPICard } from "../../components/KPICard";
import { EmptyState } from "../../components/EmptyState";
import { DashboardSkeleton } from "../../components/LoadingSkeleton";

export function TrainerDashboard() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.trainerDashboard().then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (!data) return <EmptyState title={t("enterprise.dashboards.trainer.notLoaded")} />;

  const topPaths = data.top_paths || [];
  const attention = data.learners_needing_attention || [];

  const barOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "inherit" },
    plotOptions: { bar: { horizontal: false, borderRadius: 6, columnWidth: "55%" } },
    dataLabels: { enabled: false },
    colors: topPaths.map((p) => (p.avg_score >= 80 ? "#16a34a" : p.avg_score >= 60 ? "#d97706" : "#dc2626")),
    xaxis: { categories: topPaths.map((p) => p.name.slice(0, 20)), labels: { style: { fontSize: "11px" } } },
    yaxis: { max: 100, labels: { formatter: (v) => `${v}%` } },
    tooltip: { y: { formatter: (v) => `${v}%` } },
    grid: { borderColor: "#f3f4f6" },
  };

  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h5" className="font-extrabold text-zinc-900">{t("enterprise.dashboards.trainer.title")}</Typography>
        <Typography variant="small" className="text-zinc-400">{t("enterprise.dashboards.trainer.subtitle")}</Typography>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title={t("enterprise.dashboards.trainer.kpi.learningPaths")} value={data.learning_paths_count ?? 0} icon={BookOpenIcon} color="indigo" />
        <KPICard title={t("enterprise.dashboards.trainer.kpi.totalAssignments")} value={data.assignments_total ?? 0} icon={UsersIcon} color="blue" />
        <KPICard title={t("enterprise.dashboards.trainer.kpi.completionRate")} value={`${data.completion_rate ?? 0}%`} icon={CheckCircleIcon} color="green" />
        <KPICard title={t("enterprise.dashboards.trainer.kpi.overdue")} value={data.overdue_count ?? 0} icon={ExclamationCircleIcon} color="red" urgent={(data.overdue_count ?? 0) > 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-zinc-200/60 shadow-sm">
          <CardBody className="p-5">
            <Typography variant="h6" className="font-bold text-zinc-900 mb-4">{t("enterprise.dashboards.trainer.topPaths.title")}</Typography>
            {topPaths.length === 0 ? (
              <EmptyState title={t("enterprise.dashboards.trainer.topPaths.empty")} />
            ) : (
              <ReactApexChart options={barOptions} series={[{ name: t("enterprise.dashboards.trainer.topPaths.avgScore"), data: topPaths.map((p) => p.avg_score ?? 0) }]} type="bar" height={220} />
            )}
          </CardBody>
        </Card>

        <Card className="border border-zinc-200/60 shadow-sm">
          <CardBody className="p-5">
            <Typography variant="h6" className="font-bold text-zinc-900 mb-4">{t("enterprise.dashboards.trainer.attention.title")}</Typography>
            {attention.length === 0 ? (
              <EmptyState title={t("enterprise.dashboards.trainer.attention.empty")} message={t("enterprise.dashboards.trainer.attention.emptyMessage")} />
            ) : (
              <div className="space-y-2">
                {attention.slice(0, 8).map((l) => (
                  <div key={l.user_id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                    <div>
                      <Typography variant="small" className="font-bold text-zinc-800">{l.name}</Typography>
                      <Typography variant="small" className="text-xs text-red-500">{t("enterprise.dashboards.trainer.attention.overdueCount", { n: l.overdue_assignments })}</Typography>
                    </div>
                    <Button size="sm" variant="outlined" color="indigo" className="normal-case text-xs py-1 px-2">{t("enterprise.dashboards.trainer.attention.viewProfile")}</Button>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-zinc-200/60 shadow-sm">
          <CardBody className="p-5 flex items-center gap-6">
            <div>
              <Typography variant="small" className="text-zinc-400 font-semibold uppercase text-xs mb-1">{t("enterprise.dashboards.trainer.moduleCompletionRate")}</Typography>
              <div className="text-4xl font-extrabold text-indigo-600">{data.module_completion_rate ?? 0}%</div>
            </div>
          </CardBody>
        </Card>
        <Card className="border border-zinc-200/60 shadow-sm">
          <CardBody className="p-5 flex items-center gap-6">
            <div>
              <Typography variant="small" className="text-zinc-400 font-semibold uppercase text-xs mb-1">{t("enterprise.dashboards.trainer.activePrograms")}</Typography>
              <div className="text-4xl font-extrabold text-green-600">{data.active_programs ?? 0}</div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default TrainerDashboard;

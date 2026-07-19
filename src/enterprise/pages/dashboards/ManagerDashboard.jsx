import React, { useEffect, useState } from "react";
import { Typography, Card, CardBody, Button, Progress, Select, Option } from "@material-tailwind/react";
import { UsersIcon, AcademicCapIcon, ShieldCheckIcon, ExclamationTriangleIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { analyticsApi } from "../../api/enterpriseApi";
import { useLanguage } from "../../../context/language-context";
import { KPICard } from "../../components/KPICard";
import { EmptyState } from "../../components/EmptyState";
import { DashboardSkeleton } from "../../components/LoadingSkeleton";

function RiskBadge({ score }) {
  const { t } = useLanguage();
  if (score > 60) return <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">⚠ {t("enterprise.dashboards.manager.risk.high")}</span>;
  if (score > 30) return <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">{t("enterprise.dashboards.manager.risk.moderate")}</span>;
  return <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">{t("enterprise.dashboards.manager.risk.good")}</span>;
}

export function ManagerDashboard() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamId, setTeamId] = useState("");

  useEffect(() => {
    analyticsApi.managerDashboard(teamId ? { team_id: teamId } : {})
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [teamId]);

  if (loading) return <DashboardSkeleton />;
  if (!data) return <EmptyState title={t("enterprise.dashboards.manager.notLoaded")} />;

  const atRisk = data.at_risk_members || [];
  const learning = data.learning_progress || {};
  const compliance = data.compliance_summary || {};
  const teams = data.teams || [];

  const gapCards = [
    { label: t("enterprise.dashboards.manager.compliance.criticalGaps"), value: compliance.critical_gaps ?? 0, color: "red" },
    { label: t("enterprise.dashboards.manager.compliance.highGaps"), value: compliance.high_gaps ?? 0, color: "orange" },
    { label: t("enterprise.dashboards.manager.compliance.mediumGaps"), value: compliance.medium_gaps ?? 0, color: "amber" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Typography variant="h5" className="font-extrabold text-zinc-900">{t("enterprise.dashboards.manager.title")}</Typography>
          <Typography variant="small" className="text-zinc-400">{t("enterprise.dashboards.manager.subtitle")}</Typography>
        </div>
        {teams.length > 1 && (
          <div className="w-48">
            <Select label={t("enterprise.dashboards.manager.selectTeam")} value={teamId} onChange={setTeamId}>
              <Option value="">{t("enterprise.dashboards.manager.allTeams")}</Option>
              {teams.map((tm) => <Option key={tm.id} value={String(tm.id)}>{tm.name}</Option>)}
            </Select>
          </div>
        )}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title={t("enterprise.dashboards.manager.kpi.teamMembers")} value={data.team_members ?? 0} icon={UsersIcon} color="indigo" />
        <KPICard title={t("enterprise.dashboards.manager.kpi.avgRetention")} value={`${data.avg_retention ?? 0}%`} icon={AcademicCapIcon} color="blue" />
        <KPICard title={t("enterprise.dashboards.manager.kpi.avgCompliance")} value={`${data.avg_compliance ?? 0}%`} icon={ShieldCheckIcon} color="green" />
        <KPICard
          title={t("enterprise.dashboards.manager.kpi.atRisk")}
          value={data.at_risk_count ?? 0}
          icon={ExclamationTriangleIcon}
          color="red"
          urgent={(data.at_risk_count ?? 0) > 0}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Learning Progress */}
        <Card className="border border-zinc-200/60 shadow-sm">
          <CardBody className="p-5">
            <Typography variant="h6" className="font-bold text-zinc-900 mb-4">{t("enterprise.dashboards.manager.learning.title")}</Typography>
            <div className="mb-3">
              <div className="flex justify-between mb-1">
                <Typography variant="small" className="text-zinc-600 font-semibold">{t("enterprise.dashboards.manager.learning.completionRate")}</Typography>
                <Typography variant="small" className="text-zinc-700 font-bold">{learning.completion_rate ?? 0}%</Typography>
              </div>
              <Progress value={learning.completion_rate ?? 0} size="md" color="indigo" />
            </div>
            {(learning.overdue_count ?? 0) > 0 && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mt-3">
                <ExclamationTriangleIcon className="h-4 w-4 text-red-600 flex-shrink-0" />
                <Typography variant="small" className="text-red-700 font-bold">
                  {t("enterprise.dashboards.manager.learning.overdueCount", { n: learning.overdue_count })}
                </Typography>
              </div>
            )}
          </CardBody>
        </Card>

        {/* At-Risk Members */}
        <Card className="border border-zinc-200/60 shadow-sm">
          <CardBody className="p-5">
            <Typography variant="h6" className="font-bold text-zinc-900 mb-4">{t("enterprise.dashboards.manager.atRisk.title")}</Typography>
            {atRisk.length === 0 ? (
              <EmptyState title={t("enterprise.dashboards.manager.atRisk.empty")} message={t("enterprise.dashboards.manager.atRisk.emptyMessage")} />
            ) : (
              <div className="space-y-2">
                {atRisk.slice(0, 5).map((member) => (
                  <div key={member.user_id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                    <div className="min-w-0 flex-1">
                      <Typography variant="small" className="font-bold text-zinc-800 truncate">{member.name}</Typography>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-zinc-400">{t("enterprise.dashboards.manager.atRisk.retention")}: <b>{member.retention_score}%</b></span>
                        <RiskBadge score={member.risk_score} />
                      </div>
                    </div>
                    <Button size="sm" variant="outlined" color="indigo" className="normal-case text-xs flex-shrink-0 ml-2 py-1 px-2">
                      {t("enterprise.dashboards.manager.atRisk.scheduleReview")}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Compliance Summary */}
      <Card className="border border-zinc-200/60 shadow-sm">
        <CardBody className="p-5">
          <Typography variant="h6" className="font-bold text-zinc-900 mb-4">{t("enterprise.dashboards.manager.compliance.title")}</Typography>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-zinc-900">{compliance.avg_rate ?? 0}%</div>
              <div className="text-xs font-semibold text-zinc-400">{t("enterprise.dashboards.manager.compliance.avgRate")}</div>
            </div>
            <div className="flex gap-3 flex-wrap">
              {gapCards.map((g) => (
                <div key={g.label} className={`px-4 py-2 rounded-xl bg-${g.color}-50 border border-${g.color}-100 text-center`}>
                  <div className={`text-xl font-extrabold text-${g.color}-700`}>{g.value}</div>
                  <div className={`text-xs font-semibold text-${g.color}-500`}>{g.label}</div>
                </div>
              ))}
            </div>
            {(data.overdue_reviews ?? 0) > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-xl">
                <CalendarDaysIcon className="h-4 w-4 text-red-600" />
                <span className="text-sm font-bold text-red-700">{t("enterprise.dashboards.manager.compliance.overdueReviews", { n: data.overdue_reviews })}</span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default ManagerDashboard;

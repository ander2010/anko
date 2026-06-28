import React, { useEffect, useState } from "react";
import { Typography, Card, CardBody, Button, Progress, Select, Option } from "@material-tailwind/react";
import { UsersIcon, AcademicCapIcon, ShieldCheckIcon, ExclamationTriangleIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { analyticsApi } from "../../api/enterpriseApi";
import { KPICard } from "../../components/KPICard";
import { EmptyState } from "../../components/EmptyState";
import { DashboardSkeleton } from "../../components/LoadingSkeleton";

function RiskBadge({ score }) {
  if (score > 60) return <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">⚠ High Risk</span>;
  if (score > 30) return <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Moderate</span>;
  return <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">Good</span>;
}

export function ManagerDashboard() {
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
  if (!data) return <EmptyState title="Could not load manager dashboard" />;

  const atRisk = data.at_risk_members || [];
  const learning = data.learning_progress || {};
  const compliance = data.compliance_summary || {};
  const teams = data.teams || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Typography variant="h5" className="font-extrabold text-zinc-900">Team Dashboard</Typography>
          <Typography variant="small" className="text-zinc-400">Monitor your team's knowledge retention</Typography>
        </div>
        {teams.length > 1 && (
          <div className="w-48">
            <Select label="Select Team" value={teamId} onChange={setTeamId}>
              <Option value="">All Teams</Option>
              {teams.map((t) => <Option key={t.id} value={String(t.id)}>{t.name}</Option>)}
            </Select>
          </div>
        )}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Team Members" value={data.team_members ?? 0} icon={UsersIcon} color="indigo" />
        <KPICard title="Avg Retention" value={`${data.avg_retention ?? 0}%`} icon={AcademicCapIcon} color="blue" />
        <KPICard title="Avg Compliance" value={`${data.avg_compliance ?? 0}%`} icon={ShieldCheckIcon} color="green" />
        <KPICard
          title="At Risk"
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
            <Typography variant="h6" className="font-bold text-zinc-900 mb-4">Team Learning Progress</Typography>
            <div className="mb-3">
              <div className="flex justify-between mb-1">
                <Typography variant="small" className="text-zinc-600 font-semibold">Completion Rate</Typography>
                <Typography variant="small" className="text-zinc-700 font-bold">{learning.completion_rate ?? 0}%</Typography>
              </div>
              <Progress value={learning.completion_rate ?? 0} size="md" color="indigo" />
            </div>
            {(learning.overdue_count ?? 0) > 0 && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mt-3">
                <ExclamationTriangleIcon className="h-4 w-4 text-red-600 flex-shrink-0" />
                <Typography variant="small" className="text-red-700 font-bold">
                  {learning.overdue_count} overdue assignments
                </Typography>
              </div>
            )}
          </CardBody>
        </Card>

        {/* At-Risk Members */}
        <Card className="border border-zinc-200/60 shadow-sm">
          <CardBody className="p-5">
            <Typography variant="h6" className="font-bold text-zinc-900 mb-4">At-Risk Members</Typography>
            {atRisk.length === 0 ? (
              <EmptyState title="No at-risk members" message="All team members are in good standing." />
            ) : (
              <div className="space-y-2">
                {atRisk.slice(0, 5).map((member) => (
                  <div key={member.user_id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                    <div className="min-w-0 flex-1">
                      <Typography variant="small" className="font-bold text-zinc-800 truncate">{member.name}</Typography>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-zinc-400">Retention: <b>{member.retention_score}%</b></span>
                        <RiskBadge score={member.risk_score} />
                      </div>
                    </div>
                    <Button size="sm" variant="outlined" color="indigo" className="normal-case text-xs flex-shrink-0 ml-2 py-1 px-2">
                      Schedule Review
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
          <Typography variant="h6" className="font-bold text-zinc-900 mb-4">Team Compliance Summary</Typography>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-zinc-900">{compliance.avg_rate ?? 0}%</div>
              <div className="text-xs font-semibold text-zinc-400">Avg Compliance Rate</div>
            </div>
            <div className="flex gap-3 flex-wrap">
              {[
                { label: "Critical Gaps", value: compliance.critical_gaps ?? 0, color: "red" },
                { label: "High Gaps", value: compliance.high_gaps ?? 0, color: "orange" },
                { label: "Medium Gaps", value: compliance.medium_gaps ?? 0, color: "amber" },
              ].map((g) => (
                <div key={g.label} className={`px-4 py-2 rounded-xl bg-${g.color}-50 border border-${g.color}-100 text-center`}>
                  <div className={`text-xl font-extrabold text-${g.color}-700`}>{g.value}</div>
                  <div className={`text-xs font-semibold text-${g.color}-500`}>{g.label}</div>
                </div>
              ))}
            </div>
            {(data.overdue_reviews ?? 0) > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-xl">
                <CalendarDaysIcon className="h-4 w-4 text-red-600" />
                <span className="text-sm font-bold text-red-700">{data.overdue_reviews} Overdue Reviews</span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default ManagerDashboard;

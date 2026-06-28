import React, { useEffect, useState } from "react";
import { Typography, Card, CardBody, Progress } from "@material-tailwind/react";
import {
  CpuChipIcon as BrainIcon, ShieldCheckIcon, AcademicCapIcon, ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { CpuChipIcon as BrainSolid, ShieldCheckIcon as ShieldSolid } from "@heroicons/react/24/solid";
import { analyticsApi } from "../../api/enterpriseApi";
import { KPICard } from "../../components/KPICard";
import { RetentionScoreGauge } from "../../components/RetentionScoreGauge";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";
import { DashboardSkeleton } from "../../components/LoadingSkeleton";
import {
  AcademicCapIcon as AcademicOutline,
  ClipboardDocumentCheckIcon,
  BoltIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function EmployeeDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.employeeDashboard()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (!data) return <EmptyState title="Could not load dashboard" message="Please try again later." />;

  const learning = data.learning_progress || {};
  const knowledge = data.knowledge_health || {};
  const compliance = data.compliance_status || {};
  const activity = data.recent_activity || [];

  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h5" className="font-extrabold text-zinc-900">My Dashboard</Typography>
        <Typography variant="small" className="text-zinc-400">Your personal knowledge retention overview</Typography>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          title="Retention Score"
          value={`${data.retention_score ?? 0}%`}
          subtitle="Knowledge retained"
          color="indigo"
          icon={AcademicOutline}
        />
        <KPICard
          title="Compliance Rate"
          value={`${data.compliance_rate ?? 0}%`}
          subtitle="Programs completed"
          color="green"
          icon={ClipboardDocumentCheckIcon}
        />
        <KPICard
          title="Active Certs"
          value={data.active_certifications ?? 0}
          subtitle="Valid certifications"
          color="blue"
          icon={AcademicCapIcon}
        />
        <KPICard
          title="Reviews Due"
          value={data.reviews_due ?? 0}
          subtitle={data.overdue_reviews > 0 ? `${data.overdue_reviews} overdue` : "Stay on track"}
          color={data.overdue_reviews > 0 ? "red" : "amber"}
          icon={CalendarDaysIcon}
          urgent={data.overdue_reviews > 0}
        />
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Learning Progress */}
        <Card className="border border-zinc-200/60 shadow-sm">
          <CardBody className="p-5">
            <Typography variant="h6" className="font-bold text-zinc-900 mb-4">Learning Progress</Typography>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "Completed", value: learning.completed ?? 0, color: "green" },
                { label: "In Progress", value: learning.in_progress ?? 0, color: "blue" },
                { label: "Pending", value: learning.pending ?? 0, color: "amber" },
                { label: "Overdue", value: learning.overdue ?? 0, color: "red" },
              ].map((s) => (
                <div key={s.label} className="bg-zinc-50 rounded-xl p-3 text-center">
                  <div className={`text-xl font-extrabold text-${s.color}-600`}>{s.value}</div>
                  <div className="text-xs font-semibold text-zinc-500">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {(learning.in_progress_paths || []).slice(0, 4).map((path) => (
                <div key={path.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-zinc-700">
                    <span className="truncate pr-2">{path.name}</span>
                    <span className="text-zinc-400 flex-shrink-0">{path.due_date || "No deadline"}</span>
                  </div>
                  <Progress value={path.progress ?? 0} size="sm" color="indigo" />
                </div>
              ))}
              {(learning.in_progress_paths || []).length === 0 && (
                <Typography variant="small" className="text-zinc-400 text-center py-2">No active paths</Typography>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Knowledge Health */}
        <Card className="border border-zinc-200/60 shadow-sm">
          <CardBody className="p-5">
            <Typography variant="h6" className="font-bold text-zinc-900 mb-4">Knowledge Health</Typography>
            <div className="flex justify-around mb-4">
              <RetentionScoreGauge score={knowledge.retention_score ?? 0} label="Retention" size="sm" />
              <RetentionScoreGauge score={100 - (knowledge.risk_score ?? 0)} label="Low Risk" size="sm" />
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
              <Typography variant="small" className="font-semibold text-zinc-700">Open Knowledge Gaps</Typography>
              <span className={`font-extrabold text-lg ${(knowledge.open_gaps ?? 0) > 0 ? "text-red-600" : "text-green-600"}`}>
                {knowledge.open_gaps ?? 0}
              </span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Compliance Status */}
        <Card className="border border-zinc-200/60 shadow-sm">
          <CardBody className="p-5">
            <Typography variant="h6" className="font-bold text-zinc-900 mb-4">Compliance Status</Typography>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Compliant", value: compliance.compliant ?? 0, color: "text-green-600" },
                { label: "Non-Compliant", value: compliance.non_compliant ?? 0, color: "text-red-600" },
                { label: "Pending", value: compliance.pending ?? 0, color: "text-amber-600" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                  <div className="text-xs font-semibold text-zinc-400">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {(compliance.expiring_items || []).slice(0, 4).map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-amber-50 border border-amber-100">
                  <Typography variant="small" className="font-semibold text-amber-800 truncate pr-2">{item.name}</Typography>
                  <Typography variant="small" className="text-amber-600 flex-shrink-0 text-xs">{item.expires_at}</Typography>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Recent Activity */}
        <Card className="border border-zinc-200/60 shadow-sm">
          <CardBody className="p-5">
            <Typography variant="h6" className="font-bold text-zinc-900 mb-4">Recent Activity</Typography>
            <div className="space-y-3">
              {activity.slice(0, 10).map((event, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BoltIcon className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Typography variant="small" className="text-zinc-700 font-medium leading-tight">{event.description}</Typography>
                    <Typography variant="small" className="text-zinc-400 text-xs">{timeAgo(event.timestamp)}</Typography>
                  </div>
                </div>
              ))}
              {activity.length === 0 && (
                <Typography variant="small" className="text-zinc-400 text-center py-4">No recent activity</Typography>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default EmployeeDashboard;

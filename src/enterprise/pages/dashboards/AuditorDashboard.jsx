import React, { useEffect, useState } from "react";
import { Typography, Card, CardBody } from "@material-tailwind/react";
import { ShieldCheckIcon, XCircleIcon, ClockIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { analyticsApi } from "../../api/enterpriseApi";
import { useLanguage } from "../../../context/language-context";
import { KPICard } from "../../components/KPICard";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";
import { DashboardSkeleton } from "../../components/LoadingSkeleton";

function rateColor(rate) {
  if (rate >= 80) return "text-green-700 bg-green-100 border-green-200";
  if (rate >= 60) return "text-amber-700 bg-amber-100 border-amber-200";
  return "text-red-700 bg-red-100 border-red-200";
}

function useTimeAgo() {
  const { t } = useLanguage();
  return (s) => {
    if (!s) return "";
    const d = new Date(s);
    const diff = Math.floor((Date.now() - d) / 1000);
    if (diff < 3600) return t("enterprise.dashboards.auditor.timeAgo.minutes", { n: Math.floor(diff / 60) });
    if (diff < 86400) return t("enterprise.dashboards.auditor.timeAgo.hours", { n: Math.floor(diff / 3600) });
    return t("enterprise.dashboards.auditor.timeAgo.days", { n: Math.floor(diff / 86400) });
  };
}

export function AuditorDashboard() {
  const { t } = useLanguage();
  const timeAgo = useTimeAgo();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.auditorDashboard().then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (!data) return <EmptyState title={t("enterprise.dashboards.auditor.notLoaded")} />;

  const programs = data.program_breakdown || [];
  const certs = data.certifications || {};
  const gaps = data.knowledge_gaps || {};
  const auditEvents = data.recent_audit_events || [];

  const gapRows = [
    { label: t("enterprise.dashboards.auditor.gaps.open"), value: gaps.open ?? 0, color: "red" },
    { label: t("enterprise.dashboards.auditor.gaps.critical"), value: gaps.critical ?? 0, color: "red" },
    { label: t("enterprise.dashboards.auditor.gaps.high"), value: gaps.high ?? 0, color: "orange" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h5" className="font-extrabold text-zinc-900">{t("enterprise.dashboards.auditor.title")}</Typography>
        <Typography variant="small" className="text-zinc-400">{t("enterprise.dashboards.auditor.subtitle")}</Typography>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title={t("enterprise.dashboards.auditor.kpi.complianceRate")} value={`${data.compliance_rate ?? 0}%`} icon={ShieldCheckIcon} color="green" />
        <KPICard title={t("enterprise.dashboards.auditor.kpi.nonCompliant")} value={data.non_compliant_count ?? 0} icon={XCircleIcon} color="red" urgent={(data.non_compliant_count ?? 0) > 0} />
        <KPICard title={t("enterprise.dashboards.auditor.kpi.expiring30d")} value={data.expiring_soon ?? 0} icon={ClockIcon} color="amber" />
        <KPICard title={t("enterprise.dashboards.auditor.kpi.criticalGaps")} value={data.critical_gaps ?? 0} icon={ExclamationTriangleIcon} color="red" urgent={(data.critical_gaps ?? 0) > 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Program Breakdown */}
        <Card className="border border-zinc-200/60 shadow-sm">
          <CardBody className="p-5">
            <Typography variant="h6" className="font-bold text-zinc-900 mb-4">{t("enterprise.dashboards.auditor.programBreakdown.title")}</Typography>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100">
                    <th className="text-left py-2 text-xs font-bold text-zinc-400 uppercase">{t("enterprise.dashboards.auditor.programBreakdown.program")}</th>
                    <th className="text-center py-2 text-xs font-bold text-zinc-400 uppercase">{t("enterprise.dashboards.auditor.programBreakdown.total")}</th>
                    <th className="text-center py-2 text-xs font-bold text-zinc-400 uppercase">{t("enterprise.dashboards.auditor.programBreakdown.compliant")}</th>
                    <th className="text-center py-2 text-xs font-bold text-zinc-400 uppercase">{t("enterprise.dashboards.auditor.programBreakdown.rate")}</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.map((p) => (
                    <tr key={p.code} className="border-b border-zinc-50 hover:bg-zinc-50">
                      <td className="py-2.5 font-semibold text-zinc-800 truncate max-w-[120px]">{p.name}</td>
                      <td className="py-2.5 text-center text-zinc-600">{p.total}</td>
                      <td className="py-2.5 text-center text-green-600 font-bold">{p.compliant}</td>
                      <td className="py-2.5 text-center">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${rateColor(p.rate)}`}>{p.rate}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {programs.length === 0 && <EmptyState title={t("enterprise.dashboards.auditor.programBreakdown.empty")} />}
            </div>
          </CardBody>
        </Card>

        {/* Certifications */}
        <Card className="border border-zinc-200/60 shadow-sm">
          <CardBody className="p-5">
            <Typography variant="h6" className="font-bold text-zinc-900 mb-4">{t("enterprise.dashboards.auditor.certifications.title")}</Typography>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-center">
                <div className="text-3xl font-extrabold text-green-700">{certs.active ?? 0}</div>
                <div className="text-xs font-bold text-green-500 mt-1">{t("enterprise.dashboards.auditor.certifications.active")}</div>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-center">
                <div className="text-3xl font-extrabold text-amber-700">{certs.expiring_30d ?? 0}</div>
                <div className="text-xs font-bold text-amber-500 mt-1">{t("enterprise.dashboards.auditor.certifications.expiring30d")}</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gaps Summary */}
        <Card className="border border-zinc-200/60 shadow-sm">
          <CardBody className="p-5">
            <Typography variant="h6" className="font-bold text-zinc-900 mb-4">{t("enterprise.dashboards.auditor.gaps.title")}</Typography>
            <div className="space-y-2">
              {gapRows.map((g) => (
                <div key={g.label} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                  <Typography variant="small" className="font-semibold text-zinc-700">{g.label} {t("enterprise.dashboards.auditor.gaps.suffix")}</Typography>
                  <span className={`text-lg font-extrabold text-${g.color}-600`}>{g.value}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Audit Events */}
        <Card className="border border-zinc-200/60 shadow-sm">
          <CardBody className="p-5">
            <Typography variant="h6" className="font-bold text-zinc-900 mb-4">{t("enterprise.dashboards.auditor.auditEvents.title")}</Typography>
            <div className="space-y-2">
              {auditEvents.slice(0, 8).map((e, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                    <ShieldCheckIcon className="h-3 w-3 text-zinc-500" />
                  </div>
                  <div>
                    <Typography variant="small" className="text-zinc-700 font-semibold leading-tight">{e.description}</Typography>
                    <Typography variant="small" className="text-zinc-400 text-xs">{e.user} · {timeAgo(e.timestamp)}</Typography>
                  </div>
                </div>
              ))}
              {auditEvents.length === 0 && <EmptyState title={t("enterprise.dashboards.auditor.auditEvents.empty")} />}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default AuditorDashboard;

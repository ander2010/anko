import React, { useEffect, useState } from "react";
import { Typography, Card, CardBody } from "@material-tailwind/react";
import ReactApexChart from "react-apexcharts";
import { complianceApi, analyticsApi } from "../../api/enterpriseApi";
import { KPICard } from "../../components/KPICard";
import { EmptyState } from "../../components/EmptyState";
import { DashboardSkeleton } from "../../components/LoadingSkeleton";

export function CompanyCompliance() {
  const [data, setData] = useState(null);
  const [expiring, setExpiring] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      complianceApi.companyCompliance(),
      complianceApi.expiringAssignments({ days: 30 }),
      analyticsApi.complianceTrends({ days: 90 }),
    ]).then(([d, e, t]) => {
      setData(d);
      setExpiring(e.results || e || []);
      setTrends(t.results || t || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const barOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "inherit" },
    plotOptions: { bar: { borderRadius: 4, columnWidth: "60%" } },
    colors: trends.map((t) => t.compliance_rate >= 80 ? "#16a34a" : t.compliance_rate >= 60 ? "#d97706" : "#dc2626"),
    xaxis: { categories: trends.map((t) => t.month || t.date), labels: { style: { fontSize: "11px" } } },
    yaxis: { max: 100, labels: { formatter: (v) => `${v}%` } },
    dataLabels: { enabled: false },
    grid: { borderColor: "#f3f4f6" },
    tooltip: { y: { formatter: (v) => `${v}%` } },
  };

  return (
      <div className="space-y-6">
        <Typography variant="h5" className="font-extrabold text-zinc-900">Company Compliance</Typography>

        {data && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <KPICard title="Avg Compliance Rate" value={`${data.avg_compliance_rate ?? 0}%`} color="green" />
            <KPICard title="Non-Compliant" value={data.non_compliant_count ?? 0} color="red" urgent={(data.non_compliant_count ?? 0) > 0} />
            <KPICard title="Expiring ≤30d" value={data.expiring_count ?? 0} color="amber" />
          </div>
        )}

        <Card className="border border-zinc-200/60 shadow-sm">
          <CardBody className="p-5">
            <Typography variant="h6" className="font-bold text-zinc-900 mb-4">Compliance Trend (90d)</Typography>
            {trends.length === 0 ? <EmptyState title="No trend data yet" /> : (
              <ReactApexChart
                options={barOptions}
                series={[{ name: "Compliance Rate", data: trends.map((t) => t.compliance_rate ?? 0) }]}
                type="bar" height={240}
              />
            )}
          </CardBody>
        </Card>

        {expiring.length > 0 && (
          <div>
            <Typography variant="h6" className="font-bold text-zinc-900 mb-3">Expiring Assignments (next 30 days)</Typography>
            <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-amber-50 border-b border-amber-100">
                  <tr>
                    {["User", "Program", "Expires", "Status"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-amber-700 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {expiring.map((a) => (
                    <tr key={a.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                      <td className="px-4 py-3 font-semibold text-zinc-800">{a.user_name}</td>
                      <td className="px-4 py-3 text-zinc-600">{a.program_name}</td>
                      <td className="px-4 py-3 text-amber-600 font-semibold text-xs">{a.expires_at}</td>
                      <td className="px-4 py-3"><span className="text-xs font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">Expiring</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
  );
}

export default CompanyCompliance;

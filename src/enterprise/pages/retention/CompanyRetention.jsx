import React, { useEffect, useState } from "react";
import { Typography, Card, CardBody } from "@material-tailwind/react";
import ReactApexChart from "react-apexcharts";
import { retentionApi, analyticsApi } from "../../api/enterpriseApi";
import { KPICard } from "../../components/KPICard";
import { EmptyState } from "../../components/EmptyState";
import { DashboardSkeleton } from "../../components/LoadingSkeleton";

export function CompanyRetention() {
  const [data, setData] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([retentionApi.companyRetention(), analyticsApi.retentionTrends({ days: 90 })])
      .then(([d, t]) => { setData(d); setTrends(t.results || t || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const lineOptions = {
    chart: { type: "line", toolbar: { show: false }, fontFamily: "inherit" },
    stroke: { curve: "smooth", width: [2, 2] },
    colors: ["#4f46e5", "#dc2626"],
    xaxis: { categories: trends.map((t) => t.date), labels: { style: { fontSize: "10px" }, rotate: -30 } },
    yaxis: { min: 0, max: 100, labels: { formatter: (v) => `${v}%` } },
    legend: { position: "top" },
    dataLabels: { enabled: false },
    grid: { borderColor: "#f3f4f6" },
    tooltip: { shared: true, y: { formatter: (v) => `${v}%` } },
  };

  return (
      <div className="space-y-6">
        <Typography variant="h5" className="font-extrabold text-zinc-900">Company Retention</Typography>

        {data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard title="Avg Retention" value={`${data.avg_retention ?? 0}%`} color="indigo" />
            <KPICard title="Avg Risk Score" value={`${data.avg_risk ?? 0}%`} color="red" />
            <KPICard title="Total Members" value={data.total_members ?? 0} color="blue" />
            <KPICard title="Open Gaps" value={data.open_gaps ?? 0} color="amber" />
          </div>
        )}

        <Card className="border border-zinc-200/60 shadow-sm">
          <CardBody className="p-5">
            <Typography variant="h6" className="font-bold text-zinc-900 mb-4">Retention Trend (90d)</Typography>
            {trends.length === 0 ? <EmptyState title="No trend data yet" /> : (
              <ReactApexChart
                options={lineOptions}
                series={[
                  { name: "Avg Retention", data: trends.map((t) => t.avg_retention ?? 0) },
                  { name: "Avg Risk", data: trends.map((t) => t.avg_risk ?? 0) },
                ]}
                type="line"
                height={260}
              />
            )}
          </CardBody>
        </Card>
      </div>
  );
}

export default CompanyRetention;

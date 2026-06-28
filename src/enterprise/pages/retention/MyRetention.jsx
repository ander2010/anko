import React, { useEffect, useState } from "react";
import { Typography, Card, CardBody, Button } from "@material-tailwind/react";
import ReactApexChart from "react-apexcharts";
import { retentionApi } from "../../api/enterpriseApi";
import { RetentionScoreGauge } from "../../components/RetentionScoreGauge";
import { EmptyState } from "../../components/EmptyState";
import { DashboardSkeleton } from "../../components/LoadingSkeleton";
import { useNavigate } from "react-router-dom";

export function MyRetention() {
  const [data, setData] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([retentionApi.myRetention(), retentionApi.snapshots()])
      .then(([r, s]) => { setData(r); setSnapshots(s.results || s || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (!data) return <EmptyState title="No retention data yet" message="Complete assessments to build your retention profile." />;

  const areaOptions = {
    chart: { type: "area", toolbar: { show: false }, fontFamily: "inherit" },
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { opacityFrom: 0.4, opacityTo: 0.05 } },
    colors: ["#4f46e5"],
    xaxis: { categories: snapshots.map((s) => s.created_at ? new Date(s.created_at).toLocaleDateString() : ""), labels: { style: { fontSize: "10px" } } },
    yaxis: { min: 0, max: 100, labels: { formatter: (v) => `${v}%` } },
    dataLabels: { enabled: false },
    grid: { borderColor: "#f3f4f6" },
    tooltip: { y: { formatter: (v) => `${v}%` } },
  };

  return (
    <div className="space-y-6">
      <Typography variant="h5" className="font-extrabold text-zinc-900">My Retention</Typography>

      {/* Score gauges */}
      <Card className="border border-zinc-200/60 shadow-sm">
        <CardBody className="p-6">
          <div className="flex flex-wrap justify-around gap-8">
            <RetentionScoreGauge score={data.retention_score ?? 0} label="Retention Score" size="lg" />
            <RetentionScoreGauge score={100 - (data.risk_score ?? 0)} label="Low Risk" size="lg" />
            <RetentionScoreGauge score={data.confidence_score ?? 0} label="Confidence" size="lg" />
          </div>
        </CardBody>
      </Card>

      {/* Trend chart */}
      {snapshots.length > 0 && (
        <Card className="border border-zinc-200/60 shadow-sm">
          <CardBody className="p-5">
            <Typography variant="h6" className="font-bold text-zinc-900 mb-4">Retention Over Time</Typography>
            <ReactApexChart
              options={areaOptions}
              series={[{ name: "Retention Score", data: snapshots.map((s) => s.retention_score ?? 0) }]}
              type="area"
              height={200}
            />
          </CardBody>
        </Card>
      )}

      {/* Open gaps */}
      <Card className="border border-zinc-200/60 shadow-sm">
        <CardBody className="p-5 flex items-center justify-between">
          <div>
            <Typography variant="small" className="text-zinc-400 font-semibold">Open Knowledge Gaps</Typography>
            <div className={`text-3xl font-extrabold ${(data.open_gaps ?? 0) > 0 ? "text-red-600" : "text-green-600"}`}>
              {data.open_gaps ?? 0}
            </div>
          </div>
          <Button variant="outlined" color="indigo" className="normal-case" onClick={() => navigate("/enterprise/learning/knowledge-gaps")}>
            View Gaps
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}

export default MyRetention;

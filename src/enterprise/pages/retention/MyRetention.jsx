import React, { useEffect, useState } from "react";
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
    chart: { type: "area", toolbar: { show: false }, fontFamily: "inherit", background: "transparent" },
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { opacityFrom: 0.4, opacityTo: 0.05 } },
    colors: ["#818CF8"],
    xaxis: { categories: snapshots.map((s) => s.created_at ? new Date(s.created_at).toLocaleDateString() : ""), labels: { style: { fontSize: "10px", colors: "#64748B" } } },
    yaxis: { min: 0, max: 100, labels: { formatter: (v) => `${v}%`, style: { colors: "#64748B" } } },
    dataLabels: { enabled: false },
    grid: { borderColor: "rgba(255,255,255,0.07)" },
    tooltip: { theme: "dark", y: { formatter: (v) => `${v}%` } },
  };

  return (
    <div className="space-y-5">
      <h1 style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 800 }}>My Retention</h1>

      {/* Score gauges */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
        <div className="flex flex-wrap justify-around gap-8">
          <RetentionScoreGauge score={data.retention_score ?? 0} label="Retention Score" size="lg" />
          <RetentionScoreGauge score={100 - (data.risk_score ?? 0)} label="Low Risk" size="lg" />
          <RetentionScoreGauge score={data.confidence_score ?? 0} label="Confidence" size="lg" />
        </div>
      </div>

      {/* Trend chart */}
      {snapshots.length > 0 && (
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>Retention Over Time</p>
          <ReactApexChart
            options={areaOptions}
            series={[{ name: "Retention Score", data: snapshots.map((s) => s.retention_score ?? 0) }]}
            type="area"
            height={200}
          />
        </div>
      )}

      {/* Open gaps */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }} className="flex items-center justify-between">
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)" }}>Open Knowledge Gaps</p>
          <div style={{ fontSize: 28, fontWeight: 800, color: (data.open_gaps ?? 0) > 0 ? "#f87171" : "#4ade80" }}>
            {data.open_gaps ?? 0}
          </div>
        </div>
        <button onClick={() => navigate("/enterprise/learning/knowledge-gaps")} className="ank-btn-ghost text-xs">
          View Gaps
        </button>
      </div>
    </div>
  );
}

export default MyRetention;

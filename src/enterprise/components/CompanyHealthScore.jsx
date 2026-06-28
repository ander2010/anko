import React from "react";
import ReactApexChart from "react-apexcharts";
import { Typography } from "@material-tailwind/react";

function healthColor(score) {
  if (score >= 90) return "#16a34a";
  if (score >= 70) return "#2563eb";
  if (score >= 50) return "#d97706";
  return "#dc2626";
}

function healthLabel(score) {
  if (score >= 90) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs Attention";
  return "At Risk";
}

export function CompanyHealthScore({ score = 0, breakdown = {} }) {
  const color = healthColor(score);
  const components = [
    { label: "Compliance", weight: "40%", value: breakdown.compliance },
    { label: "Retention", weight: "30%", value: breakdown.retention },
    { label: "Certifications", weight: "20%", value: breakdown.certifications },
    { label: "No Critical Gaps", weight: "10%", value: breakdown.no_critical_gaps },
  ];

  const options = {
    chart: { type: "donut", sparkline: { enabled: false } },
    labels: components.map((c) => c.label),
    colors: [color, `${color}cc`, `${color}99`, `${color}66`],
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Health Score",
              fontSize: "12px",
              color: "#6b7280",
              formatter: () => `${Math.round(score)}`,
              fontWeight: 800,
              fontsize: "28px",
            },
            value: {
              fontSize: "28px",
              fontWeight: 800,
              color: "#111827",
              formatter: () => `${Math.round(score)}`,
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { width: 0 },
    tooltip: {
      y: { formatter: (v) => `${Math.round(v)}` },
    },
  };

  const series = [40, 30, 20, 10];

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm p-6">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="relative">
          <ReactApexChart options={options} series={series} type="donut" width={240} height={240} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-4xl font-extrabold text-zinc-900">{Math.round(score)}</span>
            <span className="text-xs font-bold" style={{ color }}>{healthLabel(score)}</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <Typography variant="h5" className="font-extrabold text-zinc-900 mb-4">Company Health</Typography>
          {components.map((c, i) => (
            <div key={c.label} className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: options.colors[i] }} />
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-semibold text-zinc-700">{c.label}</span>
                  <span className="text-xs text-zinc-400">{c.weight} weight</span>
                </div>
                <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${c.value ?? 0}%`, background: options.colors[i] }} />
                </div>
              </div>
              <span className="text-sm font-bold text-zinc-700 w-10 text-right">{c.value ?? "—"}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CompanyHealthScore;

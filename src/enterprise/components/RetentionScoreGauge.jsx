import React from "react";
import ReactApexChart from "react-apexcharts";
import { Typography } from "@material-tailwind/react";

function scoreColor(score) {
  if (score >= 70) return "#16a34a";
  if (score >= 40) return "#d97706";
  return "#dc2626";
}

function scoreLabel(score) {
  if (score >= 70) return "Good";
  if (score >= 40) return "Moderate";
  return "At Risk";
}

export function RetentionScoreGauge({ score = 0, label = "Retention Score", size = "md" }) {
  const color = scoreColor(score);
  const h = size === "sm" ? 120 : size === "lg" ? 220 : 160;

  const options = {
    chart: { type: "radialBar", sparkline: { enabled: true } },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: { size: "60%" },
        track: { background: "#f3f4f6", strokeWidth: "97%" },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 8,
            fontSize: size === "lg" ? "28px" : "22px",
            fontWeight: 800,
            color: "#111827",
            formatter: (v) => `${Math.round(v)}`,
          },
        },
      },
    },
    fill: { colors: [color] },
    stroke: { lineCap: "round" },
  };

  return (
    <div className="flex flex-col items-center">
      <ReactApexChart options={options} series={[Math.min(100, Math.max(0, score))]} type="radialBar" height={h} />
      <Typography variant="small" className="font-bold text-zinc-600 -mt-4">
        {label}
      </Typography>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1`} style={{ background: `${color}20`, color }}>
        {scoreLabel(score)}
      </span>
    </div>
  );
}

export default RetentionScoreGauge;

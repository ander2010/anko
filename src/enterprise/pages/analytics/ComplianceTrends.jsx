import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { analyticsApi } from "../../api/enterpriseApi";
import { EmptyState } from "../../components/EmptyState";

export function ComplianceTrends() {
  const [data, setData] = useState([]);
  const [days, setDays] = useState("90");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    analyticsApi.complianceTrends({ days }).then((d) => setData(d.results || d || [])).catch(() => {}).finally(() => setLoading(false));
  }, [days]);

  const options = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "inherit", background: "transparent" },
    plotOptions: { bar: { borderRadius: 4, columnWidth: "60%" } },
    colors: data.map((d) => d.compliance_rate >= 80 ? "#4ade80" : d.compliance_rate >= 60 ? "#f59e0b" : "#f87171"),
    xaxis: { categories: data.map((d) => d.month || d.date), labels: { style: { fontSize: "11px", colors: "#64748B" } } },
    yaxis: { min: 0, max: 100, labels: { formatter: (v) => `${v}%`, style: { colors: "#64748B" } } },
    dataLabels: { enabled: false },
    grid: { borderColor: "rgba(255,255,255,0.07)" },
    tooltip: { theme: "dark", y: { formatter: (v) => `${v}% compliance` }, custom: ({ dataPointIndex }) => {
      const row = data[dataPointIndex];
      return `<div style="padding:8px 10px;font-size:11px;background:#0F172A;color:#E2E8F0;border:1px solid rgba(255,255,255,0.1);border-radius:6px;"><div>${row?.month || row?.date}</div><div>Total: ${row?.total}</div><div>Compliant: ${row?.compliant}</div><div>Rate: ${row?.compliance_rate}%</div></div>`;
    }},
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 800 }}>Compliance Trends</h1>
        <select value={days} onChange={(e) => setDays(e.target.value)}
          style={{ fontSize: 12, background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, padding: "7px 10px", color: "var(--text-secondary)", outline: "none", cursor: "pointer" }}>
          {["30", "60", "90", "180"].map((d) => <option key={d} value={d}>{d} days</option>)}
        </select>
      </div>

      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
        {loading ? (
          <div style={{ height: 256 }} className="flex items-center justify-center">
            <div style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} className="animate-spin h-8 w-8 rounded-full border-2" />
          </div>
        ) : data.length === 0 ? <EmptyState title="No compliance trend data" /> : (
          <ReactApexChart
            options={options}
            series={[{ name: "Compliance Rate", data: data.map((d) => d.compliance_rate ?? 0) }]}
            type="bar" height={300}
          />
        )}
      </div>
    </div>
  );
}

export default ComplianceTrends;

import React, { useEffect, useState } from "react";
import { Typography, Card, CardBody, Select, Option } from "@material-tailwind/react";
import ReactApexChart from "react-apexcharts";
import { analyticsApi } from "../../api/enterpriseApi";
import { EmptyState } from "../../components/EmptyState";

export function RetentionTrends() {
  const [data, setData] = useState([]);
  const [days, setDays] = useState("90");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    analyticsApi.retentionTrends({ days }).then((d) => setData(d.results || d || [])).catch(() => {}).finally(() => setLoading(false));
  }, [days]);

  const options = {
    chart: { type: "line", toolbar: { show: false }, fontFamily: "inherit" },
    stroke: { curve: "smooth", width: [2, 2] },
    colors: ["#4f46e5", "#dc2626"],
    xaxis: { categories: data.map((t) => t.date), labels: { style: { fontSize: "10px" }, rotate: -30 } },
    yaxis: { min: 0, max: 100, labels: { formatter: (v) => `${v}%` } },
    legend: { position: "top" },
    dataLabels: { enabled: false },
    grid: { borderColor: "#f3f4f6" },
    tooltip: { shared: true, y: { formatter: (v) => `${v}%` } },
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Typography variant="h5" className="font-extrabold text-zinc-900">Retention Trends</Typography>
          <div className="w-32">
            <Select label="Period" value={days} onChange={setDays}>
              {["30", "60", "90", "180"].map((d) => <Option key={d} value={d}>{d} days</Option>)}
            </Select>
          </div>
        </div>

        <Card className="border border-zinc-200/60 shadow-sm">
          <CardBody className="p-5">
            {loading ? (
              <div className="h-64 flex items-center justify-center"><div className="animate-spin h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent" /></div>
            ) : data.length === 0 ? <EmptyState title="No trend data yet" /> : (
              <ReactApexChart
                options={options}
                series={[
                  { name: "Avg Retention", data: data.map((t) => t.avg_retention ?? 0) },
                  { name: "Avg Risk", data: data.map((t) => t.avg_risk ?? 0) },
                ]}
                type="line" height={320}
              />
            )}
          </CardBody>
        </Card>

        {data.length > 0 && (
          <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  {["Date", "Avg Retention", "Avg Risk", "Snapshots"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-zinc-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(-10).reverse().map((row, i) => (
                  <tr key={i} className="border-b border-zinc-50 hover:bg-zinc-50">
                    <td className="px-4 py-2 text-zinc-600 text-xs">{row.date}</td>
                    <td className="px-4 py-2 font-bold text-indigo-600">{row.avg_retention ?? 0}%</td>
                    <td className="px-4 py-2 font-bold text-red-500">{row.avg_risk ?? 0}%</td>
                    <td className="px-4 py-2 text-zinc-500">{row.snapshot_count ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
  );
}

export default RetentionTrends;

import React, { useEffect, useState } from "react";
import { Typography, Card, CardBody, Select, Option } from "@material-tailwind/react";
import ReactApexChart from "react-apexcharts";
import { analyticsApi } from "../../api/enterpriseApi";
import { EmptyState } from "../../components/EmptyState";

export function LearningTrends() {
  const [data, setData] = useState([]);
  const [days, setDays] = useState("90");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    analyticsApi.learningTrends({ days }).then((d) => setData(d.results || d || [])).catch(() => {}).finally(() => setLoading(false));
  }, [days]);

  const options = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "inherit" },
    plotOptions: { bar: { borderRadius: 4, columnWidth: "60%" } },
    colors: ["#4f46e5"],
    xaxis: { categories: data.map((d) => d.week || d.date), labels: { style: { fontSize: "11px" } } },
    yaxis: { labels: { formatter: (v) => Math.round(v) } },
    dataLabels: { enabled: false },
    grid: { borderColor: "#f3f4f6" },
    tooltip: { y: { formatter: (v) => `${v} completions` } },
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Typography variant="h5" className="font-extrabold text-zinc-900">Learning Trends</Typography>
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
            ) : data.length === 0 ? <EmptyState title="No learning trend data" /> : (
              <ReactApexChart
                options={options}
                series={[{ name: "Completions", data: data.map((d) => d.count ?? d.completions ?? 0) }]}
                type="bar" height={300}
              />
            )}
          </CardBody>
        </Card>
      </div>
  );
}

export default LearningTrends;

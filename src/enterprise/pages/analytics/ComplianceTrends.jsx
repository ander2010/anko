import React, { useEffect, useState } from "react";
import { Typography, Card, CardBody, Select, Option } from "@material-tailwind/react";
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
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "inherit" },
    plotOptions: { bar: { borderRadius: 4, columnWidth: "60%" } },
    colors: data.map((d) => d.compliance_rate >= 80 ? "#16a34a" : d.compliance_rate >= 60 ? "#d97706" : "#dc2626"),
    xaxis: { categories: data.map((d) => d.month || d.date), labels: { style: { fontSize: "11px" } } },
    yaxis: { min: 0, max: 100, labels: { formatter: (v) => `${v}%` } },
    dataLabels: { enabled: false },
    grid: { borderColor: "#f3f4f6" },
    tooltip: { y: { formatter: (v) => `${v}% compliance`, custom: ({ dataPointIndex }) => {
      const row = data[dataPointIndex];
      return `<div class="p-2 text-xs"><div>${row?.month || row?.date}</div><div>Total: ${row?.total}</div><div>Compliant: ${row?.compliant}</div><div>Rate: ${row?.compliance_rate}%</div></div>`;
    }}},
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Typography variant="h5" className="font-extrabold text-zinc-900">Compliance Trends</Typography>
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
            ) : data.length === 0 ? <EmptyState title="No compliance trend data" /> : (
              <ReactApexChart
                options={options}
                series={[{ name: "Compliance Rate", data: data.map((d) => d.compliance_rate ?? 0) }]}
                type="bar" height={300}
              />
            )}
          </CardBody>
        </Card>
      </div>
  );
}

export default ComplianceTrends;

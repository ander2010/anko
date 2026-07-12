import React, { useEffect, useState } from "react";
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
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "inherit", background: "transparent" },
    plotOptions: { bar: { borderRadius: 4, columnWidth: "60%" } },
    colors: trends.map((t) => t.compliance_rate >= 80 ? "#4ade80" : t.compliance_rate >= 60 ? "#f59e0b" : "#f87171"),
    xaxis: { categories: trends.map((t) => t.month || t.date), labels: { style: { fontSize: "11px", colors: "#64748B" } } },
    yaxis: { max: 100, labels: { formatter: (v) => `${v}%`, style: { colors: "#64748B" } } },
    dataLabels: { enabled: false },
    grid: { borderColor: "rgba(255,255,255,0.07)" },
    tooltip: { theme: "dark", y: { formatter: (v) => `${v}%` } },
  };

  return (
    <div className="space-y-5">
      <h1 style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 800 }}>Company Compliance</h1>

      {data && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <KPICard title="Avg Compliance Rate" value={`${data.avg_compliance_rate ?? 0}%`} color="green" />
          <KPICard title="Non-Compliant" value={data.non_compliant_count ?? 0} color="red" urgent={(data.non_compliant_count ?? 0) > 0} />
          <KPICard title="Expiring ≤30d" value={data.expiring_count ?? 0} color="amber" />
        </div>
      )}

      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>Compliance Trend (90d)</p>
        {trends.length === 0 ? <EmptyState title="No trend data yet" /> : (
          <ReactApexChart
            options={barOptions}
            series={[{ name: "Compliance Rate", data: trends.map((t) => t.compliance_rate ?? 0) }]}
            type="bar" height={240}
          />
        )}
      </div>

      {expiring.length > 0 && (
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>Expiring Assignments (next 30 days)</p>
          <div style={{ background: "var(--bg-surface)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table className="w-full" style={{ fontSize: 13, borderCollapse: "collapse" }}>
                <thead style={{ background: "rgba(245,158,11,0.08)", borderBottom: "1px solid rgba(245,158,11,0.2)" }}>
                  <tr>
                    {["User", "Program", "Expires", "Status"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 10, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {expiring.map((a) => (
                    <tr key={a.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-primary)" }}>{a.user_name}</td>
                      <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{a.program_name}</td>
                      <td style={{ padding: "12px 16px", color: "#f59e0b", fontWeight: 600, fontSize: 11 }}>{a.expires_at}</td>
                      <td style={{ padding: "12px 16px" }}><span style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", padding: "2px 9px", borderRadius: 20 }}>Expiring</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompanyCompliance;

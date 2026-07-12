import React, { useEffect, useState } from "react";
import { analyticsApi } from "../../api/enterpriseApi";
import { CompanyHealthScore } from "../../components/CompanyHealthScore";
import { EmptyState } from "../../components/EmptyState";

const TIER_TONE = {
  green:  { bg: "rgba(74,222,128,0.1)",  text: "#4ade80", border: "rgba(74,222,128,0.35)" },
  blue:   { bg: "rgba(99,102,241,0.1)",  text: "#818CF8", border: "rgba(99,102,241,0.35)" },
  amber:  { bg: "rgba(245,158,11,0.1)",  text: "#f59e0b", border: "rgba(245,158,11,0.35)" },
  red:    { bg: "rgba(239,68,68,0.1)",   text: "#f87171", border: "rgba(239,68,68,0.35)" },
};

export function CompanyHealth() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.companyHealth().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <h1 style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 800 }}>Company Health Score</h1>
      {loading ? (
        <div style={{ padding: "80px 0" }} className="flex items-center justify-center">
          <div style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} className="animate-spin h-8 w-8 rounded-full border-2" />
        </div>
      ) : !data ? (
        <EmptyState title="No health data available" />
      ) : (
        <>
          <CompanyHealthScore
            score={data.health_score ?? 0}
            breakdown={{
              compliance: data.compliance_rate ?? 0,
              retention: data.avg_retention ?? 0,
              certifications: data.cert_coverage ?? 0,
              no_critical_gaps: data.no_critical_gaps_score ?? 0,
            }}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
            {[
              { label: "90–100: Excellent", tone: "green", current: data.health_score >= 90 },
              { label: "70–89: Good", tone: "blue", current: data.health_score >= 70 && data.health_score < 90 },
              { label: "50–69: Needs Attention", tone: "amber", current: data.health_score >= 50 && data.health_score < 70 },
              { label: "< 50: At Risk", tone: "red", current: data.health_score < 50 },
            ].map((tier) => {
              const c = TIER_TONE[tier.tone];
              return (
                <div key={tier.label} style={{
                  padding: "12px 16px", borderRadius: 10, fontSize: 13,
                  background: tier.current ? c.bg : "var(--bg-surface)",
                  color: tier.current ? c.text : "var(--text-tertiary)",
                  border: `1px solid ${tier.current ? c.border : "var(--border)"}`,
                  fontWeight: tier.current ? 700 : 400,
                }}>
                  {tier.label} {tier.current && "← current"}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default CompanyHealth;

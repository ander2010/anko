import React, { useEffect, useState } from "react";
import { Typography } from "@material-tailwind/react";
import { analyticsApi } from "../../api/enterpriseApi";
import { CompanyHealthScore } from "../../components/CompanyHealthScore";
import { EmptyState } from "../../components/EmptyState";

export function CompanyHealth() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.companyHealth().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
      <div className="space-y-6">
        <Typography variant="h5" className="font-extrabold text-zinc-900">Company Health Score</Typography>
        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent" /></div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {[
                { label: "90–100: Excellent", color: "bg-green-100 text-green-800", current: data.health_score >= 90 },
                { label: "70–89: Good", color: "bg-blue-100 text-blue-800", current: data.health_score >= 70 && data.health_score < 90 },
                { label: "50–69: Needs Attention", color: "bg-amber-100 text-amber-800", current: data.health_score >= 50 && data.health_score < 70 },
                { label: "< 50: At Risk", color: "bg-red-100 text-red-800", current: data.health_score < 50 },
              ].map((tier) => (
                <div key={tier.label} className={`px-4 py-3 rounded-xl border ${tier.current ? tier.color + " border-current font-bold ring-2 ring-offset-1" : "bg-zinc-50 text-zinc-400 border-zinc-100"}`}>
                  {tier.label} {tier.current && "← current"}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
  );
}

export default CompanyHealth;

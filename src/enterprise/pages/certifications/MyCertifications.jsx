import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import { certApi } from "../../api/enterpriseApi";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";
import { DashboardSkeleton } from "../../components/LoadingSkeleton";

export function MyCertifications() {
  const [certs, setCerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([certApi.myCertifications(), certApi.myStats()])
      .then(([c, s]) => { setCerts(c.results || c || []); setStats(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-5">
      <h1 style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 800 }}>My Certifications</h1>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Active", value: stats.active, color: "#4ade80" },
            { label: "Expiring", value: stats.expiring, color: "#f59e0b" },
            { label: "Expired", value: stats.expired, color: "#8B8B9C" },
            { label: "Revoked", value: stats.revoked, color: "#f87171" },
          ].map((s) => (
            <div key={s.label} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value ?? 0}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Cert cards */}
      {certs.length === 0 ? (
        <EmptyState icon={AcademicCapIcon} title="No certifications yet" message="Complete compliance programs or assessments to earn certifications." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {certs.map((cert) => {
            const warn = cert.status === "expiring";
            const danger = cert.status === "expired" || cert.status === "revoked";
            return (
              <div key={cert.id}
                style={{ background: "var(--bg-surface)", border: `1px solid ${warn ? "rgba(245,158,11,0.3)" : danger ? "rgba(239,68,68,0.3)" : "var(--border)"}`, borderRadius: 12, padding: 18 }}
                className="space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>{cert.template_name}</p>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#818CF8", textTransform: "capitalize", marginTop: 2 }}>{cert.template_type}</p>
                  </div>
                  <StatusBadge status={cert.status} />
                </div>

                <p style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>#{cert.certificate_number}</p>

                <div style={{ fontSize: 11, color: "var(--text-secondary)" }} className="space-y-1">
                  <div>Issued: <span style={{ fontWeight: 600 }}>{cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : "—"}</span></div>
                  <div>Expires: <span style={{ fontWeight: 600 }}>{cert.expires_at ? new Date(cert.expires_at).toLocaleDateString() : "No expiry"}</span></div>
                  {cert.score != null && <div>Score: <span style={{ fontWeight: 700, color: "#818CF8" }}>{cert.score}%</span></div>}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => navigate(`/enterprise/certifications/${cert.id}`)}
                    style={{ flex: 1, fontSize: 11, fontWeight: 700, color: "#818CF8", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 6, padding: "7px 0", cursor: "pointer" }}>
                    View
                  </button>
                  <button style={{ flex: 1, fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "7px 0", cursor: "pointer" }}>
                    Verify
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyCertifications;

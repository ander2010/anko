import React, { useEffect, useState } from "react";
import { Typography, Card, CardBody, Button } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import { certApi } from "../../api/enterpriseApi";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";
import { DashboardSkeleton, KPICardSkeleton } from "../../components/LoadingSkeleton";

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
    <div className="space-y-6">
      <Typography variant="h5" className="font-extrabold text-zinc-900">My Certifications</Typography>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active ✅", value: stats.active, color: "text-green-600" },
            { label: "Expiring 🟡", value: stats.expiring, color: "text-amber-600" },
            { label: "Expired ⏰", value: stats.expired, color: "text-gray-600" },
            { label: "Revoked ❌", value: stats.revoked, color: "text-red-600" },
          ].map((s) => (
            <Card key={s.label} className="border border-zinc-200/60 shadow-sm">
              <CardBody className="p-4 text-center">
                <div className={`text-3xl font-extrabold ${s.color}`}>{s.value ?? 0}</div>
                <div className="text-xs font-semibold text-zinc-400 mt-1">{s.label}</div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Cert cards */}
      {certs.length === 0 ? (
        <EmptyState icon={AcademicCapIcon} title="No certifications yet" message="Complete compliance programs or assessments to earn certifications." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certs.map((cert) => (
            <Card
              key={cert.id}
              className={`border shadow-sm ${cert.status === "expiring" ? "border-amber-200" : cert.status === "expired" || cert.status === "revoked" ? "border-red-200" : "border-zinc-200/60"}`}
            >
              <CardBody className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Typography variant="h6" className="font-bold text-zinc-900 text-sm leading-tight">{cert.template_name}</Typography>
                    <Typography variant="small" className="text-xs text-indigo-600 font-bold capitalize mt-0.5">{cert.template_type}</Typography>
                  </div>
                  <StatusBadge status={cert.status} />
                </div>

                <Typography variant="small" className="font-mono text-zinc-400 text-xs truncate">#{cert.certificate_number}</Typography>

                <div className="text-xs text-zinc-500 space-y-0.5">
                  <div>Issued: <span className="font-semibold">{cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : "—"}</span></div>
                  <div>Expires: <span className="font-semibold">{cert.expires_at ? new Date(cert.expires_at).toLocaleDateString() : "No expiry"}</span></div>
                  {cert.score != null && <div>Score: <span className="font-bold text-indigo-600">{cert.score}%</span></div>}
                </div>

                <div className="flex gap-2">
                  <Button size="sm" color="indigo" variant="outlined" className="normal-case text-xs flex-1" onClick={() => navigate(`/enterprise/certifications/${cert.id}`)}>
                    View
                  </Button>
                  <Button size="sm" color="zinc" variant="text" className="normal-case text-xs flex-1">
                    Verify
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyCertifications;

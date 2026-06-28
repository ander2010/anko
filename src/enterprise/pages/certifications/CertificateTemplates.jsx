import React, { useEffect, useState } from "react";
import { Typography, Button } from "@material-tailwind/react";
import { PlusIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { certApi } from "../../api/enterpriseApi";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";
import { TableSkeleton } from "../../components/LoadingSkeleton";

export function CertificateTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => {
    certApi.getTemplates().then((d) => setTemplates(d.results || d || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggle = async (t) => {
    if (t.is_active) await certApi.deactivateTemplate(t.id);
    else await certApi.activateTemplate(t.id);
    load();
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Typography variant="h5" className="font-extrabold text-zinc-900">Certificate Templates</Typography>
          <Button color="indigo" className="normal-case flex items-center gap-2" onClick={() => navigate("/enterprise/certifications/templates/new")}>
            <PlusIcon className="h-4 w-4" /> New Template
          </Button>
        </div>

        {loading ? <TableSkeleton rows={4} cols={6} /> : templates.length === 0 ? (
          <EmptyState icon={AcademicCapIcon} title="No templates" message="Create your first certificate template." action="New Template" onAction={() => navigate("/enterprise/certifications/templates/new")} />
        ) : (
          <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  {["Code", "Name", "Type", "Validity", "Req. Score", "Active", "Issued", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-zinc-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">{t.code}</td>
                    <td className="px-4 py-3 font-semibold text-zinc-800">{t.name}</td>
                    <td className="px-4 py-3 text-zinc-500 capitalize">{t.certificate_type}</td>
                    <td className="px-4 py-3 text-zinc-500">{t.validity_days === 0 ? "No expiry" : `${t.validity_days}d`}</td>
                    <td className="px-4 py-3 text-zinc-500">{t.requires_score ? `${t.minimum_score}%` : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${t.is_active ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
                        {t.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{t.issued_count ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        <Button size="sm" variant="text" color="indigo" className="normal-case text-xs py-1 px-2" onClick={() => navigate(`/enterprise/certifications/templates/${t.id}/edit`)}>Edit</Button>
                        <Button size="sm" variant="text" color={t.is_active ? "zinc" : "green"} className="normal-case text-xs py-1 px-2" onClick={() => toggle(t)}>
                          {t.is_active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button size="sm" variant="text" color="indigo" className="normal-case text-xs py-1 px-2">Issue</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
  );
}

export default CertificateTemplates;

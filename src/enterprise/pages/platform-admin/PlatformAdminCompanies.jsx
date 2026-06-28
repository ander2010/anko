import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Button } from "@material-tailwind/react";
import {
  PlusIcon, MagnifyingGlassIcon, BuildingOffice2Icon,
  UsersIcon, PencilIcon, TrashIcon, XMarkIcon,
} from "@heroicons/react/24/outline";
import { companyApi } from "../../api/enterpriseApi";

const INDUSTRIES = [
  { value: "aviation",      label: "Aviation" },
  { value: "healthcare",    label: "Healthcare" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "logistics",     label: "Logistics" },
  { value: "technology",    label: "Technology" },
  { value: "finance",       label: "Finance" },
  { value: "education",     label: "Education" },
  { value: "other",         label: "Other" },
];

const COMPANY_SIZES = [
  { value: "1_10",      label: "1–10 empleados" },
  { value: "11_50",     label: "11–50 empleados" },
  { value: "51_200",    label: "51–200 empleados" },
  { value: "201_500",   label: "201–500 empleados" },
  { value: "501_1000",  label: "501–1,000 empleados" },
  { value: "1000_plus", label: "1,000+ empleados" },
];

const SIZE_LABELS = Object.fromEntries(COMPANY_SIZES.map((s) => [s.value, s.label]));
const INDUSTRY_LABELS = Object.fromEntries(INDUSTRIES.map((i) => [i.value, i.label]));

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const inputCls = "w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-xl outline-none focus:border-indigo-500 bg-white text-zinc-800 transition-colors";
const labelCls = "block text-xs font-semibold text-zinc-500 mb-1";

/* ── Create Company Modal ── */
function CreateCompanyModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Auto-generate slug from name unless the user manually edited it
  const handleNameChange = (value) => {
    setName(value);
    if (!slugEdited) setSlug(slugify(value));
  };

  const handleSlugChange = (value) => {
    setSlug(value);
    setSlugEdited(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setError("Nombre y slug son obligatorios."); return;
    }
    setSaving(true); setError("");
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        ...(industry && { industry }),
        ...(companySize && { company_size: companySize }),
        ...(website.trim() && { website: website.trim() }),
      };
      const created = await companyApi.createCompany(payload);
      onCreate(created);
    } catch (err) {
      // interceptor already unwraps response.data
      setError(
        err?.name?.[0] || err?.slug?.[0] || err?.detail ||
        err?.non_field_errors?.[0] || "No se pudo crear la empresa."
      );
    } finally { setSaving(false); }
  };

  // Prevent modal close when clicking inside
  const stopClose = (e) => e.stopPropagation();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={stopClose}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-100">
          <Typography className="font-extrabold text-zinc-900 text-lg">Nueva Empresa</Typography>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Nombre */}
          <div>
            <label className={labelCls}>Nombre *</label>
            <input
              className={inputCls}
              placeholder="Acme Corp"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Slug */}
          <div>
            <label className={labelCls}>Identificador único (slug) *</label>
            <div className="flex items-center border border-zinc-300 rounded-xl overflow-hidden focus-within:border-indigo-500 transition-colors">
              <span className="px-3 py-2.5 bg-zinc-50 text-zinc-400 text-sm border-r border-zinc-200 whitespace-nowrap select-none">
                ankard.io/
              </span>
              <input
                className="flex-1 px-3 py-2.5 text-sm text-zinc-800 outline-none"
                placeholder="acme-corp"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Industria + Tamaño */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Industria</label>
              <select className={inputCls} value={industry} onChange={(e) => setIndustry(e.target.value)}>
                <option value="">Seleccionar...</option>
                {INDUSTRIES.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Tamaño</label>
              <select className={inputCls} value={companySize} onChange={(e) => setCompanySize(e.target.value)}>
                <option value="">Seleccionar...</option>
                {COMPANY_SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* Sitio web */}
          <div>
            <label className={labelCls}>Sitio web</label>
            <input
              className={inputCls}
              type="url"
              placeholder="https://acme.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <Typography variant="small" className="text-red-600">{error}</Typography>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-zinc-100">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-zinc-500 hover:text-zinc-700 rounded-xl hover:bg-zinc-100 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-2 transition-colors">
              {saving ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creando...</>
              ) : "Crear empresa →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Edit Company Modal ── */
function EditCompanyModal({ company, onClose, onSaved }) {
  const [name, setName] = useState(company.name || "");
  const [website, setWebsite] = useState(company.website || "");
  const [industry, setIndustry] = useState(company.industry || "");
  const [companySize, setCompanySize] = useState(company.company_size || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const updated = await companyApi.updateCompany(company.id, {
        name: name.trim(),
        website: website.trim(),
        ...(industry && { industry }),
        ...(companySize && { company_size: companySize }),
      });
      onSaved(updated);
    } catch (err) {
      setError(err?.detail || err?.name?.[0] || "No se pudo actualizar.");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-100">
          <Typography className="font-extrabold text-zinc-900 text-lg">Editar empresa</Typography>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-400">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className={labelCls}>Nombre</label>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Sitio web</label>
            <input className={inputCls} type="url" placeholder="https://" value={website}
              onChange={(e) => setWebsite(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Industria</label>
              <select className={inputCls} value={industry} onChange={(e) => setIndustry(e.target.value)}>
                <option value="">Seleccionar...</option>
                {INDUSTRIES.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Tamaño</label>
              <select className={inputCls} value={companySize} onChange={(e) => setCompanySize(e.target.value)}>
                <option value="">Seleccionar...</option>
                {COMPANY_SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <Typography variant="small" className="text-red-600">{error}</Typography>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2 border-t border-zinc-100">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-zinc-500 hover:text-zinc-700 rounded-xl hover:bg-zinc-100 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-2 transition-colors">
              {saving ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Guardando...</>
              ) : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export function PlatformAdminCompanies() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const load = useCallback(() => {
    setLoading(true);
    // Platform admin can see all companies — no company_id filter needed
    companyApi.myCompanies()
      .then((d) => setCompanies(d.results || d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreated = (company) => {
    setShowCreate(false);
    showToast(`✓ "${company.name}" creada exitosamente.`);
    load();
    // Go directly to user management for this new company
    navigate(`/platform-admin/companies/${company.id}/users`);
  };

  const handleSaved = (updated) => {
    setCompanies((prev) => prev.map((c) => c.id === updated.id ? updated : c));
    setEditTarget(null);
    showToast("Empresa actualizada.");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await companyApi.deleteCompany(deleteTarget.id);
      setCompanies((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast("Empresa eliminada.");
    } catch (err) {
      showToast(err?.detail || "No se pudo eliminar.");
    } finally { setDeleting(false); }
  };

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white text-sm px-5 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      {/* Modals */}
      {showCreate && <CreateCompanyModal onClose={() => setShowCreate(false)} onCreate={handleCreated} />}
      {editTarget && <EditCompanyModal company={editTarget} onClose={() => setEditTarget(null)} onSaved={handleSaved} />}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <Typography className="font-bold text-zinc-900">Eliminar empresa</Typography>
            <Typography variant="small" className="text-zinc-500">
              ¿Estás seguro de que quieres eliminar <strong>{deleteTarget.name}</strong>?
              Esta acción no se puede deshacer.
            </Typography>
            <div className="flex justify-end gap-3">
              <Button variant="text" color="blue-gray" className="normal-case" onClick={() => setDeleteTarget(null)}>
                Cancelar
              </Button>
              <Button color="red" className="normal-case" loading={deleting} onClick={handleDelete}>
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-black rounded uppercase tracking-wide">
              Platform Admin
            </div>
          </div>
          <Typography variant="h5" className="font-extrabold text-zinc-900">
            Administración de Plataforma
          </Typography>
          <Typography variant="small" className="text-zinc-400">
            {companies.length} empresa{companies.length !== 1 ? "s" : ""} en el sistema
          </Typography>
        </div>
        <Button color="indigo" className="normal-case flex items-center gap-2"
          onClick={() => setShowCreate(true)}>
          <PlusIcon className="h-4 w-4" /> Nueva Empresa
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="h-4 w-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:border-indigo-400 bg-white"
          placeholder="Buscar empresa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Company List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm p-5 animate-pulse">
              <div className="h-4 bg-zinc-100 rounded w-1/3 mb-2" />
              <div className="h-3 bg-zinc-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <BuildingOffice2Icon className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <Typography className="font-semibold">
            {search ? "No se encontraron empresas" : "No hay empresas registradas"}
          </Typography>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((company) => (
            <div key={company.id}
              className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm p-5 flex items-center justify-between gap-4 flex-wrap hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center flex-shrink-0">
                  {company.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <Typography className="font-bold text-zinc-900">{company.name}</Typography>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    {company.company_size && (
                      <span className="text-xs text-zinc-400">{SIZE_LABELS[company.company_size] || company.company_size}</span>
                    )}
                    {company.company_size && company.industry && <span className="text-zinc-300">·</span>}
                    {company.industry && (
                      <span className="text-xs text-zinc-400 capitalize">{INDUSTRY_LABELS[company.industry] || company.industry}</span>
                    )}
                    {company.member_count != null && (
                      <>
                        <span className="text-zinc-300">·</span>
                        <span className="flex items-center gap-1 text-xs text-zinc-400">
                          <UsersIcon className="h-3 w-3" />
                          {company.member_count} usuario{company.member_count !== 1 ? "s" : ""}
                        </span>
                      </>
                    )}
                    {!company.is_active && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-semibold">Inactiva</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <Button size="sm" variant="outlined" color="blue-gray" className="normal-case text-xs"
                  onClick={() => navigate(`/enterprise/dashboard`)}>
                  Ver
                </Button>
                <Button size="sm" color="indigo" variant="outlined" className="normal-case text-xs flex items-center gap-1"
                  onClick={() => navigate(`/platform-admin/companies/${company.id}/users`)}>
                  <UsersIcon className="h-3.5 w-3.5" /> Usuarios
                </Button>
                <button onClick={() => setEditTarget(company)}
                  className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button onClick={() => setDeleteTarget(company)}
                  className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PlatformAdminCompanies;

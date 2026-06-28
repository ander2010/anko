import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Typography, Button, Input, Select, Option } from "@material-tailwind/react";
import {
  ArrowLeftIcon, UserPlusIcon, EllipsisHorizontalIcon, XMarkIcon,
} from "@heroicons/react/24/outline";
import { companyApi } from "../../api/enterpriseApi";

const ROLES = ["owner", "admin", "manager", "trainer", "employee", "auditor"];
const STAGES = [
  { value: "candidate",       label: "Candidato" },
  { value: "onboarding",      label: "Onboarding" },
  { value: "trainee",         label: "Aprendiz" },
  { value: "active_employee", label: "Empleado activo" },
  { value: "contractor",      label: "Contratista" },
  { value: "former_employee", label: "Ex-empleado" },
];

const ROLE_COLORS = {
  owner:    "bg-purple-100 text-purple-700",
  admin:    "bg-red-100 text-red-700",
  manager:  "bg-blue-100 text-blue-700",
  trainer:  "bg-green-100 text-green-700",
  employee: "bg-zinc-100 text-zinc-600",
  auditor:  "bg-amber-100 text-amber-700",
};

/* ── Add User Modal ── */
function AddUserModal({ companyId, onClose, onAdded }) {
  const [form, setForm] = useState({ email: "", role: "employee", employee_stage: "onboarding" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) { setError("El email es obligatorio."); return; }
    setSaving(true); setError("");
    try {
      const result = await companyApi.addUser(companyId, {
        email: form.email.trim(),
        role: form.role,
        employee_stage: form.employee_stage,
      });
      onAdded(result);
    } catch (err) {
      const d = err?.response?.data || err;
      setError(d?.email?.[0] || d?.detail || d?.non_field_errors?.[0] || "No se pudo agregar el usuario.");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <Typography className="font-extrabold text-zinc-900">Agregar usuario</Typography>
          <button onClick={onClose}><XMarkIcon className="h-5 w-5 text-zinc-400 hover:text-zinc-600" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input label="Email *" type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Typography variant="small" className="text-zinc-400 mt-1">
              Si el usuario no tiene cuenta, se creará automáticamente.
              Recomiéndale usar "Olvidé mi contraseña" para activar su acceso.
            </Typography>
          </div>

          <Select label="Rol *" value={form.role} onChange={(v) => setForm({ ...form, role: v })}>
            {ROLES.map((r) => (
              <Option key={r} value={r} className="capitalize">{r}</Option>
            ))}
          </Select>

          <Select label="Etapa del empleado *" value={form.employee_stage}
            onChange={(v) => setForm({ ...form, employee_stage: v })}>
            {STAGES.map((s) => <Option key={s.value} value={s.value}>{s.label}</Option>)}
          </Select>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <Typography variant="small" className="text-red-600">{error}</Typography>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="text" color="blue-gray" className="normal-case" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button type="submit" color="indigo" className="normal-case flex items-center gap-2" loading={saving}>
              <UserPlusIcon className="h-4 w-4" /> Agregar →
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Change Role Modal ── */
function ChangeRoleModal({ member, onClose, onSaved, companyId }) {
  const [role, setRole] = useState(member.role);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      await companyApi.changeMemberRole(companyId, { membership_id: member.id, role });
      onSaved(member.id, role);
    } catch (err) {
      setError(err?.detail || "No se pudo cambiar el rol.");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}>
        <Typography className="font-bold text-zinc-900">Cambiar rol</Typography>
        <Typography variant="small" className="text-zinc-400">
          Usuario: <strong>{member.full_name || member.email}</strong>
        </Typography>
        <form onSubmit={handleSave} className="space-y-4">
          <Select label="Nuevo rol" value={role} onChange={setRole}>
            {ROLES.map((r) => (
              <Option key={r} value={r} className="capitalize">{r}</Option>
            ))}
          </Select>
          {error && <Typography variant="small" className="text-red-500">{error}</Typography>}
          <div className="flex justify-end gap-3">
            <Button variant="text" color="blue-gray" className="normal-case" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button type="submit" color="indigo" className="normal-case" loading={saving}>Guardar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export function PlatformAdminUsers() {
  const { id: companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("active");
  const [showAdd, setShowAdd] = useState(false);
  const [changeRole, setChangeRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [acting, setActing] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      companyApi.getCompany(companyId),
      companyApi.getMembers(companyId, { status: statusFilter }),
    ])
      .then(([co, mems]) => {
        setCompany(co);
        setMembers(mems.results || mems || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [companyId, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleAdded = (result) => {
    setShowAdd(false);
    showToast("✓ Usuario agregado. Ya tiene acceso a la empresa.");
    load();
  };

  const handleRoleSaved = (memberId, newRole) => {
    setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, role: newRole } : m));
    setChangeRole(null);
    showToast("Rol actualizado.");
  };

  const handleRemove = async (member) => {
    if (!window.confirm(`¿Dar de baja a ${member.full_name || member.email}?`)) return;
    setActing(true);
    try {
      await companyApi.removeMember(companyId, { membership_id: member.id });
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      showToast("Miembro dado de baja.");
    } catch (err) {
      showToast(err?.detail || "No se pudo dar de baja.");
    } finally { setActing(false); setMenuOpen(null); }
  };

  const statusColor = (s) => ({
    active:  "bg-green-100 text-green-700",
    invited: "bg-blue-100 text-blue-700",
    suspended: "bg-amber-100 text-amber-700",
    removed: "bg-zinc-100 text-zinc-500",
  })[s] || "bg-zinc-100 text-zinc-500";

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white text-sm px-5 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      {showAdd && (
        <AddUserModal companyId={companyId} onClose={() => setShowAdd(false)} onAdded={handleAdded} />
      )}

      {changeRole && (
        <ChangeRoleModal member={changeRole} companyId={companyId}
          onClose={() => setChangeRole(null)} onSaved={handleRoleSaved} />
      )}

      {/* Header */}
      <div>
        <button onClick={() => navigate("/platform-admin/companies")}
          className="flex items-center gap-1 text-sm text-zinc-400 hover:text-indigo-600 mb-3">
          <ArrowLeftIcon className="h-4 w-4" /> Volver a empresas
        </button>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-black rounded uppercase tracking-wide">
                Platform Admin
              </div>
            </div>
            <Typography variant="h5" className="font-extrabold text-zinc-900">
              {company?.name || `Empresa #${companyId}`} — Usuarios
            </Typography>
            <Typography variant="small" className="text-zinc-400">
              {members.length} miembro{members.length !== 1 ? "s" : ""} {statusFilter !== "all" ? `(${statusFilter})` : ""}
            </Typography>
          </div>
          <Button color="indigo" className="normal-case flex items-center gap-2"
            onClick={() => setShowAdd(true)}>
            <UserPlusIcon className="h-4 w-4" /> Agregar usuario
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1 bg-zinc-100 rounded-xl p-1 w-fit">
        {["active", "all"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-colors
              ${statusFilter === s ? "bg-white shadow-sm text-zinc-900" : "text-zinc-400 hover:text-zinc-600"}`}>
            {s === "active" ? "Activos" : "Todos"}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-zinc-200/60 p-4 animate-pulse">
              <div className="h-4 bg-zinc-100 rounded w-1/4 mb-1" />
              <div className="h-3 bg-zinc-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <UserPlusIcon className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <Typography className="font-semibold">No hay usuarios</Typography>
          <Typography variant="small">Agrega el primer usuario a esta empresa.</Typography>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                {["Nombre", "Email", "Rol", "Etapa", "Estado", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                  <td className="px-4 py-3 font-semibold text-zinc-800">
                    {m.full_name || m.username || "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{m.email || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${ROLE_COLORS[m.role] || "bg-zinc-100 text-zinc-500"}`}>
                      {m.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs capitalize">
                    {STAGES.find((s) => s.value === m.employee_stage)?.label || m.employee_stage || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor(m.status)}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpen(menuOpen === m.id ? null : m.id)}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600">
                        <EllipsisHorizontalIcon className="h-4 w-4" />
                      </button>
                      {menuOpen === m.id && (
                        <div className="absolute right-0 top-full z-20 bg-white rounded-xl shadow-xl border border-zinc-200 w-44 py-1">
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                            onClick={() => { setChangeRole(m); setMenuOpen(null); }}>
                            Cambiar rol
                          </button>
                          {m.role !== "owner" && (
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              onClick={() => handleRemove(m)}>
                              Dar de baja
                            </button>
                          )}
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-50"
                            onClick={() => setMenuOpen(null)}>
                            Cerrar
                          </button>
                        </div>
                      )}
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

export default PlatformAdminUsers;

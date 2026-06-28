import React, { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import {
  DocumentTextIcon, AcademicCapIcon, ChartBarIcon,
  UserGroupIcon, Cog6ToothIcon, PlusIcon, ArrowRightIcon,
  ArrowTrendingUpIcon, ClipboardDocumentListIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import { useEnterprise } from "../../context/enterprise-context";
import { knowledgeApi, learningApi } from "../../api/enterpriseApi";

// ─── Role Chip ─────────────────────────────────────────────────────────────────

const ROLE_COLORS = {
  owner:    { bg: "rgba(168,85,247,0.15)",  text: "#a855f7" },
  admin:    { bg: "rgba(239,68,68,0.12)",   text: "#f87171" },
  manager:  { bg: "rgba(59,130,246,0.12)",  text: "#60a5fa" },
  trainer:  { bg: "rgba(34,197,94,0.12)",   text: "#4ade80" },
  employee: { bg: "rgba(255,255,255,0.08)", text: "#8B8B9C" },
  auditor:  { bg: "rgba(245,158,11,0.12)",  text: "#fbbf24" },
};

function RoleChip({ role }) {
  const c = ROLE_COLORS[role] || ROLE_COLORS.employee;
  return (
    <span style={{ background: c.bg, color: c.text }}
      className="text-xs font-semibold px-2 py-0.5 rounded capitalize">
      {role}
    </span>
  );
}

// ─── Company Card ──────────────────────────────────────────────────────────────

function CompanyCard() {
  const { activeCompany, role } = useEnterprise();
  const navigate = useNavigate();
  const name = activeCompany?.company_name || activeCompany?.name || "Your Company";
  const companyId = activeCompany?.company_id || activeCompany?.id;
  const initial = name.charAt(0).toUpperCase();

  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      className="rounded-lg px-5 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div style={{ background: "var(--accent)", color: "#fff" }}
          className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base flex-shrink-0">
          {initial}
        </div>
        <div>
          <p style={{ color: "var(--text-primary)" }} className="font-semibold text-sm">{name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <RoleChip role={role || "employee"} />
            {companyId && (
              <span style={{ color: "var(--text-tertiary)" }} className="text-xs">ID: {companyId}</span>
            )}
          </div>
        </div>
      </div>
      <button onClick={() => navigate("/enterprise/settings")} className="ank-btn-ghost text-xs">
        <Cog6ToothIcon className="h-3.5 w-3.5" />
        Settings
      </button>
    </div>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

function MetricCard({ icon: Icon, label, value, sub, accent, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "var(--bg-surface)", border: "1px solid var(--border)",
        borderRadius: 8, padding: "16px", textAlign: "left", cursor: onClick ? "pointer" : "default",
        transition: "border-color 150ms, background 150ms", width: "100%",
      }}
      onMouseEnter={(e) => { if (onClick) { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.background = "var(--bg-elevated)"; } }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-surface)"; }}
    >
      <div className="flex items-start justify-between gap-2">
        <div style={{ background: accent ? "var(--accent-muted)" : "var(--bg-elevated)", borderRadius: 6, padding: 7, flexShrink: 0 }}>
          <Icon style={{ width: 16, height: 16, color: accent ? "var(--accent)" : "var(--text-secondary)" }} />
        </div>
        {onClick && <ArrowRightIcon style={{ width: 13, height: 13, color: "var(--text-tertiary)", marginTop: 2 }} />}
      </div>
      <p style={{ color: "var(--text-primary)", fontSize: 22, fontWeight: 700, marginTop: 12, lineHeight: 1 }}>{value}</p>
      <p style={{ color: "var(--text-primary)", fontSize: 12, fontWeight: 600, marginTop: 4 }}>{label}</p>
      {sub && <p style={{ color: "var(--text-tertiary)", fontSize: 11, marginTop: 2 }}>{sub}</p>}
    </button>
  );
}

// ─── Quick Action CTA ─────────────────────────────────────────────────────────

function CreateProcesoCTA() {
  const navigate = useNavigate();
  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "20px 24px" }}
      className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <BookOpenIcon style={{ width: 20, height: 20, color: "#fff" }} />
        </div>
        <div>
          <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 13 }}>Crea tu primer Proceso</p>
          <p style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 2 }}>
            Convierte documentación de tu empresa en conocimiento medible y estructurado.
          </p>
        </div>
      </div>
      <button
        onClick={() => navigate("/enterprise/knowledge/new")}
        className="ank-btn-accent text-xs flex-shrink-0">
        <PlusIcon className="h-3.5 w-3.5" /> Nuevo Proceso
      </button>
    </div>
  );
}

// ─── Quick Links ──────────────────────────────────────────────────────────────

const QUICK_LINKS = [
  { label: "Learning Paths",    href: "/enterprise/learning/paths",        Icon: AcademicCapIcon },
  { label: "My Assignments",    href: "/enterprise/learning/assignments",   Icon: ClipboardDocumentListIcon },
  { label: "Team Retention",    href: "/enterprise/retention/team",         Icon: ArrowTrendingUpIcon },
  { label: "Compliance",        href: "/enterprise/compliance/me",          Icon: ChartBarIcon },
  { label: "Team Members",      href: "/enterprise/settings/members",       Icon: UserGroupIcon },
  { label: "Knowledge Sources", href: "/enterprise/knowledge",              Icon: DocumentTextIcon },
];

function QuickLinks() {
  const navigate = useNavigate();
  return (
    <div>
      <p style={{ color: "var(--text-tertiary)", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10 }}>
        Acceso rápido
      </p>
      <div className="grid grid-cols-2 gap-2">
        {QUICK_LINKS.map(({ label, href, Icon }) => (
          <button key={href} onClick={() => navigate(href)}
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 6, padding: "10px 12px", textAlign: "left", cursor: "pointer", transition: "border-color 150ms, background 150ms" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.background = "var(--bg-surface)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-elevated)"; }}>
            <div className="flex items-center gap-2">
              <Icon style={{ width: 13, height: 13, color: "var(--text-secondary)" }} />
              <span style={{ color: "var(--text-primary)", fontSize: 12, fontWeight: 500 }}>{label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Metrics hook ─────────────────────────────────────────────────────────────

function useMetrics() {
  const [data, setData] = useState({ processes: "—", paths: "—", assignments: "—", sources: "—" });
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingMetrics(true);

    const safe = (fn) => fn().catch(() => null);

    Promise.all([
      safe(() => learningApi.getModules()),
      safe(() => learningApi.getPaths()),
      safe(() => learningApi.getAssignments()),
      safe(() => knowledgeApi.list()),
    ]).then(([modules, paths, assignments, sources]) => {
      if (cancelled) return;
      const count = (d) => {
        if (!d) return "—";
        if (typeof d?.count === "number") return d.count;
        if (Array.isArray(d)) return d.length;
        if (Array.isArray(d?.results)) return d.results.length;
        return "—";
      };
      setData({
        processes: count(modules),
        paths: count(paths),
        assignments: count(assignments),
        sources: count(sources),
      });
      setLoadingMetrics(false);
    });

    return () => { cancelled = true; };
  }, []);

  return { data, loadingMetrics };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function EnterpriseDashboard() {
  const navigate = useNavigate();
  const { isEnterpriseMember, initialized, loading, isPlatformAdmin } = useEnterprise();
  const { data: metrics, loadingMetrics } = useMetrics();

  if (!initialized || loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
          className="w-7 h-7 border-2 rounded-full animate-spin" />
      </div>
    );
  }

  if (isPlatformAdmin && !isEnterpriseMember) {
    return <Navigate to="/platform-admin/companies" replace />;
  }

  if (!isEnterpriseMember) {
    return <Navigate to="/enterprise/onboarding/company" replace />;
  }

  const fmt = (v) => loadingMetrics ? "…" : v;

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ color: "var(--text-primary)" }} className="text-xl font-bold">Enterprise Dashboard</h1>
          <p style={{ color: "var(--text-secondary)" }} className="text-sm mt-0.5">
            Gestiona conocimiento, formación y cumplimiento de tu organización
          </p>
        </div>
        <button onClick={() => navigate("/enterprise/knowledge/new")} className="ank-btn-accent text-xs">
          <PlusIcon className="h-3.5 w-3.5" /> Nuevo Proceso
        </button>
      </div>

      {/* Company card */}
      <CompanyCard />

      {/* Metrics grid */}
      <div>
        <p style={{ color: "var(--text-tertiary)", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10 }}>
          Métricas
        </p>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            icon={BookOpenIcon} label="Procesos" value={fmt(metrics.processes)}
            sub="Learning modules creados" accent
            onClick={() => navigate("/enterprise/knowledge")} />
          <MetricCard
            icon={AcademicCapIcon} label="Learning Paths" value={fmt(metrics.paths)}
            sub="Rutas de aprendizaje"
            onClick={() => navigate("/enterprise/learning/paths")} />
          <MetricCard
            icon={ClipboardDocumentListIcon} label="Asignaciones" value={fmt(metrics.assignments)}
            sub="Entrenamientos asignados"
            onClick={() => navigate("/enterprise/learning/assignments")} />
          <MetricCard
            icon={DocumentTextIcon} label="Knowledge Sources" value={fmt(metrics.sources)}
            sub="Documentos de referencia"
            onClick={() => navigate("/enterprise/knowledge")} />
        </div>
      </div>

      {/* CTA si no hay procesos */}
      {!loadingMetrics && metrics.processes === 0 && <CreateProcesoCTA />}

      {/* Quick links */}
      <QuickLinks />
    </div>
  );
}

export default EnterpriseDashboard;

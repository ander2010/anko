import React, { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import {
  DocumentTextIcon, AcademicCapIcon, ChartBarIcon,
  UserGroupIcon, Cog6ToothIcon, PlusIcon, ArrowRightIcon,
  ArrowTrendingUpIcon, ClipboardDocumentListIcon,
  BookOpenIcon, BoltIcon, SparklesIcon,
  RocketLaunchIcon, CheckBadgeIcon, ClockIcon,
} from "@heroicons/react/24/outline";
import { useEnterprise } from "../../context/enterprise-context";
import { knowledgeApi, learningApi, analyticsApi } from "../../api/enterpriseApi";

// ─── Role style map ───────────────────────────────────────────────────────────

const ROLE_COLORS = {
  owner:    { bg: "rgba(168,85,247,0.14)",  text: "#a855f7", label: "Owner" },
  admin:    { bg: "rgba(239,68,68,0.12)",   text: "#f87171", label: "Admin" },
  manager:  { bg: "rgba(59,130,246,0.12)",  text: "#60a5fa", label: "Manager" },
  trainer:  { bg: "rgba(34,197,94,0.12)",   text: "#4ade80", label: "Trainer" },
  employee: { bg: "rgba(255,255,255,0.07)", text: "#8B8B9C", label: "Employee" },
  auditor:  { bg: "rgba(245,158,11,0.12)",  text: "#fbbf24", label: "Auditor" },
};

function RoleBadge({ role }) {
  const c = ROLE_COLORS[role] || ROLE_COLORS.employee;
  return (
    <span style={{ background: c.bg, color: c.text, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 5, letterSpacing: "0.03em" }}>
      {c.label || role}
    </span>
  );
}

// ─── Company header banner ────────────────────────────────────────────────────

function CompanyBanner({ company, role, showSettings = true }) {
  const navigate = useNavigate();
  const name = company?.company_name || company?.name || "Your Company";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(192,132,252,0.06) 100%)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 14, padding: "20px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
      <div className="flex items-center gap-4">
        <div style={{ width: 44, height: 44, borderRadius: 11, background: "linear-gradient(135deg, #6366F1, #818CF8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
          {initial}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p style={{ color: "#F1F5F9", fontWeight: 700, fontSize: 15 }}>{name}</p>
            <RoleBadge role={role || "employee"} />
          </div>
          <p style={{ color: "#64748B", fontSize: 12, marginTop: 2 }}>
            Plan Enterprise · Activo
          </p>
        </div>
      </div>
      {showSettings && (
        <button onClick={() => navigate("/enterprise/settings")}
          style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 13px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s", flexShrink: 0 }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#F1F5F9"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#94A3B8"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
          <Cog6ToothIcon className="h-3.5 w-3.5" />
          Configuración
        </button>
      )}
    </div>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

function KPICard({ icon: Icon, label, value, sub, color, href }) {
  const navigate = useNavigate();
  const clickable = Boolean(href);
  return (
    <button
      onClick={clickable ? () => navigate(href) : undefined}
      style={{
        background: "var(--bg-surface)", border: "1px solid var(--border)",
        borderRadius: 12, padding: "18px 16px", textAlign: "left",
        cursor: clickable ? "pointer" : "default", width: "100%",
        transition: "border-color 0.15s, background 0.15s, transform 0.15s",
      }}
      onMouseEnter={(e) => { if (clickable) { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.background = "var(--bg-elevated)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-surface)"; e.currentTarget.style.transform = ""; }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon style={{ width: 16, height: 16, color }} />
        </div>
        {clickable && <ArrowRightIcon style={{ width: 13, height: 13, color: "var(--text-tertiary)", marginTop: 2 }} />}
      </div>
      <p style={{ color: "var(--text-primary)", fontSize: 24, fontWeight: 800, lineHeight: 1, marginBottom: 4 }}>{value}</p>
      <p style={{ color: "var(--text-primary)", fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{label}</p>
      {sub && <p style={{ color: "var(--text-tertiary)", fontSize: 11 }}>{sub}</p>}
    </button>
  );
}

// ─── Quick action card ────────────────────────────────────────────────────────

function ActionCard({ icon: Icon, color, title, desc, buttonLabel, href }) {
  const navigate = useNavigate();
  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px", display: "flex", items: "center", justifyContent: "space-between", gap: 14, alignItems: "center" }}>
      <div className="flex items-center gap-4 min-w-0">
        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon style={{ width: 18, height: 18, color }} />
        </div>
        <div className="min-w-0">
          <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 13 }}>{title}</p>
          <p style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 2, lineHeight: 1.4 }}>{desc}</p>
        </div>
      </div>
      <button onClick={() => navigate(href)}
        style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: `linear-gradient(135deg, ${color}, ${color}CC)`, border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", flexShrink: 0, transition: "opacity 0.15s", display: "flex", alignItems: "center", gap: 6 }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
        {buttonLabel} <ArrowRightIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Quick links grid ─────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Learning Paths",    href: "/enterprise/learning/paths",       icon: AcademicCapIcon },
  { label: "Mis asignaciones",  href: "/enterprise/learning/assignments",  icon: ClipboardDocumentListIcon },
  { label: "Team Retention",    href: "/enterprise/retention/team",        icon: ArrowTrendingUpIcon },
  { label: "Compliance",        href: "/enterprise/compliance/me",         icon: ChartBarIcon },
  { label: "Miembros del equipo", href: "/enterprise/settings/members",   icon: UserGroupIcon },
  { label: "Knowledge Sources", href: "/enterprise/knowledge",             icon: DocumentTextIcon },
];

function QuickLinks() {
  const navigate = useNavigate();
  return (
    <div>
      <p style={{ color: "var(--text-tertiary)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Acceso rápido</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {NAV_LINKS.map(({ label, href, icon: Icon }) => (
          <button key={href} onClick={() => navigate(href)}
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, padding: "11px 12px", textAlign: "left", cursor: "pointer", transition: "border-color 0.15s, background 0.15s", display: "flex", alignItems: "center", gap: 9 }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.background = "var(--bg-surface)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-elevated)"; }}>
            <Icon style={{ width: 13, height: 13, color: "var(--text-secondary)", flexShrink: 0 }} />
            <span style={{ color: "var(--text-primary)", fontSize: 12, fontWeight: 500 }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Feature spotlight (shown when no processes yet) ─────────────────────────

function GettingStarted() {
  const navigate = useNavigate();
  const steps = [
    { n: "1", icon: DocumentTextIcon, title: "Sube un documento", desc: "PDF, manual o política interna." },
    { n: "2", icon: SparklesIcon, title: "La IA genera el contenido", desc: "Flashcards y quizzes automáticos." },
    { n: "3", icon: CheckBadgeIcon, title: "Asigna a tu equipo", desc: "Mide progreso y cumplimiento." },
  ];
  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 14, padding: "24px 22px" }}>
      <div className="flex items-center gap-3 mb-4">
        <RocketLaunchIcon className="h-5 w-5" style={{ color: "#818CF8" }} />
        <p style={{ color: "#F1F5F9", fontWeight: 700, fontSize: 14 }}>Empieza en 3 pasos</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {steps.map(({ n, icon: Icon, title, desc }) => (
          <div key={n} style={{ background: "var(--bg-elevated)", borderRadius: 10, padding: 14 }}>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ fontSize: 10, fontWeight: 800, color: "#6366F1", background: "rgba(99,102,241,0.12)", borderRadius: 4, padding: "1px 6px" }}>{n}</span>
              <Icon style={{ width: 14, height: 14, color: "var(--text-secondary)" }} />
            </div>
            <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 12, marginBottom: 3 }}>{title}</p>
            <p style={{ color: "var(--text-tertiary)", fontSize: 11, lineHeight: 1.5 }}>{desc}</p>
          </div>
        ))}
      </div>
      <button onClick={() => navigate("/enterprise/knowledge/new")}
        style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg, #6366F1, #818CF8)", border: "none", borderRadius: 9, padding: "10px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, transition: "opacity 0.15s" }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
        <PlusIcon className="h-4 w-4" /> Crear primer proceso
      </button>
    </div>
  );
}

// ─── Metrics hook ─────────────────────────────────────────────────────────────

function useMetrics(enabled) {
  const [data, setData] = useState({ processes: "—", paths: "—", assignments: "—", sources: "—" });
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    if (!enabled) { setLoadingMetrics(false); return; }
    let cancelled = false;
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
      setData({ processes: count(modules), paths: count(paths), assignments: count(assignments), sources: count(sources) });
      setLoadingMetrics(false);
    });
    return () => { cancelled = true; };
  }, [enabled]);

  return { data, loadingMetrics };
}

// ─── Employee metrics hook ─────────────────────────────────────────────────────
// Employees don't have access to company-wide Procesos/Learning Paths/Fuentes —
// their dashboard shows only what belongs to them (analytics/employee-dashboard).

function useEmployeeMetrics(enabled) {
  const [data, setData] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    if (!enabled) { setLoadingMetrics(false); return; }
    let cancelled = false;
    analyticsApi.employeeDashboard()
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoadingMetrics(false); });
    return () => { cancelled = true; };
  }, [enabled]);

  return { data, loadingMetrics };
}

// ─── Employee dashboard view ──────────────────────────────────────────────────

const EMPLOYEE_NAV_LINKS = [
  { label: "Mis asignaciones",  href: "/enterprise/learning/assignments", icon: ClipboardDocumentListIcon },
  { label: "Review Schedules",  href: "/enterprise/learning/reviews",     icon: ClockIcon },
  { label: "Knowledge Gaps",    href: "/enterprise/learning/gaps",        icon: ArrowTrendingUpIcon },
  { label: "My Retention",      href: "/enterprise/retention/me",         icon: ArrowTrendingUpIcon },
  { label: "My Compliance",     href: "/enterprise/compliance/me",        icon: ChartBarIcon },
  { label: "My Certifications", href: "/enterprise/certifications",       icon: CheckBadgeIcon },
];

function EmployeeQuickLinks() {
  const navigate = useNavigate();
  return (
    <div>
      <p style={{ color: "var(--text-tertiary)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Acceso rápido</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {EMPLOYEE_NAV_LINKS.map(({ label, href, icon: Icon }) => (
          <button key={href} onClick={() => navigate(href)}
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, padding: "11px 12px", textAlign: "left", cursor: "pointer", transition: "border-color 0.15s, background 0.15s", display: "flex", alignItems: "center", gap: 9 }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.background = "var(--bg-surface)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-elevated)"; }}>
            <Icon style={{ width: 13, height: 13, color: "var(--text-secondary)", flexShrink: 0 }} />
            <span style={{ color: "var(--text-primary)", fontSize: 12, fontWeight: 500 }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function EmployeeDashboard({ activeCompany, role }) {
  const { data: metrics, loadingMetrics } = useEmployeeMetrics(true);
  const fmt = (v) => (loadingMetrics || !metrics ? "…" : v);

  const learning = metrics?.learning || {};
  const retention = metrics?.retention || {};
  const compliance = metrics?.compliance || {};
  const certifications = metrics?.certifications || {};

  const activeAssignments = (learning.in_progress || 0) + (learning.pending || 0);

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Page header */}
      <div>
        <h1 style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 800 }}>Dashboard</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 2 }}>
          Tu progreso, retención y cumplimiento en la organización
        </p>
      </div>

      {/* Company banner (no Configuración — employees don't have settings access) */}
      <CompanyBanner company={activeCompany} role={role} showSettings={false} />

      {/* KPI grid */}
      <div>
        <p style={{ color: "var(--text-tertiary)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Mis métricas</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard icon={ClipboardDocumentListIcon} label="Mis asignaciones" value={fmt(activeAssignments)} sub={`${fmt(learning.completed ?? "—")} completadas`} color="#F59E0B" href="/enterprise/learning/assignments" />
          <KPICard icon={ArrowTrendingUpIcon} label="Mi Retention" value={fmt(retention.score != null ? `${retention.score}%` : "—")} sub={`Riesgo ${fmt(retention.risk_score != null ? `${retention.risk_score}%` : "—")}`} color="#22C55E" href="/enterprise/retention/me" />
          <KPICard icon={ChartBarIcon} label="Mi Compliance" value={fmt(compliance.rate != null ? `${compliance.rate}%` : "—")} sub={`${fmt(compliance.compliant ?? "—")}/${fmt(compliance.total ?? "—")} programas`} color="#818CF8" href="/enterprise/compliance/me" />
          <KPICard icon={CheckBadgeIcon} label="Certificaciones" value={fmt(certifications.active ?? "—")} sub={`${fmt(certifications.expiring_soon ?? "—")} por vencer`} color="#C084FC" href="/enterprise/certifications" />
        </div>
      </div>

      {/* Quick links — only routes an employee actually has */}
      <EmployeeQuickLinks />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function EnterpriseDashboard() {
  const navigate = useNavigate();
  const { isEnterpriseMember, initialized, loading, isPlatformAdmin, activeCompany, role } = useEnterprise();
  const { data: metrics, loadingMetrics } = useMetrics(role !== "employee");

  if (!initialized || loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid rgba(99,102,241,0.3)", borderTopColor: "#6366F1" }} className="animate-spin" />
      </div>
    );
  }

  if (isPlatformAdmin && !isEnterpriseMember) return <Navigate to="/platform-admin/companies" replace />;
  if (!isEnterpriseMember) return <Navigate to="/enterprise/onboarding/company" replace />;

  if (role === "employee") {
    return <EmployeeDashboard activeCompany={activeCompany} role={role} />;
  }

  const fmt = (v) => (loadingMetrics ? "…" : v);
  const noProcesses = !loadingMetrics && metrics.processes === 0;

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 800 }}>Dashboard</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 2 }}>
            Gestiona conocimiento, formación y cumplimiento de tu organización
          </p>
        </div>
        <button onClick={() => navigate("/enterprise/knowledge/new")}
          style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg, #6366F1, #818CF8)", border: "none", borderRadius: 9, padding: "9px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <PlusIcon className="h-3.5 w-3.5" /> Nuevo Proceso
        </button>
      </div>

      {/* Company banner */}
      <CompanyBanner company={activeCompany} role={role} />

      {/* KPI grid */}
      <div>
        <p style={{ color: "var(--text-tertiary)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Métricas</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard icon={BookOpenIcon} label="Procesos" value={fmt(metrics.processes)} sub="Módulos de aprendizaje" color="#6366F1" href="/enterprise/knowledge" />
          <KPICard icon={AcademicCapIcon} label="Learning Paths" value={fmt(metrics.paths)} sub="Rutas de aprendizaje" color="#22C55E" href="/enterprise/learning/paths" />
          <KPICard icon={ClipboardDocumentListIcon} label="Asignaciones" value={fmt(metrics.assignments)} sub="Entrenamientos activos" color="#F59E0B" href="/enterprise/learning/assignments" />
          <KPICard icon={DocumentTextIcon} label="Fuentes" value={fmt(metrics.sources)} sub="Knowledge sources" color="#C084FC" href="/enterprise/knowledge" />
        </div>
      </div>

      {/* Getting started or action cards */}
      {noProcesses ? (
        <GettingStarted />
      ) : (
        <div className="space-y-3">
          <p style={{ color: "var(--text-tertiary)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Acciones</p>
          <ActionCard
            icon={BoltIcon} color="#6366F1"
            title="Crear nuevo proceso de aprendizaje"
            desc="Sube un documento y genera quizzes y flashcards automáticamente en minutos."
            buttonLabel="Crear"
            href="/enterprise/knowledge/new"
          />
          <ActionCard
            icon={AcademicCapIcon} color="#22C55E"
            title="Asignar Learning Path al equipo"
            desc="Organiza el contenido en rutas y asígnalas a empleados o grupos."
            buttonLabel="Ver paths"
            href="/enterprise/learning/paths"
          />
          <ActionCard
            icon={ChartBarIcon} color="#F59E0B"
            title="Revisar compliance del equipo"
            desc="Verifica quién completó los entrenamientos requeridos este período."
            buttonLabel="Ver compliance"
            href="/enterprise/compliance/me"
          />
        </div>
      )}

      {/* Quick links */}
      <QuickLinks />
    </div>
  );
}

export default EnterpriseDashboard;

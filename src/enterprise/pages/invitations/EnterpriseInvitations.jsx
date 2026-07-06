import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  EnvelopeIcon,
  ArrowPathIcon,
  XMarkIcon,
  PlusIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";
import { useAuth } from "@/context/auth-context";

const ADMIN_ROLES = ["owner", "admin"];
import invitationsService from "@/services/invitationsService";

const STATUS_META = {
  pending:   { label: "Pending",   color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.28)" },
  accepted:  { label: "Accepted",  color: "#34D399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.28)" },
  expired:   { label: "Expired",   color: "#F87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.28)" },
  cancelled: { label: "Cancelled", color: "#64748B", bg: "rgba(100,116,139,0.10)", border: "rgba(100,116,139,0.22)" },
};

const ROLE_META = {
  owner:    { label: "Owner",    color: "#F59E0B" },
  admin:    { label: "Admin",    color: "#818CF8" },
  manager:  { label: "Manager",  color: "#38BDF8" },
  trainer:  { label: "Trainer",  color: "#A78BFA" },
  employee: { label: "Employee", color: "#34D399" },
  auditor:  { label: "Auditor",  color: "#94A3B8" },
};

const TABS = ["all", "pending", "accepted", "expired", "cancelled"];

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, color: "#94A3B8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.22)" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase",
      color: meta.color, background: meta.bg, border: `1px solid ${meta.border}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: meta.color, flexShrink: 0 }} />
      {meta.label}
    </span>
  );
}

function RoleBadge({ role }) {
  const meta = ROLE_META[role] || { label: role, color: "#94A3B8" };
  return (
    <span style={{ fontSize: 12, fontWeight: 600, color: meta.color }}>
      {meta.label}
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function EnterpriseInvitations() {
  const navigate = useNavigate();
  const { companies, companyRole } = useAuth();
  const canInvite = ADMIN_ROLES.includes(companyRole);
  const company = companies?.[0];
  const companyId = company?.company_id;

  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [acting, setActing] = useState({});
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await invitationsService.listByCompany(companyId);
      setInvitations(Array.isArray(data) ? data : (data.results ?? []));
    } catch {
      setError("Could not load invitations.");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const handleResend = async (inv) => {
    setActing(a => ({ ...a, [inv.id]: "resend" }));
    try {
      await invitationsService.resend(companyId, inv.id);
      await load();
    } catch {
      /* silent */
    } finally {
      setActing(a => ({ ...a, [inv.id]: null }));
    }
  };

  const handleCancel = async (inv) => {
    setActing(a => ({ ...a, [inv.id]: "cancel" }));
    try {
      await invitationsService.cancel(companyId, inv.id);
      setInvitations(prev => prev.map(i => i.id === inv.id ? { ...i, status: "cancelled" } : i));
    } catch {
      /* silent */
    } finally {
      setActing(a => ({ ...a, [inv.id]: null }));
    }
  };

  const filtered = tab === "all" ? invitations : invitations.filter(i => i.status === tab);
  const counts = TABS.reduce((acc, t) => {
    acc[t] = t === "all" ? invitations.length : invitations.filter(i => i.status === t).length;
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#F1F5F9", margin: 0, letterSpacing: "-0.01em" }}>
            Invitations
          </h1>
          {company?.company_name && (
            <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>{company.company_name}</p>
          )}
        </div>
        {canInvite && (
          <button
            onClick={() => navigate("/enterprise/settings/invite")}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "9px 18px", borderRadius: 10,
              background: "linear-gradient(135deg, #6366F1, #818CF8)",
              border: "none", color: "#fff", fontSize: 13, fontWeight: 700,
              cursor: "pointer", flexShrink: 0,
              boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 22px rgba(99,102,241,0.5)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(99,102,241,0.35)"}
          >
            <PlusIcon style={{ width: 15, height: 15 }} />
            Invite User
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#0F172A", borderRadius: 10, padding: 4, border: "1px solid rgba(255,255,255,0.06)", width: "fit-content" }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "6px 14px", borderRadius: 7, border: "none",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              textTransform: "capitalize",
              background: tab === t ? "rgba(99,102,241,0.2)" : "transparent",
              color: tab === t ? "#818CF8" : "#64748B",
              transition: "all 150ms",
            }}
          >
            {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
            {counts[t] > 0 && (
              <span style={{
                marginLeft: 6, fontSize: 10, fontWeight: 700,
                background: tab === t ? "rgba(99,102,241,0.3)" : "rgba(100,116,139,0.15)",
                color: tab === t ? "#818CF8" : "#64748B",
                padding: "1px 6px", borderRadius: 10,
              }}>
                {counts[t]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <ArrowPathIcon style={{ width: 28, height: 28, color: "#6366F1", margin: "0 auto", animation: "spin 1s linear infinite" }} />
          </div>
        ) : error ? (
          <div style={{ padding: 48, textAlign: "center", color: "#F87171", fontSize: 14 }}>{error}</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 56, textAlign: "center" }}>
            <EnvelopeIcon style={{ width: 36, height: 36, color: "#1E293B", margin: "0 auto 12px" }} />
            <p style={{ color: "#64748B", fontSize: 14 }}>No invitations found</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Email", "Role", "Status", "Invited by", "Expires", "Actions"].map(h => (
                  <th key={h} style={{
                    padding: "11px 16px", textAlign: "left",
                    fontSize: 10, fontWeight: 700, color: "#64748B",
                    textTransform: "uppercase", letterSpacing: "0.07em",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv, idx) => (
                <tr
                  key={inv.id}
                  style={{
                    borderBottom: idx < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    transition: "background 150ms",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 8,
                        background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <EnvelopeIcon style={{ width: 13, height: 13, color: "#818CF8" }} />
                      </div>
                      <span style={{ fontSize: 13, color: "#F1F5F9", fontWeight: 500 }}>{inv.email}</span>
                    </div>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <RoleBadge role={inv.role} />
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <StatusBadge status={inv.status} />
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: 12, color: "#94A3B8" }}>
                    {inv.invited_by_email || "—"}
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#64748B" }}>
                      <ClockIcon style={{ width: 12, height: 12, flexShrink: 0 }} />
                      <span style={{ fontSize: 12 }}>{formatDate(inv.expires_at)}</span>
                    </div>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    {inv.status === "pending" ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => handleResend(inv)}
                          disabled={!!acting[inv.id]}
                          style={{
                            display: "flex", alignItems: "center", gap: 5,
                            padding: "5px 11px", borderRadius: 7,
                            background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.22)",
                            color: "#818CF8", fontSize: 11, fontWeight: 600,
                            cursor: acting[inv.id] ? "not-allowed" : "pointer",
                            opacity: acting[inv.id] ? 0.6 : 1, transition: "all 150ms",
                          }}
                        >
                          <ArrowPathIcon style={{ width: 11, height: 11, animation: acting[inv.id] === "resend" ? "spin 1s linear infinite" : "none" }} />
                          Resend
                        </button>
                        <button
                          onClick={() => handleCancel(inv)}
                          disabled={!!acting[inv.id]}
                          style={{
                            display: "flex", alignItems: "center", gap: 5,
                            padding: "5px 11px", borderRadius: 7,
                            background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.18)",
                            color: "#F87171", fontSize: 11, fontWeight: 600,
                            cursor: acting[inv.id] ? "not-allowed" : "pointer",
                            opacity: acting[inv.id] ? 0.6 : 1, transition: "all 150ms",
                          }}
                        >
                          <XMarkIcon style={{ width: 11, height: 11 }} />
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, color: "#334155" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

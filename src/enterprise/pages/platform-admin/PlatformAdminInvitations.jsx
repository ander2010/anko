import { useState, useEffect, useCallback } from "react";
import {
  EnvelopeIcon, ArrowPathIcon, ClockIcon,
  BuildingOffice2Icon, PlusIcon, XMarkIcon,
  PaperAirplaneIcon, CheckCircleIcon,
} from "@heroicons/react/24/solid";
import api from "@/services/api";
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

const ROLES = [
  { value: "admin",    label: "Admin",    color: "#818CF8", bg: "rgba(129,140,248,0.12)", border: "rgba(129,140,248,0.28)" },
  { value: "manager",  label: "Manager",  color: "#38BDF8", bg: "rgba(56,189,248,0.12)",  border: "rgba(56,189,248,0.28)"  },
  { value: "trainer",  label: "Trainer",  color: "#A78BFA", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.28)" },
  { value: "employee", label: "Employee", color: "#34D399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.28)"  },
  { value: "auditor",  label: "Auditor",  color: "#94A3B8", bg: "rgba(148,163,184,0.10)", border: "rgba(148,163,184,0.22)" },
  { value: "owner",    label: "Owner",    color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.28)"  },
];

const STAGES = [
  { value: "candidate",       label: "Candidate" },
  { value: "onboarding",      label: "Onboarding" },
  { value: "trainee",         label: "Trainee" },
  { value: "active_employee", label: "Active Employee" },
  { value: "contractor",      label: "Contractor" },
  { value: "former_employee", label: "Former Employee" },
];

const TOP_TABS  = ["global", "recent"];
const STATUS_TABS = ["all", "pending", "accepted", "expired", "cancelled"];

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
  return <span style={{ fontSize: 12, fontWeight: 600, color: meta.color }}>{meta.label}</span>;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

/* ── Invite Modal ──────────────────────────────────────────────────────── */
function InviteModal({ companies, onClose, onSent }) {
  const [companyId, setCompanyId] = useState("");
  const [email, setEmail]         = useState("");
  const [role, setRole]           = useState("employee");
  const [stage, setStage]         = useState("onboarding");
  const [sending, setSending]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState(false);

  const activeEmail   = email.trim();
  const selectedRole  = ROLES.find(r => r.value === role);

  const handleSend = async () => {
    if (!activeEmail || !companyId) return;
    setSending(true);
    setError("");
    try {
      await invitationsService.send(Number(companyId), { email: activeEmail, role, employee_stage: stage });
      setSuccess(true);
      onSent?.();
    } catch (err) {
      setError(err?.email?.[0] || err?.detail || "Failed to send invitation.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 1001,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}>
        <div style={{
          background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 22, width: "100%", maxWidth: 520,
          boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.12)",
          overflow: "hidden",
        }}>
          {/* Top accent */}
          <div style={{ height: 3, background: "linear-gradient(90deg, #6366F1, #818CF8, #A78BFA)" }} />

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 24px 18px" }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#F1F5F9", margin: 0, letterSpacing: "-0.01em" }}>
                New Invitation
              </h2>
              <p style={{ fontSize: 12, color: "#64748B", margin: "3px 0 0" }}>Send an invitation to any company</p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 34, height: 34, borderRadius: 9,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#64748B",
              }}
            >
              <XMarkIcon style={{ width: 16, height: 16 }} />
            </button>
          </div>

          {success ? (
            <div style={{ padding: "24px 24px 32px", textAlign: "center" }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px",
                background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.28)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <CheckCircleIcon style={{ width: 28, height: 28, color: "#34D399" }} />
              </div>
              <p style={{ fontSize: 16, fontWeight: 800, color: "#F1F5F9", margin: "0 0 8px" }}>Invitation Sent!</p>
              <div style={{
                background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.22)",
                borderRadius: 11, padding: "12px 18px", marginBottom: 20,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                <EnvelopeIcon style={{ width: 15, height: 15, color: "#818CF8" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#818CF8" }}>{email}</span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => { setSuccess(false); setEmail(""); setCompanyId(""); }}
                  style={{ flex: 1, padding: 11, borderRadius: 10, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.22)", color: "#818CF8", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                >
                  Send Another
                </button>
                <button
                  onClick={onClose}
                  style={{ flex: 1, padding: 11, borderRadius: 10, background: "linear-gradient(135deg, #6366F1, #818CF8)", border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Company selector */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>
                  Company
                </label>
                <div style={{ position: "relative" }}>
                  <BuildingOffice2Icon style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#64748B", pointerEvents: "none" }} />
                  <select
                    value={companyId}
                    onChange={e => setCompanyId(e.target.value)}
                    style={{ width: "100%", padding: "11px 14px 11px 34px", borderRadius: 11, background: "#1E293B", border: "1px solid rgba(255,255,255,0.08)", color: companyId ? "#F1F5F9" : "#64748B", fontSize: 13, outline: "none", cursor: "pointer", appearance: "none" }}
                    onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.45)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                  >
                    <option value="" style={{ background: "#1E293B" }}>Select company…</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id} style={{ background: "#1E293B" }}>{c.name}</option>
                    ))}
                  </select>
                  <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#64748B" }}>
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 4l4 4 4-4"/></svg>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>
                  Email address
                </label>
                <div style={{ position: "relative" }}>
                  <EnvelopeIcon style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#64748B", pointerEvents: "none" }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                    placeholder="user@company.com"
                    style={{ width: "100%", boxSizing: "border-box", padding: "11px 14px 11px 34px", borderRadius: 11, background: "#1E293B", border: "1px solid rgba(255,255,255,0.08)", color: "#F1F5F9", fontSize: 13, outline: "none" }}
                    onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.45)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 10 }}>
                  Role
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {ROLES.map(r => (
                    <button
                      key={r.value}
                      onClick={() => setRole(r.value)}
                      style={{
                        padding: "10px 6px", borderRadius: 10, border: `1px solid ${role === r.value ? r.border : "rgba(255,255,255,0.06)"}`,
                        background: role === r.value ? r.bg : "rgba(255,255,255,0.02)",
                        cursor: "pointer", transition: "all 150ms", textAlign: "center",
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 700, color: role === r.value ? r.color : "#64748B" }}>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stage */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>
                  Employee Stage
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    value={stage}
                    onChange={e => setStage(e.target.value)}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: 11, background: "#1E293B", border: "1px solid rgba(255,255,255,0.08)", color: "#F1F5F9", fontSize: 13, outline: "none", cursor: "pointer", appearance: "none" }}
                    onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.45)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                  >
                    {STAGES.map(s => <option key={s.value} value={s.value} style={{ background: "#1E293B" }}>{s.label}</option>)}
                  </select>
                  <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#64748B" }}>
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 4l4 4 4-4"/></svg>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.22)", borderRadius: 10, padding: "11px 14px", fontSize: 13, color: "#F87171" }}>
                  {error}
                </div>
              )}

              {/* Prominent email preview */}
              {activeEmail && companyId && (
                <div style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 11, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                  <EnvelopeIcon style={{ width: 15, height: 15, color: "#818CF8", flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 1 }}>Sending to</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#818CF8" }}>{activeEmail}</span>
                    {selectedRole && (
                      <span style={{ fontSize: 11, color: "#64748B", marginLeft: 8 }}>
                        as <span style={{ color: selectedRole.color, fontWeight: 700 }}>{selectedRole.label}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={sending || !activeEmail || !companyId}
                style={{
                  width: "100%", padding: 14, borderRadius: 12,
                  background: (activeEmail && companyId) ? "linear-gradient(135deg, #6366F1, #818CF8)" : "#1E293B",
                  border: "none",
                  color: (activeEmail && companyId) ? "#fff" : "#334155",
                  fontSize: 14, fontWeight: 800,
                  cursor: (activeEmail && companyId && !sending) ? "pointer" : "not-allowed",
                  opacity: sending ? 0.7 : 1, transition: "all 200ms",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
                  boxShadow: (activeEmail && companyId) ? "0 6px 20px rgba(99,102,241,0.35)" : "none",
                }}
              >
                <PaperAirplaneIcon style={{ width: 16, height: 16 }} />
                {sending ? "Sending…" : "Send Invitation"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Main Page ─────────────────────────────────────────────────────────── */
export default function PlatformAdminInvitations() {
  const [topTab, setTopTab]       = useState("global");
  const [statusTab, setStatusTab] = useState("all");
  const [invitations, setInvitations] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (topTab === "recent") params.recent = "1";
      const data = await invitationsService.listGlobal(params);
      setInvitations(Array.isArray(data) ? data : (data.results ?? []));
    } catch {
      setError("Could not load invitations. Make sure the server is running and you have staff access.");
    } finally {
      setLoading(false);
    }
  }, [topTab]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    api.get("/api/enterprise/companies/")
      .then(r => setCompanies(Array.isArray(r.data) ? r.data : (r.data?.results ?? [])))
      .catch(() => {});
  }, []);

  const filtered = statusTab === "all" ? invitations : invitations.filter(i => i.status === statusTab);
  const counts = STATUS_TABS.reduce((acc, t) => {
    acc[t] = t === "all" ? invitations.length : invitations.filter(i => i.status === t).length;
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#F1F5F9", margin: 0, letterSpacing: "-0.01em" }}>
            Invitations
          </h1>
          <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>All company invitations across the platform</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
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
          New Invitation
        </button>
      </div>

      {/* Top tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        {TOP_TABS.map(t => (
          <button
            key={t}
            onClick={() => setTopTab(t)}
            style={{
              padding: "8px 18px", border: "none", background: "transparent",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              color: topTab === t ? "#818CF8" : "#64748B",
              borderBottom: topTab === t ? "2px solid #6366F1" : "2px solid transparent",
              transition: "all 150ms", marginBottom: -1,
            }}
          >
            {t === "recent" ? "Recent (7 days)" : "Global"}
          </button>
        ))}
      </div>

      {/* Status filter */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#0F172A", borderRadius: 10, padding: 4, border: "1px solid rgba(255,255,255,0.06)", width: "fit-content" }}>
        {STATUS_TABS.map(t => (
          <button
            key={t}
            onClick={() => setStatusTab(t)}
            style={{
              padding: "6px 14px", borderRadius: 7, border: "none",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              textTransform: "capitalize",
              background: statusTab === t ? "rgba(99,102,241,0.2)" : "transparent",
              color: statusTab === t ? "#818CF8" : "#64748B",
              transition: "all 150ms",
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {counts[t] > 0 && (
              <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, background: statusTab === t ? "rgba(99,102,241,0.3)" : "rgba(100,116,139,0.15)", color: statusTab === t ? "#818CF8" : "#64748B", padding: "1px 6px", borderRadius: 10 }}>
                {counts[t]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
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
                {["Company", "Email", "Role", "Status", "Invited by", "Sent", "Expires"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv, idx) => (
                <tr
                  key={inv.id}
                  style={{ borderBottom: idx < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", transition: "background 150ms" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <BuildingOffice2Icon style={{ width: 13, height: 13, color: "#38BDF8" }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8" }}>{inv.company_name || `#${inv.company}`}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <EnvelopeIcon style={{ width: 12, height: 12, color: "#64748B", flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: "#F1F5F9", fontWeight: 500 }}>{inv.email}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}><RoleBadge role={inv.role} /></td>
                  <td style={{ padding: "12px 16px" }}><StatusBadge status={inv.status} /></td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#94A3B8" }}>{inv.invited_by_email || "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#64748B" }}>
                      <ClockIcon style={{ width: 11, height: 11 }} />
                      <span style={{ fontSize: 12 }}>{formatDate(inv.created_at)}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#64748B" }}>{formatDate(inv.expires_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <InviteModal
          companies={companies}
          onClose={() => setShowModal(false)}
          onSent={() => { load(); }}
        />
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

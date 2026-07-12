import React, { useEffect, useState } from "react";
import {
  CalendarDaysIcon, RectangleStackIcon, BoltIcon, BookOpenIcon,
  ClipboardDocumentCheckIcon, ClockIcon, CheckCircleIcon, ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { learningApi } from "../../api/enterpriseApi";

const TYPE_ICON = {
  flashcard: RectangleStackIcon,
  battery: BoltIcon,
  reading: BookOpenIcon,
  assessment: ClipboardDocumentCheckIcon,
};

const TYPE_LABEL = {
  flashcard: "Flashcard Review",
  battery: "Battery / Quiz",
  reading: "Reading / Study",
  assessment: "Assessment",
};

const PRIORITY = {
  low:      { label: "Low",      bg: "rgba(255,255,255,0.06)",  text: "#8B8B9C", border: "rgba(255,255,255,0.09)" },
  medium:   { label: "Medium",   bg: "rgba(245,158,11,0.12)",   text: "#f59e0b", border: "rgba(245,158,11,0.22)" },
  high:     { label: "High",     bg: "rgba(249,115,22,0.12)",   text: "#fb923c", border: "rgba(249,115,22,0.22)" },
  critical: { label: "Critical", bg: "rgba(239,68,68,0.14)",    text: "#f87171", border: "rgba(239,68,68,0.28)" },
};

// Anki-style quick grading — maps to the score the SM-2 backend expects (0-100).
const GRADES = [
  { label: "Otra vez", score: 20,  color: "#f87171" },
  { label: "Difícil",  score: 55,  color: "#f59e0b" },
  { label: "Bien",     score: 75,  color: "#818CF8" },
  { label: "Fácil",    score: 95,  color: "#4ade80" },
];

function PriorityBadge({ priority }) {
  const p = PRIORITY[priority] || PRIORITY.medium;
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color: p.text, background: p.bg, border: `1px solid ${p.border}`, borderRadius: 20, padding: "2px 9px", flexShrink: 0 }}>
      {p.label}
    </span>
  );
}

function daysLate(dueDate) {
  const due = new Date(dueDate);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.round((today - due) / 86400000);
}

function ReviewCard({ review, overdue, onComplete, completing }) {
  const Icon = TYPE_ICON[review.review_type] || BoltIcon;
  const [grading, setGrading] = useState(false);
  const late = overdue ? daysLate(review.due_date) : 0;
  const isBusy = completing === review.id;

  return (
    <div style={{
      background: "var(--bg-surface)",
      border: `1px solid ${overdue ? "rgba(239,68,68,0.25)" : "var(--border)"}`,
      borderRadius: 10, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10,
      transition: "border-color 150ms",
    }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon style={{ width: 14, height: 14, color: "#818CF8" }} />
          </div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {review.topic || review.module_name || review.learning_module_name || "Repaso"}
          </p>
        </div>
        <PriorityBadge priority={review.priority} />
      </div>

      <p style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{TYPE_LABEL[review.review_type] || review.review_type}</p>

      <div className="flex items-center gap-1.5" style={{ fontSize: 11, color: overdue ? "#f87171" : "var(--text-tertiary)", fontWeight: overdue ? 700 : 400 }}>
        <ClockIcon style={{ width: 11, height: 11 }} />
        {overdue
          ? `Venció hace ${late} día${late !== 1 ? "s" : ""} (${review.due_date})`
          : `Vence: ${review.due_date}`}
      </div>

      {!grading ? (
        <button
          onClick={() => setGrading(true)}
          disabled={isBusy}
          className="ank-btn-accent text-xs"
          style={{ justifyContent: "center", marginTop: 4, opacity: isBusy ? 0.6 : 1 }}
        >
          {isBusy ? <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" /> : <><CheckCircleIcon className="h-3.5 w-3.5" /> Completar</>}
        </button>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5, marginTop: 4 }}>
          {GRADES.map((g) => (
            <button
              key={g.label}
              onClick={() => onComplete(review.id, g.score)}
              disabled={isBusy}
              style={{
                fontSize: 10, fontWeight: 700, color: g.color,
                background: `${g.color}18`, border: `1px solid ${g.color}30`,
                borderRadius: 6, padding: "6px 4px", cursor: isBusy ? "default" : "pointer",
                opacity: isBusy ? 0.5 : 1, transition: "background 150ms",
              }}
              onMouseEnter={(e) => { if (!isBusy) e.currentTarget.style.background = `${g.color}2a`; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = `${g.color}18`; }}
            >
              {g.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyReviews({ label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "56px 20px", textAlign: "center" }}>
      <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <CalendarDaysIcon style={{ width: 24, height: 24, color: "#818CF8" }} />
      </div>
      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Sin repasos {label}</p>
      <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>Estás al día. Vuelve más tarde.</p>
    </div>
  );
}

export function ReviewSchedules() {
  const [tab, setTab] = useState("due");
  const [due, setDue] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);

  useEffect(() => {
    Promise.all([learningApi.getDueReviews(), learningApi.getOverdueReviews()])
      .then(([d, o]) => { setDue(d.results || d || []); setOverdue(o.results || o || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const complete = async (id, score) => {
    setCompleting(id);
    try {
      await learningApi.completeReview(id, score);
      setDue((prev) => prev.filter((r) => r.id !== id));
      setOverdue((prev) => prev.filter((r) => r.id !== id));
    } catch {} finally { setCompleting(null); }
  };

  const items = tab === "due" ? due : overdue;

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 800 }}>Review Schedules</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 2 }}>
          Repaso espaciado (SM-2) para reforzar lo que ya aprendiste, justo antes de que se te olvide
        </p>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {[
          { id: "due", label: "Due Today", count: due.length },
          { id: "overdue", label: "Overdue", count: overdue.length, danger: true },
        ].map(({ id, label, count, danger }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
                background: active ? "var(--accent)" : "var(--bg-elevated)",
                color: active ? "#fff" : "var(--text-secondary)",
                border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                transition: "all 150ms",
              }}
            >
              {label}
              {count > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 800, borderRadius: 20, padding: "1px 6px",
                  background: active ? "rgba(255,255,255,0.25)" : (danger ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.08)"),
                  color: active ? "#fff" : (danger ? "#f87171" : "var(--text-tertiary)"),
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} className="w-6 h-6 border-2 rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <EmptyReviews label={tab === "due" ? "pendientes hoy" : "vencidos"} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((r) => (
            <ReviewCard key={r.id} review={r} overdue={tab === "overdue"} onComplete={complete} completing={completing} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewSchedules;

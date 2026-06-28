import React, { useEffect, useState } from "react";
import { Typography, Card, CardBody, Button } from "@material-tailwind/react";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { learningApi } from "../../api/enterpriseApi";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";
import { TableSkeleton } from "../../components/LoadingSkeleton";

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

  const complete = async (id) => {
    setCompleting(id);
    try {
      await learningApi.completeReview(id);
      setDue((prev) => prev.filter((r) => r.id !== id));
      setOverdue((prev) => prev.filter((r) => r.id !== id));
    } finally { setCompleting(null); }
  };

  const items = tab === "due" ? due : overdue;

  return (
    <div className="space-y-6">
      <Typography variant="h5" className="font-extrabold text-zinc-900">Review Schedules</Typography>

      <div className="flex gap-2 border-b border-zinc-200 pb-0">
        {["due", "overdue"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-bold capitalize border-b-2 -mb-px transition-colors ${tab === t ? "border-indigo-600 text-indigo-600" : "border-transparent text-zinc-400 hover:text-zinc-600"}`}
          >
            {t === "due" ? "Due Today" : "Overdue"}
            {t === "overdue" && overdue.length > 0 && (
              <span className="ml-1.5 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">{overdue.length}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? <TableSkeleton rows={4} cols={4} /> : items.length === 0 ? (
        <EmptyState icon={CalendarDaysIcon} title={`No ${tab} reviews`} message="You're all caught up!" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((r) => (
            <Card key={r.id} className={`border shadow-sm ${tab === "overdue" ? "border-red-200" : "border-zinc-200/60"}`}>
              <CardBody className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Typography variant="h6" className="font-bold text-zinc-900 text-sm">{r.topic || r.module_name || "Review"}</Typography>
                  <StatusBadge status={r.priority || "pending"} />
                </div>
                <Typography variant="small" className="text-zinc-400 text-xs capitalize">Type: {r.review_type}</Typography>
                <Typography variant="small" className="text-zinc-400 text-xs">Due: {r.due_date}</Typography>
                <Button
                  size="sm" fullWidth color="indigo" className="normal-case text-xs"
                  loading={completing === r.id}
                  onClick={() => complete(r.id)}
                >
                  Complete
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewSchedules;

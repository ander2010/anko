import React from "react";

const COMPLIANCE_MAP = {
  compliant: { label: "Compliant", cls: "bg-green-100 text-green-800 border-green-200" },
  non_compliant: { label: "Non-Compliant", cls: "bg-red-100 text-red-800 border-red-200" },
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  expired: { label: "Expired", cls: "bg-gray-100 text-gray-700 border-gray-200" },
};

const CERT_MAP = {
  active: { label: "Active", cls: "bg-green-100 text-green-800 border-green-200" },
  expiring: { label: "Expiring Soon", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  expired: { label: "Expired", cls: "bg-red-100 text-red-800 border-red-200" },
  revoked: { label: "Revoked", cls: "bg-gray-100 text-gray-700 border-gray-200" },
};

const ASSIGNMENT_MAP = {
  pending: { label: "Pending", cls: "bg-zinc-100 text-zinc-700 border-zinc-200" },
  in_progress: { label: "In Progress", cls: "bg-blue-100 text-blue-800 border-blue-200" },
  completed: { label: "Completed", cls: "bg-green-100 text-green-800 border-green-200" },
  overdue: { label: "Overdue", cls: "bg-red-100 text-red-800 border-red-200" },
};

const GAP_MAP = {
  critical: { label: "Critical", cls: "bg-red-100 text-red-800 border-red-200" },
  high: { label: "High", cls: "bg-orange-100 text-orange-800 border-orange-200" },
  medium: { label: "Medium", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  low: { label: "Low", cls: "bg-zinc-100 text-zinc-600 border-zinc-200" },
  open: { label: "Open", cls: "bg-red-100 text-red-800 border-red-200" },
  acknowledged: { label: "Acknowledged", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  resolved: { label: "Resolved", cls: "bg-green-100 text-green-800 border-green-200" },
};

const PROGRAM_MAP = {
  draft: { label: "Draft", cls: "bg-zinc-100 text-zinc-700 border-zinc-200" },
  active: { label: "Active", cls: "bg-green-100 text-green-800 border-green-200" },
  archived: { label: "Archived", cls: "bg-gray-100 text-gray-500 border-gray-200" },
};

const ALL_MAPS = { ...COMPLIANCE_MAP, ...CERT_MAP, ...ASSIGNMENT_MAP, ...GAP_MAP, ...PROGRAM_MAP };

export function StatusBadge({ status, size = "sm" }) {
  const key = (status || "").toLowerCase().replace(/ /g, "_");
  const config = ALL_MAPS[key] || { label: status || "—", cls: "bg-zinc-100 text-zinc-600 border-zinc-200" };
  const textSize = size === "xs" ? "text-[10px]" : "text-xs";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold border ${textSize} ${config.cls}`}>
      {config.label}
    </span>
  );
}

export default StatusBadge;

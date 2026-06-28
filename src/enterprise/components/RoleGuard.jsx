import React from "react";
import { useCompanyRole } from "../hooks/useCompanyRole";
import { ShieldExclamationIcon } from "@heroicons/react/24/outline";
import { Typography } from "@material-tailwind/react";

export function RoleGuard({ roles = [], minRole, children, fallback }) {
  const { role, hasRole, hasMinRole } = useCompanyRole();

  const allowed = minRole ? hasMinRole(minRole) : (roles.length === 0 || hasRole(...roles));

  if (!allowed) {
    return fallback ?? (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShieldExclamationIcon className="h-12 w-12 text-zinc-300 mb-4" />
        <Typography variant="h6" className="text-zinc-600 font-bold">Access Restricted</Typography>
        <Typography variant="small" className="text-zinc-400 mt-1">
          You don't have permission to view this. Required role: {minRole || roles.join(" / ")}.
        </Typography>
        <Typography variant="small" className="text-zinc-300 mt-1">Your role: {role || "none"}</Typography>
      </div>
    );
  }

  return children;
}

export default RoleGuard;

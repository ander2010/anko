import React from "react";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";

export function KPICard({ title, value, subtitle, trend, trendLabel, icon: Icon, color = "indigo", onClick, urgent }) {
  const colors = {
    indigo: "bg-indigo-600",
    blue: "bg-blue-600",
    green: "bg-green-600",
    amber: "bg-amber-500",
    red: "bg-red-600",
    purple: "bg-purple-600",
  };

  return (
    <Card
      className={`overflow-hidden border border-zinc-200/60 shadow-sm hover:shadow-md transition-shadow ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <CardBody className="p-5">
        <div className="flex items-start justify-between mb-3">
          <Typography variant="small" className="text-zinc-500 font-semibold uppercase tracking-wide text-xs">
            {title}
          </Typography>
          {Icon && (
            <div className={`${colors[color]} rounded-xl p-2`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
          )}
        </div>

        <div className="flex items-end gap-2">
          <Typography variant="h3" className={`font-extrabold tracking-tight ${urgent ? "text-red-600" : "text-zinc-900"}`}>
            {value ?? "—"}
          </Typography>
          {urgent && (
            <span className="mb-1 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
              Urgent
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2">
          {trend !== undefined && trend !== null && (
            <span className={`flex items-center gap-0.5 text-xs font-bold ${trend >= 0 ? "text-green-600" : "text-red-600"}`}>
              {trend >= 0 ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
              {Math.abs(trend)}%
            </span>
          )}
          {subtitle && (
            <Typography variant="small" className="text-zinc-400 text-xs">
              {subtitle}
            </Typography>
          )}
          {trendLabel && (
            <Typography variant="small" className="text-zinc-400 text-xs">
              {trendLabel}
            </Typography>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export default KPICard;

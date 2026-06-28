import React from "react";

function Bone({ className = "" }) {
  return <div className={`animate-pulse bg-zinc-200 rounded-xl ${className}`} />;
}

export function KPICardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-3">
      <Bone className="h-3 w-24" />
      <Bone className="h-8 w-16" />
      <Bone className="h-2 w-32" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-zinc-100">
          {Array.from({ length: cols }).map((_, j) => (
            <Bone key={j} className="h-3 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => <KPICardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-3">
          <Bone className="h-4 w-32" />
          <Bone className="h-32 w-full" />
        </div>
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-3">
          <Bone className="h-4 w-32" />
          <Bone className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton({ height = "h-48" }) {
  return (
    <div className={`bg-white rounded-2xl border border-zinc-200 p-5 ${height} animate-pulse`}>
      <Bone className="h-4 w-40 mb-3" />
      <Bone className="h-3 w-full mb-2" />
      <Bone className="h-3 w-3/4" />
    </div>
  );
}

export default DashboardSkeleton;

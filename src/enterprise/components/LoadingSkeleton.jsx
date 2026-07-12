import React from "react";

function Bone({ style = {} }) {
  return <div className="animate-pulse" style={{ background: "var(--bg-elevated)", borderRadius: 8, ...style }} />;
}

export function KPICardSkeleton() {
  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }} className="space-y-3">
      <Bone style={{ height: 10, width: 96 }} />
      <Bone style={{ height: 28, width: 64 }} />
      <Bone style={{ height: 8, width: 128 }} />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: "flex", gap: 16, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
          {Array.from({ length: cols }).map((_, j) => (
            <Bone key={j} style={{ height: 10, flex: 1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => <KPICardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[0, 1].map((i) => (
          <div key={i} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }} className="space-y-3">
            <Bone style={{ height: 14, width: 128 }} />
            <Bone style={{ height: 128, width: "100%" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton({ height = 192 }) {
  return (
    <div className="animate-pulse space-y-3" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 18, height }}>
      <Bone style={{ height: 14, width: 160, marginBottom: 12 }} />
      <Bone style={{ height: 10, width: "100%", marginBottom: 8 }} />
      <Bone style={{ height: 10, width: "75%" }} />
    </div>
  );
}

export default DashboardSkeleton;

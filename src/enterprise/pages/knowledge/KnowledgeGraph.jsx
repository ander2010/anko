import React, { useEffect, useState, useRef, useCallback } from "react";
import { ArrowPathIcon, LinkIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { knowledgeApi } from "../../api/enterpriseApi";
import { useEnterprise } from "../../context/enterprise-context";

const NODE_COLORS = {
  concept:   "#6366f1",
  procedure: "#f97316",
  regulation:"#ef4444",
  skill:     "#22c55e",
  topic:     "#a855f7",
  rule:      "#78716c",
};

const EDGE_COLORS = {
  requires:    "#ef4444",
  related_to:  "#6366f1",
  extends:     "#22c55e",
  depends_on:  "#f97316",
  supersedes:  "#78716c",
  contradicts: "#dc2626",
};

const NODE_TYPES = Object.keys(NODE_COLORS);

/* Simple force-directed layout using Fruchterman-Reingold approximation */
function computeLayout(nodes, edges, W, H) {
  if (!nodes.length) return {};
  const area = W * H;
  const k = Math.sqrt(area / nodes.length);
  const positions = {};

  // Random initial positions
  nodes.forEach((n) => {
    positions[n.id] = {
      x: W * 0.1 + Math.random() * W * 0.8,
      y: H * 0.1 + Math.random() * H * 0.8,
    };
  });

  const indexById = {};
  nodes.forEach((n, i) => { indexById[n.id] = i; });

  for (let iter = 0; iter < 50; iter++) {
    const disp = {};
    nodes.forEach((n) => { disp[n.id] = { x: 0, y: 0 }; });

    // Repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const ni = nodes[i], nj = nodes[j];
        const dx = positions[ni.id].x - positions[nj.id].x;
        const dy = positions[ni.id].y - positions[nj.id].y;
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const force = (k * k) / dist;
        disp[ni.id].x += (dx / dist) * force;
        disp[ni.id].y += (dy / dist) * force;
        disp[nj.id].x -= (dx / dist) * force;
        disp[nj.id].y -= (dy / dist) * force;
      }
    }

    // Attraction
    edges.forEach((e) => {
      const si = e.source_id || e.source;
      const ti = e.target_id || e.target;
      if (!positions[si] || !positions[ti]) return;
      const dx = positions[si].x - positions[ti].x;
      const dy = positions[si].y - positions[ti].y;
      const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const force = (dist * dist) / k;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      disp[si].x -= fx;
      disp[si].y -= fy;
      disp[ti].x += fx;
      disp[ti].y += fy;
    });

    // Apply
    const temp = Math.max(5, k * (1 - iter / 50));
    nodes.forEach((n) => {
      const d = disp[n.id];
      const len = Math.max(1, Math.sqrt(d.x * d.x + d.y * d.y));
      positions[n.id].x = Math.max(30, Math.min(W - 30, positions[n.id].x + (d.x / len) * Math.min(len, temp)));
      positions[n.id].y = Math.max(30, Math.min(H - 30, positions[n.id].y + (d.y / len) * Math.min(len, temp)));
    });
  }
  return positions;
}

export function KnowledgeGraph() {
  const { activeCompanyId } = useEnterprise();
  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sources, setSources] = useState([]);
  const [filters, setFilters] = useState({ nodeTypes: new Set(NODE_TYPES), source: "" });
  const [positions, setPositions] = useState({});
  const [selected, setSelected] = useState(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const dragging = useRef(false);
  const lastPt = useRef(null);
  const W = 1100, H = 700;

  const loadGraph = useCallback(() => {
    setLoading(true);
    const p = {};
    if (filters.source) p.knowledge_source_id = filters.source;
    Promise.all([
      knowledgeApi.getGraph(p),
      knowledgeApi.list({}),
    ])
      .then(([g, ksResp]) => {
        setGraph(g);
        setSources(ksResp.results || ksResp || []);
        const nodes = (g.nodes || []).filter((n) => filters.nodeTypes.has(n.node_type));
        const edges = g.edges || g.relationships || [];
        setPositions(computeLayout(nodes, edges, W, H));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCompanyId, filters.source]);

  useEffect(() => { loadGraph(); }, [loadGraph]);

  const toggleType = (type) => {
    setFilters((prev) => {
      const next = new Set(prev.nodeTypes);
      next.has(type) ? next.delete(type) : next.add(type);
      return { ...prev, nodeTypes: next };
    });
  };

  const visibleNodes = (graph?.nodes || []).filter((n) => filters.nodeTypes.has(n.node_type));
  const visibleIds = new Set(visibleNodes.map((n) => n.id));
  const visibleEdges = (graph?.edges || graph?.relationships || []).filter((e) => {
    const s = e.source_id || e.source;
    const t = e.target_id || e.target;
    return visibleIds.has(s) && visibleIds.has(t);
  });

  const onWheel = (e) => { e.preventDefault(); setZoom((z) => Math.max(0.2, Math.min(4, z - e.deltaY * 0.001))); };
  const onMouseDown = (e) => { dragging.current = true; lastPt.current = { x: e.clientX, y: e.clientY }; };
  const onMouseMove = (e) => {
    if (!dragging.current) return;
    setPan((p) => ({ x: p.x + e.clientX - lastPt.current.x, y: p.y + e.clientY - lastPt.current.y }));
    lastPt.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseUp = () => { dragging.current = false; };

  const selectedRelations = selected
    ? visibleEdges.filter((e) => {
        const s = e.source_id || e.source;
        const t = e.target_id || e.target;
        return s === selected.id || t === selected.id;
      })
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 800 }}>Knowledge Graph</h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: 12, marginTop: 2 }}>
            {visibleNodes.length} nodes · {visibleEdges.length} relationships
          </p>
        </div>
        <button onClick={loadGraph} disabled={loading} className="ank-btn-ghost text-xs" style={{ opacity: loading ? 0.6 : 1 }}>
          <ArrowPathIcon className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="flex gap-4 flex-wrap lg:flex-nowrap">
        {/* Filters panel */}
        <div style={{ width: 208, flexShrink: 0 }} className="space-y-4">
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }} className="space-y-3">
            <div className="flex items-center gap-2">
              <FunnelIcon style={{ width: 14, height: 14, color: "var(--text-tertiary)" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Filters</span>
            </div>

            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", marginBottom: 8 }}>Node Types</p>
              <div className="space-y-1.5">
                {NODE_TYPES.map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={filters.nodeTypes.has(type)}
                      onChange={() => toggleType(type)} style={{ accentColor: NODE_COLORS[type] }} />
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: NODE_COLORS[type], flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "capitalize" }}>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", marginBottom: 8 }}>Knowledge Source</p>
              <select
                value={filters.source}
                onChange={(e) => setFilters((f) => ({ ...f, source: e.target.value }))}
                style={{ width: "100%", fontSize: 12, background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, padding: "7px 8px", color: "var(--text-secondary)", outline: "none" }}
              >
                <option value="">All sources</option>
                {sources.filter((s) => s.status === "processed").map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-1">
              <button onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
                style={{ flex: 1, padding: "5px 0", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-secondary)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+</button>
              <button onClick={() => setZoom((z) => Math.max(0.2, z - 0.25))}
                style={{ flex: 1, padding: "5px 0", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-secondary)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>−</button>
              <button onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }}
                style={{ flex: 1, padding: "5px 0", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-tertiary)", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>Fit</button>
            </div>
          </div>

          {/* Selected node detail */}
          {selected && (
            <div style={{ background: "var(--bg-surface)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 12, padding: 16 }} className="space-y-3">
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 20, textTransform: "capitalize", background: NODE_COLORS[selected.node_type] + "22", color: NODE_COLORS[selected.node_type] }}>
                  {selected.node_type}
                </span>
                <button onClick={() => setSelected(null)} style={{ color: "var(--text-tertiary)", fontSize: 18, background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>×</button>
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{selected.title}</p>
              {selected.description && (
                <p style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{selected.description}</p>
              )}
              {selected.importance_score != null && (
                <div>
                  <div className="flex justify-between mb-1">
                    <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Importance</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#818CF8" }}>
                      {Math.round(selected.importance_score * 100)}%
                    </span>
                  </div>
                  <div style={{ height: 5, background: "var(--bg-elevated)", borderRadius: 20, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 20, background: "#6366F1", width: `${selected.importance_score * 100}%` }} />
                  </div>
                </div>
              )}
              {selectedRelations.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", marginBottom: 5 }}>
                    Connections ({selectedRelations.length})
                  </p>
                  <div className="space-y-1" style={{ maxHeight: 128, overflowY: "auto" }}>
                    {selectedRelations.slice(0, 8).map((e, i) => {
                      const otherId = (e.source_id || e.source) === selected.id ? (e.target_id || e.target) : (e.source_id || e.source);
                      const other = visibleNodes.find((n) => n.id === otherId);
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-tertiary)" }}>
                          <span style={{ color: EDGE_COLORS[e.relationship_type] || "#6366f1" }}>→</span>
                          <span>{e.relationship_type}</span>
                          <span style={{ color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{other?.title || otherId}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Graph canvas */}
        <div className="flex-1 relative" style={{ minWidth: 0 }}>
          {loading && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(2,6,23,0.75)", borderRadius: 12, zIndex: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-secondary)" }}>
                <ArrowPathIcon className="animate-spin" style={{ width: 20, height: 20 }} />
                <span style={{ fontSize: 13 }}>Computing layout...</span>
              </div>
            </div>
          )}

          {!loading && !visibleNodes.length && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 384, background: "var(--bg-app)", borderRadius: 12, border: "1px solid var(--border)", color: "var(--text-tertiary)", gap: 10 }}>
              <LinkIcon style={{ width: 40, height: 40, opacity: 0.3 }} />
              <p style={{ fontWeight: 600, fontSize: 13 }}>No knowledge graph data</p>
              <p style={{ fontSize: 12 }}>Process documents with AI to build the graph.</p>
            </div>
          )}

          {visibleNodes.length > 0 && (
            <svg
              viewBox={`0 0 ${W} ${H}`}
              style={{ width: "100%", height: 520, background: "var(--bg-app)", borderRadius: 12, border: "1px solid var(--border)", cursor: dragging.current ? "grabbing" : "grab" }}
              onWheel={onWheel}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            >
              <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
                {/* Edges */}
                {visibleEdges.map((e, i) => {
                  const s = positions[e.source_id || e.source];
                  const t = positions[e.target_id || e.target];
                  if (!s || !t) return null;
                  const color = EDGE_COLORS[e.relationship_type] || "#64748b";
                  const dashed = ["requires", "contradicts"].includes(e.relationship_type);
                  const strength = e.strength ?? 0.5;
                  return (
                    <line key={i}
                      x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                      stroke={color} strokeWidth={Math.max(1, strength * 2.5)}
                      strokeDasharray={dashed ? "6,3" : "none"}
                      opacity={0.5}
                    />
                  );
                })}
                {/* Nodes */}
                {visibleNodes.map((n) => {
                  const pos = positions[n.id];
                  if (!pos) return null;
                  const color = NODE_COLORS[n.node_type] || "#6366f1";
                  const r = 8 + (n.importance_score || 0.5) * 16;
                  const isSel = selected?.id === n.id;
                  const isRelated = selectedRelations.some((e) =>
                    (e.source_id || e.source) === n.id || (e.target_id || e.target) === n.id);
                  return (
                    <g key={n.id} style={{ cursor: "pointer" }}
                      onClick={() => setSelected(isSel ? null : n)}>
                      <circle cx={pos.x} cy={pos.y} r={r + (isSel ? 5 : 0)}
                        fill={color}
                        opacity={selected && !isSel && !isRelated ? 0.25 : 0.9}
                        stroke={isSel ? "#A5B4FC" : "#0F172A"}
                        strokeWidth={isSel ? 3 : 1.5}
                      />
                      <text x={pos.x} y={pos.y + r + 13}
                        fontSize={10} fill="#94A3B8" textAnchor="middle"
                        style={{ pointerEvents: "none" }}>
                        {n.title?.length > 20 ? n.title.slice(0, 18) + "…" : n.title}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          )}

          {/* Edge type legend */}
          {visibleNodes.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {Object.entries(EDGE_COLORS).map(([type, color]) => (
                <span key={type} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-tertiary)" }}>
                  <span style={{ width: 18, height: 2, display: "inline-block", background: color }} />
                  {type.replace("_", " ")}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default KnowledgeGraph;

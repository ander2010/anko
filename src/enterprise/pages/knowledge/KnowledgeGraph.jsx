import React, { useEffect, useState, useRef, useCallback } from "react";
import { Typography, Button, Select, Option } from "@material-tailwind/react";
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
          <Typography variant="h5" className="font-extrabold text-zinc-900">Knowledge Graph</Typography>
          <Typography variant="small" className="text-zinc-400">
            {visibleNodes.length} nodes · {visibleEdges.length} relationships
          </Typography>
        </div>
        <Button variant="outlined" color="indigo" size="sm" className="normal-case"
          loading={loading} onClick={loadGraph}>
          <ArrowPathIcon className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      <div className="flex gap-4">
        {/* Filters panel */}
        <div className="w-52 flex-shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm p-4 space-y-3">
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-4 w-4 text-zinc-400" />
              <Typography variant="small" className="font-bold text-zinc-600 uppercase tracking-wide">Filters</Typography>
            </div>

            <div>
              <Typography variant="small" className="font-semibold text-zinc-500 mb-2">Node Types</Typography>
              <div className="space-y-1.5">
                {NODE_TYPES.map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={filters.nodeTypes.has(type)}
                      onChange={() => toggleType(type)} className="rounded border-zinc-300" />
                    <span className="w-3 h-3 rounded-full" style={{ background: NODE_COLORS[type] }} />
                    <Typography variant="small" className="text-zinc-600 capitalize">{type}</Typography>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Typography variant="small" className="font-semibold text-zinc-500 mb-2">Knowledge Source</Typography>
              <select
                className="w-full text-sm border border-zinc-200 rounded-lg px-2 py-1.5 text-zinc-700"
                value={filters.source}
                onChange={(e) => setFilters((f) => ({ ...f, source: e.target.value }))}
              >
                <option value="">All sources</option>
                {sources.filter((s) => s.status === "processed").map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-1">
              <button onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
                className="flex-1 py-1 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-zinc-600 font-bold text-sm">+</button>
              <button onClick={() => setZoom((z) => Math.max(0.2, z - 0.25))}
                className="flex-1 py-1 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-zinc-600 font-bold text-sm">−</button>
              <button onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }}
                className="flex-1 py-1 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-zinc-500 text-xs font-bold">Fit</button>
            </div>
          </div>

          {/* Selected node detail */}
          {selected && (
            <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full capitalize"
                  style={{ background: NODE_COLORS[selected.node_type] + "22", color: NODE_COLORS[selected.node_type] }}>
                  {selected.node_type}
                </span>
                <button onClick={() => setSelected(null)} className="text-zinc-400 hover:text-zinc-600 text-lg">×</button>
              </div>
              <Typography className="font-semibold text-zinc-900 text-sm">{selected.title}</Typography>
              {selected.description && (
                <Typography variant="small" className="text-zinc-400">{selected.description}</Typography>
              )}
              {selected.importance_score != null && (
                <div>
                  <div className="flex justify-between mb-1">
                    <Typography variant="small" className="text-zinc-400">Importance</Typography>
                    <Typography variant="small" className="font-bold text-indigo-600">
                      {Math.round(selected.importance_score * 100)}%
                    </Typography>
                  </div>
                  <div className="h-1.5 bg-zinc-100 rounded-full">
                    <div className="h-1.5 bg-indigo-500 rounded-full" style={{ width: `${selected.importance_score * 100}%` }} />
                  </div>
                </div>
              )}
              {selectedRelations.length > 0 && (
                <div>
                  <Typography variant="small" className="font-semibold text-zinc-500 mb-1">
                    Connections ({selectedRelations.length})
                  </Typography>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {selectedRelations.slice(0, 8).map((e, i) => {
                      const otherId = (e.source_id || e.source) === selected.id ? (e.target_id || e.target) : (e.source_id || e.source);
                      const other = visibleNodes.find((n) => n.id === otherId);
                      return (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-zinc-500">
                          <span style={{ color: EDGE_COLORS[e.relationship_type] || "#6366f1" }}>→</span>
                          <span className="text-zinc-400">{e.relationship_type}</span>
                          <span className="text-zinc-600 truncate">{other?.title || otherId}</span>
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
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-50/80 rounded-2xl z-10">
              <div className="flex items-center gap-3 text-zinc-500">
                <ArrowPathIcon className="h-6 w-6 animate-spin" />
                <span>Computing layout...</span>
              </div>
            </div>
          )}

          {!loading && !visibleNodes.length && (
            <div className="flex flex-col items-center justify-center h-96 bg-zinc-50 rounded-2xl border border-zinc-200 text-zinc-400 gap-3">
              <LinkIcon className="h-12 w-12 opacity-30" />
              <Typography className="font-semibold">No knowledge graph data</Typography>
              <Typography variant="small">Process documents with AI to build the graph.</Typography>
            </div>
          )}

          {visibleNodes.length > 0 && (
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full bg-zinc-50 rounded-2xl border border-zinc-200 shadow-sm cursor-grab active:cursor-grabbing"
              style={{ height: 520 }}
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
                  const color = EDGE_COLORS[e.relationship_type] || "#94a3b8";
                  const dashed = ["requires", "contradicts"].includes(e.relationship_type);
                  const strength = e.strength ?? 0.5;
                  return (
                    <line key={i}
                      x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                      stroke={color} strokeWidth={Math.max(1, strength * 2.5)}
                      strokeDasharray={dashed ? "6,3" : "none"}
                      opacity={0.45}
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
                        opacity={selected && !isSel && !isRelated ? 0.25 : 0.85}
                        stroke={isSel ? "#312e81" : isRelated ? "#fff" : "white"}
                        strokeWidth={isSel ? 3 : 1.5}
                      />
                      <text x={pos.x} y={pos.y + r + 13}
                        fontSize={10} fill="#374151" textAnchor="middle"
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
                <span key={type} className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <span className="w-5 h-0.5 inline-block" style={{ background: color }} />
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

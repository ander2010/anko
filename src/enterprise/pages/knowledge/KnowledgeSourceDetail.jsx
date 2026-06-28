import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Typography, Button, Tabs, TabsHeader, Tab, TabsBody, TabPanel } from "@material-tailwind/react";
import {
  ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon, ClockIcon,
  ChevronDownIcon, ChevronRightIcon, ExclamationTriangleIcon,
  SparklesIcon, DocumentTextIcon, LinkIcon,
} from "@heroicons/react/24/outline";
import { knowledgeApi } from "../../api/enterpriseApi";
import { useEnterprise } from "../../context/enterprise-context";
import { TableSkeleton } from "../../components/LoadingSkeleton";

/* ── Status badge ── */
function StatusBadge({ status }) {
  const map = {
    pending:    { label: "Pending",    cls: "bg-zinc-100 text-zinc-500" },
    processing: { label: "Processing", cls: "bg-blue-100 text-blue-700", spin: true },
    processed:  { label: "Processed",  cls: "bg-green-100 text-green-700" },
    failed:     { label: "Failed",     cls: "bg-red-100 text-red-700" },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${s.cls}`}>
      {s.spin && <ArrowPathIcon className="h-3 w-3 animate-spin" />}
      {status === "processed" && <CheckCircleIcon className="h-3 w-3" />}
      {status === "failed" && <ExclamationCircleIcon className="h-3 w-3" />}
      {status === "pending" && <ClockIcon className="h-3 w-3" />}
      {s.label}
    </span>
  );
}

/* ── Procedures Tab ── */
function ProceduresTab({ ksId }) {
  const [procs, setProcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    setLoading(true);
    const p = { knowledge_source_id: ksId };
    if (criticalOnly) p.is_critical = true;
    knowledgeApi.getProcedures(p)
      .then((d) => setProcs(d.results || d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ksId, criticalOnly]);

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  if (loading) return <TableSkeleton rows={3} cols={1} />;
  if (!procs.length) return (
    <div className="text-center py-12 text-zinc-400">
      <DocumentTextIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
      <p>No procedures extracted yet.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer select-none">
          <input type="checkbox" checked={criticalOnly} onChange={(e) => setCriticalOnly(e.target.checked)}
            className="rounded border-zinc-300" />
          Show critical only
        </label>
        <span className="text-zinc-300">|</span>
        <Typography variant="small" className="text-zinc-400">{procs.length} procedures</Typography>
      </div>
      {procs.map((proc) => (
        <div key={proc.id} className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-50"
            onClick={() => toggle(proc.id)}
          >
            <div className="flex items-center gap-3">
              {proc.is_critical && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">CRITICAL</span>
              )}
              <Typography className="font-semibold text-zinc-800">{proc.title}</Typography>
              <Typography variant="small" className="text-zinc-400">
                {proc.steps?.length ?? 0} steps
                {proc.warnings?.length ? ` · ${proc.warnings.length} warning(s)` : ""}
              </Typography>
            </div>
            {expanded[proc.id]
              ? <ChevronDownIcon className="h-4 w-4 text-zinc-400" />
              : <ChevronRightIcon className="h-4 w-4 text-zinc-400" />}
          </button>
          {expanded[proc.id] && (
            <div className="px-5 pb-4 space-y-3 border-t border-zinc-100">
              {proc.description && (
                <Typography variant="small" className="text-zinc-500">{proc.description}</Typography>
              )}
              {proc.steps?.length > 0 && (
                <ol className="space-y-2">
                  {proc.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-zinc-700">
                      <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      {typeof step === "string" ? step : step.description || step.text || JSON.stringify(step)}
                    </li>
                  ))}
                </ol>
              )}
              {proc.warnings?.map((w, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                  <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
                  {typeof w === "string" ? w : w.text || JSON.stringify(w)}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Mini SVG Knowledge Graph ── */
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
  contradicts: "#ef4444",
};

function placeNodes(nodes) {
  const byType = {};
  nodes.forEach((n) => { (byType[n.node_type] = byType[n.node_type] || []).push(n); });
  const types = Object.keys(byType);
  const W = 900, H = 620, cx = W / 2, cy = H / 2;
  const placed = {};
  types.forEach((type, ti) => {
    const group = byType[type];
    const ringR = 80 + ti * 90;
    group.forEach((n, i) => {
      const angle = (2 * Math.PI * i) / group.length - Math.PI / 2;
      placed[n.id] = { x: cx + ringR * Math.cos(angle), y: cy + ringR * Math.sin(angle), node: n };
    });
  });
  return placed;
}

function GraphCanvas({ ksId }) {
  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const dragging = useRef(false);
  const lastPt = useRef(null);
  const svgRef = useRef();

  useEffect(() => {
    setLoading(true);
    const p = ksId ? { knowledge_source_id: ksId } : {};
    knowledgeApi.getGraph(p)
      .then((d) => setGraph(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ksId]);

  const onWheel = (e) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.3, Math.min(3, z - e.deltaY * 0.001)));
  };

  const onMouseDown = (e) => { dragging.current = true; lastPt.current = { x: e.clientX, y: e.clientY }; };
  const onMouseMove = (e) => {
    if (!dragging.current) return;
    setPan((p) => ({ x: p.x + e.clientX - lastPt.current.x, y: p.y + e.clientY - lastPt.current.y }));
    lastPt.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseUp = () => { dragging.current = false; };

  if (loading) return <div className="flex items-center justify-center h-64 text-zinc-400"><ArrowPathIcon className="h-6 w-6 animate-spin mr-2" /> Loading graph...</div>;
  if (!graph || !graph.nodes?.length) return (
    <div className="text-center py-16 text-zinc-400">
      <LinkIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
      <p>No knowledge graph data available yet.</p>
      <Typography variant="small" className="mt-1">Process this document with AI to generate the graph.</Typography>
    </div>
  );

  const nodes = graph.nodes || [];
  const edges = graph.edges || graph.relationships || [];
  const placed = placeNodes(nodes);
  const W = 900, H = 620;

  return (
    <div className="flex gap-4">
      <div className="flex-1 relative">
        <div className="absolute top-3 right-3 flex gap-2 z-10">
          <button onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
            className="w-8 h-8 bg-white rounded-lg shadow text-zinc-600 font-bold hover:bg-zinc-50">+</button>
          <button onClick={() => setZoom((z) => Math.max(0.3, z - 0.2))}
            className="w-8 h-8 bg-white rounded-lg shadow text-zinc-600 font-bold hover:bg-zinc-50">−</button>
          <button onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }}
            className="w-8 h-8 bg-white rounded-lg shadow text-zinc-500 text-xs font-bold hover:bg-zinc-50">⊡</button>
        </div>
        <svg
          ref={svgRef}
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          className="bg-zinc-50 rounded-2xl border border-zinc-200 cursor-grab active:cursor-grabbing"
          style={{ height: 420 }}
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
            {/* Edges */}
            {edges.map((e, i) => {
              const src = placed[e.source_id || e.source];
              const tgt = placed[e.target_id || e.target];
              if (!src || !tgt) return null;
              const color = EDGE_COLORS[e.relationship_type] || "#94a3b8";
              const dashed = e.relationship_type === "requires" || e.relationship_type === "contradicts";
              return (
                <g key={i}>
                  <line
                    x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                    stroke={color} strokeWidth={Math.max(1, (e.strength || 0.5) * 3)}
                    strokeDasharray={dashed ? "5,3" : "none"}
                    opacity={0.5}
                  />
                  {e.relationship_type && (
                    <text
                      x={(src.x + tgt.x) / 2} y={(src.y + tgt.y) / 2 - 4}
                      fontSize={9} fill={color} textAnchor="middle" opacity={0.7}
                    >{e.relationship_type}</text>
                  )}
                </g>
              );
            })}
            {/* Nodes */}
            {Object.values(placed).map(({ x, y, node }) => {
              const color = NODE_COLORS[node.node_type] || "#6366f1";
              const r = 10 + (node.importance_score || 0.5) * 14;
              const isSel = selected?.id === node.id;
              return (
                <g key={node.id} style={{ cursor: "pointer" }}
                  onClick={() => setSelected(isSel ? null : node)}>
                  <circle cx={x} cy={y} r={r + (isSel ? 4 : 0)}
                    fill={color} opacity={isSel ? 1 : 0.8}
                    stroke={isSel ? "#1e1b4b" : "white"} strokeWidth={isSel ? 2.5 : 1.5} />
                  <text x={x} y={y + r + 12} fontSize={10} fill="#374151"
                    textAnchor="middle" style={{ pointerEvents: "none" }}>
                    {node.title?.length > 18 ? node.title.slice(0, 16) + "…" : node.title}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-3">
          {Object.entries(NODE_COLORS).map(([type, color]) => (
            <span key={type} className="flex items-center gap-1.5 text-xs text-zinc-500">
              <span className="w-3 h-3 rounded-full" style={{ background: color }} />
              {type}
            </span>
          ))}
        </div>
      </div>

      {/* Node detail panel */}
      {selected && (
        <div className="w-56 bg-white rounded-2xl border border-zinc-200 shadow-sm p-4 space-y-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <Typography variant="small" className="font-bold text-zinc-700 uppercase tracking-wide">
              {selected.node_type}
            </Typography>
            <button onClick={() => setSelected(null)} className="text-zinc-400 hover:text-zinc-600 text-lg leading-none">×</button>
          </div>
          <Typography className="font-semibold text-zinc-900 text-sm">{selected.title}</Typography>
          {selected.description && (
            <Typography variant="small" className="text-zinc-400">{selected.description}</Typography>
          )}
          {selected.importance_score != null && (
            <div>
              <Typography variant="small" className="text-zinc-400 mb-1">Importance</Typography>
              <div className="h-1.5 bg-zinc-100 rounded-full">
                <div className="h-1.5 bg-indigo-500 rounded-full"
                  style={{ width: `${selected.importance_score * 100}%` }} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Change History Tab ── */
function ChangeHistoryTab({ ksId }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    knowledgeApi.getChangeImpacts({ knowledge_source_id: ksId })
      .then((d) => setItems(d.results || d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ksId]);

  const impactColor = (level) => ({
    low: "bg-green-100 text-green-700",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-orange-100 text-orange-700",
    critical: "bg-red-100 text-red-700",
  })[level] || "bg-zinc-100 text-zinc-500";

  if (loading) return <TableSkeleton rows={3} cols={4} />;
  if (!items.length) return (
    <div className="text-center py-12 text-zinc-400">
      <ClockIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
      <p>No change analyses yet.</p>
      <Typography variant="small">Use "Detect Changes" when the document is updated.</Typography>
    </div>
  );

  return (
    <div className="space-y-3">
      {items.map((ci) => (
        <div key={ci.id}
          className="bg-white rounded-xl border border-zinc-200/60 shadow-sm p-4 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${impactColor(ci.impact_level)}`}>
                {ci.impact_level?.toUpperCase() || "PENDING"}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500`}>
                {ci.status}
              </span>
              {ci.training_regenerated && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  Training regenerated
                </span>
              )}
            </div>
            <Typography variant="small" className="text-zinc-400">
              {ci.created_at ? new Date(ci.created_at).toLocaleString() : "—"}
              {ci.old_version && ci.new_version ? ` · v${ci.old_version} → v${ci.new_version}` : ""}
            </Typography>
          </div>
          <Button size="sm" variant="outlined" color="indigo" className="normal-case text-xs"
            onClick={() => navigate(`/enterprise/knowledge/change-impact/${ci.id}`)}>
            View Analysis
          </Button>
        </div>
      ))}
    </div>
  );
}

/* ── Processing Panel ── */
function ProcessingPanel({ ksId, onDone }) {
  const [msg, setMsg] = useState("Extracting concepts...");
  const [progress, setProgress] = useState(20);

  useEffect(() => {
    const messages = [
      "Extracting concepts...",
      "Identifying procedures...",
      "Building knowledge graph...",
      "Generating relationships...",
      "Finalizing...",
    ];
    let i = 0;
    const interval = setInterval(async () => {
      i = (i + 1) % messages.length;
      setMsg(messages[i]);
      setProgress((p) => Math.min(90, p + 14));
      try {
        const s = await knowledgeApi.status(ksId);
        if (s.status !== "processing") {
          clearInterval(interval);
          onDone(s.status);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [ksId]);

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 space-y-3">
      <div className="flex items-center gap-3">
        <ArrowPathIcon className="h-5 w-5 text-indigo-600 animate-spin" />
        <Typography className="font-semibold text-indigo-800">Processing document with AI...</Typography>
      </div>
      <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
        <div className="h-2 bg-indigo-500 rounded-full transition-all duration-1000"
          style={{ width: `${progress}%` }} />
      </div>
      <Typography variant="small" className="text-indigo-500">{msg}</Typography>
      <Typography variant="small" className="text-indigo-400">Processing may take 30–90 seconds.</Typography>
    </div>
  );
}

/* ── Main Component ── */
export function KnowledgeSourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeCompanyId } = useEnterprise();
  const [ks, setKs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [toast, setToast] = useState("");
  const [activeTab, setActiveTab] = useState("summary");

  const load = useCallback(() => {
    setLoading(true);
    knowledgeApi.get(id)
      .then(setKs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const handleProcess = async () => {
    setActionLoading("process");
    try {
      await knowledgeApi.process(id);
      setKs((prev) => ({ ...prev, status: "processing" }));
      setProcessing(true);
    } catch (e) {
      showToast("Failed to start processing: " + (e?.detail || "Unknown error"));
    } finally {
      setActionLoading("");
    }
  };

  const handleGenerateTraining = async () => {
    setActionLoading("training");
    try {
      const result = await knowledgeApi.generateTraining(id);
      showToast(`Training program created: ${result.program_name || "New Program"}`);
      if (result.program_id) navigate(`/enterprise/learning/programs`);
    } catch (e) {
      showToast("Failed to generate training: " + (e?.detail || "Unknown error"));
    } finally {
      setActionLoading("");
    }
  };

  const handleDetectChanges = async () => {
    setActionLoading("changes");
    try {
      const result = await knowledgeApi.detectChanges(id);
      if (result.changes_detected === false) {
        showToast("No changes detected since the last version.");
      } else {
        if (result.analysis_id && window.confirm("Changes detected! Analyze impact now?")) {
          navigate(`/enterprise/knowledge/change-impact/${result.analysis_id}`);
        } else {
          showToast("Change analysis created. View it in the Changes tab.");
        }
      }
    } catch (e) {
      showToast("Failed to detect changes: " + (e?.detail || "Unknown error"));
    } finally {
      setActionLoading("");
    }
  };

  if (loading) return <div className="space-y-4"><TableSkeleton rows={2} cols={3} /></div>;
  if (!ks) return <Typography className="text-red-500">Knowledge source not found.</Typography>;

  const isProcessed = ks.status === "processed";
  const isProcessing = ks.status === "processing" || processing;
  const isFailed = ks.status === "failed";
  const isPending = ks.status === "pending";

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white text-sm px-5 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => navigate("/enterprise/knowledge")}
              className="text-zinc-400 hover:text-indigo-600 text-sm">← Knowledge Sources</button>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Typography variant="h5" className="font-extrabold text-zinc-900">{ks.title}</Typography>
            <StatusBadge status={ks.status} />
          </div>
          <Typography variant="small" className="text-zinc-400 capitalize">
            {ks.source_type?.replace("_", " ")} ·{" "}
            {ks.document_title ? (
              <span className="text-indigo-500">{ks.document_title}</span>
            ) : `Document ID: ${ks.document}`}
          </Typography>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          {isPending && (
            <Button color="indigo" className="normal-case"
              loading={actionLoading === "process"} onClick={handleProcess}>
              Process with AI →
            </Button>
          )}
          {isFailed && (
            <Button color="red" className="normal-case"
              loading={actionLoading === "process"} onClick={handleProcess}>
              Retry Processing
            </Button>
          )}
          {isProcessed && (
            <>
              {!ks.metadata?.has_training && (
                <Button color="purple" variant="outlined" className="normal-case flex items-center gap-2"
                  loading={actionLoading === "training"} onClick={handleGenerateTraining}>
                  <SparklesIcon className="h-4 w-4" /> Generate Training
                </Button>
              )}
              <Button color="amber" variant="outlined" className="normal-case"
                loading={actionLoading === "changes"} onClick={handleDetectChanges}>
                Detect Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Processing panel */}
      {isProcessing && (
        <ProcessingPanel ksId={id} onDone={(newStatus) => {
          setProcessing(false);
          setKs((prev) => ({ ...prev, status: newStatus }));
          load();
        }} />
      )}

      {/* Error panel */}
      {isFailed && ks.error_message && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <ExclamationCircleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <Typography className="font-semibold text-red-700">Processing failed</Typography>
            <Typography variant="small" className="text-red-500">{ks.error_message}</Typography>
          </div>
        </div>
      )}

      {/* Tabs — only when processed */}
      {isProcessed && (
        <Tabs value={activeTab} onChange={setActiveTab}>
          <TabsHeader>
            <Tab value="summary">Summary</Tab>
            <Tab value="procedures">Procedures</Tab>
            <Tab value="graph">Knowledge Graph</Tab>
            <Tab value="changes">Changes</Tab>
          </TabsHeader>
          <TabsBody>
            <TabPanel value="summary">
              <div className="space-y-5 pt-2">
                {ks.metadata?.summary && (
                  <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm p-5">
                    <Typography className="font-semibold text-zinc-700 mb-2">Summary</Typography>
                    <Typography variant="small" className="text-zinc-500 leading-relaxed">{ks.metadata.summary}</Typography>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "Topics Extracted", value: ks.extracted_topics_count ?? ks.metadata?.topics_count ?? 0 },
                    { label: "Procedures", value: ks.procedures_count ?? 0 },
                    { label: "Training Program", value: ks.metadata?.has_training ? "Generated ✓" : "Not yet" },
                  ].map((m) => (
                    <div key={m.label} className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm p-4 text-center">
                      <Typography variant="h4" className="font-extrabold text-indigo-600">{m.value}</Typography>
                      <Typography variant="small" className="text-zinc-400">{m.label}</Typography>
                    </div>
                  ))}
                </div>
                {ks.metadata?.topics?.length > 0 && (
                  <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm p-5">
                    <Typography className="font-semibold text-zinc-700 mb-3">Topics</Typography>
                    <div className="flex flex-wrap gap-2">
                      {ks.metadata.topics.map((t, i) => (
                        <span key={i} className="text-sm px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full font-medium">
                          {typeof t === "string" ? t : t.name || t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabPanel>
            <TabPanel value="procedures">
              <div className="pt-2"><ProceduresTab ksId={id} /></div>
            </TabPanel>
            <TabPanel value="graph">
              <div className="pt-2"><GraphCanvas ksId={id} /></div>
            </TabPanel>
            <TabPanel value="changes">
              <div className="pt-2"><ChangeHistoryTab ksId={id} /></div>
            </TabPanel>
          </TabsBody>
        </Tabs>
      )}

      {/* Pending state message */}
      {isPending && !isProcessing && (
        <div className="bg-zinc-50 rounded-2xl border border-dashed border-zinc-300 p-10 text-center">
          <DocumentTextIcon className="h-12 w-12 mx-auto text-zinc-300 mb-3" />
          <Typography className="font-semibold text-zinc-500">Ready to process</Typography>
          <Typography variant="small" className="text-zinc-400 mt-1">
            Click "Process with AI" to extract concepts, procedures and build the knowledge graph.
          </Typography>
        </div>
      )}
    </div>
  );
}

export default KnowledgeSourceDetail;

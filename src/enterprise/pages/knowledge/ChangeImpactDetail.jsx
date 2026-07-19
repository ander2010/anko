import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Typography, Button } from "@material-tailwind/react";
import {
  ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon,
  LightBulbIcon, SparklesIcon,
} from "@heroicons/react/24/outline";
import { knowledgeApi } from "../../api/enterpriseApi";
import { useEnterprise } from "../../context/enterprise-context";
import { useLanguage } from "../../../context/language-context";
import { TableSkeleton } from "../../components/LoadingSkeleton";

function ImpactBadge({ level }) {
  const { t } = useLanguage();
  const map = {
    low:      { label: t("enterprise.knowledge.changeImpact.levels.low"),      cls: "bg-green-100 text-green-700" },
    medium:   { label: t("enterprise.knowledge.changeImpact.levels.medium"),   cls: "bg-amber-100 text-amber-700" },
    high:     { label: t("enterprise.knowledge.changeImpact.levels.high"),     cls: "bg-orange-100 text-orange-700" },
    critical: { label: t("enterprise.knowledge.changeImpact.levels.critical"), cls: "bg-red-100 text-red-700" },
  };
  const s = map[level] || { label: level?.toUpperCase() || "—", cls: "bg-zinc-100 text-zinc-500" };
  return (
    <span className={`inline-block text-sm font-black px-3 py-1 rounded-full ${s.cls}`}>{s.label}</span>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending:   "bg-zinc-100 text-zinc-500",
    analyzing: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    failed:    "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${map[status] || "bg-zinc-100 text-zinc-400"}`}>
      {status}
    </span>
  );
}

export function ChangeImpactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { activeCompanyId } = useEnterprise();
  const [ci, setCi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [toast, setToast] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    knowledgeApi.getChangeImpact(id)
      .then(setCi)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 4000); };

  const handleAnalyze = async () => {
    setActionLoading("analyze");
    try {
      await knowledgeApi.analyzeImpact(id);
      showToast(t("enterprise.knowledge.changeImpact.toast.analysisStarted"));
      const poll = setInterval(async () => {
        try {
          const updated = await knowledgeApi.getChangeImpact(id);
          setCi(updated);
          if (updated.status !== "analyzing") clearInterval(poll);
        } catch { clearInterval(poll); }
      }, 3000);
    } catch (e) {
      showToast(t("enterprise.knowledge.changeImpact.toast.analysisFailed", { error: e?.detail || t("enterprise.knowledge.changeImpact.toast.unknownError") }));
    } finally {
      setActionLoading("");
    }
  };

  const handleApply = async () => {
    if (!window.confirm(t("enterprise.knowledge.changeImpact.confirmApply"))) return;
    setActionLoading("apply");
    try {
      await knowledgeApi.applyImpact(id);
      showToast(t("enterprise.knowledge.changeImpact.toast.regenerated"));
      load();
    } catch (e) {
      showToast(t("enterprise.knowledge.changeImpact.toast.applyFailed", { error: e?.detail || t("enterprise.knowledge.changeImpact.toast.unknownError") }));
    } finally {
      setActionLoading("");
    }
  };

  if (loading) return <TableSkeleton rows={4} cols={3} />;
  if (!ci) return <Typography className="text-red-500">{t("enterprise.knowledge.changeImpact.notFound")}</Typography>;

  const isCompleted = ci.status === "completed";
  const isPending = ci.status === "pending";
  const isAnalyzing = ci.status === "analyzing";

  return (
    <div className="space-y-6 max-w-4xl">
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white text-sm px-5 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <button onClick={() => navigate(-1)} className="text-zinc-400 hover:text-indigo-600 text-sm">
            ← {t("enterprise.compliance.programDetail.back")}
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <Typography variant="h5" className="font-extrabold text-zinc-900">{t("enterprise.knowledge.changeImpact.title")}</Typography>
            <StatusBadge status={ci.status} />
            {isCompleted && <ImpactBadge level={ci.impact_level} />}
          </div>
          {ci.knowledge_source_title && (
            <Typography variant="small" className="text-zinc-400">
              {t("enterprise.knowledge.changeImpact.knowledgeSource")}{" "}
              <span className="text-indigo-500 cursor-pointer"
                onClick={() => navigate(`/enterprise/knowledge/${ci.knowledge_source}`)}>
                {ci.knowledge_source_title}
              </span>
            </Typography>
          )}
        </div>
        <div className="flex gap-2">
          {isPending && (
            <Button color="indigo" className="normal-case" loading={actionLoading === "analyze"} onClick={handleAnalyze}>
              {t("enterprise.knowledge.changeImpact.runAnalysis")}
            </Button>
          )}
          {isCompleted && !ci.training_regenerated && (
            <Button color="purple" className="normal-case flex items-center gap-2"
              loading={actionLoading === "apply"} onClick={handleApply}>
              <SparklesIcon className="h-4 w-4" /> {t("enterprise.knowledge.changeImpact.regenerateTraining")}
            </Button>
          )}
        </div>
      </div>

      {/* Analyzing state */}
      {isAnalyzing && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-center gap-4">
          <ArrowPathIcon className="h-6 w-6 text-blue-600 animate-spin flex-shrink-0" />
          <div>
            <Typography className="font-semibold text-blue-800">{t("enterprise.knowledge.changeImpact.comparingVersions")}</Typography>
            <Typography variant="small" className="text-blue-400">{t("enterprise.knowledge.changeImpact.mayTakeSeconds")}</Typography>
          </div>
        </div>
      )}

      {/* Pending state */}
      {isPending && (
        <div className="bg-zinc-50 border border-dashed border-zinc-300 rounded-2xl p-10 text-center">
          <ExclamationTriangleIcon className="h-10 w-10 mx-auto text-zinc-300 mb-3" />
          <Typography className="font-semibold text-zinc-500">{t("enterprise.knowledge.changeImpact.notYetRun")}</Typography>
          <Typography variant="small" className="text-zinc-400 mt-1">
            {t("enterprise.knowledge.changeImpact.notYetRunHint")}
          </Typography>
        </div>
      )}

      {/* Completed state */}
      {isCompleted && (
        <>
          {/* Metrics row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: t("enterprise.knowledge.changeImpact.metrics.topics"),     value: ci.affected_topics_count     ?? ci.analysis_results?.topics_affected     ?? 0, color: "text-amber-600" },
              { label: t("enterprise.knowledge.changeImpact.metrics.paths"),       value: ci.affected_paths_count      ?? ci.analysis_results?.paths_affected      ?? 0, color: "text-orange-600" },
              { label: t("enterprise.knowledge.changeImpact.metrics.procedures"),  value: ci.affected_procedures_count ?? ci.analysis_results?.procedures_affected ?? 0, color: "text-red-600" },
            ].map((m) => (
              <div key={m.label} className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm p-5 text-center">
                <Typography variant="h3" className={`font-extrabold ${m.color}`}>{m.value}</Typography>
                <Typography variant="small" className="text-zinc-400">{m.label}</Typography>
              </div>
            ))}
          </div>

          {/* Summary */}
          {ci.summary && (
            <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm p-5">
              <Typography className="font-semibold text-zinc-700 mb-2">{t("enterprise.knowledge.changeImpact.analysisSummary")}</Typography>
              <Typography variant="small" className="text-zinc-500 leading-relaxed">{ci.summary}</Typography>
            </div>
          )}

          {/* Key changes */}
          {ci.key_changes?.length > 0 && (
            <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm p-5">
              <Typography className="font-semibold text-zinc-700 mb-3">{t("enterprise.knowledge.changeImpact.keyChanges")}</Typography>
              <ul className="space-y-2">
                {ci.key_changes.map((change, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-zinc-600">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0" />
                    {typeof change === "string" ? change : change.description || JSON.stringify(change)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {ci.recommendations?.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <LightBulbIcon className="h-5 w-5 text-amber-600" />
                <Typography className="font-semibold text-amber-800">{t("enterprise.knowledge.changeImpact.recommendations")}</Typography>
              </div>
              <ul className="space-y-2">
                {ci.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-amber-700">
                    <CheckCircleIcon className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-500" />
                    {typeof rec === "string" ? rec : rec.text || JSON.stringify(rec)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Training status */}
          {ci.training_regenerated ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <div>
                <Typography className="font-semibold text-green-700">{t("enterprise.knowledge.changeImpact.regenerated")}</Typography>
                {ci.training_regenerated_at && (
                  <Typography variant="small" className="text-green-400">
                    {new Date(ci.training_regenerated_at).toLocaleString()}
                  </Typography>
                )}
              </div>
              <Button size="sm" color="green" variant="outlined" className="normal-case ml-auto"
                onClick={() => navigate("/enterprise/learning/programs")}>
                {t("enterprise.knowledge.changeImpact.viewNewProgram")}
              </Button>
            </div>
          ) : (
            <div className="bg-zinc-50 border border-dashed border-zinc-300 rounded-xl p-4 flex items-center justify-between gap-4">
              <Typography variant="small" className="text-zinc-500">
                {t("enterprise.knowledge.changeImpact.notRegeneratedYet")}
              </Typography>
              <Button color="purple" className="normal-case flex items-center gap-2 flex-shrink-0"
                loading={actionLoading === "apply"} onClick={handleApply}>
                <SparklesIcon className="h-4 w-4" /> {t("enterprise.knowledge.changeImpact.regenerateTraining")}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ChangeImpactDetail;

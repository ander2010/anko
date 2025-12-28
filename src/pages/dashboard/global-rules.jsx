import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Spinner,
  Button,
  IconButton,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Select,
  Option,
  Tooltip,
} from "@material-tailwind/react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import projectService from "@/services/projectService";
import { useLanguage } from "@/context/language-context";

export function GlobalRules() {
  const { t, language } = useLanguage();
  const [rules, setRules] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loadingRules, setLoadingRules] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState(null);

  // ---- Row busy ----
  const [rowBusy, setRowBusy] = useState({}); // { [ruleId]: true }
  const setBusy = (ruleId, value) => setRowBusy((p) => ({ ...p, [ruleId]: value }));

  // ---- Edit dialog ----
  const [editOpen, setEditOpen] = useState(false);
  const [editRule, setEditRule] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Campos del RuleModel (según tu backend):
  // name, topic_scope (nullable), global_count, time_limit, distribution_strategy, difficulty, project
  const [editForm, setEditForm] = useState({
    name: "",
    topic_scope: null,
    global_count: 10,
    time_limit: 10,
    distribution_strategy: "singleChoice",
    difficulty: "Medium",
  });

  // ---- Delete dialog ----
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteRule, setDeleteRule] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ---- Topics (para dropdown topic_scope) ----
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  // ---------- fetchers ----------
  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const data = await projectService.getProjects();
      const list = Array.isArray(data) ? data : data?.results || [];
      setProjects(list);
    } catch (e) {
      setProjects([]);
      console.error("Failed to load projects", e);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchRules = async () => {
    try {
      setLoadingRules(true);
      setError(null);

      // Como no tienes getRules() global en service, usamos el endpoint directo con api:
      // Pero para mantenerlo simple sin tocar tu service, hacemos esta “convención”:
      // -> si tienes un endpoint /rules/ global, agrega projectService.getRules() y úsalo aquí.
      // Por ahora: intentamos llamar a /rules/ via un helper rápido:
      const data = await projectService.getAllRules?.(); // si existe, perfecto
      if (data) {
        const list = Array.isArray(data) ? data : data?.results || [];
        setRules(list);
        return;
      }

      // Fallback: si NO agregaste getAllRules, intentamos cargar reglas por cada proyecto y unir.
      const projs = Array.isArray(projects) && projects.length ? projects : (await projectService.getProjects());
      const projsList = Array.isArray(projs) ? projs : projs?.results || [];

      const all = [];
      for (const p of projsList) {
        try {
          const r = await projectService.getProjectRules(p.id);
          const list = Array.isArray(r) ? r : r?.results || [];
          all.push(...list);
        } catch (e) {
          // ignoramos por proyecto
        }
      }

      // dedupe por id
      const map = new Map();
      all.forEach((r) => map.set(r.id, r));
      setRules(Array.from(map.values()));
    } catch (e) {
      setRules([]);
      setError(e?.error || e?.detail || "Failed to load rules");
    } finally {
      setLoadingRules(false);
    }
  };

  const fetchTopics = async () => {
    try {
      setLoadingTopics(true);
      const data = await projectService.getTopics();
      const list = Array.isArray(data) ? data : data?.results || [];
      setTopics(list);
    } catch (e) {
      setTopics([]);
    } finally {
      setLoadingTopics(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cuando ya hay projects listos, cargar rules
  useEffect(() => {
    if (!loadingProjects) {
      fetchRules();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingProjects]);

  // ---------- project name map ----------
  const projectNameById = useMemo(() => {
    const map = new Map();
    (projects || []).forEach((p) => {
      map.set(p.id, p.title || p.name || `Project #${p.id}`);
    });
    return map;
  }, [projects]);

  const getProjectName = (projectId) => {
    if (!projectId) return "—";
    return projectNameById.get(projectId) || `Project #${projectId}`;
  };

  // ---------- helpers shapes ----------
  const getRuleProjectId = (r) => r?.projectId ?? r?.project ?? r?.project_id ?? null;
  const getRuleTotalQuestions = (r) => Number(r?.global_count ?? r?.globalCount ?? 0);

  const getStrategyLabel = (s) => {
    if (s === "singleChoice") return "SC";
    if (s === "multiSelect") return "MS";
    if (s === "trueFalse") return "TF";
    return s || "—";
  };

  const topicNameById = useMemo(() => {
    const map = new Map();
    (topics || []).forEach((t) => map.set(t.id, t.name));
    return map;
  }, [topics]);

  // ---------- EDIT ----------
  const openEdit = (rule) => {
    setEditRule(rule);

    setEditForm({
      name: rule?.name || "",
      topic_scope: rule?.topic_scope ?? rule?.topicScope ?? null,
      global_count: Number(rule?.global_count ?? rule?.globalCount ?? 10),
      time_limit: Number(rule?.time_limit ?? rule?.timeLimit ?? 10),
      distribution_strategy: rule?.distribution_strategy ?? rule?.distributionStrategy ?? "singleChoice",
      difficulty: rule?.difficulty ?? "Medium",
    });

    setEditOpen(true);
  };

  const closeEdit = () => {
    if (savingEdit) return;
    setEditOpen(false);
    setEditRule(null);
  };

  const saveEdit = async () => {
    if (!editRule?.id) return;

    const name = (editForm.name || "").trim();
    if (!name) {
      setError("Rule name is required.");
      return;
    }

    const global_count = Number(editForm.global_count);
    const time_limit = Number(editForm.time_limit);

    if (!Number.isFinite(global_count) || global_count <= 0) {
      setError("global_count must be a number > 0.");
      return;
    }
    if (!Number.isFinite(time_limit) || time_limit <= 0) {
      setError("time_limit must be a number > 0.");
      return;
    }

    setSavingEdit(true);
    setBusy(editRule.id, true);
    setError(null);

    try {
      await projectService.updateRule(editRule.id, {
        name,
        topic_scope: editForm.topic_scope || null,
        global_count,
        time_limit,
        distribution_strategy: editForm.distribution_strategy,
        difficulty: editForm.difficulty,
      });

      setEditOpen(false);
      setEditRule(null);
      await fetchRules();
    } catch (e) {
      setError(e?.detail || e?.error || "Failed to update rule");
    } finally {
      setSavingEdit(false);
      setBusy(editRule.id, false);
    }
  };

  // ---------- DELETE ----------
  const openDelete = (rule) => {
    setDeleteRule(rule);
    setDeleteOpen(true);
  };

  const closeDelete = () => {
    if (deleting) return;
    setDeleteOpen(false);
    setDeleteRule(null);
  };

  const confirmDelete = async () => {
    if (!deleteRule?.id) return;

    setDeleting(true);
    setBusy(deleteRule.id, true);
    setError(null);

    try {
      await projectService.deleteRule(deleteRule.id);
      setDeleteOpen(false);
      setDeleteRule(null);
      await fetchRules();
    } catch (e) {
      setError(e?.detail || e?.error || "Failed to delete rule");
    } finally {
      setDeleting(false);
      setBusy(deleteRule.id, false);
    }
  };

  const isLoading = loadingRules || loadingProjects;

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            {t("global.rules.title")}
          </Typography>
        </CardHeader>

        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          {error && (
            <div className="px-6 pb-4">
              <Typography color="red" variant="small">
                {error}
              </Typography>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Spinner className="h-10 w-10 mb-4" />
              <Typography className="text-blue-gray-600">{t("global.rules.loading")}</Typography>
            </div>
          ) : (
            <table className="w-full min-w-[900px] table-auto">
              <thead>
                <tr>
                  {[
                    t("global.rules.table.name"),
                    t("global.rules.table.project"),
                    t("global.rules.table.topic"),
                    t("global.rules.table.questions"),
                    t("global.rules.table.strategy"),
                    t("global.rules.table.difficulty"),
                    t("global.rules.table.actions")
                  ].map((el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-5 text-left"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-bold uppercase text-blue-gray-400"
                      >
                        {el}
                      </Typography>
                    </th>
                  )
                  )}
                </tr>
              </thead>

              <tbody>
                {rules.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center">
                      <Typography variant="small" color="blue-gray">
                        {t("global.rules.no_rules")}
                      </Typography>
                    </td>
                  </tr>
                ) : (
                  rules.map((r, key) => {
                    const className = `py-3 px-5 ${key === rules.length - 1 ? "" : "border-b border-blue-gray-50"
                      }`;

                    const projectId = getRuleProjectId(r);
                    const totalQs = getRuleTotalQuestions(r);
                    const strategy = r?.distribution_strategy ?? r?.distributionStrategy;
                    const difficulty = r?.difficulty || "—";
                    const topicScopeId = r?.topic_scope ?? r?.topicScope ?? null;

                    const busy = !!rowBusy[r.id];

                    return (
                      <tr key={r.id}>
                        <td className={className}>
                          <Typography variant="small" color="blue-gray" className="font-semibold">
                            {r.name}
                          </Typography>
                        </td>

                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {getProjectName(projectId)}
                          </Typography>
                        </td>

                        <td className={className}>
                          <Typography className="text-xs text-blue-gray-600">
                            {topicScopeId ? (topicNameById.get(topicScopeId) || `${t("project_detail.tabs.topics")} #${topicScopeId}`) : (language === "es" ? "Global" : "Global")}
                          </Typography>
                        </td>

                        <td className={className}>
                          <Typography className="text-xs font-bold text-blue-gray-700">
                            {totalQs}
                          </Typography>
                        </td>

                        <td className={className}>
                          <span className="bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded font-semibold">
                            {getStrategyLabel(strategy)}
                          </span>
                        </td>

                        <td className={className}>
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded font-semibold">
                            {difficulty}
                          </span>
                        </td>

                        <td className={className}>
                          <div className="flex items-center gap-2">
                            <Tooltip content={language === "es" ? "Editar regla" : "Edit rule"}>
                              <IconButton
                                variant="text"
                                color="blue-gray"
                                disabled={busy}
                                onClick={() => openEdit(r)}
                              >
                                <PencilIcon className="h-5 w-5" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip content={language === "es" ? "Eliminar regla" : "Delete rule"}>
                              <IconButton
                                variant="text"
                                color="red"
                                disabled={busy}
                                onClick={() => openDelete(r)}
                              >
                                <TrashIcon className="h-5 w-5" />
                              </IconButton>
                            </Tooltip>

                            {busy && <Spinner className="h-4 w-4" />}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      {/* ---------------- EDIT DIALOG ---------------- */}
      <Dialog open={editOpen} handler={closeEdit} size="sm">
        <DialogHeader>{language === "es" ? "Editar Regla" : "Edit Rule"}</DialogHeader>
        <DialogBody className="space-y-4">
          <div>
            <Typography variant="small" className="mb-1 text-blue-gray-600 font-semibold">
              {language === "es" ? "Nombre" : "Name"}
            </Typography>
            <Input
              value={editForm.name}
              onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
              placeholder={language === "es" ? "Nombre de la regla" : "Rule name"}
              crossOrigin=""
            />
          </div>

          <div>
            <Typography variant="small" className="mb-1 text-blue-gray-600 font-semibold">
              {t("global.rules.table.topic")}
            </Typography>
            <Select
              value={editForm.topic_scope ? String(editForm.topic_scope) : "null"}
              onChange={(val) =>
                setEditForm((p) => ({ ...p, topic_scope: val === "null" ? null : Number(val) }))
              }
            >
              <Option value="null">{language === "es" ? "Global (sin alcance de tema)" : "Global (no topic scope)"}</Option>
              {loadingTopics ? (
                <Option value="null">{t("global.topics.loading")}</Option>
              ) : (
                (topics || []).map((t) => (
                  <Option key={t.id} value={String(t.id)}>
                    {t.name}
                  </Option>
                ))
              )}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Typography variant="small" className="mb-1 text-blue-gray-600 font-semibold">
                {language === "es" ? "Total Preguntas" : "Total Questions"}
              </Typography>
              <Input
                type="number"
                value={String(editForm.global_count)}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, global_count: e.target.value }))
                }
                crossOrigin=""
              />
            </div>

            <div>
              <Typography variant="small" className="mb-1 text-blue-gray-600 font-semibold">
                {language === "es" ? "Límite de Tiempo (minutos)" : "Time Limit (minutes)"}
              </Typography>
              <Input
                type="number"
                value={String(editForm.time_limit)}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, time_limit: e.target.value }))
                }
                crossOrigin=""
              />
            </div>
          </div>

          <div>
            <Typography variant="small" className="mb-1 text-blue-gray-600 font-semibold">
              {t("global.rules.table.strategy")}
            </Typography>
            <Select
              value={editForm.distribution_strategy}
              onChange={(val) => setEditForm((p) => ({ ...p, distribution_strategy: val }))}
            >
              <Option value="singleChoice">singleChoice</Option>
              <Option value="multiSelect">multiSelect</Option>
              <Option value="trueFalse">trueFalse</Option>
            </Select>
          </div>

          <div>
            <Typography variant="small" className="mb-1 text-blue-gray-600 font-semibold">
              {t("global.rules.table.difficulty")}
            </Typography>
            <Select
              value={editForm.difficulty}
              onChange={(val) => setEditForm((p) => ({ ...p, difficulty: val }))}
            >
              <Option value="Easy">{language === "es" ? "Fácil" : "Easy"}</Option>
              <Option value="Medium">{language === "es" ? "Medio" : "Medium"}</Option>
              <Option value="Hard">{language === "es" ? "Difícil" : "Hard"}</Option>
            </Select>
          </div>

          {editRule?.id ? (
            <Typography variant="small" className="text-blue-gray-400">
              Rule ID: {editRule.id}
            </Typography>
          ) : null}
        </DialogBody>

        <DialogFooter className="gap-2">
          <Button variant="text" color="blue-gray" onClick={closeEdit} disabled={savingEdit}>
            {language === "es" ? "Cancelar" : "Cancel"}
          </Button>
          <Button color="blue" onClick={saveEdit} disabled={savingEdit}>
            {savingEdit ? (language === "es" ? "Guardando..." : "Saving...") : (language === "es" ? "Guardar" : "Save")}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* ---------------- DELETE DIALOG ---------------- */}
      <Dialog open={deleteOpen} handler={closeDelete} size="sm">
        <DialogHeader>{language === "es" ? "Eliminar Regla" : "Delete Rule"}</DialogHeader>
        <DialogBody>
          <Typography color="blue-gray">
            {language === "es" ? "¿Estás seguro de que quieres eliminar " : "Are you sure you want to delete "}
            <span className="font-semibold">{deleteRule?.name}</span>?
          </Typography>
          <Typography variant="small" className="text-blue-gray-400 mt-2">
            {language === "es" ? "Esta acción no se puede deshacer." : "This action cannot be undone."}
          </Typography>
        </DialogBody>

        <DialogFooter className="gap-2">
          <Button variant="text" color="blue-gray" onClick={closeDelete} disabled={deleting}>
            {language === "es" ? "Cancelar" : "Cancel"}
          </Button>
          <Button color="red" onClick={confirmDelete} disabled={deleting}>
            {deleting ? (language === "es" ? "Eliminando..." : "Deleting...") : (language === "es" ? "Eliminar" : "Delete")}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default GlobalRules;

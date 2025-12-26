import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Spinner,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Input,
  Select,
  Option,
} from "@material-tailwind/react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";

import projectService from "@/services/projectService";

export function GlobalBatteries() {
  const [batteries, setBatteries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [rules, setRules] = useState([]);
  const [topics, setTopics] = useState([]);

  const [loadingBatteries, setLoadingBatteries] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingRules, setLoadingRules] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(true);

  const [error, setError] = useState(null);

  // per-row busy
  const [rowBusy, setRowBusy] = useState({});
  const setBusy = (batteryId, value) => setRowBusy((p) => ({ ...p, [batteryId]: value }));

  // ---------- EDIT ----------
  const [editOpen, setEditOpen] = useState(false);
  const [editBattery, setEditBattery] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Battery model (según tu backend):
  // project, rule, name, status: Draft/Ready, difficulty: Easy/Medium/Hard
  const [editForm, setEditForm] = useState({
    name: "",
    status: "Draft",
    difficulty: "Medium",
    rule: null,
  });

  // ---------- DELETE ----------
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBattery, setDeleteBattery] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ---------- Fetchers ----------
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

  const fetchRules = async () => {
    try {
      setLoadingRules(true);

      // si tienes un endpoint global /rules/, lo ideal es projectService.getAllRules()
      const data = await projectService.getAllRules?.();
      if (data) {
        const list = Array.isArray(data) ? data : data?.results || [];
        setRules(list);
        return;
      }

      // fallback: por proyecto
      const projs = Array.isArray(projects) && projects.length ? projects : (await projectService.getProjects());
      const projsList = Array.isArray(projs) ? projs : projs?.results || [];

      const all = [];
      for (const p of projsList) {
        try {
          const r = await projectService.getProjectRules(p.id);
          const list = Array.isArray(r) ? r : r?.results || [];
          all.push(...list);
        } catch (e) {
          // ignore
        }
      }

      // dedupe
      const map = new Map();
      all.forEach((r) => map.set(r.id, r));
      setRules(Array.from(map.values()));
    } catch (e) {
      setRules([]);
    } finally {
      setLoadingRules(false);
    }
  };

  const fetchBatteries = async () => {
    try {
      setLoadingBatteries(true);
      setError(null);

      // ideal: endpoint global /batteries/ => projectService.getAllBatteries()
      const data = await projectService.getAllBatteries?.();
      if (data) {
        const list = Array.isArray(data) ? data : data?.results || [];
        setBatteries(list);
        return;
      }

      // fallback: por proyecto
      const projs = Array.isArray(projects) && projects.length ? projects : (await projectService.getProjects());
      const projsList = Array.isArray(projs) ? projs : projs?.results || [];

      const all = [];
      for (const p of projsList) {
        try {
          const b = await projectService.getProjectBatteries(p.id);
          const list = Array.isArray(b) ? b : b?.results || [];
          all.push(...list);
        } catch (e) {
          // ignore
        }
      }

      // dedupe
      const map = new Map();
      all.forEach((b) => map.set(b.id, b));
      setBatteries(Array.from(map.values()));
    } catch (e) {
      setBatteries([]);
      setError(e?.error || e?.detail || "Failed to load batteries");
    } finally {
      setLoadingBatteries(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // cuando projects listos, cargar rules y batteries
  useEffect(() => {
    if (!loadingProjects) {
      fetchRules();
      fetchBatteries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingProjects]);

  // ---------- Maps ----------
  const projectNameById = useMemo(() => {
    const map = new Map();
    (projects || []).forEach((p) => map.set(p.id, p.title || p.name || `Project #${p.id}`));
    return map;
  }, [projects]);

  const ruleNameById = useMemo(() => {
    const map = new Map();
    (rules || []).forEach((r) => map.set(r.id, r.name || `Rule #${r.id}`));
    return map;
  }, [rules]);

  const topicNameById = useMemo(() => {
    const map = new Map();
    (topics || []).forEach((t) => map.set(t.id, t.name || `Topic #${t.id}`));
    return map;
  }, [topics]);

  const getProjectName = (projectId) => projectNameById.get(projectId) || (projectId ? `Project #${projectId}` : "—");
  const getRuleName = (ruleId) => ruleNameById.get(ruleId) || (ruleId ? `Rule #${ruleId}` : "Unknown/Deleted Rule");
  const getTopicName = (topicId) => (topicId ? (topicNameById.get(topicId) || `Topic #${topicId}`) : "Global (All Topics)");

  // ---------- shape helpers ----------
  const getBatteryProjectId = (b) => b?.projectId ?? b?.project ?? b?.project_id ?? null;
  const getBatteryRuleId = (b) => b?.ruleId ?? b?.rule ?? b?.courseId ?? b?.course_id ?? null; // compat
  const getBatteryStatus = (b) => b?.status ?? "Draft";
  const getBatteryDifficulty = (b) => b?.difficulty ?? "Medium";
  const getBatteryQuestionsCount = (b) => {
    if (Array.isArray(b?.questions)) return b.questions.length;
    if (typeof b?.questions_count === "number") return b.questions_count;
    // backend te manda questions embebidas en BatterySerializer:
    if (Array.isArray(b?.questions_rel)) return b.questions_rel.length;
    return 0;
  };

  // topic scope real está en Rule (topic_scope). Battery no tiene topicId en tu modelo.
  // Entonces para mostrar “Topic Scope” usamos el rule.topic_scope si encontramos el rule.
  const getRuleTopicScopeId = (ruleId) => {
    const r = (rules || []).find((x) => x.id === ruleId);
    return r?.topic_scope ?? r?.topicScope ?? null;
  };

  // ---------- EDIT handlers ----------
  const openEdit = (battery) => {
    setEditBattery(battery);

    setEditForm({
      name: battery?.name || "",
      status: getBatteryStatus(battery) || "Draft",
      difficulty: getBatteryDifficulty(battery) || "Medium",
      rule: getBatteryRuleId(battery),
    });

    setEditOpen(true);
  };

  const closeEdit = () => {
    if (savingEdit) return;
    setEditOpen(false);
    setEditBattery(null);
  };

  const saveEdit = async () => {
    if (!editBattery?.id) return;

    const name = (editForm.name || "").trim();
    if (!name) {
      setError("Battery name is required.");
      return;
    }

    setSavingEdit(true);
    setBusy(editBattery.id, true);
    setError(null);

    try {
      await projectService.updateBattery(editBattery.id, {
        name,
        status: editForm.status,
        difficulty: editForm.difficulty,
        rule: editForm.rule || null,
      });

      setEditOpen(false);
      setEditBattery(null);
      await fetchBatteries();
    } catch (e) {
      setError(e?.detail || e?.error || "Failed to update battery");
    } finally {
      setSavingEdit(false);
      setBusy(editBattery.id, false);
    }
  };

  // ---------- DELETE handlers ----------
  const openDelete = (battery) => {
    setDeleteBattery(battery);
    setDeleteOpen(true);
  };

  const closeDelete = () => {
    if (deleting) return;
    setDeleteOpen(false);
    setDeleteBattery(null);
  };

  const confirmDelete = async () => {
    if (!deleteBattery?.id) return;

    setDeleting(true);
    setBusy(deleteBattery.id, true);
    setError(null);

    try {
      await projectService.deleteBattery(deleteBattery.id);
      setDeleteOpen(false);
      setDeleteBattery(null);
      await fetchBatteries();
    } catch (e) {
      setError(e?.detail || e?.error || "Failed to delete battery");
    } finally {
      setDeleting(false);
      setBusy(deleteBattery.id, false);
    }
  };

  const isLoading = loadingProjects || loadingRules || loadingTopics || loadingBatteries;

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Global Batteries List
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
              <Typography className="text-blue-gray-600">Loading batteries...</Typography>
            </div>
          ) : (
            <table className="w-full min-w-[1100px] table-auto">
              <thead>
                <tr>
                  {["Battery Name", "Status", "Difficulty", "Project", "Rule", "Topic Scope", "Questions", "Actions"].map(
                    (el) => (
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
                {batteries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-4 text-center">
                      <Typography variant="small" color="blue-gray">
                        No batteries found.
                      </Typography>
                    </td>
                  </tr>
                ) : (
                  batteries.map((b, key) => {
                    const className = `py-3 px-5 ${
                      key === batteries.length - 1 ? "" : "border-b border-blue-gray-50"
                    }`;

                    const projectId = getBatteryProjectId(b);
                    const ruleId = getBatteryRuleId(b);
                    const topicScopeId = getRuleTopicScopeId(ruleId);

                    const status = getBatteryStatus(b);
                    const difficulty = getBatteryDifficulty(b);
                    const questionsCount = getBatteryQuestionsCount(b);

                    const busy = !!rowBusy[b.id];

                    return (
                      <tr key={b.id}>
                        <td className={className}>
                          <Typography variant="small" color="blue-gray" className="font-semibold">
                            {b.name}
                          </Typography>
                        </td>

                        <td className={className}>
                          <Chip
                            variant="ghost"
                            color={status === "Ready" ? "green" : "blue-gray"}
                            value={status}
                            className="py-0.5 px-2 text-[11px] font-medium w-fit"
                          />
                        </td>

                        <td className={className}>
                          <Chip
                            variant="ghost"
                            color={difficulty === "Easy" ? "green" : difficulty === "Hard" ? "red" : "amber"}
                            value={difficulty || "Medium"}
                            className="py-0.5 px-2 text-[11px] font-medium w-fit"
                          />
                        </td>

                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {getProjectName(projectId)}
                          </Typography>
                        </td>

                        <td className={className}>
                          <Typography className="text-xs text-blue-gray-600">
                            {getRuleName(ruleId)}
                          </Typography>
                        </td>

                        <td className={className}>
                          <Typography className="text-xs text-blue-gray-600">
                            {getTopicName(topicScopeId)}
                          </Typography>
                        </td>

                        <td className={className}>
                          <Typography className="text-xs font-bold text-blue-gray-700">
                            {questionsCount}
                          </Typography>
                        </td>

                        <td className={className}>
                          <div className="flex items-center gap-2">
                            <Tooltip content="Edit battery">
                              <IconButton
                                variant="text"
                                color="blue-gray"
                                disabled={busy}
                                onClick={() => openEdit(b)}
                              >
                                <PencilIcon className="h-5 w-5" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip content="Delete battery">
                              <IconButton
                                variant="text"
                                color="red"
                                disabled={busy}
                                onClick={() => openDelete(b)}
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
        <DialogHeader>Edit Battery</DialogHeader>
        <DialogBody className="space-y-4">
          <div>
            <Typography variant="small" className="mb-1 text-blue-gray-600 font-semibold">
              Name
            </Typography>
            <Input
              value={editForm.name}
              onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Battery name"
              crossOrigin=""
            />
          </div>

          <div>
            <Typography variant="small" className="mb-1 text-blue-gray-600 font-semibold">
              Status
            </Typography>
            <Select
              value={editForm.status}
              onChange={(val) => setEditForm((p) => ({ ...p, status: val }))}
            >
              <Option value="Draft">Draft</Option>
              <Option value="Ready">Ready</Option>
            </Select>

            {/* Si quieres usar tus endpoints mark_ready / mark_draft en vez de patch:
                aquí lo dejamos simple con updateBattery() */}
          </div>

          <div>
            <Typography variant="small" className="mb-1 text-blue-gray-600 font-semibold">
              Difficulty
            </Typography>
            <Select
              value={editForm.difficulty}
              onChange={(val) => setEditForm((p) => ({ ...p, difficulty: val }))}
            >
              <Option value="Easy">Easy</Option>
              <Option value="Medium">Medium</Option>
              <Option value="Hard">Hard</Option>
            </Select>
          </div>

          <div>
            <Typography variant="small" className="mb-1 text-blue-gray-600 font-semibold">
              Rule
            </Typography>
            <Select
              value={editForm.rule ? String(editForm.rule) : "null"}
              onChange={(val) => setEditForm((p) => ({ ...p, rule: val === "null" ? null : Number(val) }))}
            >
              <Option value="null">No rule</Option>
              {(rules || []).map((r) => (
                <Option key={r.id} value={String(r.id)}>
                  {r.name}
                </Option>
              ))}
            </Select>
          </div>

          {editBattery?.id ? (
            <Typography variant="small" className="text-blue-gray-400">
              Battery ID: {editBattery.id}
            </Typography>
          ) : null}
        </DialogBody>

        <DialogFooter className="gap-2">
          <Button variant="text" color="blue-gray" onClick={closeEdit} disabled={savingEdit}>
            Cancel
          </Button>
          <Button color="blue" onClick={saveEdit} disabled={savingEdit}>
            {savingEdit ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* ---------------- DELETE DIALOG ---------------- */}
      <Dialog open={deleteOpen} handler={closeDelete} size="sm">
        <DialogHeader>Delete Battery</DialogHeader>
        <DialogBody>
          <Typography color="blue-gray">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{deleteBattery?.name}</span>?
          </Typography>
          <Typography variant="small" className="text-blue-gray-400 mt-2">
            This action cannot be undone.
          </Typography>
        </DialogBody>

        <DialogFooter className="gap-2">
          <Button variant="text" color="blue-gray" onClick={closeDelete} disabled={deleting}>
            Cancel
          </Button>
          <Button color="red" onClick={confirmDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default GlobalBatteries;

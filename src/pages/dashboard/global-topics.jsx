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
  Textarea,
  Select,
  Option,
  Tooltip,
} from "@material-tailwind/react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import projectService from "@/services/projectService";
import { useLanguage } from "@/context/language-context";

export function GlobalTopics() {
  const { t, language } = useLanguage();
  const [topics, setTopics] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState(null);

  // ---- Edit Dialog state ----
  const [editOpen, setEditOpen] = useState(false);
  const [editTopic, setEditTopic] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    status: "active",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // ---- Delete Dialog state ----
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTopic, setDeleteTopic] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ---- Row loading state (para bloquear botones por fila) ----
  const [rowBusy, setRowBusy] = useState({}); // { [topicId]: true }

  const setBusy = (topicId, value) => {
    setRowBusy((prev) => ({ ...prev, [topicId]: value }));
  };

  // --- fetch projects (para resolver nombre) ---
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

  // --- fetch topics global ---
  const fetchTopics = async () => {
    try {
      setLoadingTopics(true);
      setError(null);
      const data = await projectService.getTopics();
      const list = Array.isArray(data) ? data : data?.results || [];
      setTopics(list);
    } catch (e) {
      setTopics([]);
      setError(e?.error || e?.detail || "Failed to load topics");
    } finally {
      setLoadingTopics(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mapa { projectId: projectTitle }
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

  // helpers para compatibilidad con tus posibles shapes
  const getTopicProjectId = (topic) =>
    topic?.projectId ?? topic?.project ?? topic?.project_id ?? null;

  const getDocsCount = (topic) => {
    if (Array.isArray(topic?.related_documents)) return topic.related_documents.length;
    if (typeof topic?.related_documents_count === "number") return topic.related_documents_count;
    if (Array.isArray(topic?.documentIds)) return topic.documentIds.length;
    return 0;
  };

  const isLoading = loadingTopics || loadingProjects;

  // ----------------- EDIT -----------------
  const openEdit = (topic) => {
    setEditTopic(topic);
    setEditForm({
      name: topic?.name || "",
      description: topic?.description || "",
      status: topic?.status || "active",
    });
    setEditOpen(true);
  };

  const closeEdit = () => {
    if (savingEdit) return;
    setEditOpen(false);
    setEditTopic(null);
  };

  const saveEdit = async () => {
    if (!editTopic?.id) return;

    const name = (editForm.name || "").trim();
    if (!name) {
      setError("Topic name is required.");
      return;
    }

    setSavingEdit(true);
    setBusy(editTopic.id, true);
    setError(null);

    try {
      // PATCH /topics/:id/
      await projectService.updateTopic(editTopic.id, {
        name,
        description: editForm.description || "",
        status: editForm.status || "active",
      });

      setEditOpen(false);
      setEditTopic(null);

      await fetchTopics();
    } catch (e) {
      setError(e?.detail || e?.error || "Failed to update topic");
    } finally {
      setSavingEdit(false);
      setBusy(editTopic.id, false);
    }
  };

  // ----------------- DELETE -----------------
  const openDelete = (topic) => {
    setDeleteTopic(topic);
    setDeleteOpen(true);
  };

  const closeDelete = () => {
    if (deleting) return;
    setDeleteOpen(false);
    setDeleteTopic(null);
  };

  const confirmDelete = async () => {
    if (!deleteTopic?.id) return;

    setDeleting(true);
    setBusy(deleteTopic.id, true);
    setError(null);

    try {
      // DELETE /topics/:id/
      await projectService.deleteTopic(deleteTopic.id);

      setDeleteOpen(false);
      setDeleteTopic(null);

      await fetchTopics();
    } catch (e) {
      setError(e?.detail || e?.error || "Failed to delete topic");
    } finally {
      setDeleting(false);
      setBusy(deleteTopic.id, false);
    }
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue-gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            {t("global.topics.title")}
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
              <Typography className="text-blue-gray-600">
                {t("global.topics.loading")}
              </Typography>
            </div>
          ) : (
            <table className="w-full min-w-[760px] table-auto">
              <thead>
                <tr>
                  {[
                    t("global.topics.table.name"),
                    t("global.topics.table.project"),
                    t("global.topics.table.docs"),
                    t("global.topics.table.actions")
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
                  ))}
                </tr>
              </thead>

              <tbody>
                {topics.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center">
                      <Typography variant="small" color="blue-gray">
                        {t("global.topics.no_topics")}
                      </Typography>
                    </td>
                  </tr>
                ) : (
                  topics.map((t, key) => {
                    const className = `py-3 px-5 ${key === topics.length - 1 ? "" : "border-b border-blue-gray-50"
                      }`;

                    const projectId = getTopicProjectId(t);
                    const docsCount = getDocsCount(t);
                    const busy = !!rowBusy[t.id];

                    return (
                      <tr key={t.id}>
                        <td className={className}>
                          <Typography variant="small" color="blue-gray" className="font-semibold">
                            {t.name}
                          </Typography>
                          {t?.description ? (
                            <Typography variant="small" className="text-blue-gray-400">
                              {t.description}
                            </Typography>
                          ) : null}
                        </td>

                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {getProjectName(projectId)}
                          </Typography>
                          <Typography variant="small" className="text-blue-gray-400">
                            status: {t.status || "active"}
                          </Typography>
                        </td>

                        <td className={className}>
                          <Typography className="text-xs font-normal text-blue-gray-500">
                            {docsCount}
                          </Typography>
                        </td>

                        <td className={className}>
                          <div className="flex items-center gap-2">
                            <Tooltip content={language === "es" ? "Editar tema" : "Edit topic"}>
                              <IconButton
                                variant="text"
                                color="blue-gray"
                                disabled={busy}
                                onClick={() => openEdit(t)}
                              >
                                <PencilIcon className="h-5 w-5" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip content={language === "es" ? "Eliminar tema" : "Delete topic"}>
                              <IconButton
                                variant="text"
                                color="red"
                                disabled={busy}
                                onClick={() => openDelete(t)}
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
        <DialogHeader>{language === "es" ? "Editar Tema" : "Edit Topic"}</DialogHeader>
        <DialogBody className="space-y-4">
          <div>
            <Typography variant="small" className="mb-1 text-blue-gray-600 font-semibold">
              {language === "es" ? "Nombre" : "Name"}
            </Typography>
            <Input
              value={editForm.name}
              onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
              placeholder={language === "es" ? "Nombre del tema" : "Topic name"}
              crossOrigin=""
            />
          </div>

          <div>
            <Typography variant="small" className="mb-1 text-blue-gray-600 font-semibold">
              {language === "es" ? "Descripción" : "Description"}
            </Typography>
            <Textarea
              value={editForm.description}
              onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
              placeholder={language === "es" ? "Descripción opcional" : "Optional description"}
            />
          </div>

          <div>
            <Typography variant="small" className="mb-1 text-blue-gray-600 font-semibold">
              {language === "es" ? "Estado" : "Status"}
            </Typography>
            <Select
              value={editForm.status}
              onChange={(val) => setEditForm((p) => ({ ...p, status: val }))}
            >
              <Option value="active">{language === "es" ? "activo" : "active"}</Option>
              <Option value="archived">{language === "es" ? "archivado" : "archived"}</Option>
            </Select>
          </div>

          {editTopic?.id ? (
            <Typography variant="small" className="text-blue-gray-400">
              Topic ID: {editTopic.id}
            </Typography>
          ) : null}
        </DialogBody>

        <DialogFooter className="gap-2">
          <Button variant="text" color="blue-gray" onClick={closeEdit} disabled={savingEdit}>
            {language === "es" ? "Cancelar" : "Cancel"}
          </Button>
          <Button color="blue-gray" onClick={saveEdit} disabled={savingEdit}>
            {savingEdit ? (language === "es" ? "Guardando..." : "Saving...") : (language === "es" ? "Guardar" : "Save")}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* ---------------- DELETE DIALOG ---------------- */}
      <Dialog open={deleteOpen} handler={closeDelete} size="sm">
        <DialogHeader>{language === "es" ? "Eliminar Tema" : "Delete Topic"}</DialogHeader>
        <DialogBody>
          <Typography color="blue-gray">
            {language === "es" ? "¿Estás seguro de que quieres eliminar " : "Are you sure you want to delete "}
            <span className="font-semibold">{deleteTopic?.name}</span>?
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

export default GlobalTopics;

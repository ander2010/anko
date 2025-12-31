
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Tooltip,
  Spinner,
  Tabs,
  TabsHeader,
  Tab,
  Progress,
} from "@material-tailwind/react";
import {
  ArrowLeftIcon,
  DocumentArrowUpIcon,
  EllipsisVerticalIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  FolderIcon,
  PlusIcon,
  ClipboardDocumentListIcon,
  BoltIcon,
  PlayIcon,
  ViewColumnsIcon,
} from "@heroicons/react/24/outline";

import projectService from "@/services/projectService";
import { UploadDocumentsDialog } from "@/widgets/dialogs/upload-documents-dialog";
import { DocumentMetadataDialog } from "@/widgets/dialogs/document-metadata-dialog";
import { ConfirmDialog } from "@/widgets/dialogs/confirm-dialog";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/context/language-context";

// Si todavía no tienes Topics/Rules/Batteries en API, puedes dejar esto así (arrays vacíos)
import { ExamSimulatorDialog } from "@/widgets/dialogs/exam-simulator-dialog";
import { CreateTopicDialog } from "@/widgets/dialogs/create-topic-dialog";
import { EditTopicDialog } from "@/widgets/dialogs/edit-topic-dialog";
import { TopicCard } from "@/widgets/cards/topic-card";
import { ProjectProcessingProgress } from "@/widgets/project/project-processing-progress";

export function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState("documents");

  const [showGenerateBattery, setShowGenerateBattery] = useState(false);
  const [batteryForm, setBatteryForm] = useState({
    rule: "",
    query_text: "",
    sections: [],
    quantity: 10,
    difficulty: "medium",
    question_format: "true_false"
  });
  const [sectionSearch, setSectionSearch] = useState("");
  const [availableSections, setAvailableSections] = useState([]);
  const [batteryProgress, setBatteryProgress] = useState({});

  const [loadingProject, setLoadingProject] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [error, setError] = useState(null);
  const [loadingRules, setLoadingRules] = useState(false);

  const [project, setProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loadingBatteries, setLoadingBatteries] = useState(false);
  const [attempt, setAttempt] = useState(null);
  const [saving, setSaving] = useState(false);
  const [documentsWithSections, setDocumentsWithSections] = useState([]); // Store full data
  const [sectionsCounts, setSectionsCounts] = useState({});

  // dialogs
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [metadataDialogOpen, setMetadataDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  // Topics dialogs
  const [createTopicDialogOpen, setCreateTopicDialogOpen] = useState(false);
  const [editTopicDialogOpen, setEditTopicDialogOpen] = useState(false);
  const [confirmTopicDialogOpen, setConfirmTopicDialogOpen] = useState(false);

  const [confirmDeleteTopicDialogOpen, setConfirmDeleteTopicDialogOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);

  // topics/rules/batteries state

  const [topics, setTopics] = useState([]);
  const [rules, setRules] = useState([]);
  const [batteries, setBatteries] = useState([]);
  const [simulationBattery, setSimulationBattery] = useState(null);
  const [activeJobs, setActiveJobs] = useState({}); // { documentId: jobId }

  const isOwner = useMemo(() => {
    if (!project || !user) return false;
    return project?.owner?.id === user?.id;
  }, [project, user]);



  const [showCreateRule, setShowCreateRule] = useState(false);
  const [ruleForm, setRuleForm] = useState({
    name: "",
    global_count: 10,
    time_limit: 30,
    distribution_strategy: "mixed",
    difficulty: "Medium",
    topic_scope: null, // o id
  });
  const handleGenerateBattery = async () => {
    try {
      setError(null);

      // query_text is now optional

      const payload = {
        project: Number(projectId),
        query_text: batteryForm.query_text,
        sections: batteryForm.sections.length > 0 ? batteryForm.sections.map(s => s.id) : null,
        quantity: Number(batteryForm.quantity),
        difficulty: batteryForm.difficulty,
        question_format: batteryForm.question_format,
      };

      // Add optional fields
      if (batteryForm.rule) {
        payload.rule = Number(batteryForm.rule);
      }

      const res = await projectService.startGenerateBattery(payload);
      console.log("startGenerateBattery response:", res); // Debug log

      setShowGenerateBattery(false);

      // Reset form
      setBatteryForm({
        rule: "",
        query_text: "",
        sections: [],
        quantity: 10,
        difficulty: "medium",
        question_format: "true_false"
      });
      setSectionSearch("");

      await fetchBatteries(Number(projectId));

      // Init SSE for progress
      const batteryId = res?.battery?.id;
      if (batteryId) {
        const sseUrl = `${import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api"}/batteries/${batteryId}/progress-stream-bat/`;
        console.log("Initializing SSE at:", sseUrl); // Debug log

        // If 'token' is truly not needed (e.g. cookie auth or public), removes it.
        const es = new EventSource(sseUrl);

        es.onopen = () => {
          console.log("SSE Connection Opened");
        };

        es.addEventListener("progress", (e) => {
          console.log("SSE Progress Event:", e.data); // Debug log
          const data = JSON.parse(e.data);
          setBatteryProgress(prev => ({
            ...prev,
            [batteryId]: data
          }));
        });

        es.addEventListener("end", async (e) => {
          console.log("ended:", e.data);
          es.close();

          try {
            await projectService.saveQuestionsFromQa(batteryId);
          } catch (err) {
            console.error("Error saving questions:", err);
          }

          // Update status to completed or remove from progress map
          // Refresh batteries to get final data
          fetchBatteries(Number(projectId));
          setBatteryProgress(prev => {
            const newState = { ...prev };
            // remove or keep as '100%'?
            // Let's keep it as 100% until refresh or manually cleared?
            // Actually fetching batteries updates the list with 'Ready'.
            // So progress overlay can be removed.
            delete newState[batteryId];
            return newState;
          });
        });

        es.addEventListener("error", (e) => {
          console.error("SSE error", e);
          es.close();
        });
      }
    } catch (err) {
      setError(err?.error || err?.detail || "Failed to generate battery");
    }
  };

  const handleCreateRule = async () => {
    try {
      setError(null);

      if (!ruleForm.name) {
        setError("Rule name is required");
        return;
      }

      await projectService.createRule(Number(projectId), {
        name: ruleForm.name,
        global_count: Number(ruleForm.global_count) || 0,
        time_limit: Number(ruleForm.time_limit) || 0,
        distribution_strategy: ruleForm.distribution_strategy,
        difficulty: ruleForm.difficulty,
        topic_scope: ruleForm.topic_scope || null,
      });

      setShowCreateRule(false);
      setRuleForm({
        name: "",
        global_count: 10,
        time_limit: 30,
        distribution_strategy: "mixed",
        difficulty: "Medium",
        topic_scope: null,
      });

      await fetchRules(Number(projectId));
    } catch (err) {
      setError(err?.response?.data || err?.error || err?.detail || "Failed to create rule");
    }
  };



  useEffect(() => {
    const id = Number(projectId);
    if (!id) return;
    fetchAll(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    const fetchSectionsCounts = async () => {
      try {
        const data = await projectService.getDocumentsWithSections(projectId);

        // Store full list involved in sections
        setDocumentsWithSections(data.documents || []);

        const counts = {};
        data.documents?.forEach(doc => {
          counts[doc.id] = doc.sections ? doc.sections.length : 0;
        });
        setSectionsCounts(counts);
      } catch (err) {
        console.error("Failed to fetch section counts", err);
      }
    };
    if (projectId) {
      fetchSectionsCounts();
    }
  }, [projectId, documents.length]);

  useEffect(() => {
    const sections = [];
    documentsWithSections.forEach(doc => {
      if (doc.sections && Array.isArray(doc.sections)) {
        doc.sections.forEach(sec => {
          sections.push({
            id: sec.id,
            name: sec.title || sec.name || `Section ${sec.id}`,
            documentName: doc.filename || doc.name || "Unknown Doc",
            docId: doc.id
          });
        });
      }
    });
    setAvailableSections(sections.sort((a, b) => a.name.localeCompare(b.name)));
  }, [documentsWithSections]);




  const fetchTopics = async (id) => {
    const data = await projectService.getProjectTopics(id);
    setTopics(Array.isArray(data) ? data : data?.results || []);
  };


  const readyDocuments = useMemo(
    () => documents.filter((d) => d.status === "ready"),
    [documents]
  );

  const handleCreateTopic = async (topicData) => {
    try {
      setError(null);
      await projectService.createTopic(Number(projectId), topicData);
      setCreateTopicDialogOpen(false);
      await fetchTopics(Number(projectId));
    } catch (err) {
      setError(err?.error || err?.detail || "Failed to create topic");
    }
  };

  const handleEditTopic = (topic) => {
    setSelectedTopic(topic);
    setEditTopicDialogOpen(true);
  };
  const fetchRules = async (id) => {
    try {
      setLoadingRules(true);
      const data = await projectService.getProjectRules(id);
      setRules(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      setRules([]);
      setError(err?.error || err?.detail || "Failed to load rules");
    } finally {
      setLoadingRules(false);
    }
  };
  const handleSaveEditTopic = async (updates) => {
    if (!selectedTopic) return;
    try {
      setError(null);
      await projectService.updateTopic(selectedTopic.id, updates);
      setEditTopicDialogOpen(false);
      setSelectedTopic(null);
      await fetchTopics(Number(projectId));
    } catch (err) {
      setError(err?.error || err?.detail || "Failed to update topic");
    }
  };




  const handleArchiveTopic = (topic) => {
    setSelectedTopic(topic);
    setConfirmTopicDialogOpen(true);
  };

  const handleConfirmArchiveTopic = async () => {
    if (!selectedTopic) return;
    try {
      setError(null);
      await projectService.archiveTopic(selectedTopic.id);
      setConfirmTopicDialogOpen(false);
      setSelectedTopic(null);
      await fetchTopics(Number(projectId));
    } catch (err) {
      setError(err?.error || err?.detail || "Failed to archive topic");
    }
  };

  const handleDeleteTopic = (topic) => {
    setSelectedTopic(topic);
    setConfirmDeleteTopicDialogOpen(true);
  };

  const handleConfirmDeleteTopic = async () => {
    if (!selectedTopic) return;
    try {
      setError(null);
      await projectService.deleteTopic(selectedTopic.id);
      setConfirmDeleteTopicDialogOpen(false);
      setSelectedTopic(null);
      await fetchTopics(Number(projectId));
    } catch (err) {
      setError(err?.error || err?.detail || "Failed to delete topic");
    }
  };

  const handleCloseSimulator = async () => {
    setSimulationBattery(null);
    await fetchBatteries(Number(projectId)); // <-- refresca para ver intentos/last_attempt
  };

  const fetchAll = async (id) => {
    setError(null);
    await Promise.all([fetchProject(id), fetchDocuments(id), fetchTopics(id), fetchRules(id), fetchBatteries(id)]);
  };

  const fetchProject = async (id) => {
    try {
      setLoadingProject(true);
      const data = await projectService.getProjectDetail(id);
      setProject(data);
    } catch (err) {
      setProject(null);
      setError(err?.error || "Failed to load project");
    } finally {
      setLoadingProject(false);
    }
  };
  const fetchBatteries = async (id) => {
    try {
      setLoadingBatteries(true);
      const data = await projectService.getProjectBatteries(id);
      setBatteries(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      setBatteries([]);
      setError(err?.error || err?.detail || "Failed to load batteries");
    } finally {
      setLoadingBatteries(false);
    }
  };

  const fetchDocuments = async (id) => {
    try {
      setLoadingDocs(true);
      // Necesitas tener este método (te lo dejo abajo)
      const data = await projectService.getProjectDocuments(id);
      setDocuments(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      setDocuments([]);
      setError(err?.error || "Failed to load documents");
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleUploadDocuments = async (pId, files) => {
    try {
      setError(null);
      const response = await projectService.uploadProjectDocuments(Number(pId), files);

      if (response.processing) {
        const newJobs = {};
        response.processing.forEach(p => {
          if (p.document?.id && p.external?.job_id) {
            newJobs[p.document.id] = p.external.job_id;
          }
        });
        setActiveJobs(prev => ({ ...prev, ...newJobs }));
      }

      await fetchDocuments(Number(projectId));
    } catch (err) {
      setError(err?.error || err?.detail || "Failed to upload documents");
    }
  };

  const handleJobComplete = async (docId, jobId) => {
    try {
      if (docId) {
        // Fetch tags as requested by the user
        await projectService.getDocumentTags(docId);
      }
      setActiveJobs((prev) => {
        const newState = { ...prev };
        delete newState[docId];
        return newState;
      });
      refreshProject();
    } catch (err) {
      console.error("Error handling job completion:", err);
    }
  };

  const handleDownloadDocument = (doc) => {
    // Del API vendrá doc.url (string). No es un File local.
    const href = doc?.url;
    if (!href) return;

    const a = document.createElement("a");
    a.href = href;
    a.download = doc?.filename || "document";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDeleteDocument = (doc) => {
    setSelectedDocument(doc);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDocument) return;
    try {
      setError(null);
      await projectService.deleteDocument(selectedDocument.id);
      setSelectedDocument(null);
      setConfirmDialogOpen(false);
      await fetchDocuments(Number(projectId));
    } catch (err) {
      setError(err?.error || "Failed to delete document");
    }
  };

  const handleViewMetadata = (doc) => {
    setSelectedDocument(doc);
    setMetadataDialogOpen(true);
  };

  const statusMap = {
    pending: t("project_detail.docs.status.pending"),
    processing: t("project_detail.docs.status.processing"),
    ready: t("project_detail.docs.status.ready"),
    failed: t("project_detail.docs.status.failed")
  };

  const getStatusBadge = (status) => {
    const val = statusMap[status] || status || "—";
    switch (status) {
      case "pending":
        return <Chip value={val} size="sm" color="gray" className="rounded-full" />;
      case "processing":
        return (
          <Chip
            value={val}
            icon={<Spinner className="h-3 w-3" />}
            size="sm"
            color="blue-gray"
            className="rounded-full"
          />
        );
      case "ready":
        return (
          <Chip
            value={val}
            icon={<CheckCircleIcon className="h-4 w-4" />}
            size="sm"
            color="green"
            className="rounded-full"
          />
        );
      case "failed":
        return (
          <Chip
            value={val}
            icon={<ExclamationCircleIcon className="h-4 w-4" />}
            size="sm"
            color="red"
            className="rounded-full"
          />
        );
      default:
        return <Chip value={val} size="sm" color="blue-gray" className="rounded-full" />;
    }
  };

  const formatFileSize = (bytes) => {
    const b = Number(bytes || 0);
    if (!b) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return `${Math.round((b / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const processingCount = documents.filter((d) => d.status === "processing").length;

  if (loadingProject) {
    return (
      <div className="mt-12 flex flex-col items-center justify-center py-12">
        <Spinner className="h-10 w-10" />
        <Typography className="mt-3 text-blue-gray-600">{t("project_detail.loading")}</Typography>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mt-12 flex flex-col items-center justify-center py-12">
        <Typography variant="h5" color="blue-gray" className="mb-2">
          {t("project_detail.not_found")}
        </Typography>
        {error && <Typography color="red" className="mb-4">{error}</Typography>}
        <Button onClick={() => navigate("/dashboard/projects")}>{t("project_detail.back")}</Button>
      </div>
    );
  }

  return (
    <div className="mt-12">
      {/* Error */}
      {error && (
        <Card className="border border-red-100 bg-red-50 shadow-sm mb-6">
          <CardBody className="p-4">
            <Typography color="red">{error}</Typography>
          </CardBody>
        </Card>
      )}

      {/* Header */}
      <Card className="border border-blue-gray-100 shadow-sm mb-6">
        <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-6">
          <div className="flex flex-col gap-4">
            <Button
              variant="text"
              className="flex items-center gap-2 w-fit"
              onClick={() => navigate("/dashboard/projects")}
            >
              <ArrowLeftIcon className="h-4 w-4" />
              {t("project_detail.back")}
            </Button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <Typography variant="h4" color="blue-gray" className="mb-1">
                  {project.title || project.name || "Untitled"}
                </Typography>
                <Typography className="font-normal text-blue-gray-600">
                  {project.description || (language === "es" ? "Sin descripción" : "No description")}
                </Typography>
                {processingCount > 0 && (
                  <Typography variant="small" className="text-blue-500 mt-2">
                    {t("project_detail.processing", {
                      count: processingCount,
                      item: processingCount === 1 ? t("project_detail.document") : t("project_detail.documents")
                    })}
                  </Typography>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Chip
                  value={isOwner ? "Owner" : "Member"}
                  size="sm"
                  color={isOwner ? "blue" : "blue-gray"}
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Card className="border border-blue-gray-100 shadow-sm mb-6">
        <CardBody className="p-0">
          <Tabs value={activeTab}>
            <TabsHeader className="bg-transparent">
              <Tab value="documents" onClick={() => setActiveTab("documents")}>
                <div className="flex items-center gap-2">
                  <DocumentTextIcon className="h-5 w-5" />
                  {t("project_detail.tabs.documents")} ({documents.length})
                </div>
              </Tab>
              <Tab value="topics" onClick={() => setActiveTab("topics")}>
                <div className="flex items-center gap-2">
                  <FolderIcon className="h-5 w-5" />
                  {t("project_detail.tabs.topics")} ({topics.length})
                </div>
              </Tab>
              <Tab value="rules" onClick={() => setActiveTab("rules")}>
                <div className="flex items-center gap-2">
                  <ClipboardDocumentListIcon className="h-5 w-5" />
                  {t("project_detail.tabs.rules")} ({rules.length})
                </div>
              </Tab>
              <Tab value="batteries" onClick={() => setActiveTab("batteries")}>
                <div className="flex items-center gap-2">
                  <BoltIcon className="h-5 w-5" />
                  {t("project_detail.tabs.batteries")} ({batteries.length})
                </div>
              </Tab>
            </TabsHeader>
          </Tabs>
        </CardBody>
      </Card>

      {/* Documents tab */}
      {activeTab === "documents" && (
        <>
          <div className="mb-6 flex justify-end">
            <Button
              className="flex items-center gap-2"
              color="blue-gray"
              onClick={() => setUploadDialogOpen(true)}
            >
              <DocumentArrowUpIcon className="h-5 w-5" />
              {t("project_detail.docs.btn_upload")}
            </Button>
          </div>

          <Card className="border border-blue-gray-100 shadow-sm">
            <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
              {loadingDocs ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Spinner className="h-10 w-10 mb-4" />
                  <Typography className="text-blue-gray-600">{t("project_detail.docs.loading")}</Typography>
                </div>
              ) : documents.length > 0 ? (
                <table className="w-full min-w-[760px] table-auto">
                  <thead>
                    <tr>
                      {[
                        t("project_detail.docs.table.name"),
                        t("project_detail.docs.table.type"),
                        t("project_detail.docs.table.size"),
                        t("project_detail.docs.table.sections"),
                        t("project_detail.docs.table.uploaded"),
                        t("project_detail.docs.table.status"),
                        t("project_detail.docs.table.actions")
                      ].map((el) => (
                        <th key={el} className="border-b border-blue-gray-50 py-3 px-6 text-left">
                          <Typography
                            variant="small"
                            className="text-[11px] font-medium uppercase text-blue-gray-400"
                          >
                            {el}
                          </Typography>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {documents.map((doc, index) => {
                      const rowClass = `py-3 px-6 ${index === documents.length - 1 ? "" : "border-b border-blue-gray-50"
                        }`;

                      return (
                        <tr key={doc.id}>
                          <td className={rowClass}>
                            <div className="flex items-center gap-2">
                              <DocumentTextIcon className="h-5 w-5 text-blue-gray-400" />
                              <Typography variant="small" className="font-medium text-blue-gray-900">
                                {doc.filename || doc.file || "Untitled"}
                              </Typography>
                            </div>
                          </td>

                          <td className={rowClass}>
                            <Chip value={doc.type} size="sm" variant="ghost" color="blue-gray" />
                          </td>

                          <td className={rowClass}>
                            <Typography variant="small" className="text-blue-gray-600">
                              {formatFileSize(doc.size)}
                            </Typography>
                          </td>

                          <td className={rowClass}>
                            <div className="flex items-center gap-2">
                              <Typography variant="small" className="text-blue-gray-600 font-medium">
                                {sectionsCounts[doc.id] || 0}
                              </Typography>
                              <Button
                                size="sm"
                                variant="text"
                                className="flex items-center gap-1 p-1"
                                onClick={() => handleViewMetadata(doc)}
                              >
                                <ViewColumnsIcon className="h-4 w-4" />
                                {t("project_detail.docs.actions.view")}
                              </Button>
                            </div>
                          </td>

                          <td className={rowClass}>
                            <Typography variant="small" className="text-blue-gray-600">
                              {formatDate(doc.uploaded_at || doc.created_at || doc.uploadedAt)}
                            </Typography>
                          </td>

                          <td className={rowClass}>
                            {activeJobs[doc.id] ? (
                              <div className="w-32">
                                <ProjectProcessingProgress
                                  jobId={activeJobs[doc.id]}
                                  onComplete={() => handleJobComplete(doc.id, activeJobs[doc.id])}
                                />
                              </div>
                            ) : (
                              getStatusBadge(doc.status)
                            )}
                          </td>

                          <td className={rowClass}>
                            <Menu placement="left-start">
                              <MenuHandler>
                                <IconButton variant="text" color="blue-gray" size="sm">
                                  <EllipsisVerticalIcon className="h-5 w-5" />
                                </IconButton>
                              </MenuHandler>
                              <MenuList>
                                <MenuItem
                                  onClick={() => handleDownloadDocument(doc)}
                                  className="flex items-center gap-2"
                                >
                                  <ArrowDownTrayIcon className="h-4 w-4" />
                                  {t("project_detail.docs.actions.download")}
                                </MenuItem>

                                <MenuItem
                                  onClick={() => handleViewMetadata(doc)}
                                  className="flex items-center gap-2"
                                >
                                  <InformationCircleIcon className="h-4 w-4" />
                                  {t("project_detail.docs.actions.metadata")}
                                </MenuItem>

                                {isOwner && (
                                  <>
                                    <hr className="my-1" />
                                    <MenuItem
                                      onClick={() => handleDeleteDocument(doc)}
                                      className="flex items-center gap-2 text-red-500 hover:bg-red-50"
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                      {t("project_detail.docs.actions.delete")}
                                    </MenuItem>
                                  </>
                                )}
                              </MenuList>
                            </Menu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <DocumentTextIcon className="h-16 w-16 text-blue-gray-300 mb-4" />
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    {t("project_detail.docs.empty.title")}
                  </Typography>
                  <Typography className="text-blue-gray-600 mb-4 text-center">
                    {t("project_detail.docs.empty.desc")}
                  </Typography>
                  <Button
                    className="flex items-center gap-2"
                    color="blue-gray"
                    onClick={() => setUploadDialogOpen(true)}
                  >
                    <DocumentArrowUpIcon className="h-5 w-5" />
                    {t("project_detail.docs.btn_upload")}
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </>
      )}
      {activeTab === "topics" && (
        <>
          <div className="mb-6 flex justify-end">
            <Button
              className="flex items-center gap-2"
              color="blue-gray"
              onClick={() => setCreateTopicDialogOpen(true)}
            >
              <PlusIcon className="h-5 w-5" />
              {t("project_detail.topics.btn_create")}
            </Button>
          </div>

          {topics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {topics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  allDocumentsWithSections={documentsWithSections}
                  onEdit={handleEditTopic}
                  onArchive={handleArchiveTopic}
                  onDelete={handleDeleteTopic}
                />
              ))}
            </div>
          ) : (
            <Card className="border border-blue-gray-100 shadow-sm">
              <CardBody className="flex flex-col items-center justify-center py-12">
                <FolderIcon className="h-16 w-16 text-blue-gray-300 mb-4" />
                <Typography variant="h5" color="blue-gray" className="mb-2">
                  {t("project_detail.topics.empty.title")}
                </Typography>
                <Typography className="text-blue-gray-600 mb-4 text-center">
                  {t("project_detail.topics.empty.desc")}
                </Typography>
                <Button
                  className="flex items-center gap-2"
                  color="blue-gray"
                  onClick={() => setCreateTopicDialogOpen(true)}
                >
                  <PlusIcon className="h-5 w-5" />
                  {t("project_detail.topics.btn_create")}
                </Button>
              </CardBody>
            </Card>
          )}

          {/* Dialogs - Topics */}
          <CreateTopicDialog
            open={createTopicDialogOpen}
            onClose={() => setCreateTopicDialogOpen(false)}
            onCreate={handleCreateTopic}
            projectId={projectId}
          />

          <EditTopicDialog
            open={editTopicDialogOpen}
            onClose={() => setEditTopicDialogOpen(false)}
            onSave={handleSaveEditTopic}
            topic={selectedTopic}
            availableDocuments={readyDocuments}
          />

          <ConfirmDialog
            open={confirmTopicDialogOpen}
            onClose={() => setConfirmTopicDialogOpen(false)}
            onConfirm={handleConfirmArchiveTopic}
            title="Archive Topic"
            message={`Are you sure you want to archive "${selectedTopic?.name}"? You can restore it later.`}
            confirmText="Archive"
            variant="info"
          />
          <ConfirmDialog
            open={confirmTopicDialogOpen}
            onClose={() => setConfirmTopicDialogOpen(false)}
            onConfirm={handleConfirmArchiveTopic}
            title="Archive Topic"
            message={`Are you sure you want to archive "${selectedTopic?.name}"? You can restore it later.`}
            confirmText="Archive"
            variant="info"
          />

          <ConfirmDialog
            open={confirmDeleteTopicDialogOpen}
            onClose={() => setConfirmDeleteTopicDialogOpen(false)}
            onConfirm={handleConfirmDeleteTopic}
            title="Delete Topic"
            message={`Are you sure you want to delete "${selectedTopic?.name}"? This action cannot be undone.`}
            confirmText="Delete"
            variant="danger"
          />
        </>
      )}

      {activeTab === "rules" && (
        <>
          <div className="mb-6 flex justify-end">
            <Button className="flex items-center gap-2" color="blue-gray" onClick={() => setShowCreateRule(true)}>
              <PlusIcon className="h-5 w-5" />
              {t("project_detail.rules.btn_create")}
            </Button>
          </div>

          {showCreateRule && (
            <Card className="mb-6 border border-blue-gray-100 shadow-sm">
              <CardBody>
                <Typography variant="h6" color="blue-gray" className="mb-4">
                  {t("project_detail.rules.btn_create")}
                </Typography>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Typography variant="small" className="mb-1 text-blue-gray-600">
                      {language === "es" ? "Nombre" : "Name"}
                    </Typography>
                    <input
                      className="w-full px-3 py-2 border border-blue-gray-200 rounded-md"
                      value={ruleForm.name}
                      onChange={(e) => setRuleForm((p) => ({ ...p, name: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Typography variant="small" className="mb-1 text-blue-gray-600">Global Count</Typography>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 border border-blue-gray-200 rounded-md"
                      value={ruleForm.global_count}
                      onChange={(e) => setRuleForm((p) => ({ ...p, global_count: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Typography variant="small" className="mb-1 text-blue-gray-600">Time Limit (minutes)</Typography>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-3 py-2 border border-blue-gray-200 rounded-md"
                      value={ruleForm.time_limit}
                      onChange={(e) => setRuleForm((p) => ({ ...p, time_limit: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Typography variant="small" className="mb-1 text-blue-gray-600">Strategy</Typography>
                    <select
                      className="w-full px-3 py-2 border border-blue-gray-200 rounded-md"
                      value={ruleForm.distribution_strategy}
                      onChange={(e) => setRuleForm((p) => ({ ...p, distribution_strategy: e.target.value }))}
                    >
                      <option value="singleChoice">singleChoice</option>
                      <option value="multiSelect">multiSelect</option>
                      <option value="trueFalse">trueFalse</option>
                      <option value="mixed">mixed</option>
                    </select>
                  </div>

                  <div>
                    <Typography variant="small" className="mb-1 text-blue-gray-600">Difficulty</Typography>
                    <select
                      className="w-full px-3 py-2 border border-blue-gray-200 rounded-md"
                      value={ruleForm.difficulty}
                      onChange={(e) => setRuleForm((p) => ({ ...p, difficulty: e.target.value }))}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <Typography variant="small" className="mb-1 text-blue-gray-600">Topic Scope (optional)</Typography>
                    <select
                      className="w-full px-3 py-2 border border-blue-gray-200 rounded-md"
                      value={ruleForm.topic_scope || ""}
                      onChange={(e) =>
                        setRuleForm((p) => ({ ...p, topic_scope: e.target.value ? Number(e.target.value) : null }))
                      }
                    >
                      <option value="">(Global)</option>
                      {topics.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="text" onClick={() => setShowCreateRule(false)}>
                    {language === "es" ? "Cancelar" : "Cancel"}
                  </Button>
                  <Button color="blue-gray" onClick={handleCreateRule} disabled={!ruleForm.name}>
                    {language === "es" ? "Guardar Regla" : "Save Rule"}
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {loadingRules ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Spinner className="h-10 w-10 mb-4" />
              <Typography className="text-blue-gray-600">{t("global.rules.loading")}</Typography>
            </div>
          ) : rules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {rules.map((rule) => (
                <Card key={rule.id} className="border border-blue-gray-100 shadow-sm">
                  <CardBody>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <Typography variant="h6" color="blue-gray">{rule.name}</Typography>
                        <Typography variant="small" className="text-blue-gray-500">
                          {t("global.rules.table.strategy")}: {rule.distribution_strategy} • {t("global.rules.table.difficulty")}: {rule.difficulty}
                        </Typography>
                      </div>

                      {isOwner && (
                        <IconButton
                          size="sm"
                          variant="text"
                          color="red"
                          onClick={async () => {
                            try {
                              setError(null);
                              await projectService.deleteRule(rule.id);
                              await fetchRules(Number(projectId));
                            } catch (err) {
                              setError(err?.error || err?.detail || "Failed to delete rule");
                            }
                          }}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                      )}
                    </div>

                    <div className="space-y-1 text-sm text-blue-gray-600">
                      <div className="flex justify-between">
                        <span>{t("global.rules.table.questions")}</span>
                        <span className="font-medium text-blue-gray-900">{rule.global_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{language === "es" ? "Límite de Tiempo" : "Time Limit"}</span>
                        <span className="font-medium text-blue-gray-900">{rule.time_limit} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("global.rules.table.topic")}</span>
                        <span className="font-medium text-blue-gray-900">
                          {rule.topic_scope ? `${t("project_detail.tabs.topics")} #${rule.topic_scope}` : (language === "es" ? "Global" : "Global")}
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-blue-gray-400">
              <ClipboardDocumentListIcon className="h-16 w-16 mb-4" />
              <Typography variant="h6" className="mb-2">{t("global.rules.no_rules")}</Typography>
              <Typography>
                {language === "es"
                  ? "Crea una regla para definir cómo se generan las baterías."
                  : "Create a rule to define how batteries are generated."}
              </Typography>
            </div>
          )}
        </>
      )}{activeTab === "batteries" && (
        <>
          <div className="mb-6 flex justify-end">
            <Button
              className="flex items-center gap-2"
              color="blue-gray"
              onClick={() => setShowGenerateBattery(true)}
            >
              <BoltIcon className="h-5 w-5" />
              {t("project_detail.batteries.btn_create")}
            </Button>
          </div>

          {showGenerateBattery && (
            <Card className="mb-6 border border-blue-gray-100 shadow-sm">
              <CardBody>
                <Typography variant="h6" color="blue-gray" className="mb-4">
                  {language === "es" ? "Generar Nueva Batería" : "Generate New Battery"}
                </Typography>

                <div className="space-y-4">
                  {/* Query Text */}
                  <div>
                    <label className="block text-sm font-medium text-blue-gray-700 mb-2">
                      {language === "es" ? "Sobre qué quieres las preguntas (opcional)" : "What do you want questions about? (optional)"}
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-blue-gray-200 rounded-md"
                      placeholder={language === "es" ? "Ej: Barca, Historia de España, etc." : "E.g: Barcelona, Spanish History, etc."}
                      value={batteryForm.query_text}
                      onChange={(e) => setBatteryForm(prev => ({ ...prev, query_text: e.target.value }))}
                    />
                  </div>

                  {/* Sections Selection */}
                  <div>
                    <label className="block text-sm font-medium text-blue-gray-700 mb-2">
                      {language === "es" ? "Secciones (opcional)" : "Sections (optional)"}
                    </label>
                    <div className="mb-2">
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-blue-gray-200 rounded-md"
                        placeholder={language === "es" ? "Buscar secciones..." : "Search sections..."}
                        value={sectionSearch}
                        onChange={(e) => setSectionSearch(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {batteryForm.sections.map((sec) => (
                        <Chip
                          key={sec.id}
                          value={`${sec.documentName}: ${sec.name}`}
                          onClose={() => {
                            setBatteryForm(prev => ({
                              ...prev,
                              sections: prev.sections.filter((s) => s.id !== sec.id)
                            }));
                          }}
                          className="rounded-full bg-blue-50 text-blue-900"
                        />
                      ))}
                    </div>
                    <div className="max-h-32 overflow-y-auto border border-blue-gray-100 rounded-md">
                      {availableSections
                        .filter(sec =>
                          sec.name.toLowerCase().includes(sectionSearch.toLowerCase()) ||
                          sec.documentName.toLowerCase().includes(sectionSearch.toLowerCase())
                        )
                        .filter(sec => !batteryForm.sections.some(s => s.id === sec.id))
                        .map((sec) => (
                          <div
                            key={sec.id}
                            className="px-3 py-2 hover:bg-blue-gray-50 cursor-pointer text-sm flex flex-col items-start"
                            onClick={() => {
                              setBatteryForm(prev => ({
                                ...prev,
                                sections: [...prev.sections, sec]
                              }));
                              setSectionSearch("");
                            }}
                          >
                            <span className="font-medium text-blue-gray-800">{sec.name}</span>
                            <span className="text-xs text-gray-500">{sec.documentName}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Rule Selection (Optional) */}
                    <div>
                      <label className="block text-sm font-medium text-blue-gray-700 mb-2">
                        {language === "es" ? "Regla (opcional)" : "Rule (optional)"}
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-blue-gray-200 rounded-md"
                        value={batteryForm.rule}
                        onChange={(e) => setBatteryForm(prev => ({ ...prev, rule: e.target.value }))}
                      >
                        <option value="">{language === "es" ? "Sin regla" : "No rule"}</option>
                        {rules.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity (conditional) */}
                    {!batteryForm.rule && (
                      <div>
                        <label className="block text-sm font-medium text-blue-gray-700 mb-2">
                          {language === "es" ? "Cantidad de Preguntas *" : "Number of Questions *"}
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          className="w-full px-3 py-2 border border-blue-gray-200 rounded-md"
                          value={batteryForm.quantity}
                          onChange={(e) => setBatteryForm(prev => ({ ...prev, quantity: e.target.value }))}
                        />
                      </div>
                    )}

                    {/* Difficulty */}
                    <div>
                      <label className="block text-sm font-medium text-blue-gray-700 mb-2">
                        {language === "es" ? "Dificultad *" : "Difficulty *"}
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-blue-gray-200 rounded-md"
                        value={batteryForm.difficulty}
                        onChange={(e) => setBatteryForm(prev => ({ ...prev, difficulty: e.target.value }))}
                      >
                        <option value="easy">{language === "es" ? "Fácil" : "Easy"}</option>
                        <option value="medium">{language === "es" ? "Medio" : "Medium"}</option>
                        <option value="hard">{language === "es" ? "Difícil" : "Hard"}</option>
                      </select>
                    </div>

                    {/* Question Format */}
                    <div>
                      <label className="block text-sm font-medium text-blue-gray-700 mb-2">
                        {language === "es" ? "Formato de Pregunta *" : "Question Format *"}
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-blue-gray-200 rounded-md"
                        value={batteryForm.question_format}
                        onChange={(e) => setBatteryForm(prev => ({ ...prev, question_format: e.target.value }))}
                      >
                        <option value="true_false">{language === "es" ? "Verdadero/Falso" : "True/False"}</option>
                        <option value="single_choice">{language === "es" ? "Opción Única" : "Single Choice"}</option>
                        <option value="multi_select">{language === "es" ? "Selección Múltiple" : "Multi Select"}</option>
                        <option value="mixed">{language === "es" ? "Mixto" : "Mixed"}</option>
                      </select>
                    </div>

                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="text" onClick={() => setShowGenerateBattery(false)}>
                      {language === "es" ? "Cancelar" : "Cancel"}
                    </Button>
                    <Button
                      color="blue-gray"
                      onClick={handleGenerateBattery}
                    >
                      {language === "es" ? "Generar Batería" : "Generate Battery"}
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {batteries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {batteries.map((battery) => (
                <Card key={battery.id} className="border border-blue-gray-100 shadow-sm">
                  <CardBody>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-1">
                        <Chip
                          value={battery.status}
                          color={battery.status === "Ready" ? "green" : "blue-gray"}
                          size="sm"
                          variant="ghost"
                          className="rounded-full"
                        />
                        <Tooltip content="Simulate Exam">
                          <IconButton
                            size="sm"
                            variant="text"
                            color="green"
                            onClick={() => setSimulationBattery(battery)}
                          >
                            <PlayIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                      </div>

                      {isOwner && (
                        <Menu placement="bottom-end">
                          <MenuHandler>
                            <IconButton size="sm" variant="text" color="blue-gray">
                              <EllipsisVerticalIcon className="h-5 w-5" />
                            </IconButton>
                          </MenuHandler>
                          <MenuList>
                            <MenuItem
                              onClick={async () => {
                                await projectService.markBatteryReady(battery.id);
                                await fetchBatteries(Number(projectId));
                              }}
                            >
                              Mark as Ready
                            </MenuItem>
                            <MenuItem
                              onClick={async () => {
                                await projectService.deleteBattery(battery.id);
                                await fetchBatteries(Number(projectId));
                              }}
                              className="text-red-500"
                            >
                              Delete
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      )}
                    </div>

                    <Typography variant="h6" color="blue-gray" className="mb-1 truncate">
                      {battery.name}
                    </Typography>

                    <div className="flex gap-2 mb-4">
                      <Chip
                        value={battery.difficulty || "Medium"}
                        size="sm"
                        variant="outlined"
                        className="rounded-full text-[10px] py-0 px-2 border-blue-gray-200 text-blue-gray-500"
                      />
                      <Typography variant="small" className="text-blue-gray-500 text-xs">
                        {(battery.questions?.length || 0)} {language === "es" ? "preguntas" : "questions"} •{" "}
                        {formatDate(battery.created_at || battery.createdAt)}
                      </Typography>
                    </div>

                    {/* Generation Progress */}
                    {batteryProgress[battery.id] && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between gap-4 mb-1">
                          <Typography variant="small" color="blue-gray" className="font-medium text-xs">
                            {batteryProgress[battery.id].status}
                          </Typography>
                          <Typography variant="small" color="blue-gray" className="font-medium text-xs">
                            {Math.round(batteryProgress[battery.id].percent || 0)}%
                          </Typography>
                        </div>
                        <Progress value={Math.round(batteryProgress[battery.id].percent || 0)} size="sm" color="blue" />
                      </div>
                    )}

                    {/* Attempts summary */}
                    <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs">
                      {battery.attempts_count > 0 ? (
                        <div className="flex items-center justify-between">
                          <span className="text-blue-gray-700 font-semibold">
                            {language === "es" ? "Intentos" : "Attempts"}: {battery.attempts_count}
                          </span>

                          <span className="text-blue-gray-600">
                            {language === "es" ? "Último" : "Last"}: {Number(battery.last_attempt?.percent || 0).toFixed(0)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-blue-gray-400">{language === "es" ? "Sin intentos aún" : "No attempts yet"}</span>
                      )}
                    </div>

                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-blue-gray-400">
              <BoltIcon className="h-16 w-16 mb-4" />
              <Typography variant="h6" className="mb-2">
                {t("global.batteries.no_batteries")}
              </Typography>
              <Typography>
                {language === "es"
                  ? "Genera baterías a partir de tus reglas configuradas."
                  : "Generate batteries from your configured rules."}
              </Typography>
            </div>
          )}
        </>
      )}








      {/* (Los otros tabs los puedes mantener como UI-only por ahora) */}

      <UploadDocumentsDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUpload={handleUploadDocuments}
        project={project}
      />

      <DocumentMetadataDialog
        open={metadataDialogOpen}
        onClose={() => setMetadataDialogOpen(false)}
        document={selectedDocument}
      />

      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t("project_detail.docs.actions.delete")}
        message={t("project_detail.dialogs.delete_message", { name: selectedDocument?.filename || "this document" })}
        confirmText={t("project_detail.docs.actions.delete")}
        variant="danger"
      />

      <ExamSimulatorDialog
        open={!!simulationBattery}
        handler={handleCloseSimulator}
        battery={simulationBattery}
      />
    </div>
  );
}

export default ProjectDetail;

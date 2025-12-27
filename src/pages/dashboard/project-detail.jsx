
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

// Si todavía no tienes Topics/Rules/Batteries en API, puedes dejar esto así (arrays vacíos)
import { ExamSimulatorDialog } from "@/widgets/dialogs/exam-simulator-dialog";
import { CreateTopicDialog } from "@/widgets/dialogs/create-topic-dialog";
import { EditTopicDialog } from "@/widgets/dialogs/edit-topic-dialog";
import { TopicCard } from "@/widgets/cards/topic-card";

export function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("documents");

  const [showGenerateBattery, setShowGenerateBattery] = useState(false);
  const [batteryType, setBatteryType] = useState("global");
  const [selectedRuleId, setSelectedRuleId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [batteryDifficulty, setBatteryDifficulty] = useState("Medium");

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

  const isOwner = useMemo(() => {
    if (!project || !user) return false;
    return project?.owner?.id === user?.id;
  }, [project, user]);



  const [showCreateRule, setShowCreateRule] = useState(false);
  const [ruleForm, setRuleForm] = useState({
    name: "",
    global_count: 10,
    time_limit: 30,
    distribution_strategy: "random",
    difficulty: "Medium",
    topic_scope: null, // o id
  });
  const handleGenerateBattery = async () => {
    try {
      setError(null);

      if (!selectedRuleId) return;
      if (batteryType === "topic" && !selectedTopicId) return;

      const payload = {
        rule: Number(selectedRuleId),
        difficulty: batteryDifficulty,
        name: `Battery - ${batteryDifficulty} - ${new Date().toLocaleString()}`,
        status: "Draft",
        questions: [], // por ahora vacío, luego lo llenas cuando generes preguntas
      };

      await projectService.createBattery(Number(projectId), payload);
      setShowGenerateBattery(false);

      setSelectedRuleId("");
      setSelectedTopicId("");
      setBatteryType("global");
      setBatteryDifficulty("Medium");

      await fetchBatteries(Number(projectId));
    } catch (err) {
      setError(err?.error || err?.detail || "Failed to create battery");
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
        distribution_strategy: "random",
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

  const handleUploadDocuments = async (files) => {
    try {
      setError(null);
      await projectService.uploadProjectDocuments(Number(projectId), files);
      await fetchDocuments(Number(projectId));
    } catch (err) {
      setError(err?.error || "Failed to upload documents");
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

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Chip value="Pending" size="sm" color="gray" className="rounded-full" />;
      case "processing":
        return (
          <Chip
            value="Processing"
            icon={<Spinner className="h-3 w-3" />}
            size="sm"
            color="blue"
            className="rounded-full"
          />
        );
      case "ready":
        return (
          <Chip
            value="Ready"
            icon={<CheckCircleIcon className="h-4 w-4" />}
            size="sm"
            color="green"
            className="rounded-full"
          />
        );
      case "failed":
        return (
          <Chip
            value="Failed"
            icon={<ExclamationCircleIcon className="h-4 w-4" />}
            size="sm"
            color="red"
            className="rounded-full"
          />
        );
      default:
        return <Chip value={status || "—"} size="sm" color="blue-gray" className="rounded-full" />;
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
        <Typography className="mt-3 text-blue-gray-600">Loading project...</Typography>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mt-12 flex flex-col items-center justify-center py-12">
        <Typography variant="h5" color="blue-gray" className="mb-2">
          Project not found
        </Typography>
        {error && <Typography color="red" className="mb-4">{error}</Typography>}
        <Button onClick={() => navigate("/dashboard/projects")}>Back to Projects</Button>
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
              Back to Projects
            </Button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <Typography variant="h4" color="blue-gray" className="mb-1">
                  {project.title || project.name || "Untitled"}
                </Typography>
                <Typography className="font-normal text-blue-gray-600">
                  {project.description || "No description"}
                </Typography>
                {processingCount > 0 && (
                  <Typography variant="small" className="text-blue-500 mt-2">
                    Processing {processingCount} {processingCount === 1 ? "document" : "documents"}...
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
                  Documentos ({documents.length})
                </div>
              </Tab>
              <Tab value="topics" onClick={() => setActiveTab("topics")}>
                <div className="flex items-center gap-2">
                  <FolderIcon className="h-5 w-5" />
                  Temas ({topics.length})
                </div>
              </Tab>
              <Tab value="rules" onClick={() => setActiveTab("rules")}>
                <div className="flex items-center gap-2">
                  <ClipboardDocumentListIcon className="h-5 w-5" />
                  Reglas ({rules.length})
                </div>
              </Tab>
              <Tab value="batteries" onClick={() => setActiveTab("batteries")}>
                <div className="flex items-center gap-2">
                  <BoltIcon className="h-5 w-5" />
                  Baterías ({batteries.length})
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
              color="blue"
              onClick={() => setUploadDialogOpen(true)}
            >
              <DocumentArrowUpIcon className="h-5 w-5" />
              Upload Documents
            </Button>
          </div>

          <Card className="border border-blue-gray-100 shadow-sm">
            <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
              {loadingDocs ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Spinner className="h-10 w-10 mb-4" />
                  <Typography className="text-blue-gray-600">Loading documents...</Typography>
                </div>
              ) : documents.length > 0 ? (
                <table className="w-full min-w-[760px] table-auto">
                  <thead>
                    <tr>
                      {["Name", "Type", "Size", "Sections", "Uploaded", "Status", "Actions"].map((el) => (
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
                            <Chip value={doc.type} size="sm" variant="ghost" color="blue" />
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
                                View
                              </Button>
                            </div>
                          </td>

                          <td className={rowClass}>
                            <Typography variant="small" className="text-blue-gray-600">
                              {formatDate(doc.uploaded_at || doc.created_at || doc.uploadedAt)}
                            </Typography>
                          </td>

                          <td className={rowClass}>{getStatusBadge(doc.status)}</td>

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
                                  Download
                                </MenuItem>

                                <MenuItem
                                  onClick={() => handleViewMetadata(doc)}
                                  className="flex items-center gap-2"
                                >
                                  <InformationCircleIcon className="h-4 w-4" />
                                  View Metadata
                                </MenuItem>

                                {isOwner && (
                                  <>
                                    <hr className="my-1" />
                                    <MenuItem
                                      onClick={() => handleDeleteDocument(doc)}
                                      className="flex items-center gap-2 text-red-500 hover:bg-red-50"
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                      Delete
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
                    No documents yet
                  </Typography>
                  <Typography className="text-blue-gray-600 mb-4 text-center">
                    Upload documents to get started with analysis
                  </Typography>
                  <Button
                    className="flex items-center gap-2"
                    color="blue"
                    onClick={() => setUploadDialogOpen(true)}
                  >
                    <DocumentArrowUpIcon className="h-5 w-5" />
                    Upload Documents
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
              color="blue"
              onClick={() => setCreateTopicDialogOpen(true)}
            >
              <PlusIcon className="h-5 w-5" />
              Create Topic
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
                  No topics yet
                </Typography>
                <Typography className="text-blue-gray-600 mb-4 text-center">
                  Create your first topic to start organizing questions
                </Typography>
                <Button
                  className="flex items-center gap-2"
                  color="blue"
                  onClick={() => setCreateTopicDialogOpen(true)}
                >
                  <PlusIcon className="h-5 w-5" />
                  Create Topic
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
            <Button className="flex items-center gap-2" color="blue" onClick={() => setShowCreateRule(true)}>
              <PlusIcon className="h-5 w-5" />
              Create Rule
            </Button>
          </div>

          {showCreateRule && (
            <Card className="mb-6 border border-blue-gray-100 shadow-sm">
              <CardBody>
                <Typography variant="h6" color="blue-gray" className="mb-4">
                  New Rule
                </Typography>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Typography variant="small" className="mb-1 text-blue-gray-600">Name</Typography>
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
                      <option value="random">random</option>
                      <option value="balanced">balanced</option>
                      <option value="topic_weighted">topic_weighted</option>
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
                  <Button variant="text" onClick={() => setShowCreateRule(false)}>Cancel</Button>
                  <Button color="blue" onClick={handleCreateRule} disabled={!ruleForm.name}>
                    Save Rule
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {loadingRules ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Spinner className="h-10 w-10 mb-4" />
              <Typography className="text-blue-gray-600">Loading rules...</Typography>
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
                          Strategy: {rule.distribution_strategy} • Difficulty: {rule.difficulty}
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
                        <span>Global Count</span>
                        <span className="font-medium text-blue-gray-900">{rule.global_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time Limit</span>
                        <span className="font-medium text-blue-gray-900">{rule.time_limit} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Scope</span>
                        <span className="font-medium text-blue-gray-900">
                          {rule.topic_scope ? `Topic #${rule.topic_scope}` : "Global"}
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
              <Typography variant="h6" className="mb-2">No rules yet</Typography>
              <Typography>Create a rule to define how batteries are generated.</Typography>
            </div>
          )}
        </>
      )}{activeTab === "batteries" && (
        <>
          <div className="mb-6 flex justify-end">
            <Button
              className="flex items-center gap-2"
              color="blue"
              onClick={() => setShowGenerateBattery(true)}
              disabled={rules.length === 0}
            >
              <BoltIcon className="h-5 w-5" />
              Generate Battery
            </Button>
          </div>

          {showGenerateBattery && (
            <Card className="mb-6 border border-blue-gray-100 shadow-sm">
              <CardBody>
                <Typography variant="h6" color="blue-gray" className="mb-4">
                  Generate New Battery
                </Typography>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-gray-700 mb-2">
                      Select Rule
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-blue-gray-200 rounded-md"
                      value={selectedRuleId}
                      onChange={(e) => setSelectedRuleId(e.target.value)}
                    >
                      <option value="">Select a rule...</option>
                      {rules.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-gray-700 mb-2">
                        Battery Type
                      </label>
                      <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="batteryType"
                            value="global"
                            checked={batteryType === "global"}
                            onChange={(e) => setBatteryType(e.target.value)}
                          />
                          Global
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="batteryType"
                            value="topic"
                            checked={batteryType === "topic"}
                            onChange={(e) => setBatteryType(e.target.value)}
                          />
                          Topic Specific
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-gray-700 mb-2">
                        Difficulty
                      </label>
                      <div className="flex gap-4 mt-2">
                        {["Easy", "Medium", "Hard"].map((diff) => (
                          <label key={diff} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="batteryDifficulty"
                              value={diff}
                              checked={batteryDifficulty === diff}
                              onChange={(e) => setBatteryDifficulty(e.target.value)}
                            />
                            {diff}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {batteryType === "topic" && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-blue-gray-700 mb-2">
                      Select Topic
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-blue-gray-200 rounded-md"
                      value={selectedTopicId}
                      onChange={(e) => setSelectedTopicId(e.target.value)}
                    >
                      <option value="">Select a topic...</option>
                      {topics.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="text" onClick={() => setShowGenerateBattery(false)}>
                    Cancel
                  </Button>
                  <Button
                    color="blue"
                    onClick={handleGenerateBattery}
                    disabled={!selectedRuleId || (batteryType === "topic" && !selectedTopicId)}
                  >
                    Generate
                  </Button>
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
                        {(battery.questions?.length || 0)} questions •{" "}
                        {formatDate(battery.created_at || battery.createdAt)}
                      </Typography>
                    </div>
                    {/* Attempts summary */}
                    <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs">
                      {battery.attempts_count > 0 ? (
                        <div className="flex items-center justify-between">
                          <span className="text-blue-gray-700 font-semibold">
                            Attempts: {battery.attempts_count}
                          </span>

                          <span className="text-blue-gray-600">
                            Last: {Number(battery.last_attempt?.percent || 0).toFixed(0)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-blue-gray-400">No attempts yet</span>
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
                No batteries yet
              </Typography>
              <Typography>Generate batteries from your configured rules.</Typography>
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
        title="Delete Document"
        message={`Are you sure you want to delete "${selectedDocument?.filename || "this document"}"? This action cannot be undone.`}
        confirmText="Delete"
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

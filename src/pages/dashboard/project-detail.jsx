import React, { useState } from "react";
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
    TabsBody,
    TabPanel,
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
    Cog6ToothIcon,
    BeakerIcon,
    ClipboardDocumentListIcon,
    BoltIcon,
    PlayIcon,
} from "@heroicons/react/24/outline";
import { ExamSimulatorDialog } from "@/widgets/dialogs/exam-simulator-dialog";
import { useProjects } from "@/context/projects-context";
import { UploadDocumentsDialog } from "@/widgets/dialogs/upload-documents-dialog";
import { DocumentMetadataDialog } from "@/widgets/dialogs/document-metadata-dialog";
import { ConfirmDialog } from "@/widgets/dialogs/confirm-dialog";
import { CreateTopicDialog } from "@/widgets/dialogs/create-topic-dialog";
import { EditTopicDialog } from "@/widgets/dialogs/edit-topic-dialog";
import { TopicCard } from "@/widgets/cards/topic-card";

export function ProjectDetail() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const {
        getProject,
        getProjectDocuments,
        getProjectTopics,
        getProjectRules,
        getProjectBatteries,
        uploadDocuments,
        deleteDocument,
        retryDocumentProcessing,
        createTopic,
        updateTopic,
        archiveTopic,
        createRule,
        deleteRule,
        generateBattery,
        generateBatteryVariant,
        deleteBattery,
        isOwner,
    } = useProjects();

    const [activeTab, setActiveTab] = useState("documents");
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [metadataDialogOpen, setMetadataDialogOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);

    // Topics dialogs
    const [createTopicDialogOpen, setCreateTopicDialogOpen] = useState(false);
    const [editTopicDialogOpen, setEditTopicDialogOpen] = useState(false);
    const [confirmTopicDialogOpen, setConfirmTopicDialogOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);

    // Rules & Batteries state (MVP simplified)
    const [showCreateRule, setShowCreateRule] = useState(false);
    const [createdRuleName, setCreatedRuleName] = useState("");
    const [ruleDistribution, setRuleDistribution] = useState({
        singleChoice: 10,
        multiSelect: 5,
        trueFalse: 5
    });
    const [showGenerateBattery, setShowGenerateBattery] = useState(false);
    const [batteryType, setBatteryType] = useState("global");
    const [selectedRuleId, setSelectedRuleId] = useState("");

    const [selectedTopicId, setSelectedTopicId] = useState("");
    const [simulationBattery, setSimulationBattery] = useState(null);

    const project = getProject(projectId);
    const documents = getProjectDocuments(projectId);
    const topics = getProjectTopics(projectId);
    const rules = getProjectRules(projectId);
    const batteries = getProjectBatteries(projectId);
    const readyDocuments = documents.filter((d) => d.status === "ready");

    if (!project) {
        return (
            <div className="mt-12 flex flex-col items-center justify-center py-12">
                <Typography variant="h5" color="blue-gray" className="mb-2">
                    Project not found
                </Typography>
                <Button onClick={() => navigate("/dashboard/projects")}>
                    Back to Projects
                </Button>
            </div>
        );
    }

    const handleUploadDocuments = (files) => {
        uploadDocuments(projectId, files);
    };

    const handleDownloadDocument = (doc) => {
        const url = URL.createObjectURL(doc.file);
        const a = document.createElement("a");
        a.href = url;
        a.download = doc.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDeleteDocument = (doc) => {
        setSelectedDocument(doc);
        setConfirmDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (selectedDocument) {
            deleteDocument(selectedDocument.id, projectId);
            setSelectedDocument(null);
        }
    };

    const handleViewMetadata = (doc) => {
        setSelectedDocument(doc);
        setMetadataDialogOpen(true);
    };

    const handleRetryProcessing = (doc) => {
        retryDocumentProcessing(doc.id);
    };

    // Topics handlers
    const handleCreateTopic = (topicData) => {
        createTopic(projectId, topicData);
    };

    const handleEditTopic = (topic) => {
        setSelectedTopic(topic);
        setEditTopicDialogOpen(true);
    };

    const handleSaveEditTopic = (updates) => {
        if (selectedTopic) {
            updateTopic(selectedTopic.id, updates);
        }
    };

    const handleArchiveTopic = (topic) => {
        setSelectedTopic(topic);
        setConfirmTopicDialogOpen(true);
    };

    const handleConfirmArchiveTopic = () => {
        if (selectedTopic) {
            archiveTopic(selectedTopic.id);
            setSelectedTopic(null);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Simplified handlers for MVP
    const handleCreateRule = () => {
        if (!createdRuleName) return;

        // Default rule configuration for MVP demo
        const ruleData = {
            name: createdRuleName,
            distribution: {
                singleChoice: parseInt(ruleDistribution.singleChoice) || 0,
                multiSelect: parseInt(ruleDistribution.multiSelect) || 0,
                trueFalse: parseInt(ruleDistribution.trueFalse) || 0
            },
            questionTypes: {
                singleChoice: (parseInt(ruleDistribution.singleChoice) || 0) > 0,
                multiSelect: (parseInt(ruleDistribution.multiSelect) || 0) > 0,
                trueFalse: (parseInt(ruleDistribution.trueFalse) || 0) > 0
            },
            topicQuestions: topics.map(t => ({
                topicId: t.id,
                topicName: t.name,
                questionCount: 0 // Handled by distribution now
            })),
            scoring: {
                distribution: "equal",
                topicWeights: null
            },
            randomization: {
                enabled: true,
                seed: null
            }
        };

        const result = createRule(projectId, ruleData);
        if (result.success) {
            setShowCreateRule(false);
            setCreatedRuleName("");
        }
    };

    const handleGenerateBattery = () => {
        if (!selectedRuleId) return;
        if (batteryType === "topic" && !selectedTopicId) return;

        generateBattery(selectedRuleId, batteryType, batteryType === "topic" ? selectedTopicId : null);
        setShowGenerateBattery(false);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return (
                    <Chip
                        value="Pending"
                        size="sm"
                        color="gray"
                        className="rounded-full"
                    />
                );
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
                    <Tooltip content="Processing failed. Click retry to try again.">
                        <Chip
                            value="Failed"
                            icon={<ExclamationCircleIcon className="h-4 w-4" />}
                            size="sm"
                            color="red"
                            className="rounded-full"
                        />
                    </Tooltip>
                );
            default:
                return null;
        }
    };

    const processingCount = documents.filter((d) => d.status === "processing").length;

    return (
        <div className="mt-12">
            {/* Header */}
            <Card className="border border-blue-gray-100 shadow-sm mb-6">
                <CardHeader
                    floated={false}
                    shadow={false}
                    color="transparent"
                    className="m-0 p-6"
                >
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
                                    {project.name}
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
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Tabs Navigation */}
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

            {/* Tab Content */}
            {activeTab === "documents" && (
                <>
                    {/* Upload Button */}
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

                    {/* Documents List */}
                    <Card className="border border-blue-gray-100 shadow-sm">
                        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                            {documents.length > 0 ? (
                                <table className="w-full min-w-[640px] table-auto">
                                    <thead>
                                        <tr>
                                            {["Name", "Type", "Size", "Uploaded", "Status", "Actions"].map((el) => (
                                                <th
                                                    key={el}
                                                    className="border-b border-blue-gray-50 py-3 px-6 text-left"
                                                >
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
                                            const className = `py-3 px-6 ${index === documents.length - 1
                                                ? ""
                                                : "border-b border-blue-gray-50"
                                                }`;

                                            return (
                                                <tr key={doc.id}>
                                                    <td className={className}>
                                                        <div className="flex items-center gap-2">
                                                            <DocumentTextIcon className="h-5 w-5 text-blue-gray-400" />
                                                            <Typography
                                                                variant="small"
                                                                className="font-medium text-blue-gray-900"
                                                            >
                                                                {doc.filename}
                                                            </Typography>
                                                        </div>
                                                    </td>
                                                    <td className={className}>
                                                        <Chip value={doc.type} size="sm" variant="ghost" color="blue" />
                                                    </td>
                                                    <td className={className}>
                                                        <Typography variant="small" className="text-blue-gray-600">
                                                            {formatFileSize(doc.size)}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <Typography variant="small" className="text-blue-gray-600">
                                                            {formatDate(doc.uploadedAt)}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>{getStatusBadge(doc.status)}</td>
                                                    <td className={className}>
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
                                                                {doc.status === "failed" && isOwner(project) && (
                                                                    <MenuItem
                                                                        onClick={() => handleRetryProcessing(doc)}
                                                                        className="flex items-center gap-2 text-blue-500"
                                                                    >
                                                                        <ArrowPathIcon className="h-4 w-4" />
                                                                        Retry Processing
                                                                    </MenuItem>
                                                                )}
                                                                {isOwner(project) && (
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
                    {/* Create Topic Button */}
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

                    {/* Topics Grid */}
                    {topics.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {topics.map((topic) => (
                                <TopicCard
                                    key={topic.id}
                                    topic={topic}
                                    documentCount={topic.assignedDocuments.length}
                                    onEdit={handleEditTopic}
                                    onArchive={handleArchiveTopic}
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
                </>
            )}

            {/* Rules Tab Content */}
            {activeTab === "rules" && (
                <>
                    <div className="mb-6 flex justify-end">
                        <Button
                            className="flex items-center gap-2"
                            color="blue"
                            onClick={() => setShowCreateRule(true)}
                        >
                            <PlusIcon className="h-5 w-5" />
                            Create Rule
                        </Button>
                    </div>

                    {showCreateRule && (
                        <Card className="mb-6 border border-blue-gray-100 shadow-sm">
                            <CardBody>
                                <Typography variant="h6" color="blue-gray" className="mb-4">
                                    New Rule Configuration (Simplified)
                                </Typography>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-blue-gray-700 mb-2">
                                        Rule Name
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-blue-gray-200 rounded-md"
                                        placeholder="E.g., Final Exam Rule"
                                        value={createdRuleName}
                                        onChange={(e) => setCreatedRuleName(e.target.value)}
                                    />
                                </div>

                                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                                    Question Distribution (Total: {(parseInt(ruleDistribution.singleChoice) || 0) + (parseInt(ruleDistribution.multiSelect) || 0) + (parseInt(ruleDistribution.trueFalse) || 0)})
                                </Typography>
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs text-blue-gray-500 mb-1">Single Choice</label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full px-3 py-2 border border-blue-gray-200 rounded-md"
                                            value={ruleDistribution.singleChoice}
                                            onChange={(e) => setRuleDistribution({ ...ruleDistribution, singleChoice: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-blue-gray-500 mb-1">Multi Select</label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full px-3 py-2 border border-blue-gray-200 rounded-md"
                                            value={ruleDistribution.multiSelect}
                                            onChange={(e) => setRuleDistribution({ ...ruleDistribution, multiSelect: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-blue-gray-500 mb-1">True/False</label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full px-3 py-2 border border-blue-gray-200 rounded-md"
                                            value={ruleDistribution.trueFalse}
                                            onChange={(e) => setRuleDistribution({ ...ruleDistribution, trueFalse: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="text" onClick={() => setShowCreateRule(false)}>
                                        Cancel
                                    </Button>
                                    <Button color="blue" onClick={handleCreateRule} disabled={!createdRuleName}>
                                        Save Rule
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    {rules.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {rules.map((rule) => (
                                <Card key={rule.id} className="border border-blue-gray-100 shadow-sm">
                                    <CardBody>
                                        <div className="flex justify-between items-start mb-4">
                                            <Typography variant="h6" color="blue-gray">
                                                {rule.name}
                                            </Typography>
                                            <IconButton
                                                size="sm"
                                                variant="text"
                                                color="red"
                                                onClick={() => deleteRule(rule.id)}
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </IconButton>
                                        </div>
                                        <div className="space-y-2 text-sm text-blue-gray-600">
                                            <div className="flex justify-between">
                                                <span>Questions:</span>
                                                <span className="font-medium text-blue-gray-900">
                                                    {(rule.distribution?.singleChoice || 0) +
                                                        (rule.distribution?.multiSelect || 0) +
                                                        (rule.distribution?.trueFalse || 0)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Scoring:</span>
                                                <span className="capitalize">{rule.scoring.distribution}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Distribution:</span>
                                                <div className="flex flex-col text-xs text-right">
                                                    <span>SC: {rule.distribution?.singleChoice || 0}</span>
                                                    <span>MS: {rule.distribution?.multiSelect || 0}</span>
                                                    <span>TF: {rule.distribution?.trueFalse || 0}</span>
                                                </div>
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
            )
            }

            {/* Batteries Tab Content */}
            {
                activeTab === "batteries" && (
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
                                                {rules.map(r => (
                                                    <option key={r.id} value={r.id}>{r.name}</option>
                                                ))}
                                            </select>
                                        </div>
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
                                                {topics.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
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
                                                        color={battery.status === "ready" ? "green" : "blue-gray"}
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
                                                <Menu placement="bottom-end">
                                                    <MenuHandler>
                                                        <IconButton size="sm" variant="text" color="blue-gray">
                                                            <EllipsisVerticalIcon className="h-5 w-5" />
                                                        </IconButton>
                                                    </MenuHandler>
                                                    <MenuList>
                                                        <MenuItem onClick={() => generateBatteryVariant(battery.id)}>
                                                            Generate Variant
                                                        </MenuItem>
                                                        {battery.status === "draft" && (
                                                            <MenuItem onClick={() => updateBatteryStatus(battery.id, "ready")}>
                                                                Mark as Ready
                                                            </MenuItem>
                                                        )}
                                                        <MenuItem onClick={() => deleteBattery(battery.id)} className="text-red-500">
                                                            Delete
                                                        </MenuItem>
                                                    </MenuList>
                                                </Menu>
                                            </div>
                                            <Typography variant="h6" color="blue-gray" className="mb-1 truncate">
                                                {battery.name}
                                            </Typography>
                                            <Typography variant="small" className="text-blue-gray-500 mb-4">
                                                {battery.questions.length} questions • {formatDate(battery.createdAt)}
                                            </Typography>

                                            {battery.variants.length > 0 && (
                                                <div className="flex items-center gap-2 text-xs text-blue-500 bg-blue-50 p-2 rounded">
                                                    <InformationCircleIcon className="h-4 w-4" />
                                                    {battery.variants.length} variants generated
                                                </div>
                                            )}
                                            {battery.variantOf && (
                                                <div className="flex items-center gap-2 text-xs text-purple-500 bg-purple-50 p-2 rounded">
                                                    <InformationCircleIcon className="h-4 w-4" />
                                                    Variant of another battery
                                                </div>
                                            )}
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-blue-gray-400">
                                <BoltIcon className="h-16 w-16 mb-4" />
                                <Typography variant="h6" className="mb-2">No batteries yet</Typography>
                                <Typography>Generate batteries from your configured rules.</Typography>
                            </div>
                        )}
                    </>
                )
            }

            {/* Dialogs - Documents */}
            <UploadDocumentsDialog
                open={uploadDialogOpen}
                onClose={() => setUploadDialogOpen(false)}
                onUpload={handleUploadDocuments}
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
                message={`Are you sure you want to delete "${selectedDocument?.filename}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />

            {/* Dialogs - Topics */}
            <CreateTopicDialog
                open={createTopicDialogOpen}
                onClose={() => setCreateTopicDialogOpen(false)}
                onCreate={handleCreateTopic}
                availableDocuments={readyDocuments}
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
            <ExamSimulatorDialog
                open={!!simulationBattery}
                handler={() => setSimulationBattery(null)}
                battery={simulationBattery}
            />
        </div >
    );
}

export default ProjectDetail;

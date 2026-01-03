import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
    Input,
    Tabs,
    TabsHeader,
    Tab,
    Spinner,
} from "@material-tailwind/react";
import {
    PlusIcon,
    MagnifyingGlassIcon,
    FolderIcon,
    UserGroupIcon,
} from "@heroicons/react/24/outline";
import { ProjectCard } from "@/widgets/cards/project-card";
import { CreateProjectDialog } from "@/widgets/dialogs/create-project-dialog";
import { EditProjectDialog } from "@/widgets/dialogs/edit-project-dialog";
import { ConfirmDialog } from "@/widgets/dialogs/confirm-dialog";
import projectService from "@/services/projectService";
import { useAuth } from "@/context/auth-context";
import UploadDocumentsDialog from "@/widgets/dialogs/upload-documents-dialog";

import { useProjects } from "@/context/projects-context";

import { useLanguage } from "@/context/language-context";

export function Projects() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { user } = useAuth();
    // Use global state
    const { projects, createProject, deleteProject, refreshAll, loading: contextLoading } = useProjects();

    // Local UI state
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [error, setError] = useState(null);
    const [activeJobs, setActiveJobs] = useState({}); // { projectId: [{ jobId }] }

    // No local fetch needed, context handles it.
    useEffect(() => {
        refreshAll();
    }, [refreshAll]);




    // Default projects to show
    const defaultProjects = [
        {
            id: 1,
            title: "Design System",
            name: "Design System",
            description: "Build a comprehensive design system for web applications",
            owner: { id: user?.id || 1, name: user?.username || "You" },
            created_at: new Date().toISOString(),
            logo: null,
        },
        {
            id: 2,
            title: "Mobile App",
            name: "Mobile App",
            description: "React Native mobile application for iOS and Android",
            owner: { id: user?.id || 1, name: user?.username || "You" },
            created_at: new Date().toISOString(),
            logo: null,
        },
    ];
    const handleUploadDocs = (project) => {
        setUploadProject(project);
        setUploadDialogOpen(true);
    };

    const handleDoUploadDocs = async (projectId, files) => {
        try {
            const response = await projectService.uploadDocuments(projectId, files);
            if (response.processing) {
                const newJobs = response.processing.map(p => ({ jobId: p.external?.job_id }));
                setActiveJobs(prev => ({
                    ...prev,
                    [projectId]: [...(prev[projectId] || []), ...newJobs]
                }));
            }
            await refreshAll();
        } catch (err) {
            setError(err?.error || "Failed to upload documents");
        }
    };
    const handleJobComplete = async (projectId, jobId, docId) => {
        try {
            if (docId) {
                // Fetch tags as requested by user
                await projectService.getDocumentTags(docId);
            }
            setActiveJobs((prev) => {
                const projectJobs = prev[projectId] || [];
                const filtered = projectJobs.filter((j) => j.jobId !== jobId);

                if (filtered.length === 0) {
                    const next = { ...prev };
                    delete next[projectId];
                    return next;
                }

                return {
                    ...prev,
                    [projectId]: filtered,
                };
            });
            refreshAll();
        } catch (err) {
            console.error("Error handling job completion:", err);
        }
    };

    // Get projects based on active tab
    const getFilteredProjects = () => {
        let filtered = projects;

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    (p.title || p.name).toLowerCase().includes(query) ||
                    (p.description || "").toLowerCase().includes(query) ||
                    (p.owner?.name || "").toLowerCase().includes(query)
            );
        }

        // Filter by tab
        if (activeTab === "owned") {
            filtered = filtered.filter((p) => p.owner?.id === user?.id);
        }
        // TODO: Implement member filter when API supports it

        return filtered;
    };

    const filteredProjects = getFilteredProjects();
    const isOwner = (project) => project?.owner?.id === user?.id;


    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [uploadProject, setUploadProject] = useState(null);



    // Por ahora no hay progreso en el API, dejamos 0
    const getProjectProgress = (_projectId) => 0;

    // No tienes esas features todavía, las dejamos deshabilitadas
    const handleDuplicateProject = () => {
        setError("Duplicate Project not implemented yet");
    };

    const handleArchiveProject = () => {
        setError("Archive Project not implemented yet");
    };

    // Handlers
    // const handleCreateProject = async (projectData, files) => {
    //     try {
    //         await fetchProjects(); // Refresh list after create
    //         setCreateDialogOpen(false);
    //     } catch (err) {
    //         setError(err?.error || "Failed to create project");
    //     }
    // };
    const handleCreateProject = async (createdProject) => {
        // Context createProject already refreshes, but the dialog returns the created object
        // If the dialog CALLS the service itself, we just need refreshAll.
        // Assuming the dialog returns data to BE created:
        // But wait, CreateProjectDialog usually calls onCreate.
        // Let's assume standard pattern: Dialog calls service? or Parent calls service?
        // Checking typical pattern: Dialog passes data, Parent calls service.
        // However, earlier code had `await projectService.getProjects()` in `fetchProjects`.

        // Actually, checking CreateProjectDialog usage below... `onCreate={handleCreateProject}`.
        // If CreateProjectDialog calls API, `createdProject` is the result.
        // If CreateProjectDialog just passes data, `createdProject` is the form data.
        // Based on "await fetchProjects()" in original code, likely the dialog does NOT call API?
        // Or it does, and just wants refresh.

        // Safest: call refreshAll().
        try {
            await refreshAll();
            setCreateDialogOpen(false);
        } catch (err) {
            setError("Failed to refresh");
        }
    };
    const getProjectDocuments = (projectId) => {
        const project = projects.find((p) => p.id === projectId);
        return project?.documents || [];
    };

    const handleEnterProject = (project) => {
        navigate(`/dashboard/project/${project.id}`);
    };

    const handleEditProject = (project) => {
        setSelectedProject(project);
        setEditDialogOpen(true);
    };

    const handleSaveEdit = async (updates) => {
        if (selectedProject) {
            try {
                await refreshAll();
                setEditDialogOpen(false);
            } catch (err) {
                setError(err?.error || "Failed to update project");
            }
        }
    };

    const handleDeleteProject = (project) => {
        setSelectedProject(project);
        setConfirmAction("delete");
        setConfirmDialogOpen(true);
    };

    const handleConfirmAction = async () => {
        if (!selectedProject) return;

        try {
            if (confirmAction === "delete") {
                await deleteProject(selectedProject.id); // Uses context
            }
            setSelectedProject(null);
            setConfirmAction(null);
            setConfirmDialogOpen(false);
        } catch (err) {
            setError(err?.error || "Failed to perform action");
        }
    };
    const getConfirmDialogProps = () => {
        if (confirmAction === "delete") {
            return {
                title: t("projects.dialogs.delete_title"),
                message: t("projects.dialogs.delete_message", { name: selectedProject?.title || selectedProject?.name }),
                confirmText: t("projects.dialogs.delete_confirm"),
                variant: "danger",
            };
        }

        return {
            title: t("projects.dialogs.confirm_title"),
            message: t("projects.dialogs.confirm_message"),
            confirmText: t("projects.dialogs.confirm_btn"),
            variant: "info",
        };
    };

    // const getConfirmDialogProps = () => {
    //     if (confirmAction === "delete") {
    //         return {
    //             title: "Delete Project",
    //             message: `Are you sure you want to permanently delete "${selectedProject?.title || selectedProject?.name}"? This action cannot be undone.`,
    //             confirmText: "Delete",
    //             variant: "danger",
    //         };
    //     }
    //     return {};
    // };

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
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <Typography variant="h4" color="blue-gray" className="mb-1">
                                {t("projects.title")}
                            </Typography>
                            <Typography className="font-normal text-blue-gray-600">
                                {t("projects.subtitle")}
                            </Typography>
                        </div>
                        <Button
                            className="flex items-center gap-2"
                            color="blue-gray"
                            onClick={() => setCreateDialogOpen(true)}
                        >
                            <PlusIcon className="h-5 w-5" />
                            {t("projects.btn_create")}
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Filters and Search */}
            <Card className="border border-blue-gray-100 shadow-sm mb-6">
                <CardBody className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Tabs */}
                        <div className="flex-1 min-w-[400px]">
                            <Tabs value={activeTab} className="w-full">
                                <TabsHeader className="bg-blue-gray-50">
                                    <Tab
                                        value="all"
                                        onClick={() => setActiveTab("all")}
                                        className="px-4"
                                    >
                                        <div className="flex items-center gap-2">
                                            <FolderIcon className="h-4 w-4" />
                                            {t("projects.tabs.all")}
                                        </div>
                                    </Tab>
                                    <Tab
                                        value="owned"
                                        onClick={() => setActiveTab("owned")}
                                        className="px-4"
                                    >
                                        <div className="flex items-center gap-2">
                                            <UserGroupIcon className="h-4 w-4" />
                                            {t("projects.tabs.owned")}
                                        </div>
                                    </Tab>
                                    <Tab
                                        value="member"
                                        onClick={() => setActiveTab("member")}
                                        className="px-4"
                                    >
                                        <div className="flex items-center gap-2">
                                            <UserGroupIcon className="h-4 w-4" />
                                            {t("projects.tabs.shared")}
                                        </div>
                                    </Tab>
                                </TabsHeader>
                            </Tabs>
                        </div>

                        {/* Search */}
                        <div className="w-full md:w-80">
                            <Input
                                label={t("projects.search_placeholder")}
                                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Projects Grid */}
            {filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        // <ProjectCard
                        //     key={project.id}
                        //     project={project}
                        //     documentCount={getProjectDocuments(project.id).length}
                        //     progress={getProjectProgress(project.id)}
                        //     isOwner={isOwner(project)}
                        //     onEnter={handleEnterProject}
                        //     onEdit={handleEditProject}
                        //     onDuplicate={handleDuplicateProject}
                        //     onArchive={handleArchiveProject}
                        //     onDelete={handleDeleteProject}
                        // />
                        <ProjectCard
                            key={project.id}
                            project={project}
                            documentCount={project.documents_count ?? 0}
                            progress={0}
                            processingJobs={activeJobs[project.id] || []}
                            isOwner={project?.owner?.id === user?.id}
                            onEnter={handleEnterProject}
                            onEdit={handleEditProject}
                            onDelete={handleDeleteProject}
                            onUploadDocs={handleUploadDocs}
                            onJobComplete={handleJobComplete}
                        />


                    ))}
                </div>
            ) : (
                <Card className="border border-blue-gray-100 shadow-sm">
                    <CardBody className="flex flex-col items-center justify-center py-12">
                        <FolderIcon className="h-16 w-16 text-blue-gray-300 mb-4" />
                        <Typography variant="h5" color="blue-gray" className="mb-2">
                            {t("projects.no_projects")}
                        </Typography>
                        <Typography className="text-blue-gray-600 mb-4 text-center">
                            {searchQuery
                                ? t("projects.no_projects_desc")
                                : t("projects.no_projects_cta")}
                        </Typography>
                        {!searchQuery && (
                            <Button
                                className="flex items-center gap-2"
                                color="blue-gray"
                                onClick={() => setCreateDialogOpen(true)}
                            >
                                <PlusIcon className="h-5 w-5" />
                                {t("projects.btn_create")}
                            </Button>
                        )}
                    </CardBody>
                </Card>
            )}

            {/* Dialogs */}
            <CreateProjectDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onCreate={handleCreateProject}
            />

            <EditProjectDialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                onSave={handleSaveEdit}
                project={selectedProject}
            />
            <ConfirmDialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                onConfirm={handleConfirmAction}
                title={getConfirmDialogProps().title || "Confirm"}
                message={getConfirmDialogProps().message || "Are you sure?"}
                confirmText={getConfirmDialogProps().confirmText || "Confirm"}
                variant={getConfirmDialogProps().variant || "default"}
            />

            <UploadDocumentsDialog
                open={uploadDialogOpen}
                onClose={() => {
                    setUploadDialogOpen(false);
                    setUploadProject(null);
                }}
                project={uploadProject}
                onUpload={handleDoUploadDocs}
            />



            {/* <ConfirmDialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                onConfirm={handleConfirmAction}
                {...getConfirmDialogProps()}
            /> */}
        </div>
    );
}

export default Projects;

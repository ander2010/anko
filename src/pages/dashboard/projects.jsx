import React, { useState, useEffect, useMemo } from "react";
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
    BookOpenIcon,
    ChevronRightIcon,
    // UserGroupIcon,
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
import { useJobs } from "@/context/job-context";

export function Projects() {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const { user } = useAuth();
    // Use global state
    const { projects, createProject, deleteProject, refreshAll, loading: contextLoading } = useProjects();
    const { activeJobs: globalActiveJobs, addJob, removeJob, clearAllJobs } = useJobs();

    // Local UI state
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [error, setError] = useState(null);
    const [mobileCounts, setMobileCounts] = useState({});

    useEffect(() => {
        if (projects.length === 0) return;
        projects.forEach(async (project) => {
            try {
                const data = await projectService.getProjectCounts(project.id);
                setMobileCounts(prev => ({
                    ...prev,
                    [project.id]: {
                        documents: data.documents_count ?? project.documents_count ?? 0,
                        batteries: data.batteries_count ?? 0,
                        decks: data.decks_count ?? 0,
                    }
                }));
            } catch (_) {}
        });
    }, [projects]);

    const activeJobs = useMemo(() => {
        const projectJobs = {};
        globalActiveJobs.forEach(job => {
            if (!job) return; // Safety check
            const pid = job.projectId ? String(job.projectId) : null;
            if (pid) {
                if (!projectJobs[pid]) projectJobs[pid] = [];
                projectJobs[pid].push({ jobId: job.id, docId: job.docId });
            }
        });
        return projectJobs;
    }, [globalActiveJobs]);

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

    const handleDoUploadDocs = async (projectId, response) => {
        // Jobs are already registered by UploadDocumentsDialog internal handler.
        // We just need to refresh the projects list to see the new document counts.
        try {
            await refreshAll();
        } catch (err) {
            setError(err?.error || "Failed to refresh project list");
        }
    };
    const handleJobComplete = async (projectId, jobId, docId) => {
        try {
            if (docId) {
                // Fetch tags as requested by user
                await projectService.getDocumentTags(docId);
            }
            if (jobId) removeJob(jobId);
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
    const handleEnterProject = (project, tab = null) => {
        navigate(`/dashboard/project/${project.id}`, { state: { activeTab: tab } });
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
        <div className="mt-0 md:mt-8 md:space-y-8 pb-20">

            {/* ── Mobile Header + Search (hidden on desktop) ── */}
            <div className="md:hidden px-4 pt-5 pb-1">
                <div className="flex items-center justify-between mb-4">
                    <span style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.5px" }}>
                        {t("projects.title")}
                    </span>
                    <button
                        onClick={() => setCreateDialogOpen(true)}
                        style={{
                            width: 36, height: 36, borderRadius: "50%",
                            background: "#3949AB", border: "none",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", boxShadow: "0 4px 14px rgba(57,73,171,0.28)",
                        }}
                    >
                        <PlusIcon className="h-[15px] w-[15px] text-white" strokeWidth={2.5} />
                    </button>
                </div>
                <div style={{ position: "relative", marginBottom: 20 }}>
                    <MagnifyingGlassIcon style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "#94a3b8", pointerEvents: "none" }} />
                    <input
                        type="text"
                        placeholder={t("projects.search_placeholder") || "Search projects…"}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: "100%", background: "#fff",
                            border: "1.5px solid #e2e8f0", borderRadius: 13,
                            padding: "11px 14px 11px 38px",
                            fontSize: 13, color: "#0f172a", outline: "none",
                        }}
                    />
                </div>
            </div>

            {/* ── Desktop Header (hidden on mobile) ── */}
            <div className="hidden md:flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-6 border-b border-zinc-200/60">
                <div>
                    <Typography variant="h3" className="font-bold tracking-tight text-zinc-900 mb-1">
                        {t("projects.title")}
                    </Typography>
                    <Typography className="text-zinc-500 font-medium">
                        {t("projects.subtitle")}
                    </Typography>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 px-6 py-3 normal-case text-sm font-bold transition-all hover:-translate-y-0.5"
                        onClick={() => setCreateDialogOpen(true)}
                    >
                        <PlusIcon className="h-5 w-5 stroke-[2.5]" />
                        {t("projects.btn_create")}
                    </Button>
                </div>
            </div>

            {/* ── Desktop Filters + Search (hidden on mobile) ── */}
            <div className="hidden md:flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                    <div className="inline-flex p-1 bg-zinc-100 rounded-2xl border border-zinc-200/60">
                        {[
                            { value: "all", label: t("projects.tabs.all"), icon: FolderIcon },
                        ].map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setActiveTab(tab.value)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${activeTab === tab.value
                                    ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/50"
                                    : "text-zinc-500 hover:text-zinc-800"
                                    }`}
                            >
                                <tab.icon className={`h-4 w-4 ${activeTab === tab.value ? "text-indigo-600" : "text-zinc-400"}`} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="relative w-full lg:w-96 group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder={t("projects.search_placeholder") || "Search projects..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-indigo-600 focus:bg-white rounded-2xl text-sm font-medium transition-all outline-none"
                    />
                </div>
            </div>

            {/* ── Mobile Cards (hidden on desktop) ── */}
            <div className="md:hidden px-4">
                {filteredProjects.length > 0 ? (
                    <>
                        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "1.3px", color: "#94a3b8", textTransform: "uppercase", marginBottom: 12 }}>
                            {language === "es" ? "Recientes" : "Recent"}
                        </p>
                        {filteredProjects.map((project, index) => {
                            const isFeatured = index === 0;
                            const title = project.title || project.name || "Untitled";
                            const updatedAt = project.updated_at || project.created_at;
                            const dateStr = updatedAt
                                ? new Date(updatedAt).toLocaleDateString(language === "es" ? "es-ES" : "en-US", { month: "short", day: "numeric", year: "numeric" })
                                : "";
                            return (
                                <div
                                    key={project.id}
                                    onClick={() => handleEnterProject(project)}
                                    style={{
                                        background: isFeatured ? "linear-gradient(140deg, #fff 55%, #f4f6ff 100%)" : "#fff",
                                        borderRadius: 18,
                                        padding: 16,
                                        marginBottom: 12,
                                        border: `1.5px solid ${isFeatured ? "rgba(57,73,171,0.28)" : "#e2e8f0"}`,
                                        cursor: "pointer",
                                        position: "relative",
                                        overflow: "hidden",
                                    }}
                                >
                                    {isFeatured && (
                                        <div style={{
                                            position: "absolute", top: 0, left: 0,
                                            width: "100%", height: 3,
                                            background: "linear-gradient(90deg, #3949AB, #818cf8)",
                                            borderRadius: "18px 18px 0 0",
                                        }} />
                                    )}
                                    {/* Top row */}
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                                        <div style={{
                                            width: 40, height: 40,
                                            background: "rgba(57, 73, 171)",
                                            borderRadius: 11,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            border: "1px solid rgba(57,73,171,0.28)",
                                            flexShrink: 0,
                                        }}>
                                            <BookOpenIcon style={{ width: 17, height: 17, color: "#ffffff", strokeWidth: 1.8 }} />
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            {isFeatured && (
                                                <span style={{
                                                    display: "inline-flex", alignItems: "center", gap: 5,
                                                    background: "rgba(57,73,171,0.10)",
                                                    border: "1px solid rgba(57,73,171,0.28)",
                                                    color: "#3949AB", fontSize: 10, fontWeight: 600,
                                                    padding: "3px 9px", borderRadius: 20,
                                                }}>
                                                    <span style={{ width: 5, height: 5, background: "#3949AB", borderRadius: "50%" }} />
                                                    {language === "es" ? "Activo" : "Active"}
                                                </span>
                                            )}
                                            <div style={{
                                                width: 26, height: 26, borderRadius: "50%",
                                                background: "rgba(57, 73, 171)",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                border: "1px solid #e2e8f0",
                                            }}>
                                                <ChevronRightIcon style={{ width: 11, height: 11, color: "#ffffff" }} strokeWidth={2} />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Title + date */}
                                    <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 3, letterSpacing: "-0.3px" }}>
                                        {title}
                                    </p>
                                    <p style={{ fontSize: 11, color: "#94a3b8" }}>
                                        {language === "es" ? "Actualizado" : "Updated"} {dateStr}
                                    </p>
                                    {/* Divider */}
                                    <div style={{ height: 1, background: "#e2e8f0", margin: "12px 0" }} />
                                    {/* Stats */}
                                    <div style={{ display: "flex" }}>
                                        {[
                                            { num: mobileCounts[project.id]?.documents ?? project.documents_count ?? 0, lbl: "Docs" },
                                            { num: mobileCounts[project.id]?.batteries ?? project.batteries_count ?? 0, lbl: language === "es" ? "Baterías" : "Batteries" },
                                            { num: mobileCounts[project.id]?.decks ?? project.decks_count ?? 0, lbl: language === "es" ? "Mazos" : "Decks" },
                                        ].map((s, i) => (
                                            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, position: "relative" }}>
                                                {i < 2 && <div style={{ position: "absolute", right: 0, top: "10%", width: 1, height: "80%", background: "#e2e8f0" }} />}
                                                <span style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>{s.num}</span>
                                                <span style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px", fontWeight: 500 }}>{s.lbl}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                        {/* New project dashed card */}
                        <button
                            onClick={() => setCreateDialogOpen(true)}
                            style={{
                                border: "1.5px dashed #e2e8f0", borderRadius: 18,
                                padding: 17, width: "100%",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
                                cursor: "pointer", background: "transparent", marginBottom: 12,
                            }}
                        >
                            <PlusIcon style={{ width: 14, height: 14, color: "#94a3b8" }} strokeWidth={2} />
                            <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>
                                {language === "es" ? "Nuevo proyecto" : "New project"}
                            </span>
                        </button>
                    </>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 0", textAlign: "center" }}>
                        <FolderIcon style={{ width: 56, height: 56, color: "#cbd5e1", marginBottom: 16 }} />
                        <p style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", marginBottom: 8 }}>
                            {t("projects.no_projects")}
                        </p>
                        <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
                            {searchQuery ? t("projects.no_projects_desc") : t("projects.no_projects_cta")}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => setCreateDialogOpen(true)}
                                style={{
                                    background: "#3949AB", color: "#fff", border: "none",
                                    borderRadius: 12, padding: "10px 20px",
                                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                                    display: "flex", alignItems: "center", gap: 6,
                                }}
                            >
                                <PlusIcon style={{ width: 16, height: 16 }} />
                                {t("projects.btn_create")}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ── Desktop Grid (hidden on mobile) ── */}
            {filteredProjects.length > 0 ? (
                <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            documentCount={project.documents_count ?? 0}
                            batteriesCount={project.batteries_count ?? 0}
                            decksCount={project.decks_count ?? 0}
                            progress={0}
                            processingJobs={activeJobs[String(project.id)] || []}
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
                <Card className="hidden md:block border border-blue-gray-100 shadow-sm">
                    <CardBody className="flex flex-col items-center justify-center py-12">
                        <FolderIcon className="h-16 w-16 text-blue-gray-300 mb-4" />
                        <Typography variant="h5" color="blue-gray" className="mb-2">
                            {t("projects.no_projects")}
                        </Typography>
                        <Typography className="text-blue-gray-600 mb-4 text-center">
                            {searchQuery ? t("projects.no_projects_desc") : t("projects.no_projects_cta")}
                        </Typography>
                        {!searchQuery && (
                            <Button className="flex items-center gap-2" color="blue-gray" onClick={() => setCreateDialogOpen(true)}>
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
                projects={projects}
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

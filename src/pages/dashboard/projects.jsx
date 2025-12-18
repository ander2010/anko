import React, { useState } from "react";
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
} from "@material-tailwind/react";
import {
    PlusIcon,
    MagnifyingGlassIcon,
    FolderIcon,
    UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useProjects } from "@/context/projects-context";
import { ProjectCard } from "@/widgets/cards/project-card";
import { CreateProjectDialog } from "@/widgets/dialogs/create-project-dialog";
import { EditProjectDialog } from "@/widgets/dialogs/edit-project-dialog";
import { ConfirmDialog } from "@/widgets/dialogs/confirm-dialog";

export function Projects() {
    const navigate = useNavigate();
    const {
        currentUser,
        createProject,
        updateProject,
        duplicateProject,
        archiveProject,
        deleteProject,
        isOwner,
        getActiveProjects,
        getOwnedProjects,
        getMemberProjects,
        getProjectDocuments,
        getProjectProgress,
    } = useProjects();

    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);

    // Get projects based on active tab
    const getFilteredProjects = () => {
        let projects = [];
        switch (activeTab) {
            case "owned":
                projects = getOwnedProjects();
                break;
            case "member":
                projects = getMemberProjects();
                break;
            default:
                projects = getActiveProjects();
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            projects = projects.filter(
                (p) =>
                    p.name.toLowerCase().includes(query) ||
                    p.description?.toLowerCase().includes(query) ||
                    p.owner.name.toLowerCase().includes(query)
            );
        }

        return projects;
    };

    const filteredProjects = getFilteredProjects();

    // Handlers
    const handleCreateProject = (projectData, files) => {
        createProject(projectData, files);
    };

    const handleEnterProject = (project) => {
        navigate(`/dashboard/project/${project.id}`);
    };

    const handleEditProject = (project) => {
        setSelectedProject(project);
        setEditDialogOpen(true);
    };

    const handleSaveEdit = (updates) => {
        if (selectedProject) {
            updateProject(selectedProject.id, updates);
        }
    };

    const handleDuplicateProject = (project) => {
        duplicateProject(project.id);
    };

    const handleArchiveProject = (project) => {
        setSelectedProject(project);
        setConfirmAction("archive");
        setConfirmDialogOpen(true);
    };

    const handleDeleteProject = (project) => {
        setSelectedProject(project);
        setConfirmAction("delete");
        setConfirmDialogOpen(true);
    };

    const handleConfirmAction = () => {
        if (!selectedProject) return;

        if (confirmAction === "archive") {
            archiveProject(selectedProject.id);
        } else if (confirmAction === "delete") {
            deleteProject(selectedProject.id);
        }

        setSelectedProject(null);
        setConfirmAction(null);
    };

    const getConfirmDialogProps = () => {
        if (confirmAction === "archive") {
            return {
                title: "Archive Project",
                message: `Are you sure you want to archive "${selectedProject?.name}"? You can restore it later.`,
                confirmText: "Archive",
                variant: "info",
            };
        } else if (confirmAction === "delete") {
            return {
                title: "Delete Project",
                message: `Are you sure you want to permanently delete "${selectedProject?.name}"? This action cannot be undone.`,
                confirmText: "Delete",
                variant: "danger",
            };
        }
        return {};
    };

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
                                My Projects
                            </Typography>
                            <Typography className="font-normal text-blue-gray-600">
                                Manage and organize your projects
                            </Typography>
                        </div>
                        <Button
                            className="flex items-center gap-2"
                            color="blue"
                            onClick={() => setCreateDialogOpen(true)}
                        >
                            <PlusIcon className="h-5 w-5" />
                            Create Project
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Filters and Search */}
            <Card className="border border-blue-gray-100 shadow-sm mb-6">
                <CardBody className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Tabs */}
                        <Tabs value={activeTab} className="w-full md:w-auto">
                            <TabsHeader className="bg-blue-gray-50">
                                <Tab
                                    value="all"
                                    onClick={() => setActiveTab("all")}
                                    className="px-4"
                                >
                                    <div className="flex items-center gap-2">
                                        <FolderIcon className="h-4 w-4" />
                                        All Projects
                                    </div>
                                </Tab>
                                <Tab
                                    value="owned"
                                    onClick={() => setActiveTab("owned")}
                                    className="px-4"
                                >
                                    <div className="flex items-center gap-2">
                                        <UserGroupIcon className="h-4 w-4" />
                                        My Projects
                                    </div>
                                </Tab>
                                <Tab
                                    value="member"
                                    onClick={() => setActiveTab("member")}
                                    className="px-4"
                                >
                                    <div className="flex items-center gap-2">
                                        <UserGroupIcon className="h-4 w-4" />
                                        Shared with Me
                                    </div>
                                </Tab>
                            </TabsHeader>
                        </Tabs>

                        {/* Search */}
                        <div className="w-full md:w-72">
                            <Input
                                label="Search projects..."
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
                        <ProjectCard
                            key={project.id}
                            project={project}
                            documentCount={getProjectDocuments(project.id).length}
                            progress={getProjectProgress(project.id)}
                            isOwner={isOwner(project)}
                            onEnter={handleEnterProject}
                            onEdit={handleEditProject}
                            onDuplicate={handleDuplicateProject}
                            onArchive={handleArchiveProject}
                            onDelete={handleDeleteProject}
                        />
                    ))}
                </div>
            ) : (
                <Card className="border border-blue-gray-100 shadow-sm">
                    <CardBody className="flex flex-col items-center justify-center py-12">
                        <FolderIcon className="h-16 w-16 text-blue-gray-300 mb-4" />
                        <Typography variant="h5" color="blue-gray" className="mb-2">
                            No projects found
                        </Typography>
                        <Typography className="text-blue-gray-600 mb-4 text-center">
                            {searchQuery
                                ? "Try adjusting your search query"
                                : "Get started by creating your first project"}
                        </Typography>
                        {!searchQuery && (
                            <Button
                                className="flex items-center gap-2"
                                color="blue"
                                onClick={() => setCreateDialogOpen(true)}
                            >
                                <PlusIcon className="h-5 w-5" />
                                Create Project
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
                {...getConfirmDialogProps()}
            />
        </div>
    );
}

export default Projects;

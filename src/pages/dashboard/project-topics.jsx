import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
} from "@material-tailwind/react";
import {
    ArrowLeftIcon,
    PlusIcon,
    FolderIcon,
} from "@heroicons/react/24/outline";
import { useProjects } from "@/context/projects-context";
import { TopicCard } from "@/widgets/cards/topic-card";
import { CreateTopicDialog } from "@/widgets/dialogs/create-topic-dialog";
import { EditTopicDialog } from "@/widgets/dialogs/edit-topic-dialog";
import { ConfirmDialog } from "@/widgets/dialogs/confirm-dialog";

export function ProjectTopics() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const {
        getProject,
        getProjectTopics,
        getProjectDocuments,
        createTopic,
        updateTopic,
        archiveTopic,
    } = useProjects();

    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);

    const project = getProject(projectId);
    const topics = getProjectTopics(projectId);
    const documents = getProjectDocuments(projectId);
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

    const handleCreateTopic = (topicData) => {
        createTopic(projectId, topicData);
    };

    const handleEditTopic = (topic) => {
        setSelectedTopic(topic);
        setEditDialogOpen(true);
    };

    const handleSaveEdit = (updates) => {
        if (selectedTopic) {
            updateTopic(selectedTopic.id, updates);
        }
    };

    const handleArchiveTopic = (topic) => {
        setSelectedTopic(topic);
        setConfirmDialogOpen(true);
    };

    const handleConfirmArchive = () => {
        if (selectedTopic) {
            archiveTopic(selectedTopic.id);
            setSelectedTopic(null);
        }
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
                    <div className="flex flex-col gap-4">
                        <Button
                            variant="text"
                            className="flex items-center gap-2 w-fit"
                            onClick={() => navigate(`/dashboard/project/${projectId}`)}
                        >
                            <ArrowLeftIcon className="h-4 w-4" />
                            Back to Project
                        </Button>

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <Typography variant="h4" color="blue-gray" className="mb-1">
                                    Topics - {project.name}
                                </Typography>
                                <Typography className="font-normal text-blue-gray-600">
                                    Manage topics and configure question generation
                                </Typography>
                            </div>
                            <Button
                                className="flex items-center gap-2"
                                color="blue-gray"
                                onClick={() => setCreateDialogOpen(true)}
                            >
                                <PlusIcon className="h-5 w-5" />
                                Create Topic
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

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
                            color="blue-gray"
                            onClick={() => setCreateDialogOpen(true)}
                        >
                            <PlusIcon className="h-5 w-5" />
                            Create Topic
                        </Button>
                    </CardBody>
                </Card>
            )}

            {/* Dialogs */}
            <CreateTopicDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onCreate={handleCreateTopic}
                availableDocuments={readyDocuments}
            />

            <EditTopicDialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                onSave={handleSaveEdit}
                topic={selectedTopic}
                availableDocuments={readyDocuments}
            />

            <ConfirmDialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                onConfirm={handleConfirmArchive}
                title="Archive Topic"
                message={`Are you sure you want to archive "${selectedTopic?.name}"? You can restore it later.`}
                confirmText="Archive"
                variant="info"
            />
        </div>
    );
}

export default ProjectTopics;

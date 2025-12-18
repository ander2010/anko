import React from "react";
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
} from "@material-tailwind/react";
import { useProjects } from "@/context/projects-context";

export function GlobalTopics() {
    const { topics, projects } = useProjects();

    const getProjectName = (id) => {
        const project = projects.find((p) => p.id === id);
        return project ? project.name : "Unknown Project";
    };

    return (
        <div className="mt-12 mb-8 flex flex-col gap-12">
            <Card>
                <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
                    <Typography variant="h6" color="white">
                        Global Topics List
                    </Typography>
                </CardHeader>
                <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                    <table className="w-full min-w-[640px] table-auto">
                        <thead>
                            <tr>
                                {["Topic Name", "Project", "Documents"].map((el) => (
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
                                    <td colSpan={3} className="p-4 text-center">
                                        <Typography variant="small" color="blue-gray">
                                            No topics found.
                                        </Typography>
                                    </td>
                                </tr>
                            ) : (
                                topics.map(({ id, name, projectId, documentIds }, key) => {
                                    const className = `py-3 px-5 ${key === topics.length - 1 ? "" : "border-b border-blue-gray-50"
                                        }`;

                                    return (
                                        <tr key={id}>
                                            <td className={className}>
                                                <Typography variant="small" color="blue-gray" className="font-semibold">
                                                    {name}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {getProjectName(projectId)}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-normal text-blue-gray-500">
                                                    {documentIds?.length || 0}
                                                </Typography>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </CardBody>
            </Card>
        </div>
    );
}

export default GlobalTopics;

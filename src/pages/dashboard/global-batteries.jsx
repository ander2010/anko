import React from "react";
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Chip
} from "@material-tailwind/react";
import { useProjects } from "@/context/projects-context";

export function GlobalBatteries() {
    const { batteries, projects, rules, topics } = useProjects();

    const getProjectName = (id) => {
        const project = projects.find((p) => p.id === id);
        return project ? project.name : "Unknown Project";
    };

    const getRuleName = (id) => {
        const rule = rules.find((r) => r.id === id);
        return rule ? rule.name : "Unknown/Deleted Rule";
    };

    const getTopicName = (id) => {
        if (!id) return "Global (All Topics)";
        const topic = topics.find((t) => t.id === id);
        return topic ? topic.name : "Unknown Topic";
    };

    return (
        <div className="mt-12 mb-8 flex flex-col gap-12">
            <Card>
                <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
                    <Typography variant="h6" color="white">
                        Global Batteries List
                    </Typography>
                </CardHeader>
                <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                    <table className="w-full min-w-[640px] table-auto">
                        <thead>
                            <tr>
                                {["Battery Name", "Status", "Project", "Rule", "Topic Scope", "Questions"].map((el) => (
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
                            {batteries.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center">
                                        <Typography variant="small" color="blue-gray">
                                            No batteries found.
                                        </Typography>
                                    </td>
                                </tr>
                            ) : (
                                batteries.map((battery, key) => {
                                    const className = `py-3 px-5 ${key === batteries.length - 1 ? "" : "border-b border-blue-gray-50"
                                        }`;

                                    return (
                                        <tr key={battery.id}>
                                            <td className={className}>
                                                <div className="flex flex-col">
                                                    <Typography variant="small" color="blue-gray" className="font-semibold">
                                                        {battery.name}
                                                    </Typography>
                                                    {battery.variantOf && (
                                                        <Typography variant="small" className="text-[10px] text-purple-500">
                                                            Variant
                                                        </Typography>
                                                    )}
                                                </div>
                                            </td>
                                            <td className={className}>
                                                <Chip
                                                    variant="ghost"
                                                    color={battery.status === "ready" ? "green" : "blue-gray"}
                                                    value={battery.status}
                                                    className="py-0.5 px-2 text-[11px] font-medium w-fit"
                                                />
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {getProjectName(battery.projectId)}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs text-blue-gray-600">
                                                    {getRuleName(battery.courseId || battery.ruleId)}
                                                    {/* Assuming ruleId is stored, check battery structure if needed */}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs text-blue-gray-600">
                                                    {getTopicName(battery.topicId)}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-bold text-blue-gray-700">
                                                    {battery.questions?.length || 0}
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

export default GlobalBatteries;

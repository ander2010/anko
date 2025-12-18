import React from "react";
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Chip
} from "@material-tailwind/react";
import { useProjects } from "@/context/projects-context";

export function GlobalRules() {
    const { rules, projects } = useProjects();

    const getProjectName = (id) => {
        const project = projects.find((p) => p.id === id);
        return project ? project.name : "Unknown Project";
    };

    return (
        <div className="mt-12 mb-8 flex flex-col gap-12">
            <Card>
                <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
                    <Typography variant="h6" color="white">
                        Global Rules List
                    </Typography>
                </CardHeader>
                <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                    <table className="w-full min-w-[640px] table-auto">
                        <thead>
                            <tr>
                                {["Rule Name", "Project", "Total Questions", "Distribution (SC/MS/TF)"].map((el) => (
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
                            {rules.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center">
                                        <Typography variant="small" color="blue-gray">
                                            No rules found.
                                        </Typography>
                                    </td>
                                </tr>
                            ) : (
                                rules.map((rule, key) => {
                                    const className = `py-3 px-5 ${key === rules.length - 1 ? "" : "border-b border-blue-gray-50"
                                        }`;

                                    const totalQs = (rule.distribution?.singleChoice || 0) +
                                        (rule.distribution?.multiSelect || 0) +
                                        (rule.distribution?.trueFalse || 0);

                                    return (
                                        <tr key={rule.id}>
                                            <td className={className}>
                                                <Typography variant="small" color="blue-gray" className="font-semibold">
                                                    {rule.name}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {getProjectName(rule.projectId)}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography className="text-xs font-bold text-blue-gray-700">
                                                    {totalQs}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <div className="flex gap-2 text-xs text-blue-gray-500">
                                                    <span className="bg-blue-50 px-2 py-1 rounded">SC: {rule.distribution?.singleChoice || 0}</span>
                                                    <span className="bg-indigo-50 px-2 py-1 rounded">MS: {rule.distribution?.multiSelect || 0}</span>
                                                    <span className="bg-purple-50 px-2 py-1 rounded">TF: {rule.distribution?.trueFalse || 0}</span>
                                                </div>
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

export default GlobalRules;

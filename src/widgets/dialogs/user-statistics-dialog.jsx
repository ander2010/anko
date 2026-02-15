import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    Card,
    CardBody,
    Typography,
    IconButton,
    Spinner,
    Progress,
} from "@material-tailwind/react";
import {
    XMarkIcon,
    ChartBarIcon,
    DocumentTextIcon,
    FolderIcon,
    TrophyIcon,
    ArrowTrendingUpIcon,
    CheckCircleIcon,
    UserCircleIcon,
    RectangleGroupIcon,
} from "@heroicons/react/24/outline";
import Chart from "react-apexcharts";
import projectService from "@/services/projectService";
import { useLanguage } from "@/context/language-context";

export function UserStatisticsDialog({ open, handler, userId }) {
    const { language } = useLanguage();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (open) {
            fetchStats();
        }
    }, [open, userId]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await projectService.getUserStatistics(userId);
            setStats(data);
        } catch (err) {
            console.error("Error fetching statistics:", err);
            setError(err?.error || (language === "es" ? "Error al cargar estadísticas" : "Failed to load statistics"));
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    // --- Chart Options ---
    const accuracyDonutOptions = {
        chart: { type: "donut" },
        labels: [language === "es" ? "Correctas" : "Correct", language === "es" ? "Incorrectas" : "Incorrect"],
        colors: ["#4f46e5", "#e2e8f0"],
        plotOptions: {
            pie: {
                donut: {
                    size: "75%",
                    labels: {
                        show: true,
                        name: { show: true, fontSize: "12px", fontWeight: 600, color: "#64748b" },
                        value: { show: true, fontSize: "24px", fontWeight: 800, color: "#1e293b", formatter: (val) => `${val}%` },
                        total: {
                            show: true,
                            label: language === "es" ? "Precisión" : "Accuracy",
                            formatter: () => `${stats?.question_level?.accuracy || 0}%`,
                        },
                    },
                },
            },
        },
        dataLabels: { enabled: false },
        legend: { show: false },
        stroke: { width: 0 },
        tooltip: { enabled: false },
    };

    const projectBarOptions = {
        chart: { type: "bar", toolbar: { show: false } },
        plotOptions: {
            bar: {
                borderRadius: 8,
                horizontal: true,
                distributed: true,
                barHeight: "60%",
            },
        },
        colors: ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f59e0b"],
        dataLabels: {
            enabled: true,
            formatter: (val) => `${val}%`,
            style: { fontSize: "12px", fontWeight: 700 },
        },
        xaxis: {
            categories: stats?.project_level?.map(p => p.project_name) || [],
            labels: { style: { colors: "#64748b", fontWeight: 600 } },
            max: 100,
        },
        grid: { borderColor: "#f1f5f9" },
        legend: { show: false },
    };

    const projectBarSeries = [{
        name: language === "es" ? "Rendimiento" : "Performance",
        data: stats?.project_level?.map(p => p.percent) || [],
    }];

    return (
        <Dialog
            open={open}
            handler={handler}
            size="xl"
            className="bg-zinc-50/95 backdrop-blur-md border border-white/20 shadow-premium rounded-[2.5rem] overflow-hidden outline-none"
        >
            <DialogHeader className="flex items-center justify-between px-10 py-8 border-b border-zinc-200/50 bg-white/50">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <ChartBarIcon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <Typography variant="h4" className="font-black text-zinc-900 tracking-tight leading-none">
                            {language === "es" ? "Dashboard de Logros" : "Achievement Dashboard"}
                        </Typography>
                        <div className="flex items-center gap-2 mt-1">
                            <UserCircleIcon className="h-4 w-4 text-zinc-400" />
                            <Typography className="text-sm font-bold text-zinc-500">
                                ID: {stats?.user_id || userId}
                            </Typography>
                        </div>
                    </div>
                </div>
                <IconButton
                    variant="text"
                    color="blue-gray"
                    onClick={handler}
                    className="rounded-full hover:bg-zinc-100 transition-colors"
                >
                    <XMarkIcon className="h-6 w-6" strokeWidth={2.5} />
                </IconButton>
            </DialogHeader>

            <DialogBody className="px-10 py-10 overflow-y-auto max-h-[75vh] custom-scrollbar bg-gradient-to-b from-white/30 to-zinc-50/30">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="relative">
                            <Spinner className="h-16 w-16 text-indigo-500" />
                            <div className="absolute inset-0 m-auto h-8 w-8 bg-white rounded-full flex items-center justify-center">
                                <div className="h-4 w-4 bg-indigo-500 rounded-full animate-pulse" />
                            </div>
                        </div>
                        <Typography className="mt-6 font-black text-zinc-400 uppercase tracking-widest text-xs">
                            {language === "es" ? "Sincronizando datos..." : "Syncing data..."}
                        </Typography>
                    </div>
                ) : error ? (
                    <div className="text-center py-32">
                        <Typography color="red" className="font-black text-lg">
                            {error}
                        </Typography>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {/* Top Section: Overview Cards & Global Accuracy */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="border-0 shadow-premium-sm bg-white overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <RectangleGroupIcon className="h-20 w-20 text-indigo-500" />
                                    </div>
                                    <CardBody className="p-8">
                                        <Typography variant="small" className="font-black text-zinc-400 uppercase tracking-widest mb-1">
                                            {language === "es" ? "Preguntas Totales" : "Total Questions"}
                                        </Typography>
                                        <Typography variant="h1" className="text-zinc-900 font-black">
                                            {stats.question_level.total_questions}
                                        </Typography>
                                        <div className="mt-4 flex items-center gap-2">
                                            <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: "100%" }} />
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>

                                <Card className="border-0 shadow-premium-sm bg-white overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <CheckCircleIcon className="h-20 w-20 text-green-500" />
                                    </div>
                                    <CardBody className="p-8">
                                        <Typography variant="small" className="font-black text-zinc-400 uppercase tracking-widest mb-1">
                                            {language === "es" ? "Respuestas Correctas" : "Correct Answers"}
                                        </Typography>
                                        <Typography variant="h1" className="text-zinc-900 font-black">
                                            {stats.question_level.correct_count}
                                        </Typography>
                                        <div className="mt-4 flex items-center gap-2">
                                            <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500 rounded-full"
                                                    style={{ width: `${(stats.question_level.correct_count / stats.question_level.total_questions) * 100 || 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </div>

                            <Card className="lg:col-span-4 border-0 shadow-premium-sm bg-white flex items-center justify-center p-6">
                                <div className="w-full max-w-[200px]">
                                    <Chart
                                        options={accuracyDonutOptions}
                                        series={[stats.question_level.accuracy || 0, 100 - (stats.question_level.accuracy || 0)]}
                                        type="donut"
                                    />
                                </div>
                            </Card>
                        </div>

                        {/* Middle Section: Project Performance */}
                        <div>
                            <div className="flex items-center gap-3 mb-6 ml-2">
                                <FolderIcon className="h-6 w-6 text-indigo-600" />
                                <Typography variant="h5" className="font-black text-zinc-900 tracking-tight">
                                    {language === "es" ? "Rendimiento por Proyecto" : "Project Performance"}
                                </Typography>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                <Card className="border-0 shadow-premium-sm bg-white p-8">
                                    <Chart
                                        options={projectBarOptions}
                                        series={projectBarSeries}
                                        type="bar"
                                        height={300}
                                    />
                                </Card>

                                <div className="space-y-4">
                                    {stats.project_level.map((proj) => (
                                        <Card key={proj.project_id} className="border-0 shadow-premium-sm bg-white hover:bg-zinc-50 transition-colors">
                                            <CardBody className="p-5 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 font-black text-sm">
                                                        #{proj.project_id}
                                                    </div>
                                                    <div>
                                                        <Typography variant="h6" className="font-black text-zinc-800 leading-tight">
                                                            {proj.project_name}
                                                        </Typography>
                                                        <Typography className="text-xs font-bold text-zinc-400 uppercase">
                                                            {proj.documents_count} {language === "es" ? "documentos" : "documents"} • {proj.project_total_tags} tags
                                                        </Typography>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <Typography className={`text-xl font-black ${proj.percent > 70 ? 'text-green-500' : 'text-zinc-600'}`}>
                                                            {proj.percent}%
                                                        </Typography>
                                                        <Typography className="text-[10px] font-black text-zinc-300 uppercase leading-none">
                                                            SCORE
                                                        </Typography>
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Section: Document Breakdown */}
                        <div>
                            <div className="flex items-center gap-3 mb-6 ml-2">
                                <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
                                <Typography variant="h5" className="font-black text-zinc-900 tracking-tight">
                                    {language === "es" ? "Análisis de Documentos" : "Document Analysis"}
                                </Typography>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                                {stats.document_level.map((doc) => (
                                    <Card key={doc.document_id} className="border-0 shadow-premium-sm bg-white overflow-hidden relative">
                                        <div className="h-1.5 w-full bg-zinc-100">
                                            <div
                                                className={`h-full ${doc.final_percent > 70 ? 'bg-green-500' : 'bg-indigo-500'}`}
                                                style={{ width: `${doc.final_percent}%` }}
                                            />
                                        </div>
                                        <CardBody className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="max-w-[70%]">
                                                    <Typography className="text-xs font-black text-indigo-500 uppercase tracking-widest leading-none mb-2">
                                                        {doc.project_name}
                                                    </Typography>
                                                    <Typography variant="h6" className="font-black text-zinc-800 leading-tight line-clamp-2 min-h-[40px]">
                                                        {doc.document_name}
                                                    </Typography>
                                                </div>
                                                <div className="text-right">
                                                    <Typography className="text-2xl font-black text-zinc-900 leading-none">
                                                        {doc.final_percent}%
                                                    </Typography>
                                                    <Typography className="text-[10px] font-black text-zinc-400 uppercase">
                                                        FINAL
                                                    </Typography>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <Typography className="text-[10px] font-black text-zinc-400 uppercase">
                                                            {language === "es" ? "Cobertura" : "Coverage"}
                                                        </Typography>
                                                        <Typography className="text-[10px] font-black text-indigo-600">
                                                            {doc.coverage_percent}%
                                                        </Typography>
                                                    </div>
                                                    <Progress value={doc.coverage_percent} size="sm" color="indigo" className="bg-zinc-100" />
                                                </div>
                                                <div>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <Typography className="text-[10px] font-black text-zinc-400 uppercase">
                                                            {language === "es" ? "Precisión" : "Accuracy"}
                                                        </Typography>
                                                        <Typography className="text-[10px] font-black text-green-600">
                                                            {doc.accuracy}%
                                                        </Typography>
                                                    </div>
                                                    <Progress value={doc.accuracy} size="sm" color="green" className="bg-zinc-100" />
                                                </div>
                                            </div>

                                            <div className="mt-6 pt-4 border-t border-zinc-100 grid grid-cols-2 gap-2">
                                                <div className="text-center">
                                                    <Typography className="text-[10px] font-black text-zinc-300 uppercase leading-none mb-1">
                                                        {language === "es" ? "Correctas" : "Correct"}
                                                    </Typography>
                                                    <Typography className="text-sm font-black text-zinc-600">
                                                        {doc.correct_count} / {doc.total_questions}
                                                    </Typography>
                                                </div>
                                                <div className="text-center border-l border-zinc-100">
                                                    <Typography className="text-[10px] font-black text-zinc-300 uppercase leading-none mb-1">
                                                        Tags
                                                    </Typography>
                                                    <Typography className="text-sm font-black text-zinc-600">
                                                        {doc.doc_distinct_tags} / {doc.project_total_tags}
                                                    </Typography>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </DialogBody>

            <div className="px-10 py-8 bg-zinc-50/50 border-t border-zinc-200/50 flex justify-between items-center">
                <Typography className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Ankard Analysis Engine • v2.1
                </Typography>
                <div className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    <Typography className="text-[10px] font-black text-zinc-400 uppercase">
                        Live Data Matrix
                    </Typography>
                </div>
            </div>
        </Dialog>
    );
}

export default UserStatisticsDialog;

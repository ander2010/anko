import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    Card,
    Typography,
    IconButton,
    Spinner,
} from "@material-tailwind/react";
import {
    XMarkIcon,
    ChartBarIcon,
    DocumentTextIcon,
    FolderIcon,
    TrophyIcon,
    ArrowTrendingUpIcon,
    SparklesIcon,
    ExclamationCircleIcon,
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

    // --- Compact & Professional Chart Configurations ---
    const accuracyDonutOptions = {
        chart: { type: "donut", fontFamily: "Inter, system-ui, sans-serif" },
        labels: [language === "es" ? "Correct" : "Correct", language === "es" ? "Incorrect" : "Incorrect"],
        colors: ["#6366f1", "#f1f5f9"],
        plotOptions: {
            pie: {
                donut: {
                    size: "82%",
                    labels: {
                        show: true,
                        name: { show: false },
                        value: {
                            show: true,
                            fontSize: "22px",
                            fontWeight: 800,
                            color: "#1e293b",
                            offsetY: 8,
                            formatter: (val) => `${val}%`
                        },
                        total: {
                            show: true,
                            label: "",
                            formatter: () => `${stats?.question_level?.accuracy || 0}%`,
                        },
                    },
                },
            },
        },
        dataLabels: { enabled: false },
        legend: { show: false },
        stroke: { width: 0 },
        tooltip: { enabled: true, theme: "light" },
        states: { hover: { filter: { type: "none" } } }
    };

    const projectBarOptions = {
        chart: {
            type: "bar",
            toolbar: { show: false },
            fontFamily: "Inter, system-ui, sans-serif"
        },
        plotOptions: {
            bar: {
                borderRadius: 3,
                horizontal: true,
                distributed: true,
                barHeight: "35%",
                dataLabels: { position: "top" }
            },
        },
        colors: ["#6366f1", "#818cf8", "#94a3b8", "#cbd5e1", "#e2e8f0"],
        dataLabels: {
            enabled: true,
            formatter: (val) => `${val}%`,
            offsetX: 28,
            style: { fontSize: "10px", fontWeight: 700, colors: ["#64748b"] },
        },
        xaxis: {
            categories: stats?.project_level?.map(p => p.project_name.length > 18 ? p.project_name.substring(0, 18) + "..." : p.project_name) || [],
            labels: { show: false },
            axisBorder: { show: false },
            axisTicks: { show: false },
            max: 110,
        },
        yaxis: {
            labels: {
                style: { colors: "#94a3b8", fontSize: "10px", fontWeight: 600 }
            }
        },
        grid: { show: false },
        legend: { show: false },
        tooltip: { theme: "light", y: { formatter: (val) => `${val}% Accuracy` } }
    };

    const projectBarSeries = [{
        name: language === "es" ? "Precisión" : "Accuracy",
        data: stats?.project_level?.map(p => p.percent) || [],
    }];

    return (
        <Dialog
            open={open}
            handler={handler}
            size="xl"
            className="bg-white border border-zinc-200 shadow-xl rounded-2xl overflow-hidden outline-none"
        >
            {/* Header: Compact & Clean */}
            <DialogHeader className="flex items-center justify-between px-8 py-5 bg-zinc-50 border-b border-zinc-100">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                        <ChartBarIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <Typography variant="h5" className="font-bold text-zinc-900 tracking-tight leading-none mb-0.5">
                            {language === "es" ? "Estadísticas del Usuario" : "User Statistics"}
                        </Typography>
                        {/* <Typography className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                            ID: {stats?.user_id || userId}
                        </Typography> */}
                    </div>
                </div>
                <IconButton
                    variant="text"
                    color="blue-gray"
                    onClick={handler}
                    className="rounded-lg border border-zinc-200 hover:bg-white transition-colors h-8 w-8"
                >
                    <XMarkIcon className="h-4 w-4" strokeWidth={2.5} />
                </IconButton>
            </DialogHeader>

            <DialogBody className="px-8 py-5 overflow-y-auto max-h-[75vh] custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Spinner className="h-8 w-8 text-indigo-500 mb-3" />
                        <Typography className="font-bold text-zinc-400 uppercase tracking-widest text-[9px]">
                            {language === "es" ? "Procesando Datos..." : "Processing Data..."}
                        </Typography>
                    </div>
                ) : error ? (
                    <div className="text-center py-24 bg-red-50/20 rounded-xl border border-red-100/50">
                        <ExclamationCircleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <Typography color="red" className="text-sm font-bold">
                            {error}
                        </Typography>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Section 01: Top Stats Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {/* Total Questions Card */}
                                <Card className="p-6 border border-zinc-100 bg-white shadow-sm rounded-xl overflow-hidden group">
                                    <div className="flex justify-between items-center mb-4">
                                        <Typography className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                            {language === "es" ? "Total Preguntas" : "Total Questions"}
                                        </Typography>
                                        <SparklesIcon className="h-4 w-4 text-indigo-200" />
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <Typography className="text-3xl font-extrabold text-zinc-900 leading-none">
                                            {stats.question_level.total_questions}
                                        </Typography>
                                        <Typography className="text-[10px] font-bold text-zinc-400 uppercase">Items</Typography>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-zinc-50">
                                        <div className="h-1 w-full bg-zinc-50 rounded-full">
                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: "100%" }} />
                                        </div>
                                    </div>
                                </Card>

                                {/* Correct Answers Card */}
                                <Card className="p-6 border border-zinc-100 bg-white shadow-sm rounded-xl overflow-hidden group">
                                    <div className="flex justify-between items-center mb-4">
                                        <Typography className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                            {language === "es" ? "Correctas" : "Correct"}
                                        </Typography>
                                        <TrophyIcon className="h-4 w-4 text-emerald-200" />
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <Typography className="text-3xl font-extrabold text-zinc-900 leading-none">
                                            {stats.question_level.correct_count}
                                        </Typography>
                                        <div className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded uppercase">
                                            Verified
                                        </div>
                                    </div>
                                    <div className="mt-6 space-y-2">
                                        <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400 uppercase">
                                            <span>{language === "es" ? "Precisión" : "Accuracy"}</span>
                                            <span className="text-zinc-600">{stats.question_level.accuracy || 0}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-zinc-50 rounded-full">
                                            <div
                                                className="h-full bg-emerald-500 rounded-full"
                                                style={{ width: `${stats.question_level.accuracy || 0}%` }}
                                            />
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Center Donut */}
                            <Card className="lg:col-span-4 p-5 border border-zinc-100 bg-white shadow-sm flex flex-col items-center justify-center rounded-xl">
                                <Typography className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                                    {language === "es" ? "Rendimiento Global" : "Global Score"}
                                </Typography>
                                <div className="w-full max-w-[140px]">
                                    <Chart
                                        options={accuracyDonutOptions}
                                        series={[stats.question_level.accuracy || 0, 100 - (stats.question_level.accuracy || 0)]}
                                        type="donut"
                                    />
                                </div>
                            </Card>
                        </div>

                        {/* Section 02: Analysis Grid */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-2">
                            {/* Project Breakdown */}
                            <div className="bg-white p-6 rounded-xl border border-zinc-100 shadow-sm">
                                <Typography className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2 mb-6">
                                    <FolderIcon className="h-3.5 w-3.5 text-indigo-500" />
                                    {language === "es" ? "Proyectos Activos" : "Project Breakdown"}
                                </Typography>
                                <Chart
                                    options={projectBarOptions}
                                    series={projectBarSeries}
                                    type="bar"
                                    height={240}
                                />
                            </div>

                            {/* Project List (Higher Density) */}
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar-thin">
                                {stats.project_level.map((proj) => (
                                    <div
                                        key={proj.project_id}
                                        className="p-3.5 rounded-lg bg-white border border-zinc-50 shadow-sm flex items-center justify-between hover:border-indigo-100 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 flex items-center justify-center rounded bg-zinc-50 text-zinc-400 font-bold text-[10px] border border-zinc-100">
                                                ID {proj.project_id}
                                            </div>
                                            <div>
                                                <Typography className="text-xs font-bold text-zinc-800 leading-tight">
                                                    {proj.project_name}
                                                </Typography>
                                                <Typography className="text-[9px] text-zinc-400 font-medium">
                                                    {proj.documents_count} Docs • {proj.project_total_tags} Tags
                                                </Typography>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Typography className="text-sm font-extrabold text-zinc-700">
                                                {proj.percent}%
                                            </Typography>
                                            <div className={`h-1.5 w-1.5 rounded-full ${proj.percent > 70 ? 'bg-indigo-500' : 'bg-zinc-200'}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section 03: Dense Document Analysis */}
                        <div className="pt-2">
                            <Typography className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest mb-5 flex items-center gap-2">
                                <DocumentTextIcon className="h-3.5 w-3.5 text-indigo-500" />
                                {language === "es" ? "Análisis por Documento" : "Document Analysis"}
                            </Typography>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
                                {stats.document_level.map((doc) => (
                                    <div
                                        key={doc.document_id}
                                        className="bg-white border border-zinc-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <Typography className="text-[8px] font-black text-indigo-400 uppercase tracking-tighter truncate max-w-[100px]">
                                                {doc.project_name}
                                            </Typography>
                                            <Typography className="text-xs font-extrabold text-zinc-900">{doc.final_percent}%</Typography>
                                        </div>

                                        <Typography className="text-[11px] font-bold text-zinc-800 leading-tight mb-4 truncate" title={doc.document_name}>
                                            {doc.document_name}
                                        </Typography>

                                        <div className="space-y-3 mb-4">
                                            <div className="flex items-center justify-between">
                                                <div className="h-1 w-full bg-zinc-50 rounded-full mr-2">
                                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${doc.coverage_percent}%` }} />
                                                </div>
                                                <Typography className="text-[9px] font-bold text-zinc-400">{doc.coverage_percent}%</Typography>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="h-1 w-full bg-zinc-50 rounded-full mr-2">
                                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${doc.accuracy}%` }} />
                                                </div>
                                                <Typography className="text-[9px] font-bold text-emerald-600">{doc.accuracy}%</Typography>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-zinc-50">
                                            <Typography className="text-[9px] font-medium text-zinc-400 uppercase">
                                                {doc.correct_count}/{doc.total_questions}
                                            </Typography>
                                            <Typography className="text-[9px] font-medium text-zinc-400 uppercase">
                                                {doc.doc_distinct_tags} Tags
                                            </Typography>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </DialogBody>

            <div className="px-8 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-between items-center text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                <span>Ankard Engine v3.04</span>
                <span className="flex items-center gap-1.5 text-zinc-500">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    System Active
                </span>
            </div>
        </Dialog>
    );
}

export default UserStatisticsDialog;

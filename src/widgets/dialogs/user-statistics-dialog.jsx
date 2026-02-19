import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    Card,
    Typography,
    IconButton,
    Spinner,
    Chip,
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

const formatStudyTime = (seconds, language) => {
    if (!seconds || seconds === 0) return language === "es" ? "0m" : "0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
};

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
        labels: [language === "es" ? "Correcto" : "Correct", language === "es" ? "Incorrecto" : "Incorrect"],
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
            fontFamily: "Inter, system-ui, sans-serif",
            stacked: false
        },
        plotOptions: {
            bar: {
                borderRadius: 3,
                horizontal: true,
                barHeight: "45%",
                dataLabels: { position: "top" }
            },
        },
        colors: ["#6366f1", "#10b981"],
        dataLabels: {
            enabled: true,
            formatter: (val) => `${val}%`,
            offsetX: 28,
            style: { fontSize: "9px", fontWeight: 700, colors: ["#64748b"] },
        },
        xaxis: {
            categories: stats?.project_level?.map(p => p.project_name.length > 15 ? p.project_name.substring(0, 15) + "..." : p.project_name) || [],
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
        legend: {
            show: true,
            position: "top",
            horizontalAlign: "right",
            fontSize: "10px",
            itemMargin: { horizontal: 10 },
            markers: { radius: 4 }
        },
        tooltip: { theme: "light", y: { formatter: (val) => `${val}%` } }
    };

    const projectBarSeries = [
        {
            name: language === "es" ? "Precisión" : "Accuracy",
            data: stats?.project_level?.map(p => p.percent) || [],
        },
        {
            name: language === "es" ? "Cobertura" : "Coverage",
            data: stats?.project_level?.map(p => p.avg_coverage_percent || 0) || [],
        }
    ];

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
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <Typography className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                                {language === "es" ? "Datos Sincronizados" : "Data Synchronized"}
                            </Typography>
                        </div>
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
                    <div className="space-y-6">
                        {/* Section 01: Top Stats Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                            <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-5">
                                {/* Total Questions Card */}
                                <Card className="p-5 border border-zinc-100 bg-white shadow-sm rounded-xl overflow-hidden group">
                                    <div className="flex justify-between items-center mb-4">
                                        <Typography className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                                            {language === "es" ? "Preguntas Totales" : "Total Questions"}
                                        </Typography>
                                        <SparklesIcon className="h-3.5 w-3.5 text-indigo-200" />
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <Typography className="text-2xl font-extrabold text-zinc-900 leading-none">
                                            {stats.question_level.total_questions}
                                        </Typography>
                                        <Typography className="text-[9px] font-bold text-zinc-400 uppercase">Tags</Typography>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-zinc-50 flex items-center justify-between">
                                        <Typography className="text-[8px] font-bold text-zinc-400 uppercase">Progreso</Typography>
                                        <Typography className="text-[8px] font-bold text-indigo-500">100%</Typography>
                                    </div>
                                    <div className="mt-1 h-1 w-full bg-zinc-50 rounded-full">
                                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: "100%" }} />
                                    </div>
                                </Card>

                                {/* Correct Answers Card */}
                                <Card className="p-5 border border-zinc-100 bg-white shadow-sm rounded-xl overflow-hidden group">
                                    <div className="flex justify-between items-center mb-4">
                                        <Typography className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                                            {language === "es" ? "Aciertos" : "Correct"}
                                        </Typography>
                                        <TrophyIcon className="h-3.5 w-3.5 text-emerald-200" />
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <Typography className="text-2xl font-extrabold text-zinc-900 leading-none">
                                            {stats.question_level.correct_count}
                                        </Typography>
                                        <div className="text-[7px] font-black text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded uppercase">
                                            Accuracy
                                        </div>
                                    </div>
                                    <div className="mt-4 space-y-1.5">
                                        <div className="flex justify-between items-center text-[8px] font-bold text-zinc-400 uppercase">
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

                                {/* Activity / Time Card */}
                                <Card className="p-5 border border-zinc-100 bg-white shadow-sm rounded-xl overflow-hidden group">
                                    <div className="flex justify-between items-center mb-4">
                                        <Typography className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                                            {language === "es" ? "Tiempo de Estudio" : "Study Time"}
                                        </Typography>
                                        <ArrowTrendingUpIcon className="h-3.5 w-3.5 text-orange-200" />
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <Typography className="text-2xl font-extrabold text-zinc-900 leading-none">
                                            {formatStudyTime(stats.document_level.reduce((acc, doc) => acc + (doc.study_seconds || 0), 0), language)}
                                        </Typography>
                                        <Typography className="text-[9px] font-bold text-zinc-400 uppercase">Total</Typography>
                                    </div>
                                    <div className="mt-4 flex items-center gap-3">
                                        <div className="flex flex-col">
                                            <Typography className="text-[7px] font-black text-zinc-300 uppercase leading-none mb-1">Attempts</Typography>
                                            <Typography className="text-xs font-bold text-zinc-700">
                                                {stats.document_level.reduce((acc, doc) => acc + (doc.attempts_count || 0), 0)}
                                            </Typography>
                                        </div>
                                        <div className="h-6 w-px bg-zinc-100" />
                                        <div className="flex flex-col">
                                            <Typography className="text-[7px] font-black text-zinc-300 uppercase leading-none mb-1">Projects</Typography>
                                            <Typography className="text-xs font-bold text-zinc-700">{stats.project_level.length}</Typography>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Center Donut */}
                            <Card className="lg:col-span-3 p-4 border border-zinc-100 bg-white shadow-sm flex flex-col items-center justify-center rounded-xl">
                                <Typography className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                                    {language === "es" ? "Score Global" : "Global Score"}
                                </Typography>
                                <div className="w-full max-w-[130px]">
                                    <Chart
                                        options={accuracyDonutOptions}
                                        series={[stats.question_level.accuracy || 0, 100 - (stats.question_level.accuracy || 0)]}
                                        type="donut"
                                    />
                                </div>
                            </Card>
                        </div>

                        {/* Section 02: Analysis Grid */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 pt-2">
                            {/* Project Breakdown Chart */}
                            <div className="xl:col-span-7 bg-white p-6 rounded-xl border border-zinc-100 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <Typography className="text-[9px] font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                                        <FolderIcon className="h-3.5 w-3.5 text-indigo-500" />
                                        {language === "es" ? "Análisis por Proyecto" : "Project Performance"}
                                    </Typography>
                                    <Chip
                                        variant="ghost"
                                        size="sm"
                                        value={language === "es" ? "Comparativa" : "Benchmarks"}
                                        className="rounded-full text-[8px] font-bold bg-zinc-50 text-zinc-500"
                                    />
                                </div>
                                <Chart
                                    options={projectBarOptions}
                                    series={projectBarSeries}
                                    type="bar"
                                    height={240}
                                />
                            </div>

                            {/* Dense Project List */}
                            <div className="xl:col-span-5 space-y-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar-thin">
                                {stats.project_level.map((proj) => (
                                    <div
                                        key={proj.project_id}
                                        className="p-3 rounded-lg bg-zinc-50/30 border border-zinc-100 flex items-center justify-between hover:bg-white hover:shadow-sm transition-all"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-7 w-7 flex-shrink-0 flex items-center justify-center rounded bg-white text-zinc-400 font-bold text-[9px] border border-zinc-100 shadow-xs">
                                                {proj.project_id}
                                            </div>
                                            <div className="min-w-0">
                                                <Typography className="text-xs font-bold text-zinc-800 leading-tight truncate">
                                                    {proj.project_name}
                                                </Typography>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Typography className="text-[8px] text-zinc-400 font-medium whitespace-nowrap">
                                                        {proj.documents_count} Docs
                                                    </Typography>
                                                    <div className="h-1 w-1 rounded-full bg-zinc-200" />
                                                    <Typography className="text-[8px] text-zinc-400 font-medium whitespace-nowrap">
                                                        {proj.docs_with_attempts} Active
                                                    </Typography>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-right">
                                            <div>
                                                <Typography className="text-[7px] font-black text-zinc-300 uppercase leading-none mb-1">Coverage</Typography>
                                                <Typography className="text-[10px] font-black text-emerald-600 leading-none">
                                                    {proj.avg_coverage_percent || 0}%
                                                </Typography>
                                            </div>
                                            <div className="h-6 w-px bg-zinc-100" />
                                            <div>
                                                <Typography className="text-[7px] font-black text-zinc-300 uppercase leading-none mb-1">Acc.</Typography>
                                                <Typography className="text-[10px] font-black text-indigo-600 leading-none">
                                                    {proj.percent}%
                                                </Typography>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section 03: Dense Document Analysis */}
                        <div className="pt-2">
                            <div className="flex items-center justify-between mb-4">
                                <Typography className="text-[9px] font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                                    <DocumentTextIcon className="h-3.5 w-3.5 text-indigo-500" />
                                    {language === "es" ? "Detalle por Documento" : "Document Analytics"}
                                </Typography>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                        <Typography className="text-[8px] font-bold text-zinc-400 uppercase">Coverage</Typography>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        <Typography className="text-[8px] font-bold text-zinc-400 uppercase">Accuracy</Typography>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
                                {stats.document_level.map((doc) => (
                                    <div
                                        key={doc.document_id}
                                        className="bg-white border border-zinc-100 rounded-xl p-4 shadow-sm hover:border-indigo-100 transition-colors group"
                                    >
                                        <div className="flex justify-between items-start mb-2.5">
                                            <Typography className="text-[7px] font-black text-indigo-400 uppercase tracking-tight truncate max-w-[80px]">
                                                {doc.project_name}
                                            </Typography>
                                            <div className="text-right">
                                                <Typography className="text-xs font-black text-zinc-900 leading-none">{doc.final_percent}%</Typography>
                                                <Typography className="text-[7px] font-bold text-zinc-300 uppercase">Score</Typography>
                                            </div>
                                        </div>

                                        <Typography
                                            className="text-[10px] font-bold text-zinc-800 leading-tight mb-3 line-clamp-2 min-h-[2.5em]"
                                            title={doc.document_name}
                                        >
                                            {doc.document_name}
                                        </Typography>

                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="bg-zinc-50/50 p-1.5 rounded border border-zinc-100/50">
                                                <Typography className="text-[7px] text-zinc-400 font-black uppercase leading-none mb-1">Time</Typography>
                                                <Typography className="text-[9px] font-bold text-zinc-700">{formatStudyTime(doc.study_seconds, language)}</Typography>
                                            </div>
                                            <div className="bg-zinc-50/50 p-1.5 rounded border border-zinc-100/50">
                                                <Typography className="text-[7px] text-zinc-400 font-black uppercase leading-none mb-1">Attempts</Typography>
                                                <Typography className="text-[9px] font-bold text-zinc-700">{doc.attempts_count}</Typography>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-4">
                                            <div>
                                                <div className="flex justify-between items-center text-[8px] font-bold text-zinc-400 uppercase mb-1">
                                                    <span>Coverage</span>
                                                    <span>{doc.coverage_percent}%</span>
                                                </div>
                                                <div className="h-1 w-full bg-zinc-50 rounded-full">
                                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${doc.coverage_percent}%` }} />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between items-center text-[8px] font-bold text-zinc-400 uppercase mb-1">
                                                    <span>Accuracy</span>
                                                    <span>{doc.accuracy}%</span>
                                                </div>
                                                <div className="h-1 w-full bg-zinc-50 rounded-full">
                                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${doc.accuracy}%` }} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2.5 border-t border-zinc-50 mt-auto">
                                            <div className="flex flex-col">
                                                <Typography className="text-[7px] font-black text-zinc-300 uppercase leading-none mb-0.5">Score</Typography>
                                                <Typography className="text-[9px] font-bold text-zinc-500">{doc.correct_count}/{doc.total_questions}</Typography>
                                            </div>
                                            <div className="flex flex-col text-right">
                                                <Typography className="text-[7px] font-black text-zinc-300 uppercase leading-none mb-0.5">Tags</Typography>
                                                <Typography className="text-[9px] font-bold text-zinc-500">{doc.doc_distinct_tags}/{doc.doc_total_tags}</Typography>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </DialogBody>

            <div className="px-8 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-between items-center text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                <span className="flex items-center gap-2">
                    Ankard Intelligence <div className="h-1 w-1 rounded-full bg-zinc-300" /> {new Date().toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1.5 text-zinc-500">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Secure Engine Active
                </span>
            </div>
        </Dialog>
    );
}

export default UserStatisticsDialog;

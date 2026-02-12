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
    CheckCircleIcon
} from "@heroicons/react/24/outline";
import projectService from "@/services/projectService";
import { useLanguage } from "@/context/language-context";

export function UserStatisticsDialog({ open, handler, userId }) {
    const { t, language } = useLanguage();
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

    return (
        <Dialog
            open={open}
            handler={handler}
            size="lg"
            className="bg-zinc-50/95 backdrop-blur-md border border-white/20 shadow-premium rounded-[2rem] overflow-hidden"
        >
            <DialogHeader className="flex items-center justify-between px-8 py-6 border-b border-zinc-200/50 bg-white/50">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <ChartBarIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <Typography variant="h5" className="font-black text-zinc-900 tracking-tight">
                            {language === "es" ? "Mis Estadísticas" : "My Statistics"}
                        </Typography>
                        <Typography className="text-xs font-medium text-zinc-500">
                            {language === "es" ? "Progreso y aprendizaje" : "Progress and learning metrics"}
                        </Typography>
                    </div>
                </div>
                <IconButton
                    variant="text"
                    color="blue-gray"
                    onClick={handler}
                    className="rounded-full hover:bg-zinc-100 transition-colors"
                >
                    <XMarkIcon className="h-6 w-6" />
                </IconButton>
            </DialogHeader>

            <DialogBody className="px-8 py-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Spinner className="h-12 w-12 text-indigo-500" />
                        <Typography className="mt-4 font-bold text-zinc-500">
                            {language === "es" ? "Calculando tus logros..." : "Calculating your achievements..."}
                        </Typography>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <Typography color="red" className="font-bold">
                            {error}
                        </Typography>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Question Level Card */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="border border-zinc-200/60 shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
                                <CardBody className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <TrophyIcon className="h-5 w-5" />
                                        </div>
                                        <Typography variant="small" className="font-bold uppercase tracking-wider text-zinc-400">
                                            {language === "es" ? "Puntos" : "Points"}
                                        </Typography>
                                    </div>
                                    <Typography variant="h3" className="font-black text-zinc-900 mb-1">
                                        {stats.question_level.earned_points}
                                    </Typography>
                                    <Typography variant="small" className="text-zinc-500 font-medium italic">
                                        / {stats.question_level.max_points} total
                                    </Typography>
                                </CardBody>
                            </Card>

                            <Card className="border border-zinc-200/60 shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
                                <CardBody className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded-lg bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                            <ArrowTrendingUpIcon className="h-5 w-5" />
                                        </div>
                                        <Typography variant="small" className="font-bold uppercase tracking-wider text-zinc-400">
                                            {language === "es" ? "Precisión" : "Accuracy"}
                                        </Typography>
                                    </div>
                                    <Typography variant="h3" className="font-black text-zinc-900 mb-1">
                                        {stats.question_level.percent}%
                                    </Typography>
                                    <Progress
                                        value={stats.question_level.percent}
                                        size="sm"
                                        color="green"
                                        className="bg-green-50"
                                    />
                                </CardBody>
                            </Card>

                            <Card className="border border-zinc-200/60 shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
                                <CardBody className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded-lg bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                            <CheckCircleIcon className="h-5 w-5" />
                                        </div>
                                        <Typography variant="small" className="font-bold uppercase tracking-wider text-zinc-400">
                                            {language === "es" ? "Intentos" : "Tries"}
                                        </Typography>
                                    </div>
                                    <Typography variant="h3" className="font-black text-zinc-900">
                                        {stats.question_level.tries}
                                    </Typography>
                                </CardBody>
                            </Card>
                        </div>

                        {/* Projects Breakdown */}
                        <div>
                            <div className="flex items-center gap-2 mb-6 ml-2">
                                <FolderIcon className="h-5 w-5 text-indigo-600" />
                                <Typography variant="h6" className="font-bold text-zinc-900">
                                    {language === "es" ? "Rendimiento por Proyecto" : "Project Performance"}
                                </Typography>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {stats.project_level.map((proj) => (
                                    <Card key={proj.project_id} className="border border-zinc-200/50 shadow-none bg-zinc-50/50 hover:bg-white transition-colors">
                                        <CardBody className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-zinc-200 text-zinc-400 font-bold text-xs">
                                                    #{proj.project_id}
                                                </div>
                                                <Typography variant="small" className="font-bold text-zinc-700">
                                                    Project {proj.project_id}
                                                </Typography>
                                            </div>
                                            <div className="text-right">
                                                <Typography className="text-xs font-bold text-zinc-400 uppercase tracking-tighter mb-1">
                                                    Score
                                                </Typography>
                                                <Typography className={`font-black text-lg ${proj.percent > 70 ? 'text-green-600' : proj.percent > 40 ? 'text-orange-600' : 'text-zinc-600'}`}>
                                                    {proj.percent}%
                                                </Typography>
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Documents Level */}
                        <div>
                            <div className="flex items-center gap-2 mb-6 ml-2">
                                <DocumentTextIcon className="h-5 w-5 text-indigo-600" />
                                <Typography variant="h6" className="font-bold text-zinc-900">
                                    {language === "es" ? "Análisis de Documentos" : "Document analysis"}
                                </Typography>
                            </div>
                            <div className="space-y-4">
                                {stats.document_level.map((doc) => (
                                    <div key={doc.document_id} className="p-4 rounded-2xl bg-white border border-zinc-200/60 shadow-sm">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-400 font-bold text-[10px]">
                                                        DOC
                                                    </div>
                                                    <Typography className="font-bold text-zinc-800 text-sm">
                                                        ID: {doc.document_id}
                                                    </Typography>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Typography className="text-[10px] uppercase font-black text-zinc-400 tracking-wider mb-1">
                                                            {language === "es" ? "Cobertura" : "Coverage"}
                                                        </Typography>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1">
                                                                <Progress value={doc.coverage_percent} size="sm" color="blue" variant="gradient" />
                                                            </div>
                                                            <Typography className="text-xs font-bold text-blue-600 min-w-[35px]">
                                                                {doc.coverage_percent}%
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Typography className="text-[10px] uppercase font-black text-zinc-400 tracking-wider mb-1">
                                                            {language === "es" ? "Precisión" : "Accuracy"}
                                                        </Typography>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1">
                                                                <Progress value={doc.accuracy_percent} size="sm" color="green" variant="gradient" />
                                                            </div>
                                                            <Typography className="text-xs font-bold text-green-600 min-w-[35px]">
                                                                {doc.accuracy_percent}%
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="md:border-l border-zinc-100 md:pl-6 text-center md:text-right min-w-[120px]">
                                                <Typography className="text-[10px] uppercase font-black text-zinc-400 tracking-wider mb-1">
                                                    {language === "es" ? "Puntaje Final" : "Final Score"}
                                                </Typography>
                                                <Typography className={`text-2xl font-black ${doc.final_percent > 70 ? 'text-indigo-600' : 'text-zinc-700'}`}>
                                                    {doc.final_percent}%
                                                </Typography>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </DialogBody>

            <div className="px-8 py-6 bg-zinc-50/50 border-t border-zinc-200/50">
                <Typography className="text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    Ankard Knowledge Engine • {new Date().getFullYear()}
                </Typography>
            </div>
        </Dialog>
    );
}

export default UserStatisticsDialog;

import React, { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    Typography,
    Input,
    Spinner,
    Chip,
    Button,
} from "@material-tailwind/react";
import { MagnifyingGlassIcon, BoltIcon, PlayIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "@/context/language-context";
import projectService from "@/services/projectService";
import { ExamSimulatorDialog } from "@/widgets/dialogs/index";

export function MyBatteries() {
    const { t, language } = useLanguage();
    const [batteries, setBatteries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [simulationBattery, setSimulationBattery] = useState(null);

    useEffect(() => {
        fetchBatteries();
    }, []);

    const fetchBatteries = async () => {
        try {
            setLoading(true);
            const data = await projectService.getUserBatteries();
            setBatteries(Array.isArray(data) ? data : data?.results || []);
        } catch (err) {
            console.error("Error fetching user batteries:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const filteredBatteries = batteries.filter((b) =>
        (b.name || b.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.status || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (

        <div className="mt-8 mb-8 flex flex-col gap-8 max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <Typography variant="h3" className="font-black text-zinc-900 tracking-tight mb-2">
                        {t("project_detail.decks.my_batteries")}
                    </Typography>
                    <Typography className="font-medium text-zinc-500 max-w-2xl">
                        {language === "es" ? "Pon a prueba tus conocimientos con tus baterías generadas. Reta tu mente." : "Test your knowledge with your generated batteries. Challenge your mind."}
                    </Typography>
                </div>
                <div className="w-full md:w-80">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                        <input
                            type="text"
                            placeholder={t("project_detail.decks.search_placeholder") || "Search batteries..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all text-sm font-medium text-zinc-900 placeholder:text-zinc-400"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Spinner className="h-8 w-8 text-indigo-500" />
                </div>
            ) : filteredBatteries.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    {filteredBatteries.map((battery) => (
                        <Card key={battery.id} className="border border-zinc-200 shadow-sm hover:shadow-premium transition-all duration-300 bg-white group hover:-translate-y-1">
                            <CardBody className="p-5 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-3">
                                    <Chip
                                        value={battery.status}
                                        color={battery.status === "Ready" ? "green" : "blue-gray"}
                                        size="sm"
                                        variant="ghost"
                                        className="rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                                    />
                                    <div className="flex items-center gap-2 bg-zinc-50 px-2 py-1 rounded-md">
                                        <Typography variant="small" className="text-zinc-500 text-[10px] font-bold">
                                            {formatDate(battery.created_at)}
                                        </Typography>
                                    </div>
                                </div>
                                <Typography variant="h6" className="mb-2 truncate text-zinc-900 font-bold tracking-tight">
                                    {battery.name || `Battery #${battery.id}`}
                                </Typography>
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-50 border border-zinc-100">
                                        <BoltIcon className="h-3.5 w-3.5 text-zinc-400" />
                                        <Typography className="text-[10px] font-bold text-zinc-600 uppercase">
                                            {battery.difficulty || "Medium"}
                                        </Typography>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-50 border border-zinc-100">
                                        <Typography className="text-[10px] font-bold text-zinc-600">
                                            {(battery.questions?.length || 0)} {language === "es" ? "PREGUNTAS" : "QUESTIONS"}
                                        </Typography>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 mt-auto">
                                    <div className="text-[11px] font-medium text-zinc-500">
                                        {battery.attempts_count > 0 ? (
                                            <span className="flex items-center gap-1">
                                                <span className="text-zinc-400">{language === "es" ? "Último" : "Last"}:</span>
                                                <span className={Number(battery.last_attempt?.percent || 0) >= 70 ? "text-green-600 font-bold" : "text-zinc-900 font-bold"}>
                                                    {Number(battery.last_attempt?.percent || 0).toFixed(0)}%
                                                </span>
                                            </span>
                                        ) : (
                                            <span className="opacity-50 italic">{language === "es" ? "Sin intentos" : "No attempts"}</span>
                                        )}
                                    </div>
                                    <Button
                                        variant="gradient"
                                        size="sm"
                                        color="indigo"
                                        className="flex items-center gap-2 px-4 py-2 normal-case rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                                        onClick={() => setSimulationBattery(battery)}
                                    >
                                        <PlayIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
                                        <span className="text-xs font-bold">{language === "es" ? "Simular" : "Simulate"}</span>
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-zinc-200 text-center">
                    <div className="h-16 w-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-zinc-50/50">
                        <BoltIcon className="h-8 w-8 text-zinc-400" />
                    </div>
                    <Typography variant="h6" className="text-zinc-900 font-bold mb-1">
                        {searchTerm ? (language === "es" ? "No se encontraron baterías" : "No batteries found") : t("global.batteries.no_batteries") || "No batteries yet"}
                    </Typography>
                    <Typography className="text-zinc-500 max-w-sm mb-6">
                        {searchTerm
                            ? (language === "es" ? "Intenta ajustar tus términos de búsqueda." : "Try adjusting your search terms.")
                            : (language === "es" ? "Genera tu primera batería de ejercicios desde un proyecto." : "Generate your first battery of exercises from a project.")
                        }
                    </Typography>
                </div>
            )}

            <ExamSimulatorDialog
                open={!!simulationBattery}
                handler={() => setSimulationBattery(null)}
                battery={simulationBattery}
            />
        </div>
    );
}

export default MyBatteries;

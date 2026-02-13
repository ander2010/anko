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
import { BatteryCard } from "@/widgets/cards";
import { usePaginationParams } from "@/hooks/usePaginationParams";
import { AppPagination } from "@/components/AppPagination";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";


export function MyBatteries() {
    const { t, language } = useLanguage();
    const [batteries, setBatteries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [simulationBattery, setSimulationBattery] = useState(null);

    const { page, pageSize, setPage, setPageSize } = usePaginationParams();

    useEffect(() => {
        fetchBatteries();
    }, [page, pageSize]);

    const fetchBatteries = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await projectService.getUserBatteries(page, pageSize);
            const results = data.results || (Array.isArray(data) ? data : []);
            const count = data.count || (Array.isArray(data) ? data.length : 0);

            setBatteries(results);
            setTotalCount(count);
        } catch (err) {
            console.error("Error fetching user batteries:", err);
            setError(language === "es" ? "Error al cargar las baterías" : "Failed to load batteries");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateVisibility = async (battery, visibility) => {
        try {
            await projectService.updateBattery(battery.id, { visibility });
            // Local update or refetch
            setBatteries(prev => prev.map(b => b.id === battery.id ? { ...b, visibility } : b));
        } catch (err) {
            console.error("Error updating battery visibility:", err);
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

        <div className="mt-8 flex flex-col flex-grow gap-8 max-w-7xl mx-auto px-4 pb-6 w-full">
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
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-red-200 text-center">
                    <ExclamationCircleIcon className="h-10 w-10 text-red-500 mb-4" />
                    <Typography variant="h6" className="text-zinc-900 font-bold mb-1">
                        {error}
                    </Typography>
                    <Button
                        variant="text"
                        color="indigo"
                        onClick={fetchBatteries}
                        className="mt-4"
                    >
                        {language === "es" ? "Reintentar" : "Retry"}
                    </Button>
                </div>
            ) : filteredBatteries.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    {filteredBatteries.map((battery) => (
                        <BatteryCard
                            key={battery.id}
                            battery={battery}
                            onSimulate={setSimulationBattery}
                            onUpdateVisibility={handleUpdateVisibility}
                        />
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

            <div className="mt-auto">
                {!loading && totalCount > 0 && (
                    <AppPagination
                        page={page}
                        pageSize={pageSize}
                        totalCount={totalCount}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                    />
                )}
            </div>
        </div>
    );
}

export default MyBatteries;

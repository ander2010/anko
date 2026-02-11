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
import { ExamSimulatorDialog, AccessRequestSuccessDialog } from "@/widgets/dialogs/index";
import { BatteryCard } from "@/widgets/cards";

export function PublicBatteries() {
    const { t, language } = useLanguage();
    const [batteries, setBatteries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [simulationBattery, setSimulationBattery] = useState(null);
    const [requestedBatteries, setRequestedBatteries] = useState(new Set());
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    useEffect(() => {
        fetchPublicBatteries();
    }, []);

    const fetchPublicBatteries = async () => {
        try {
            setLoading(true);
            const data = await projectService.getPublicBatteries();
            setBatteries(Array.isArray(data) ? data : data?.results || []);
        } catch (err) {
            console.error("Error fetching public batteries:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredBatteries = batteries.filter((b) =>
        (b.name || b.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.status || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRequestAccess = async (battery) => {
        try {
            await projectService.requestBatteryAccess(battery.id);
            setRequestedBatteries(prev => new Set([...prev, battery.id]));
            setShowSuccessDialog(true);
        } catch (err) {
            console.error("Error requesting access:", err);
            // If already pending, just mark it and show success to be friendly
            if (err?.detail?.includes("pending")) {
                setRequestedBatteries(prev => new Set([...prev, battery.id]));
                setShowSuccessDialog(true);
            } else {
                alert(err?.error || err?.detail || (language === "es" ? "Error al enviar la solicitud" : "Failed to send request"));
            }
        }
    };

    return (
        <div className="mt-8 mb-8 flex flex-col gap-8 max-w-7xl mx-auto px-4">
            {/* ... header ... */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <Typography variant="h3" className="font-black text-zinc-900 tracking-tight mb-2">
                        {language === "es" ? "Baterías Públicas" : "Public Batteries"}
                    </Typography>
                    <Typography className="font-medium text-zinc-500 max-w-2xl">
                        {language === "es" ? "Practica con los exámenes compartidos por otros usuarios de la comunidad." : "Practice with exams shared by other community users."}
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
                        <BatteryCard
                            key={battery.id}
                            battery={battery}
                            onSimulate={setSimulationBattery}
                            onRequestAccess={handleRequestAccess}
                            isPublicCatalog={true}
                            isRequestPending={requestedBatteries.has(battery.id) || battery.request_status === "pending"}
                        />
                    ))}
                </div>
            ) : (
                /* ... empty state ... */
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-zinc-200 text-center">
                    <div className="h-16 w-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-zinc-50/50">
                        <BoltIcon className="h-8 w-8 text-zinc-400" />
                    </div>
                    <Typography variant="h6" className="text-zinc-900 font-bold mb-1">
                        {searchTerm ? (language === "es" ? "No se encontraron baterías" : "No batteries found") : (language === "es" ? "No hay baterías públicas" : "No public batteries yet")}
                    </Typography>
                    <Typography className="text-zinc-500 max-w-sm mb-6">
                        {searchTerm
                            ? (language === "es" ? "Intenta ajustar tus términos de búsqueda." : "Try adjusting your search terms.")
                            : (language === "es" ? "Pronto habrá baterías de examen compartidas por la comunidad." : "Community shared batteries will appear here soon.")
                        }
                    </Typography>
                </div>
            )}

            <ExamSimulatorDialog
                open={!!simulationBattery}
                handler={() => setSimulationBattery(null)}
                battery={simulationBattery}
            />

            <AccessRequestSuccessDialog
                open={showSuccessDialog}
                handler={() => setShowSuccessDialog(false)}
            />
        </div>
    );
}

export default PublicBatteries;

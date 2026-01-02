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
        <div className="mt-12 mb-8 flex flex-col gap-12">
            <Card>
                <CardBody>
                    <div className="mb-6 flex flex-col justify-between gap-8 md:flex-row md:items-center">
                        <div>
                            <Typography variant="h6" color="blue-gray">
                                {t("project_detail.decks.my_batteries")}
                            </Typography>
                            <Typography variant="small" className="font-normal text-blue-gray-600">
                                {language === "es" ? "Pon a prueba tus conocimientos con tus baterías generadas" : "Test your knowledge with your generated batteries"}
                            </Typography>
                        </div>
                        <div className="w-full shrink-0 md:w-72">
                            <Input
                                label={t("project_detail.decks.search_placeholder")}
                                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Spinner className="h-8 w-8" />
                        </div>
                    ) : filteredBatteries.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredBatteries.map((battery) => (
                                <Card key={battery.id} className="border border-blue-gray-100 shadow-sm overflow-hidden">
                                    <CardBody className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <Chip
                                                value={battery.status}
                                                color={battery.status === "Ready" ? "green" : "blue-gray"}
                                                size="sm"
                                                variant="ghost"
                                                className="rounded-full"
                                            />
                                            <Typography variant="small" className="text-blue-gray-500 text-[11px]">
                                                {formatDate(battery.created_at)}
                                            </Typography>
                                        </div>
                                        <Typography variant="h6" color="blue-gray" className="mb-1 truncate">
                                            {battery.name || `Battery #${battery.id}`}
                                        </Typography>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Chip
                                                value={battery.difficulty || "Medium"}
                                                size="sm"
                                                variant="outlined"
                                                className="rounded-full text-[10px] py-0 px-2 border-blue-gray-200 text-blue-gray-500"
                                            />
                                            <Typography variant="small" className="text-blue-gray-500 text-xs">
                                                {(battery.questions?.length || 0)} {language === "es" ? "preguntas" : "questions"}
                                            </Typography>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-blue-gray-50">
                                            <div className="text-[11px] text-blue-gray-600">
                                                {battery.attempts_count > 0 ? (
                                                    <span>{language === "es" ? "Último" : "Last"}: {Number(battery.last_attempt?.percent || 0).toFixed(0)}%</span>
                                                ) : (
                                                    <span className="opacity-50">{language === "es" ? "Sin intentos" : "No attempts"}</span>
                                                )}
                                            </div>
                                            <Button
                                                variant="text"
                                                size="sm"
                                                color="green"
                                                className="flex items-center gap-2 px-3 py-1.5 normal-case"
                                                onClick={() => setSimulationBattery(battery)}
                                            >
                                                <PlayIcon className="h-4 w-4" strokeWidth={2.5} />
                                                {language === "es" ? "Simular" : "Simulate"}
                                            </Button>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-blue-gray-400">
                            <BoltIcon className="h-16 w-16 mb-4" />
                            <Typography variant="h6">
                                {searchTerm ? (language === "es" ? "No se encontraron baterías para tu búsqueda" : "No batteries found for your search") : t("global.batteries.no_batteries")}
                            </Typography>
                        </div>
                    )}
                </CardBody>
            </Card>

            <ExamSimulatorDialog
                open={!!simulationBattery}
                handler={() => setSimulationBattery(null)}
                battery={simulationBattery}
            />
        </div>
    );
}

export default MyBatteries;

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
    Card,
    CardBody,
    Typography,
    Chip,
    Button,
    Menu,
    MenuHandler,
    MenuList,
    MenuItem,
    IconButton,
} from "@material-tailwind/react";
import {
    MagnifyingGlassIcon,
    BoltIcon,
    PlayIcon,
    EllipsisVerticalIcon,
    LockClosedIcon,
    GlobeAmericasIcon,
    UserGroupIcon,
    TrashIcon,
    XMarkIcon,
    CheckBadgeIcon,
    HandThumbUpIcon,
} from "@heroicons/react/24/outline";
import { Progress } from "@material-tailwind/react";
import { useLanguage } from "@/context/language-context";
import { useAuth } from "@/context/auth-context";
import projectService from "@/services/projectService";

export function BatteryCard({
    battery,
    onSimulate,
    onUpdateVisibility,
    onDelete,
    progress,
    isGenerating,
    onDismissProgress,
}) {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const isOwner = user?.id && battery.owner_id && String(user.id) === String(battery.owner_id);

    const [summary, setSummary] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchSummary = async () => {
            if (!battery?.id) return;
            setLoadingSummary(true);
            try {
                const data = await projectService.getBatterySummary(battery.id);
                if (isMounted && data?.summary) {
                    setSummary(data.summary);
                }
            } catch (error) {
                // Ignore 404s as they just mean no summary exists yet
                console.debug(`No summary found for battery ${battery.id}`);
            } finally {
                if (isMounted) setLoadingSummary(false);
            }
        };

        // Wait to fetch summary until isGenerating is false
        // (meaning no active job exists in globalActiveJobs for this battery)
        if (!isGenerating) {
            fetchSummary();
        }

        return () => {
            isMounted = false;
        };
    }, [battery?.id, isGenerating]);

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const getVisibilityIcon = (visibility) => {
        switch (visibility) {
            case "public": return <GlobeAmericasIcon className="h-3 w-3" />;
            case "shared": return <UserGroupIcon className="h-3 w-3" />;
            case "private": return <LockClosedIcon className="h-3 w-3" />;
            default: return <LockClosedIcon className="h-3 w-3" />;
        }
    };

    const getVisibilityColor = (visibility) => {
        switch (visibility) {
            case "public": return "green";
            case "shared": return "blue";
            case "private": return "blue-gray";
            default: return "blue-gray";
        }
    };

    return (
        <Card className="border border-zinc-200 shadow-sm hover:shadow-premium transition-all duration-300 bg-white group hover:-translate-y-1">
            <CardBody className="p-5 flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        {/* Status Label */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">
                                {(language === "es" ? "Visibilidad:" : "Visibility:")}
                            </span>
                            {onUpdateVisibility && isOwner ? (
                                <Menu placement="bottom-start">
                                    <MenuHandler>
                                        <div className="cursor-pointer transition-all hover:scale-105">
                                            <Chip
                                                value={battery.visibility || "private"}
                                                color={getVisibilityColor(battery.visibility)}
                                                size="sm"
                                                variant="filled"
                                                icon={getVisibilityIcon(battery.visibility)}
                                                className="rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                                            />
                                        </div>
                                    </MenuHandler>
                                    <MenuList className="border border-zinc-200 shadow-xl rounded-xl p-2 min-w-[140px]">
                                        <MenuItem
                                            onClick={() => onUpdateVisibility(battery, "private")}
                                            className="flex items-center gap-3 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 font-medium text-sm py-2"
                                        >
                                            <LockClosedIcon className="h-4 w-4" />
                                            {language === "es" ? "Privado" : "Private"}
                                        </MenuItem>
                                        <MenuItem
                                            onClick={() => onUpdateVisibility(battery, "shared")}
                                            className="flex items-center gap-3 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium text-sm py-2"
                                        >
                                            <UserGroupIcon className="h-4 w-4" />
                                            {language === "es" ? "Compartido" : "Shared"}
                                        </MenuItem>
                                        <MenuItem
                                            onClick={() => onUpdateVisibility(battery, "public")}
                                            className="flex items-center gap-3 rounded-lg text-green-600 hover:text-green-700 hover:bg-green-50 font-medium text-sm py-2"
                                        >
                                            <GlobeAmericasIcon className="h-4 w-4" />
                                            {language === "es" ? "Público" : "Public"}
                                        </MenuItem>
                                    </MenuList>
                                </Menu>
                            ) : (
                                <Chip
                                    value={battery.visibility || "private"}
                                    color={getVisibilityColor(battery.visibility)}
                                    size="sm"
                                    variant="ghost"
                                    className="rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
                                />
                            )}
                            {battery.visibility === "shared" && (
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        <HandThumbUpIcon className="h-3 w-3 text-green-500" />
                                        <Typography className="text-[10px] font-bold text-green-600">
                                            {battery.approved_count || 0}
                                        </Typography>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-zinc-50 px-2 py-1 rounded-md">
                            <Typography variant="small" className="text-zinc-500 text-[10px] font-bold">
                                {formatDate(battery.created_at)}
                            </Typography>
                        </div>
                        {onDelete && isOwner && (
                            <Menu placement="bottom-end">
                                <MenuHandler>
                                    <IconButton variant="text" size="sm" className="rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100">
                                        <EllipsisVerticalIcon className="h-5 w-5" />
                                    </IconButton>
                                </MenuHandler>
                                <MenuList className="border border-zinc-200 shadow-xl rounded-xl p-2 min-w-[140px]">
                                    <MenuItem
                                        onClick={() => onDelete(battery)}
                                        className="flex items-center gap-3 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 font-medium text-sm py-2"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                        {t("global.action.delete")}
                                    </MenuItem>
                                </MenuList>
                            </Menu>
                        )}
                    </div>
                </div>
                <Typography variant="h6" className="mb-2 truncate text-zinc-900 font-bold tracking-tight">
                    {battery.name || battery.title || `Battery #${battery.id}`}
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
                            {(battery.questions?.length || battery.question_count || 0)} {language === "es" ? "PREGUNTAS" : "QUESTIONS"}
                        </Typography>
                    </div>
                </div>

                {/* AI Summary Section */}
                {summary && (
                    <div className="mb-5 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 p-3 rounded-lg border border-blue-100/50">
                        <div className="flex items-center gap-1.5 mb-2">
                            <Typography variant="small" className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                                {t("global.ai_generated") || (language === "es" ? "✨ Generado por IA" : "✨ AI Generated")}
                            </Typography>
                        </div>
                        <Typography variant="small" className="text-zinc-600 text-xs leading-relaxed italic line-clamp-3 text-justify">
                            "{summary}"
                        </Typography>
                    </div>
                )}

                {progress && (
                    <div className="mb-5 bg-blue-50/50 p-3 rounded-lg border border-blue-100/50 group/batprog">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-blue-600">
                                <Typography variant="small" className="font-bold flex items-center gap-1 text-[10px]">
                                    {progress.status}...
                                </Typography>
                            </div>
                            <div className="flex items-center gap-2">
                                <Typography variant="small" className="text-blue-900 font-bold text-[10px]">
                                    {Math.round(progress.percent || 0)}%
                                </Typography>
                                {onDismissProgress && (
                                    <IconButton
                                        size="sm"
                                        variant="text"
                                        className="h-4 w-4 rounded-md text-blue-400 hover:text-blue-600 opacity-0 group-hover/batprog:opacity-100 transition-opacity"
                                        onClick={() => onDismissProgress(battery.id)}
                                    >
                                        <XMarkIcon className="h-3 w-3" strokeWidth={2.5} />
                                    </IconButton>
                                )}
                            </div>
                        </div>
                        <Progress
                            value={Math.round(progress.percent || 0)}
                            size="sm"
                            color="blue"
                            className="h-1 bg-blue-100"
                            barProps={{ className: "bg-blue-500" }}
                        />
                    </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 mt-auto">
                    <div className="text-[11px] font-medium text-zinc-500">
                        {battery.attempts_count > 0 && (
                            <span className="flex items-center gap-1">
                                <span className="text-zinc-400">{language === "es" ? "Último" : "Last"}:</span>
                                <span className={Number(battery.last_attempt?.percent || 0) >= 70 ? "text-green-600 font-bold" : "text-zinc-900 font-bold"}>
                                    {Number(battery.last_attempt?.percent || 0).toFixed(0)}%
                                </span>
                            </span>
                        )}
                    </div>

                    <Button
                        variant="gradient"
                        size="sm"
                        color="indigo"
                        className="flex items-center gap-2 px-4 py-2 normal-case rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all font-bold"
                        onClick={() => onSimulate(battery)}
                    >
                        <PlayIcon className="h-3.5 w-3.5" strokeWidth={2.5} stroke="currentColor" fill="none" />
                        <span className="text-xs">{language === "es" ? "Simular" : "Simulate"}</span>
                    </Button>
                </div>
            </CardBody>
        </Card>
    );
}

BatteryCard.propTypes = {
    battery: PropTypes.object.isRequired,
    onSimulate: PropTypes.func.isRequired,
    onUpdateVisibility: PropTypes.func,
    onDelete: PropTypes.func,
    progress: PropTypes.object,
    onDismissProgress: PropTypes.func,
};

export default BatteryCard;

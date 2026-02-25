import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
    Card,
    CardBody,
    Typography,
    Chip,
    Button,
    Progress,
} from "@material-tailwind/react";
import {
    BoltIcon,
    PlayIcon,
    UserGroupIcon,
    CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "@/context/language-context";
import projectService from "@/services/projectService";

export function CatalogBatteryCard({
    battery,
    onSimulate,
    onRequestAccess,
    isRequestPending = false
}) {
    const { language, t } = useLanguage();

    const [summary, setSummary] = useState(null);

    useEffect(() => {
        let isMounted = true;
        if (!battery?.id) return;
        projectService.getBatterySummary(battery.id)
            .then(data => { if (isMounted && data?.summary) setSummary(data.summary); })
            .catch(() => { });
        return () => { isMounted = false; };
    }, [battery?.id]);

    const getVisibilityColor = (visibility) => {
        switch (visibility) {
            case "public": return "green";
            case "shared": return "blue";
            default: return "blue-gray";
        }
    };

    const isPublic = battery.visibility === "public";
    const isShared = battery.visibility === "shared";

    return (
        <Card className="border border-zinc-200 shadow-sm hover:shadow-premium transition-all duration-300 bg-white group hover:-translate-y-1">
            <CardBody className="p-5 flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">
                            {language === "es" ? "Visibilidad:" : "Visibility:"}
                        </span>
                        <Chip
                            value={battery.visibility || "shared"}
                            color={getVisibilityColor(battery.visibility)}
                            size="sm"
                            variant="ghost"
                            className="rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
                        />
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

                {summary && (
                    <div className="mb-5 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 p-3 rounded-lg border border-blue-100/50">
                        <Typography variant="small" className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1.5">
                            {language === "es" ? "✨ Resumen IA" : "✨ AI Summary"}
                        </Typography>
                        <Typography variant="small" className="text-zinc-600 text-xs leading-relaxed italic line-clamp-3">
                            "{summary}"
                        </Typography>
                    </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 mt-auto">
                    <div className="text-[11px] font-medium text-zinc-500">
                        {battery.owner_email && (
                            <span className="flex items-center gap-1">
                                <span className="text-zinc-400">{language === "es" ? "Por" : "By"}:</span>
                                <span className="text-zinc-900 font-bold truncate max-w-[100px]">
                                    {battery.owner_email.split('@')[0]}
                                </span>
                            </span>
                        )}
                    </div>

                    {isShared ? (
                        <Button
                            variant={isRequestPending ? "filled" : "outlined"}
                            size="sm"
                            color={isRequestPending ? "green" : "blue"}
                            disabled={isRequestPending}
                            className="flex items-center gap-2 px-4 py-2 normal-case rounded-lg font-bold hover:bg-blue-50 transition-all border-blue-100 disabled:opacity-70"
                            onClick={() => onRequestAccess && onRequestAccess(battery)}
                        >
                            {isRequestPending ? (
                                <>
                                    <CheckBadgeIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
                                    <span className="text-xs">{t("global.action.request_sent")}</span>
                                </>
                            ) : (
                                <>
                                    <UserGroupIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
                                    <span className="text-xs">{t("global.action.request_access")}</span>
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button
                            variant="gradient"
                            size="sm"
                            color="indigo"
                            className="flex items-center gap-2 px-4 py-2 normal-case rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all font-bold"
                            onClick={() => onSimulate(battery)}
                        >
                            <PlayIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
                            <span className="text-xs">{language === "es" ? "Simular" : "Simulate"}</span>
                        </Button>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}

CatalogBatteryCard.propTypes = {
    battery: PropTypes.object.isRequired,
    onSimulate: PropTypes.func.isRequired,
    onRequestAccess: PropTypes.func,
    isRequestPending: PropTypes.bool,
};

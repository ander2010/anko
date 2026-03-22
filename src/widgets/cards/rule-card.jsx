import React from "react";
import PropTypes from "prop-types";
import { Card, CardBody, Typography, IconButton } from "@material-tailwind/react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "@/context/language-context";

export function RuleCard({ rule, isOwner, onDelete }) {
    const { t, language } = useLanguage();

    if (!rule) return null;

    return (
        <Card className="border border-zinc-200 shadow-sm hover:shadow-premium transition-all duration-300 bg-white group hover:-translate-y-0.5">
            <CardBody className="p-3 md:p-5 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-2 md:mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                        <p className="font-semibold truncate" style={{ fontSize: "12px", color: "#1a1a2e" }} title={rule.name}>
                            {rule.name}
                        </p>
                        <p className="truncate" style={{ fontSize: "9px", color: "var(--ank-purple)", marginTop: "2px" }}>
                            {rule.distribution_strategy} · {rule.difficulty}
                        </p>
                    </div>

                    {isOwner && onDelete && (
                        <IconButton
                            size="sm"
                            variant="text"
                            color="red"
                            onClick={() => onDelete(rule)}
                            className="shrink-0 -mt-1 -mr-1 rounded-full hover:bg-red-50"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </IconButton>
                    )}
                </div>

                {/* Data rows */}
                <div className="space-y-1 mt-auto pt-2 border-t border-zinc-100">
                    <div className="flex justify-between items-center">
                        <span style={{ fontSize: "9px", color: "#888" }}>{t("global.rules.table.questions")}</span>
                        <span style={{ fontSize: "10px", fontWeight: 600, color: "#1a1a2e" }}>{rule.global_count}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span style={{ fontSize: "9px", color: "#888" }}>{language === "es" ? "Límite de Tiempo" : "Time Limit"}</span>
                        <span style={{ fontSize: "10px", fontWeight: 600, color: "#1a1a2e" }}>{rule.time_limit} min</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span style={{ fontSize: "9px", color: "#888" }}>{t("global.rules.table.topic")}</span>
                        <span style={{ fontSize: "10px", fontWeight: 600, color: "#1a1a2e" }} className="truncate ml-2 text-right">
                            {rule.topic_scope ? `${t("project_detail.tabs.topics")} #${rule.topic_scope}` : (language === "es" ? "Global" : "Global")}
                        </span>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}

RuleCard.propTypes = {
    rule: PropTypes.object.isRequired,
    isOwner: PropTypes.bool,
    onDelete: PropTypes.func,
};

export default RuleCard;

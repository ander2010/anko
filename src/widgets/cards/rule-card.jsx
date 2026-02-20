import React from "react";
import PropTypes from "prop-types";
import { Card, CardBody, Typography, IconButton } from "@material-tailwind/react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "@/context/language-context";

export function RuleCard({ rule, isOwner, onDelete }) {
    const { t, language } = useLanguage();

    if (!rule) return null;

    return (
        <Card className="border border-blue-gray-100 shadow-sm h-full flex flex-col">
            <CardBody className="flex flex-col flex-1">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                        <Typography variant="h6" color="blue-gray" className="truncate" title={rule.name}>
                            {rule.name}
                        </Typography>
                        <Typography variant="small" className="text-blue-gray-500 truncate">
                            {t("global.rules.table.strategy")}: {rule.distribution_strategy} • {t("global.rules.table.difficulty")}: {rule.difficulty}
                        </Typography>
                    </div>

                    {isOwner && onDelete && (
                        <IconButton
                            size="sm"
                            variant="text"
                            color="red"
                            onClick={() => onDelete(rule)}
                            className="shrink-0 -mt-1 -mr-1"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </IconButton>
                    )}
                </div>

                <div className="space-y-1 text-sm text-blue-gray-600 mt-auto">
                    <div className="flex justify-between items-center py-0.5">
                        <span>{t("global.rules.table.questions")}</span>
                        <span className="font-medium text-blue-gray-900">{rule.global_count}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                        <span>{language === "es" ? "Límite de Tiempo" : "Time Limit"}</span>
                        <span className="font-medium text-blue-gray-900">{rule.time_limit} min</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                        <span>{t("global.rules.table.topic")}</span>
                        <span className="font-medium text-blue-gray-900 truncate ml-2 text-right">
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

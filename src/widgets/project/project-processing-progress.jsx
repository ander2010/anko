import React from "react";
import PropTypes from "prop-types";
import { Typography, Progress, IconButton } from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useJobProgress } from "@/hooks/use-job-progress";
import { useLanguage } from "@/context/language-context";

export function ProjectProcessingProgress({ jobId, onComplete }) {
    const { progress, error, isCompleted, docId } = useJobProgress(jobId);
    const { language } = useLanguage();

    React.useEffect(() => {
        console.log("[ProjectProcessingProgress] Tracking jobId:", jobId, "Current status:", { progress, isCompleted, docId });
        if (isCompleted && onComplete) {
            onComplete(jobId, docId);
        }
    }, [isCompleted, jobId, docId, onComplete, progress]);

    if (error && progress === 0) {
        return (
            <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-100">
                <Typography variant="small" color="red" className="font-medium text-[10px] leading-tight flex-1 mr-2">
                    {error}
                </Typography>
                <IconButton
                    size="sm"
                    variant="text"
                    color="red"
                    className="h-6 w-6 rounded-md hover:bg-red-100"
                    onClick={() => onComplete && onComplete(jobId, docId)}
                >
                    <XMarkIcon className="h-4 w-4" />
                </IconButton>
            </div>
        );
    }

    const getStatusText = () => {
        const p = Math.round(progress);
        if (p <= 50) {
            return language === "es" ? "Procesando..." : "Processing...";
        }
        return language === "es" ? "Finalizando..." : "Finishing...";
    };

    return (
        <div className="mb-3">
            <div className="flex items-center justify-between mb-1 group/progress">
                <div className="flex items-center gap-2">
                    <Typography variant="small" className="text-blue-gray-600 font-medium capitalize flex items-center gap-2">
                        {getStatusText()}
                        {error && (
                            <span className="text-[10px] text-red-400 font-normal normal-case">
                                (Reconnecting...)
                            </span>
                        )}
                    </Typography>
                </div>
                <div className="flex items-center gap-2">
                    <Typography variant="small" className="text-blue-gray-600 font-medium whitespace-nowrap">
                        {Math.round(progress)}%
                    </Typography>
                    <IconButton
                        size="sm"
                        variant="text"
                        color="blue-gray"
                        className="h-5 w-5 rounded-md opacity-0 group-hover/progress:opacity-100 transition-opacity"
                        onClick={() => onComplete && onComplete(jobId, docId)}
                        title={language === "es" ? "Quitar" : "Dismiss"}
                    >
                        <XMarkIcon className="h-3.5 w-3.5" />
                    </IconButton>
                </div>
            </div>
            <Progress
                value={progress}
                variant="gradient"
                color={progress >= 100 ? "green" : "blue"}
                className="h-1.5"
            />
        </div>
    );
}

ProjectProcessingProgress.propTypes = {
    jobId: PropTypes.string.isRequired,
    onComplete: PropTypes.func,
};

export default ProjectProcessingProgress;

import React from "react";
import PropTypes from "prop-types";
import { Typography, Progress } from "@material-tailwind/react";
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
            <Typography variant="small" color="red" className="font-normal opacity-70">
                {error}
            </Typography>
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
            <div className="flex items-center justify-between mb-1">
                <Typography variant="small" className="text-blue-gray-600 font-medium capitalize">
                    {getStatusText()}
                </Typography>
                <Typography variant="small" className="text-blue-gray-600 font-medium">
                    {Math.round(progress)}%
                </Typography>
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

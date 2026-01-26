import { useState, useEffect } from "react";
import { API_BASE } from "@/services/api";

/**
 * Hook to connect to a job's progress stream.
 * @param {string} jobId - The ID of the job to track.
 * @returns {Object} - { progress, status, error, isCompleted, currentStep }
 */
export function useJobProgress(jobId) {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("queued");
    const [currentStep, setCurrentStep] = useState(null);
    const [docId, setDocId] = useState(null);
    const [error, setError] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);

    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 4;

    useEffect(() => {
        if (!jobId || isCompleted || retryCount >= MAX_RETRIES) return;

        const token = localStorage.getItem("token");

        // Use API_BASE to construct absolute URL for production support.
        // If API_BASE is relative (starts with /), it will still work locally via proxy.
        // We ensure no double slashes if API_BASE ends with /
        const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
        const streamUrl = `${base}/projects/progress-stream/?job_id=${encodeURIComponent(jobId)}` +
            (token ? `&token=${encodeURIComponent(token)}` : "");

        console.log("[useJobProgress] Connecting to:", streamUrl);
        const eventSource = new EventSource(streamUrl);

        eventSource.onopen = () => {
            console.log("[useJobProgress] SSE Connected for jobId:", jobId);
        };

        const handleMessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === "progress" || data.type === "snapshot" || data.type === "heartbeat") {
                    setProgress(parseFloat(data.progress || progress));
                    if (data.status) setStatus(data.status);
                    if (data.current_step) setCurrentStep(data.current_step);
                    if (data.doc_id) setDocId(data.doc_id);
                    setError(null);
                    setRetryCount(0); // Reset retry count on successful message

                    if (parseFloat(data.progress) >= 100) {
                        setIsCompleted(true);
                        eventSource.close();
                    }
                }
            } catch (err) {
                console.error("Error parsing SSE data:", err);
            }
        };

        const handleError = (err) => {
            console.error("SSE Connection Error:", err);
            eventSource.close();

            if (retryCount < MAX_RETRIES) {
                setError(`Connection lost. Retrying (${retryCount + 1}/${MAX_RETRIES})...`);
                const timer = setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                }, 3000); // Wait 3 seconds before retrying
                return () => clearTimeout(timer);
            } else {
                setError("Connection failed after multiple attempts.");
            }
        };

        eventSource.onmessage = handleMessage;
        eventSource.onerror = handleError;
        eventSource.addEventListener("ping", () => {
            setRetryCount(0); // Reset on ping too
        });

        return () => {
            eventSource.close();
        };
    }, [jobId, retryCount, isCompleted]);

    return { progress, status, error, isCompleted, setIsCompleted, currentStep, docId };
}

export default useJobProgress;

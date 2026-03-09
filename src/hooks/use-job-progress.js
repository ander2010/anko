import { useState, useEffect, useRef } from "react";
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
    const isCompletedRef = useRef(false);

    // Fake progress animation: moves bar up randomly while backend processes.
    // Caps at FAKE_CAP so real SSE progress can always overtake it.
    useEffect(() => {
        if (!jobId) return;

        const FAKE_CAP = 82;

        let timeoutId;

        const tick = () => {
            if (isCompletedRef.current) return;
            setProgress(prev => {
                if (prev >= FAKE_CAP) return prev;
                // Random step 3–12 so it never feels mechanical
                const step = Math.floor(Math.random() * 10) + 3;
                return Math.min(prev + step, FAKE_CAP);
            });
            // Next tick: random 700–2800 ms
            const delay = Math.floor(Math.random() * 2100) + 7000;
            timeoutId = setTimeout(tick, delay);
        };

        // Start after a brief initial pause (200–600 ms)
        const initDelay = Math.floor(Math.random() * 400) + 200;
        timeoutId = setTimeout(tick, initDelay);

        return () => clearTimeout(timeoutId);
    }, [jobId]);

    useEffect(() => {
        if (!jobId || isCompleted || retryCount >= MAX_RETRIES) return;

        const token = localStorage.getItem("token");

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

                if (event.type === "end" || data.type === "progress" || data.type === "snapshot" || data.type === "heartbeat" || data.final_status) {
                    const incoming = parseFloat(data.progress);
                    if (!isNaN(incoming)) {
                        // Only move forward — never let SSE lower the fake-animated bar
                        setProgress(prev => Math.max(prev, incoming));
                    }

                    if (data.status) setStatus(data.status);
                    if (data.current_step) setCurrentStep(data.current_step);
                    if (data.doc_id) setDocId(data.doc_id);
                    setError(null);
                    setRetryCount(0);

                    const isDoneStatus = ["COMPLETED", "DONE", "FINISHED", "SUCCESS"].includes(data.final_status) || ["COMPLETED", "DONE", "FINISHED"].includes(data.status);

                    if (incoming >= 100 || isDoneStatus || event.type === "end") {
                        isCompletedRef.current = true;
                        setIsCompleted(true);
                        setProgress(100);
                        eventSource.onerror = null;
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
                }, 3000);
                return () => clearTimeout(timer);
            } else {
                setError("Connection failed after multiple attempts.");
            }
        };

        eventSource.addEventListener("progress", handleMessage);
        eventSource.addEventListener("init", handleMessage);
        eventSource.addEventListener("end", handleMessage);
        eventSource.onerror = handleError;
        eventSource.addEventListener("ping", () => {
            setRetryCount(0);
        });

        return () => {
            eventSource.close();
        };
    }, [jobId, retryCount, isCompleted]);

    return { progress, status, error, isCompleted, setIsCompleted, currentStep, docId };
}

export default useJobProgress;

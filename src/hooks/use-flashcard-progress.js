import { useState, useEffect } from "react";

/**
 * Hook to connect to a flashcard creation job's WebSocket progress stream.
 * @param {string} wsUrl - The WebSocket URL for progress.
 * @returns {Object} - { progress, status, error, isCompleted, lastData }
 */
export function useFlashcardProgress(wsUrl) {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("queued");
    const [error, setError] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [lastData, setLastData] = useState(null);

    useEffect(() => {
        if (!wsUrl || isCompleted) return;

        let socket;
        let finalStatus = "queued";
        let lastKnownProgress = 0;

        try {
            socket = new WebSocket(wsUrl);

            socket.onopen = () => {

            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);


                    setLastData(data);

                    if (data.progress !== undefined) {
                        const p = parseFloat(data.progress);
                        lastKnownProgress = p;
                        setProgress(p);
                    }
                    if (data.status) {
                        finalStatus = data.status;
                        setStatus(data.status);
                    }

                    if (data.status === "completed" || parseFloat(data.progress) >= 100) {
                        // We ask the socket to close, and onclose will handle isCompleted
                        socket.close(1000, "Processing complete");
                    }
                } catch (err) {
                    console.error("Error parsing WebSocket message:", err);
                }
            };

            socket.onerror = (err) => {
                console.error("WebSocket error:", err);
                setError("WebSocket connection failed.");
            };

            socket.onclose = (event) => {

                if (finalStatus === "completed" || lastKnownProgress >= 100) {
                    setIsCompleted(true);
                } else if (!isCompleted && event.code !== 1000) {
                    setError("WebSocket connection closed unexpectedly.");
                }
            };
        } catch (err) {
            console.error("Failed to create WebSocket:", err);
            setError("Failed to initialize WebSocket.");
        }

        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, [wsUrl, isCompleted]);

    return { progress, status, error, isCompleted, lastData };
}

export default useFlashcardProgress;

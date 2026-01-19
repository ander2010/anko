import { useState, useEffect } from "react";
import { API_BASE } from "@/services/api";

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
            // Normalize relative URLs OR absolute URLs to use the correct API_BASE host
            // This handles cases where backend returns "localhost:8080" but we need "localhost:8000"
            let finalWsUrl = wsUrl;

            // Determine correct host and protocol from API_BASE
            let protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
            let host;

            if (API_BASE.startsWith("http")) {
                const url = new URL(API_BASE);
                host = url.host; // e.g. 127.0.0.1:8000
                if (API_BASE.startsWith("https")) {
                    protocol = "wss:";
                } else {
                    protocol = "ws:";
                }
            } else {
                host = window.location.host;
            }

            // If it's already absolute (start with ws/wss), strip it to path to re-apply host
            if (finalWsUrl.match(/^wss?:\/\//)) {
                // Remove protocol and host, keep path
                const parts = finalWsUrl.split("/");
                // parts[0] = protocol, parts[1] = "", parts[2] = host, parts[3...] = path
                const path = "/" + parts.slice(3).join("/");
                finalWsUrl = `${protocol}//${host}${path}`;
                console.log("[useFlashcardProgress] Rewrote absolute URL:", wsUrl, "->", finalWsUrl);
            } else if (finalWsUrl.startsWith("/")) {
                finalWsUrl = `${protocol}//${host}${finalWsUrl}`;
                console.log("[useFlashcardProgress] Normalized relative URL:", wsUrl, "->", finalWsUrl);
            }

            console.log("[useFlashcardProgress] Connecting to:", finalWsUrl);
            socket = new WebSocket(finalWsUrl);

            socket.onopen = () => {
                console.log("[useFlashcardProgress] Connected to WS");
            };

            socket.onmessage = (event) => {
                try {
                    console.log("[useFlashcardProgress] WS Message:", event.data);
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

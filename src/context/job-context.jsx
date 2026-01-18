import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";

const JobsContext = createContext();

const STORAGE_KEY = "anko_active_jobs";

export function JobsProvider({ children }) {
    const [activeJobs, setActiveJobs] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    const now = Date.now();
                    const TWO_HOURS = 2 * 60 * 60 * 1000;

                    // Filter out:
                    // 1. Invalid objects
                    // 2. Jobs without IDs
                    // 3. Jobs older than 2 hours (stale zombies)
                    const validJobs = parsed.filter(j => {
                        const isValid = j && typeof j === 'object' && j.id;
                        if (!isValid) return false;

                        // If it has a timestamp, check if it's too old
                        if (j.createdAt) {
                            const age = now - j.createdAt;
                            if (age > TWO_HOURS) {
                                console.log("[JobContext] Pruning stale job:", j.id, "Age:", Math.round(age / 60000), "mins");
                                return false;
                            }
                        }
                        return true;
                    });

                    console.log("[JobContext] Initial recovery:", validJobs.length, "valid jobs found.");
                    return validJobs;
                }
            } catch (e) {
                console.error("[JobContext] Recovery failed:", e);
            }
        }
        return [];
    });

    // Fail-safe: ensure storage is updated before page unload
    useEffect(() => {
        const handleUnload = () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(activeJobs));
        };
        window.addEventListener("beforeunload", handleUnload);
        return () => window.removeEventListener("beforeunload", handleUnload);
    }, [activeJobs]);

    // Unified update function that writes to localStorage synchronously
    const syncActiveJobs = (updater) => {
        setActiveJobs((prev) => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    };

    const addJob = useCallback((job) => {
        if (!job.id) return;
        syncActiveJobs((prev) => {
            if (prev.find((j) => String(j.id) === String(job.id))) return prev;
            // Force ALL IDs to string for absolute consistency
            const newJob = {
                ...job,
                id: String(job.id),
                projectId: job.projectId ? String(job.projectId) : undefined,
                docId: job.docId ? String(job.docId) : undefined,
                createdAt: Date.now() // Timestamp for expiration
            };
            console.log("[JobContext] Job Registered:", newJob.id, "for Project:", newJob.projectId);
            return [...prev, newJob];
        });
    }, []);

    const removeJob = useCallback((jobId) => {
        if (!jobId) return;
        const sid = String(jobId);
        console.log("[JobContext] Job Removed:", sid);
        syncActiveJobs((prev) => prev.filter((j) => String(j.id) !== sid));
    }, []);

    const clearAllJobs = useCallback(() => {
        console.log("[JobContext] Clearing all jobs manually.");
        syncActiveJobs([]);
    }, []);

    const getJobsForProject = (projectId) => {
        return activeJobs.filter((j) => String(j.projectId) === String(projectId));
    };

    const value = {
        activeJobs,
        addJob,
        removeJob,
        clearAllJobs,
        getJobsForProject,
    };

    return (
        <JobsContext.Provider value={value}>
            {children}
        </JobsContext.Provider>
    );
}

JobsProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useJobs = () => {
    const context = useContext(JobsContext);
    if (!context) {
        throw new Error("useJobs must be used within a JobsProvider");
    }
    return context;
};

export default JobsContext;

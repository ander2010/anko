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
                    console.log("[JobContext] Initial recovery:", parsed.length, "jobs found.");
                    return parsed;
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
                docId: job.docId ? String(job.docId) : undefined
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

    const getJobsForProject = (projectId) => {
        return activeJobs.filter((j) => String(j.projectId) === String(projectId));
    };

    const value = {
        activeJobs,
        addJob,
        removeJob,
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

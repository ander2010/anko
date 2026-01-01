import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import projectService from "@/services/projectService";
import { useAuth } from "./auth-context";

const ProjectsContext = createContext();

export function ProjectsProvider({ children }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [rules, setRules] = useState([]);
  const [batteries, setBatteries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to load all data
  const refreshAll = useCallback(async () => {
    if (!user?.id) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [projectsData, topicsData, rulesData, batteriesData] = await Promise.all([
        projectService.getProjects({ user: user.id }),
        projectService.getTopics(),
        projectService.getAllRules(),
        projectService.getAllBatteries()
      ]);

      // Handle array or paginated response for projects
      const projectList = Array.isArray(projectsData) ? projectsData : (projectsData.results || []);
      setProjects(projectList);

      setTopics(Array.isArray(topicsData) ? topicsData : (topicsData.results || []));
      setRules(Array.isArray(rulesData) ? rulesData : (rulesData.results || []));
      setBatteries(Array.isArray(batteriesData) ? batteriesData : (batteriesData.results || []));

      setError(null);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    // Only fetch if we have a token? 
    // Usually api.js handles auth, but we can verify here if needed.
    // For now, simpler is better.
    refreshAll();
  }, [refreshAll]);

  // ===== PROJECT FUNCTIONS =====
  // These wrappers ensure we update the global state after actions

  const createProject = async (projectData, files = []) => {
    try {
      const newProject = await projectService.createProject(projectData, null, files);
      await refreshAll(); // Sync everything
      return newProject;
    } catch (err) {
      console.error("Context createProject error:", err);
      throw err;
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await projectService.deleteProject(projectId);
      // Optimistic update or refresh
      setProjects(prev => prev.filter(p => p.id !== projectId));
      await refreshAll(); // Ensure consistency
    } catch (err) {
      throw err;
    }
  };

  // Keep these mostly compatible with the old context structure if they were used directly
  // But now they should probably delegate to projectService if logic is complex

  // Minimal value object export
  const value = {
    projects,
    topics,
    rules,
    batteries,
    loading,
    error,
    refreshAll,
    createProject,
    deleteProject,
    // Add other wrappers as needed by components, or let components call service directly + refreshAll
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}

ProjectsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error("useProjects must be used within a ProjectsProvider");
  }
  return context;
};

export default ProjectsContext;

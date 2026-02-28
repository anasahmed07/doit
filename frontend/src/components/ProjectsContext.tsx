"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Project } from "@/lib/types";

interface ProjectsContextType {
  projects: Project[];
  isLoading: boolean;
  isSidebarOpen: boolean;
  fetchProjects: (force?: boolean) => Promise<void>;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  toggleSidebar: (isOpen?: boolean) => void;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const fetchProjects = useCallback(async (force = false) => {
    if (hasFetched && !force) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/projects");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setProjects(data);
      setHasFetched(true);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setIsLoading(false);
    }
  }, [hasFetched]);

  const addProject = useCallback((project: Project) => {
    setProjects((prev) => [project, ...prev]);
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const removeProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const toggleSidebar = useCallback((isOpen?: boolean) => {
    setIsSidebarOpen((prev) => isOpen ?? !prev);
  }, []);

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        isLoading,
        isSidebarOpen,
        fetchProjects,
        addProject,
        updateProject,
        removeProject,
        toggleSidebar,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectsProvider");
  }
  return context;
}

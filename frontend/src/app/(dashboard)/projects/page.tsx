"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Layout, Trash2, ChevronRight } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { Project } from "@/lib/types";
import { ProjectCreationDialog } from "@/components/ProjectCreationDialog";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<Project[]>("/projects/");
      setProjects(response.data);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project?")) return;
    
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Failed to delete project", error);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl p-6 space-y-8">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
            <Layout className="h-6 w-6" />
            Projects
         </h1>
         <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 border-2 border-foreground bg-primary px-4 py-2 text-sm font-bold text-white shadow-hard transition-transform hover:-translate-y-0.5 hover:shadow-hard-lg active:translate-y-0 active:shadow-hard"
         >
            New Project
            <Plus className="h-4 w-4" />
         </button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 border-2 border-dashed border-foreground/20 rounded-lg text-muted-foreground">
            <p className="font-mono text-sm uppercase tracking-widest">No projects found</p>
            <button 
                onClick={() => setIsCreateOpen(true)}
                className="text-sm font-bold hover:text-foreground underline"
            >
                Create your first project
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group relative flex flex-col gap-4 border-2 border-foreground bg-background p-6 shadow-hard transition-all hover:-translate-y-1 hover:shadow-hard-lg"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                   <h3 className="font-black uppercase tracking-tight text-lg group-hover:text-primary transition-colors">
                      {project.name}
                   </h3>
                   <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                      Framework: {project.framework}
                   </span>
                </div>
                <button 
                  onClick={(e) => handleDelete(project.id, e)}
                  className="p-2 text-muted-foreground hover:bg-destructive hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center justify-between text-sm font-bold text-primary mt-4">
                <span>View Board</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      )}

      <ProjectCreationDialog 
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchProjects}
      />
    </div>
  );
}

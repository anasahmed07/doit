"use client";

import { useEffect, useState, useCallback, use } from "react";
import { Loader2, Layout, Plus, ChevronLeft } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { Project, ProjectTask } from "@/lib/types";
import { KanbanBoard } from "@/components/KanbanBoard";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [projectRes, tasksRes] = await Promise.all([
        api.get<Project>(`/projects/${id}`),
        api.get<ProjectTask[]>(`/projects/${id}/tasks`),
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error("Failed to fetch project data", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTaskUpdate = async (taskId: string, updates: Partial<ProjectTask>) => {
    // Optimistic update
    setTasks((prev) => 
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
    
    try {
      await api.patch(`/projects/tasks/${taskId}`, updates);
    } catch (error) {
      console.error("Failed to update task", error);
      fetchData(); // Revert
    }
  };

  const handleAddTask = async (content: string, status: string) => {
    try {
      const response = await api.post<ProjectTask>(`/projects/${id}/tasks`, {
        content,
        status,
      });
      setTasks((prev) => [...prev, response.data]);
    } catch (error) {
      console.error("Failed to add task", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.delete(`/projects/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto p-6 text-center space-y-4">
        <h1 className="text-xl font-bold">Project not found</h1>
        <Link href="/projects" className="text-primary hover:underline">Back to Projects</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="border-b border-foreground/10 bg-background/50 backdrop-blur-md p-6">
        <div className="container mx-auto max-w-7xl flex items-center justify-between">
           <div className="flex items-center gap-4">
             <Link href="/projects" className="p-2 hover:bg-secondary rounded-full transition-colors">
                <ChevronLeft className="h-5 w-5" />
             </Link>
             <div>
                <h1 className="text-xl font-black uppercase tracking-tight">{project.name}</h1>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                    Fixed Kanban Workflow
                </span>
             </div>
           </div>
        </div>
      </div>

      {/* Board Area */}
      <div className="flex-1 overflow-x-auto bg-muted/20">
         <div className="container mx-auto h-full p-6 min-w-max">
            <KanbanBoard 
              tasks={tasks} 
              onTaskUpdate={handleTaskUpdate}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
            />
         </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback, use } from "react";
import { Loader2, Layout, Plus, ChevronLeft } from "lucide-react";
import Link from "next/link";
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
        fetch(`/api/projects/${id}`),
        fetch(`/api/projects/${id}/tasks`),
      ]);

      if (!projectRes.ok || !tasksRes.ok) throw new Error("Failed to fetch data");

      const projectData = await projectRes.json();
      const tasksData = await tasksRes.json();

      setProject(projectData);
      setTasks(tasksData);
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
      await fetch(`/api/projects/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error("Failed to update task", error);
      fetchData(); // Revert
    }
  };

  const handleAddTask = async (content: string, status: string) => {
    try {
      const response = await fetch(`/api/projects/${id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, status }),
      });

      if (!response.ok) throw new Error("Failed to add task");

      const newTask = await response.json();
      setTasks((prev) => [...prev, newTask]);
    } catch (error) {
      console.error("Failed to add task", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await fetch(`/api/projects/tasks/${taskId}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  const handleTasksReorder = async (
    reorderedTasks: { id: string; order_index: number; status: string }[]
  ) => {
    // Optimistic update is already done in KanbanBoard
    // Persist the changes to the backend
    try {
      await Promise.all(
        reorderedTasks.map((task) =>
          fetch(`/api/projects/tasks/${task.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order_index: task.order_index }),
          })
        )
      );
      // Update local state to match
      setTasks((prev) =>
        prev.map((t) => {
          const reordered = reorderedTasks.find((r) => r.id === t.id);
          return reordered ? { ...t, order_index: reordered.order_index } : t;
        })
      );
    } catch (error) {
      console.error("Failed to reorder tasks", error);
      fetchData(); // Revert on error
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
              onTasksReorder={handleTasksReorder}
            />
         </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback, use } from "react";
import { Loader2, Layout, Plus, ChevronLeft, Edit2, Grid, Trash2 } from "lucide-react";
import Link from "next/link";
import { Project, ProjectTask } from "@/lib/types";
import { KanbanBoard } from "@/components/KanbanBoard";
import { ProjectCreationDialog } from "@/components/ProjectCreationDialog";
import { TaskDialog } from "@/components/TaskDialog";
import { useProjects } from "@/components/ProjectsContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

function TaskCard({
  task,
  onDelete,
  onEdit
}: {
  task: ProjectTask;
  onDelete: (id: string) => void;
  onEdit: (task: ProjectTask) => void;
}) {
  return (
    <div 
      className="group relative flex flex-col gap-4 border-2 border-foreground bg-background p-5 shadow-hard-sm hover:translate-y-[-4px] hover:shadow-hard transition-all h-full cursor-pointer"
      onClick={() => onEdit(task)}
    >
      <div className="flex items-start justify-between">
        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-none border border-foreground/10 ${
          task.status === 'TODO' ? 'bg-red-50 text-red-700' :
          task.status === 'IN_PROGRESS' ? 'bg-yellow-50 text-yellow-700' :
          'bg-green-50 text-green-700'
        }`}>
          {task.status.replace('_', ' ')}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent hover:border-foreground/10 transition-all"
            title="Edit Task"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="p-1.5 text-muted-foreground hover:bg-destructive hover:text-white border border-transparent transition-all"
            title="Delete Task"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:my-0 prose-headings:my-1 break-words [overflow-wrap:anywhere] flex-1">
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
          {task.content}
        </ReactMarkdown>
      </div>
      <div className="pt-4 border-t border-foreground/5 flex items-center justify-between">
         <span className="text-[9px] font-mono font-bold uppercase tracking-tighter text-muted-foreground/50">
           Updated {new Date(task.updated_at || task.created_at).toLocaleDateString()}
         </span>
      </div>
    </div>
  );
}

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = use(params);
  const { updateProject: updateProjectCtx } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'grid'>('kanban');
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ProjectTask | undefined>(undefined);
  const [defaultStatus, setDefaultStatus] = useState<string>("TODO");

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
      setViewMode(projectData.framework === 'GRID' ? 'grid' : 'kanban');
    } catch (error) {
      console.error("Failed to fetch project data", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleView = async (mode: 'kanban' | 'grid') => {
    if (!project) return;
    const framework = mode === 'grid' ? 'GRID' : 'KANBAN_FIXED';
    
    // Optimistic update
    setViewMode(mode);
    setProject(prev => prev ? { ...prev, framework } : prev);

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ framework }),
      });
      if (!res.ok) throw new Error("Failed to update framework");
      const updated = await res.json();
      updateProjectCtx(updated.id, updated);
    } catch (error) {
      console.error("Failed to persist view mode", error);
      // Revert on error
      setViewMode(project.framework === 'GRID' ? 'grid' : 'kanban');
      setProject(prev => prev ? { ...prev, framework: project.framework } : prev);
    }
  };

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

  const handleAddTask = async (content: string, status: string, priority?: string, due_date?: string | null) => {
    try {
      const response = await fetch(`/api/projects/${id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, status, priority, due_date }),
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
      setTasks((prev) =>
        prev.map((t) => {
          const reordered = reorderedTasks.find((r) => r.id === t.id);
          return reordered ? { ...t, order_index: reordered.order_index } : t;
        })
      );
    } catch (error) {
      console.error("Failed to reorder tasks", error);
      fetchData();
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
                    {project.framework === 'GRID' ? 'Task Grid' : 'Fixed Kanban Workflow'}
                </span>
             </div>
             <button
               onClick={() => setIsEditOpen(true)}
               className="p-2 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-full transition-colors"
               title="Edit Project"
             >
               <Edit2 className="h-4 w-4" />
             </button>
           </div>
           
           <div className="flex items-center bg-secondary/50 rounded-lg p-1 border border-border">
              <button
                onClick={() => toggleView('kanban')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  viewMode === 'kanban' 
                    ? 'bg-background shadow-sm text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Layout className="h-3.5 w-3.5" />
                Board
              </button>
              <button
                onClick={() => toggleView('grid')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-background shadow-sm text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Grid className="h-3.5 w-3.5" />
                Cards
              </button>
           </div>
        </div>
      </div>

      {/* Board Area */}
      <div className="flex-1 overflow-y-auto bg-muted/20">
         <div className="container mx-auto h-full p-6">
            {viewMode === 'kanban' ? (
              <KanbanBoard
                tasks={tasks}
                onTaskUpdate={handleTaskUpdate}
                onAddTask={handleAddTask}
                onDeleteTask={handleDeleteTask}
                onTasksReorder={handleTasksReorder}
              />
            ) : (
              <div className="space-y-6">
                <div className="flex justify-end">
                   <button
                     onClick={() => {
                       setEditingTask(undefined);
                       setDefaultStatus("TODO");
                       setIsTaskDialogOpen(true);
                     }}
                     className="flex items-center gap-2 border-2 border-foreground bg-primary px-4 py-2 text-xs font-bold text-white shadow-hard-sm transition-transform hover:-translate-y-0.5 hover:shadow-hard active:translate-y-0 active:shadow-hard-sm"
                   >
                     <Plus className="h-4 w-4" />
                     Add Task
                   </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                  {tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={(t) => {
                        setEditingTask(t);
                        setIsTaskDialogOpen(true);
                      }}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                  {tasks.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground">
                      <Layout className="h-12 w-12 mb-4 opacity-20" />
                      <p className="font-medium">No tasks yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
         </div>
      </div>

      <ProjectCreationDialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialProject={project || undefined}
        onSuccess={(updated) => {
          if (updated) {
            setProject((prev) => prev ? { ...prev, ...updated } : prev);
            setViewMode(updated.framework === 'GRID' ? 'grid' : 'kanban');
            updateProjectCtx(updated.id, updated);
          }
          setIsEditOpen(false);
        }}
      />

      <TaskDialog
        isOpen={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
        onSuccess={(content, status, priority, due_date) => {
          if (editingTask) {
            handleTaskUpdate(editingTask.id, { content, status, priority, due_date });
          } else {
            handleAddTask(content, status || defaultStatus, priority, due_date);
          }
        }}
        initialTask={editingTask}
        defaultStatus={defaultStatus}
      />
    </div>
  );
}

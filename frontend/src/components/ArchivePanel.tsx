"use client";

import { useState, useEffect } from "react";
import { X, Archive, RotateCcw, Loader2, Calendar } from "lucide-react";
import { ProjectTask } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface ArchivePanelProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onRestore: (task: ProjectTask) => void;
}

export function ArchivePanel({ isOpen, onClose, projectId, onRestore }: ArchivePanelProps) {
  const [archivedTasks, setArchivedTasks] = useState<ProjectTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchArchivedTasks();
    }
  }, [isOpen, projectId]);

  const fetchArchivedTasks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/archived`);
      if (!res.ok) throw new Error("Failed to fetch archived tasks");
      const data = await res.json();
      setArchivedTasks(data);
    } catch (error) {
      console.error("Failed to fetch archived tasks", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (task: ProjectTask) => {
    setRestoringId(task.id);
    try {
      const res = await fetch(`/api/projects/tasks/${task.id}/unarchive`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to unarchive task");
      const restored = await res.json();
      setArchivedTasks((prev) => prev.filter((t) => t.id !== task.id));
      onRestore(restored);
    } catch (error) {
      console.error("Failed to restore task", error);
    } finally {
      setRestoringId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md h-full bg-background border-l-2 border-foreground shadow-hard-lg animate-in slide-in-from-right duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-foreground/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-orange-500/10 rounded-lg">
              <Archive className="h-4.5 w-4.5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight">Archive</h2>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                {archivedTasks.length} archived task{archivedTasks.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:bg-destructive hover:text-white transition-colors rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : archivedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Archive className="h-10 w-10 mb-4 opacity-20" />
              <p className="text-sm font-bold">No archived tasks</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Drag tasks to the right edge to archive them
              </p>
            </div>
          ) : (
            archivedTasks.map((task) => (
              <div
                key={task.id}
                className="group border-2 border-foreground/20 bg-background p-4 space-y-3 hover:border-foreground/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-bold leading-relaxed break-words whitespace-pre-wrap flex-1">
                    {task.content}
                  </p>
                  <button
                    onClick={() => handleRestore(task)}
                    disabled={restoringId === task.id}
                    className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border-2 border-foreground bg-primary text-white shadow-hard-sm hover:-translate-y-0.5 hover:shadow-hard active:translate-y-0 transition-all disabled:opacity-50"
                  >
                    {restoringId === task.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3 w-3" />
                    )}
                    Restore
                  </button>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className={`font-black uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                    task.status === 'TODO' ? 'bg-red-50 text-red-600' :
                    task.status === 'IN_PROGRESS' ? 'bg-yellow-50 text-yellow-600' :
                    'bg-green-50 text-green-600'
                  }`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  {task.priority !== 'MEDIUM' && (
                    <span className={`font-black uppercase tracking-wider ${
                      task.priority === 'HIGH' ? 'text-red-500' : 'text-blue-500'
                    }`}>
                      {task.priority}
                    </span>
                  )}
                  {task.archived_at && (
                    <span className="flex items-center gap-1 ml-auto">
                      <Calendar className="h-3 w-3" />
                      Archived {formatDistanceToNow(new Date(task.archived_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Calendar, AlertCircle } from "lucide-react";
import { ProjectTask } from "@/lib/types";

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (content: string, status?: string, priority?: string, due_date?: string | null) => void;
  initialTask?: ProjectTask;
  defaultStatus?: string;
}

export function TaskDialog({
  isOpen,
  onClose,
  onSuccess,
  initialTask,
  defaultStatus = "TODO",
}: TaskDialogProps) {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState(defaultStatus);
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!initialTask;

  useEffect(() => {
    if (isOpen) {
      setContent(initialTask?.content || "");
      setStatus(initialTask?.status || defaultStatus);
      setPriority(initialTask?.priority || "MEDIUM");
      // Format datetime-local input: YYYY-MM-DDTHH:MM
      const dateStr = initialTask?.due_date 
        ? new Date(initialTask.due_date).toISOString().slice(0, 16) 
        : "";
      setDueDate(dateStr);
    }
  }, [isOpen, initialTask, defaultStatus]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      // Ensure due date is sent as ISO string or null
      const formattedDueDate = dueDate ? new Date(dueDate).toISOString() : null;
      await onSuccess(content.trim(), status, priority, formattedDueDate);
      setContent("");
      onClose();
    } catch (err) {
      console.error("Failed to save task", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg border-2 border-foreground bg-background p-6 shadow-hard animate-in fade-in zoom-in-95 duration-200">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-black uppercase tracking-tight">
            {isEditing ? "Edit Task" : "New Task"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-none p-1 text-muted-foreground hover:bg-destructive hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="content"
              className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground"
            >
              Task Description (Markdown supported)
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[120px] rounded-none border-2 border-input bg-transparent px-3 py-2 text-sm font-bold placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:shadow-hard-sm"
              placeholder="Describe the task... You can use **bold**, *italic*, or [links](...)"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
                Priority
              </label>
              <div className="flex flex-col gap-1">
                {["LOW", "MEDIUM", "HIGH"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`border-2 px-3 py-1.5 text-xs font-bold text-left transition-all flex items-center justify-between ${
                      priority === p
                        ? p === 'HIGH' ? "border-red-500 bg-red-50 text-red-700" :
                          p === 'MEDIUM' ? "border-yellow-500 bg-yellow-50 text-yellow-700" :
                          "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-foreground/10 hover:border-foreground/30 text-muted-foreground"
                    }`}
                  >
                    <span>{p}</span>
                    {priority === p && <AlertCircle className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-none border-2 border-input bg-transparent px-3 py-2 text-xs font-bold focus:border-primary focus:outline-none"
                >
                  <option value="TODO">TO DO</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="DONE">DONE</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
                  Due Date
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-none border-2 border-input bg-transparent px-3 py-2 text-xs font-bold placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                  />
                  <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 border-2 border-transparent px-4 text-sm font-bold text-muted-foreground hover:text-foreground hover:underline disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="flex h-10 items-center justify-center gap-2 border-2 border-foreground bg-primary px-6 text-sm font-bold text-white shadow-hard-sm transition-transform hover:-translate-y-0.5 hover:shadow-hard active:translate-y-0 active:shadow-hard-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

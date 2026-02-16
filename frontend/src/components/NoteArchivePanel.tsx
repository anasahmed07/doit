"use client";

import { useState, useEffect } from "react";
import { X, Archive, RotateCcw, Loader2, Calendar } from "lucide-react";
import { Note } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface NoteArchivePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore: (note: Note) => void;
  categoryId?: string | null;
}

export function NoteArchivePanel({ isOpen, onClose, onRestore, categoryId }: NoteArchivePanelProps) {
  const [archivedNotes, setArchivedNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchArchivedNotes();
    }
  }, [isOpen, categoryId]);

  const fetchArchivedNotes = async () => {
    setIsLoading(true);
    try {
      const params = categoryId ? `?category_id=${categoryId}` : "";
      const res = await fetch(`/api/notes/archived${params}`);
      if (!res.ok) throw new Error("Failed to fetch archived notes");
      const data = await res.json();
      setArchivedNotes(data);
    } catch (error) {
      console.error("Failed to fetch archived notes", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (note: Note) => {
    setRestoringId(note.id);
    try {
      const res = await fetch(`/api/notes/${note.id}/unarchive`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to unarchive note");
      const restored = await res.json();
      setArchivedNotes((prev) => prev.filter((n) => n.id !== note.id));
      onRestore(restored);
    } catch (error) {
      console.error("Failed to restore note", error);
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
                {archivedNotes.length} archived note{archivedNotes.length !== 1 ? "s" : ""}
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
          ) : archivedNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Archive className="h-10 w-10 mb-4 opacity-20" />
              <p className="text-sm font-bold">No archived notes</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Drag notes to the right edge to archive them
              </p>
            </div>
          ) : (
            archivedNotes.map((note) => (
              <div
                key={note.id}
                className="group border-2 border-foreground/20 bg-background p-4 space-y-3 hover:border-foreground/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {note.title && (
                      <p className="text-sm font-bold leading-snug tracking-tight truncate">
                        {note.title}
                      </p>
                    )}
                    {note.content && (
                      <p className="text-xs text-muted-foreground leading-relaxed break-words whitespace-pre-wrap line-clamp-3 mt-1">
                        {note.content}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRestore(note)}
                    disabled={restoringId === note.id}
                    className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border-2 border-foreground bg-primary text-white shadow-hard-sm hover:-translate-y-0.5 hover:shadow-hard active:translate-y-0 transition-all disabled:opacity-50"
                  >
                    {restoringId === note.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3 w-3" />
                    )}
                    Restore
                  </button>
                </div>

                {note.archived_at && (
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Archived {formatDistanceToNow(new Date(note.archived_at), { addSuffix: true })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

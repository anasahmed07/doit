"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Plus, Archive } from "lucide-react";
import { Note } from "@/lib/types";
import { DraggableNoteGrid } from "@/components/DraggableNoteGrid";
import { NoteForm } from "@/components/NoteForm";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { NoteViewDialog } from "@/components/NoteViewDialog";
import { NoteArchivePanel } from "@/components/NoteArchivePanel";

function NotesContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");
  const isNew = searchParams.get("new") === "true";

  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  // Automatically open create form if 'new=true' is in URL
  useEffect(() => {
    if (isNew) {
      setIsCreating(true);
      setEditingNote(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isNew]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N or Cmd+N to create new note
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setIsCreating(true);
        // Ensure we're not in edit mode when starting fresh via shortcut
        setEditingNote(null);
        setViewingNote(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      // If a specific category is selected, filter by that category
      // Otherwise, show only uncategorized notes (notes without a category)
      const url = categoryId
        ? `/api/notes?category_id=${categoryId}`
        : "/api/notes?uncategorized=true";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch notes");
      const data = await response.json();

      // Sort by updated_at desc (newest first)
      const sortedData = data.sort((a: Note, b: Note) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      setNotes(sortedData);

      // Update viewing note if it's currently open
      if (viewingNote) {
        const updated = data.find((n: Note) => n.id === viewingNote.id);
        if (updated) setViewingNote(updated);
      }
    } catch (error) {
      console.error("Failed to fetch notes", error);
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, viewingNote?.id]);

  useEffect(() => {
    fetchNotes();
  }, [categoryId]); // Only re-fetch when category changes, or on manual refresh

  const handleReorder = async (newNotes: Note[]) => {
    // Optimistic update
    setNotes(newNotes);

    try {
      await fetch("/api/notes/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note_ids: newNotes.map((n) => n.id) }),
      });
    } catch (error) {
      console.error("Failed to reorder notes", error);
      fetchNotes(); // Revert on error
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await fetch(`/api/notes/${deleteId}`, { method: "DELETE" });
      setNotes((prev) => prev.filter((n) => n.id !== deleteId));
      if (viewingNote?.id === deleteId) setViewingNote(null);
    } catch (error) {
      console.error("Failed to delete note", error);
    } finally {
      setDeleteId(null);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setIsCreating(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleView = (note: Note) => {
    setViewingNote(note);
  };

  const handleArchiveNote = async (id: string) => {
    // Optimistic remove from state
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (viewingNote?.id === id) setViewingNote(null);

    try {
      const res = await fetch(`/api/notes/${id}/archive`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to archive note");
    } catch (error) {
      console.error("Failed to archive note", error);
      fetchNotes(); // Revert on error
    }
  };

  const handleRestoreNote = (note: Note) => {
    setNotes((prev) => [note, ...prev]);
  };

  const handleToggleTodo = async (note: Note, index: number) => {
    const lines = note.content?.split('\n') || [];
    let checkboxCount = 0;
    const newLines = lines.map((line) => {
      const checkboxRegex = /^(\s*([-+*]|\d+[.)])\s+)\[([ xX]?)\]/;
      const match = line.match(checkboxRegex);

      if (match) {
        if (checkboxCount === index) {
          const currentStatus = match[3] || ' ';
          const isChecked = currentStatus.toLowerCase() === 'x';
          const newStatus = isChecked ? ' ' : 'x';

          const prefix = match[1];
          const remainingLine = line.substring(match[0].length);
          line = `${prefix}[${newStatus}]${remainingLine}`;
        }
        checkboxCount++;
      }
      return line;
    });

    const newContent = newLines.join('\n');
    const updatedNote = { ...note, content: newContent };

    // Optimistic update
    setNotes(prev => prev.map(n => n.id === note.id ? updatedNote : n));

    // Also update viewingNote if this note is currently being viewed
    if (viewingNote?.id === note.id) {
      setViewingNote(updatedNote);
    }

    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
      });
      if (!response.ok) throw new Error("Failed to sync toggle");
    } catch (error) {
      console.error("Failed to toggle todo", error);
      fetchNotes(); // Revert on error
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingNote(null);
  };

  const handleSuccess = () => {
    setIsCreating(false);
    setEditingNote(null);
    fetchNotes();
  };

  return (
    <div className="w-full p-6 space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-black uppercase tracking-tighter">
            {categoryId ? "Category View" : "Quick Notes"}
         </h1>
         <div className="flex items-center gap-2">
           <button
              onClick={() => setIsArchiveOpen(true)}
              className="flex items-center gap-2 border-2 border-foreground px-4 py-2 text-sm font-bold shadow-hard transition-transform hover:-translate-y-0.5 hover:shadow-hard-lg active:translate-y-0 active:shadow-hard"
              title="View Archived Notes"
           >
              <Archive className="h-4 w-4" />
           </button>
           <button
              onClick={() => {
                  if (isCreating) handleCancel();
                  else setIsCreating(true);
              }}
              className="flex items-center gap-2 border-2 border-foreground bg-primary px-4 py-2 text-sm font-bold text-white shadow-hard transition-transform hover:-translate-y-0.5 hover:shadow-hard-lg active:translate-y-0 active:shadow-hard"
              title="Create New Note (Ctrl+N)"
           >
              {isCreating ? "Cancel" : "Create Note"}
              {!isCreating && <Plus className="h-4 w-4" />}
           </button>
         </div>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="mx-auto max-w-2xl animate-in slide-in-from-top-4 duration-200">
           <NoteForm
             initialNote={editingNote || undefined}
             categoryId={categoryId}
             onSuccess={handleSuccess}
             onCancel={handleCancel}
           />
        </div>
      )}

      {/* Notes Grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : notes.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 border-2 border-dashed border-foreground/20 rounded-lg text-muted-foreground">
            <p className="font-mono text-sm uppercase tracking-widest">No notes found</p>
            <button
                onClick={() => setIsCreating(true)}
                className="text-sm font-bold hover:text-foreground underline"
            >
                Create your first note
            </button>
        </div>
      ) : (
        <DraggableNoteGrid
          notes={notes}
          onReorder={handleReorder}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onView={handleView}
          onToggleTodo={handleToggleTodo}
          onArchive={handleArchiveNote}
        />
      )}

      <NoteViewDialog
        note={viewingNote}
        isOpen={!!viewingNote}
        onClose={() => setViewingNote(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSuccess={fetchNotes}
        onToggleTodo={handleToggleTodo}
      />

      <ConfirmationDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Note"
        description="Are you sure you want to delete this note? This action cannot be undone."
        variant="destructive"
        confirmText="Delete"
      />

      <NoteArchivePanel
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        onRestore={handleRestoreNote}
        categoryId={categoryId}
      />
    </div>
  );
}

export default function NotesClient() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <NotesContent />
        </Suspense>
    )
}

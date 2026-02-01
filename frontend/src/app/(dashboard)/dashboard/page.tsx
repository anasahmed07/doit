"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Note } from "@/lib/types";
import { DraggableNoteGrid } from "@/components/DraggableNoteGrid";
import { NoteForm } from "@/components/NoteForm";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { NoteViewDialog } from "@/components/NoteViewDialog";

function DashboardContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
      setNotes(data);

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

  const handleToggleTodo = async (note: Note, index: number) => {
    console.log(`Toggling todo at index ${index} for note ${note.id}`);
    const lines = note.content?.split('\n') || [];
    let checkboxCount = 0;
    const newLines = lines.map((line) => {
      // Match GFM checkbox at start of line: optional whitespace, then list marker, then checkbox
      const checkboxMatch = line.match(/^(\s*(-|\*|[0-9]+\.)\s+)\[([ xX])\]/);
      if (checkboxMatch) {
        if (checkboxCount === index) {
          const currentStatus = checkboxMatch[3]; // ' ', 'x', or 'X'
          const isChecked = currentStatus.toLowerCase() === 'x';
          const newStatus = isChecked ? ' ' : 'x';
          // Replace only the specific checkbox part
          line = line.replace(/\[[ xX]\]/, `[${newStatus}]`);
          console.log(`Changed line from "${checkboxMatch[0]}" to status "${newStatus}"`);
        }
        checkboxCount++;
      }
      return line;
    });

    const newContent = newLines.join('\n');
    
    // Optimistic update
    setNotes(prev => prev.map(n => n.id === note.id ? { ...n, content: newContent } : n));

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
    <div className="container mx-auto max-w-7xl p-6 space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-black uppercase tracking-tighter">
            {categoryId ? "Category View" : "Quick Notes"}
         </h1>
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
        />
      )}

      <NoteViewDialog
        note={viewingNote}
        isOpen={!!viewingNote}
        onClose={() => setViewingNote(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSuccess={fetchNotes}
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
    </div>
  );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <DashboardContent />
        </Suspense>
    )
}
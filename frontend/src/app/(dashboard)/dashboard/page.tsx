"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Note } from "@/lib/types";
import { DraggableNoteGrid } from "@/components/DraggableNoteGrid";
import { CreateNoteForm } from "@/components/CreateNoteForm";

function DashboardContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

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
    } catch (error) {
      console.error("Failed to fetch notes", error);
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      await fetch(`/api/notes/${id}`, { method: "DELETE" });
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Failed to delete note", error);
    }
  };

  const handleEdit = (note: Note) => {
    // TODO: Implement edit modal or inline edit
    console.log("Edit note", note);
  };

  return (
    <div className="container mx-auto max-w-7xl p-6 space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-black uppercase tracking-tighter">
            {categoryId ? "Category View" : "Quick Notes"}
         </h1>
         <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 border-2 border-foreground bg-primary px-4 py-2 text-sm font-bold text-white shadow-hard transition-transform hover:-translate-y-0.5 hover:shadow-hard-lg active:translate-y-0 active:shadow-hard"
         >
            {isCreating ? "Cancel" : "Create Note"}
            {!isCreating && <Plus className="h-4 w-4" />}
         </button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="mx-auto max-w-2xl animate-in slide-in-from-top-4 duration-200">
           <CreateNoteForm 
             categoryId={categoryId}
             onSuccess={() => {
                setIsCreating(false);
                fetchNotes();
             }}
             onCancel={() => setIsCreating(false)}
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
        />
      )}
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
"use client";

import { useState, useRef } from "react";
import { Loader2, Image as ImageIcon, X } from "lucide-react";
import api from "@/lib/api";
import { Note } from "@/lib/types";

interface CreateNoteFormProps {
  categoryId?: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateNoteForm({ categoryId, onSuccess, onCancel }: CreateNoteFormProps) {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && files.length === 0) return;

    setIsSubmitting(true);
    try {
      // 1. Create Note
      const noteResponse = await api.post<Note>("/notes/", {
        content: content,
        category_id: categoryId,
      });
      
      const noteId = noteResponse.data.id;

      // 2. Upload Files
      if (files.length > 0) {
        await Promise.all(
          files.map((file) => {
            const formData = new FormData();
            formData.append("file", file);
            return api.post(`/notes/${noteId}/media`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          })
        );
      }

      setContent("");
      setFiles([]);
      onSuccess();
    } catch (error) {
      console.error("Failed to create note:", error);
      // Ideally show toast here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border-2 border-foreground bg-background p-4 shadow-hard">
      <div className="space-y-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full min-h-[100px] resize-none rounded-none border-2 border-input bg-transparent px-3 py-2 text-sm font-medium placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:shadow-hard-sm"
          autoFocus
        />
      </div>

      {/* File Preview */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file, i) => (
            <div key={i} className="relative group flex items-center gap-2 rounded-md border border-foreground/20 bg-secondary/50 px-2 py-1 text-xs font-mono">
              <span className="max-w-[150px] truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="ml-1 text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-2">
           <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-none px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
           >
             <ImageIcon className="h-4 w-4" />
             Add Media
           </button>
           <input
             ref={fileInputRef}
             type="file"
             multiple
             accept="image/*,audio/*"
             className="hidden"
             onChange={handleFileSelect}
           />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-bold text-muted-foreground hover:underline"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || (!content.trim() && files.length === 0)}
            className="flex items-center gap-2 bg-primary px-4 py-2 text-sm font-bold text-white shadow-hard-sm hover:translate-y-px hover:shadow-hard active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="h-3 w-3 animate-spin" />}
            Save Note
          </button>
        </div>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";

interface CreateCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const COLORS = [
  { name: "Blue", value: "#1e3a8a" }, // Primary
  { name: "Orange", value: "#f97316" }, // Accent
  { name: "Green", value: "#15803d" },
  { name: "Red", value: "#b91c1c" },
  { name: "Purple", value: "#7e22ce" },
  { name: "Black", value: "#18181b" },
];

export function CreateCategoryDialog({
  isOpen,
  onClose,
  onSuccess,
}: CreateCategoryDialogProps) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          color: selectedColor,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create category");
      }

      setName("");
      setSelectedColor(COLORS[0].value);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to create category", err);
      setError("Failed to create category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md border-2 border-foreground bg-background p-6 shadow-hard animate-in fade-in zoom-in-95 duration-200">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-black uppercase tracking-tight">
            New Category
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
              htmlFor="name"
              className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground"
            >
              Category Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-none border-2 border-input bg-transparent px-3 py-2 text-sm font-bold placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:shadow-hard-sm"
              placeholder="e.g., Work, Personal, Research"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
              Color Tag
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`group relative h-8 w-8 border border-foreground transition-all hover:-translate-y-0.5 hover:shadow-sm ${
                    selectedColor === color.value
                      ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                      : ""
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                   {selectedColor === color.value && (
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <div className="h-1.5 w-1.5 bg-white rounded-full"></div>
                      </div>
                   )}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
              {error}
            </div>
          )}

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
              disabled={isSubmitting || !name.trim()}
              className="flex h-10 items-center justify-center gap-2 border-2 border-foreground bg-primary px-6 text-sm font-bold text-white shadow-hard-sm transition-transform hover:-translate-y-0.5 hover:shadow-hard active:translate-y-0 active:shadow-hard-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

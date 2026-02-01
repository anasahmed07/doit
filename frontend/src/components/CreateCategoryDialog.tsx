"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Trash2 } from "lucide-react";
import { Category } from "@/lib/types";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialCategory?: Category;
}

const COLORS = [
  { name: "Blue", value: "#1e3a8a" }, // Primary
  { name: "Orange", value: "#f97316" }, // Accent
  { name: "Green", value: "#15803d" },
  { name: "Red", value: "#b91c1c" },
  { name: "Purple", value: "#7e22ce" },
  { name: "Black", value: "#18181b" },
];

export function CategoryDialog({
  isOpen,
  onClose,
  onSuccess,
  initialCategory
}: CategoryDialogProps) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (initialCategory) {
      setName(initialCategory.name);
      setSelectedColor(initialCategory.color);
    } else {
      setName("");
      setSelectedColor(COLORS[0].value);
    }
  }, [initialCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const url = initialCategory 
        ? `/api/categories/${initialCategory.id}` 
        : "/api/categories";
      
      const method = initialCategory ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          color: selectedColor,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${initialCategory ? 'update' : 'create'} category`);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialCategory) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/categories/${initialCategory.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete category");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to delete category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="w-full max-w-md border-2 border-foreground bg-background p-6 shadow-hard animate-in fade-in zoom-in-95 duration-200">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-black uppercase tracking-tight">
              {initialCategory ? "Edit Category" : "New Category"}
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
                <div className="relative">
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="h-8 w-8 cursor-pointer opacity-0 absolute inset-0 z-10"
                    title="Custom Color"
                  />
                  <div 
                    className={`h-8 w-8 flex items-center justify-center border-2 border-dashed border-foreground/50 text-foreground bg-transparent transition-all hover:-translate-y-0.5 hover:shadow-sm hover:border-foreground ${
                      !COLORS.some(c => c.value === selectedColor) ? "ring-2 ring-foreground ring-offset-2 ring-offset-background border-solid border-foreground" : ""
                    }`}
                    style={!COLORS.some(c => c.value === selectedColor) ? { backgroundColor: selectedColor } : {}}
                  >
                    {!COLORS.some(c => c.value === selectedColor) ? (
                      <div className="h-1.5 w-1.5 bg-white rounded-full mix-blend-difference" />
                    ) : (
                      <span className="text-xs font-bold">+</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                {error}
              </div>
            )}

            <div className="flex justify-between pt-2">
              {initialCategory ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 text-xs font-bold text-destructive hover:underline"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Category
                </button>
              ) : <div />}

              <div className="flex gap-3">
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
                  {initialCategory ? "Save Changes" : "Create"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? Any notes in this category will become uncategorized."
        variant="destructive"
        confirmText="Delete"
      />
    </>
  );
}
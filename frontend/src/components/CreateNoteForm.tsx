"use client";

import { useState, useRef, useEffect } from "react";
import {
  Loader2,
  Image as ImageIcon,
  X,
  Tag,
  Bold,
  Italic,
  Heading2,
  List,
  ListChecks,
  Code,
  Link2,
  Quote
} from "lucide-react";
import { Note, Category } from "@/lib/types";

interface CreateNoteFormProps {
  categoryId?: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateNoteForm({ categoryId, onSuccess, onCancel }: CreateNoteFormProps) {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(categoryId || null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Fetch categories for the picker
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  // Insert markdown at cursor position
  const insertMarkdown = (before: string, after: string = "", placeholder: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const textToInsert = selectedText || placeholder;

    const newContent =
      content.substring(0, start) +
      before + textToInsert + after +
      content.substring(end);

    setContent(newContent);

    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Insert at start of line(s)
  const insertAtLineStart = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Find the start of the current line
    const lineStart = content.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = content.indexOf('\n', end);
    const actualLineEnd = lineEnd === -1 ? content.length : lineEnd;

    // Get selected lines
    const selectedLines = content.substring(lineStart, actualLineEnd);
    const lines = selectedLines.split('\n');

    // Add prefix to each line
    const newLines = lines.map(line => prefix + line);
    const newContent =
      content.substring(0, lineStart) +
      newLines.join('\n') +
      content.substring(actualLineEnd);

    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
    }, 0);
  };

  const formatActions = [
    {
      icon: Bold,
      title: "Bold (Ctrl+B)",
      action: () => insertMarkdown("**", "**", "bold text")
    },
    {
      icon: Italic,
      title: "Italic (Ctrl+I)",
      action: () => insertMarkdown("*", "*", "italic text")
    },
    {
      icon: Heading2,
      title: "Heading",
      action: () => insertAtLineStart("## ")
    },
    {
      icon: Quote,
      title: "Quote",
      action: () => insertAtLineStart("> ")
    },
    {
      icon: List,
      title: "Bullet List",
      action: () => insertAtLineStart("- ")
    },
    {
      icon: ListChecks,
      title: "Todo List",
      action: () => insertAtLineStart("- [ ] ")
    },
    {
      icon: Code,
      title: "Code",
      action: () => insertMarkdown("`", "`", "code")
    },
    {
      icon: Link2,
      title: "Link",
      action: () => insertMarkdown("[", "](url)", "link text")
    },
  ];

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') {
        e.preventDefault();
        insertMarkdown("**", "**", "bold text");
      } else if (e.key === 'i') {
        e.preventDefault();
        insertMarkdown("*", "*", "italic text");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && files.length === 0) return;

    setIsSubmitting(true);
    try {
      // 1. Create Note
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content,
          category_id: selectedCategoryId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create note");
      }

      const noteData = await response.json();
      const noteId = noteData.id;

      // 2. Upload Files
      if (files.length > 0) {
        await Promise.all(
          files.map(async (file) => {
            const formData = new FormData();
            formData.append("file", file);
            const mediaResponse = await fetch(`/api/notes/${noteId}/media`, {
              method: "POST",
              body: formData,
            });
            if (!mediaResponse.ok) {
               throw new Error("Failed to upload media");
            }
            return mediaResponse.json();
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
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border-2 border-foreground bg-background p-4 shadow-hard">
      {/* Formatting Toolbar */}
      <div className="flex items-center gap-1 pb-2 border-b border-border">
        {formatActions.map((action, index) => (
          <button
            key={index}
            type="button"
            onClick={action.action}
            title={action.title}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <action.icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What's on your mind? Use the toolbar above for formatting..."
          className="w-full min-h-[120px] resize-none rounded-none border-2 border-input bg-transparent px-3 py-2 text-sm font-medium placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:shadow-hard-sm font-mono"
          autoFocus
        />
        <p className="text-[10px] text-muted-foreground/60 font-mono">
          Supports Markdown: **bold**, *italic*, ## heading, - list, - [ ] todo, `code`
        </p>
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

           {/* Category Picker */}
           <div className="relative">
             <button
               type="button"
               onClick={() => setShowCategoryPicker(!showCategoryPicker)}
               className="flex items-center gap-2 rounded-none px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
             >
               <Tag className="h-4 w-4" />
               {selectedCategoryId
                 ? categories.find(c => c.id === selectedCategoryId)?.name || "Category"
                 : "Add Category"}
             </button>

             {showCategoryPicker && (
               <div className="absolute left-0 top-full mt-1 z-50 w-48 rounded-md border-2 border-foreground bg-background shadow-hard py-1">
                 <button
                   type="button"
                   onClick={() => {
                     setSelectedCategoryId(null);
                     setShowCategoryPicker(false);
                   }}
                   className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary transition-colors ${!selectedCategoryId ? 'bg-secondary' : ''}`}
                 >
                   <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                   No Category
                 </button>
                 {categories.map((category) => (
                   <button
                     key={category.id}
                     type="button"
                     onClick={() => {
                       setSelectedCategoryId(category.id);
                       setShowCategoryPicker(false);
                     }}
                     className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary transition-colors ${selectedCategoryId === category.id ? 'bg-secondary' : ''}`}
                   >
                     <span
                       className="h-2 w-2 rounded-full"
                       style={{ backgroundColor: category.color }}
                     />
                     {category.name}
                   </button>
                 ))}
               </div>
             )}
           </div>
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

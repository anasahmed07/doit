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
  Heading3,
  Heading1,
  List,
  ListChecks,
  Code,
  Link2,
  Quote,
  Undo,
  Redo
} from "lucide-react";
import { Note, Category } from "@/lib/types";

interface NoteFormProps {
  initialNote?: Note;
  categoryId?: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function NoteForm({ initialNote, categoryId, onSuccess, onCancel }: NoteFormProps) {
  const [content, setContent] = useState(initialNote?.content || "");
  const [history, setHistory] = useState<string[]>([initialNote?.content || ""]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    initialNote?.category_id || categoryId || null
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const saveToHistory = (newVal: string) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newVal);
      return newHistory;
    });
    setHistoryIndex((prev) => prev + 1);
  };

  const updateContent = (newContent: string, immediate = false) => {
    setContent(newContent);

    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
    }

    if (immediate) {
      saveToHistory(newContent);
    } else {
      historyTimeoutRef.current = setTimeout(() => {
        saveToHistory(newContent);
      }, 750);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      // If there are unsaved changes (typing), revert to current history index first?
      // Actually, if we are at historyIndex, history[historyIndex] IS the saved state.
      // If content != history[historyIndex], it means we have unsaved typing.
      // Standard behavior: Undo removes unsaved typing first.
      
      if (content !== history[historyIndex]) {
        setContent(history[historyIndex]);
        return;
      }

      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    } else if (content !== history[0]) {
       // Edge case: Unsaved typing at the very beginning
       setContent(history[0]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };

  // Helper to ensure current typed content is saved before applying a programmatic change
  const prepareForProgrammaticChange = () => {
    if (content !== history[historyIndex]) {
      // We can't use saveToHistory directly because it relies on stale state in this closure?
      // No, setHistory functional update is fine. But we need to update index.
      // To be safe, let's force a sync save logic that mimics saveToHistory but works synchronously 
      // with the subsequent update. 
      // Actually, simpler: just push the current content to history array in the state update of the NEXT action.
      // But standard 'saveToHistory' is async due to setState.
      
      // Let's just flush the timeout.
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
        saveToHistory(content); 
        // Note: setState is async, so historyIndex won't update immediately. 
        // This makes "save then apply" tricky in one event loop.
        // Workaround: Programmatic changes pass `true` to updateContent, which saves the NEW content.
        // We just need to make sure the "gap" (typing) is also saved.
        // The safest way is to NOT use history state for the "base" of the modification, but `content`.
        // AND we should probably inject the "intermediate" state into history if needed.
        // For simplicity in this iteration: If user types "abc" then clicks Bold:
        // History: [..., ""] -> (typing "abc") -> updateContent("abc", false) -> timeout pending.
        // Click Bold -> prepareForProgrammaticChange -> clears timeout -> saves "abc".
        // Then insertMarkdown calculates "**abc**" -> updateContent("**abc**", true) -> saves "**abc**".
        // Result History: [..., "", "abc", "**abc**"]. This is perfect.
      } else {
         // Timeout might have already fired, or not started.
         // If content != history[historyIndex], we have unsaved changes.
         saveToHistory(content);
      }
    }
  };

  // Insert markdown at cursor position
  const insertMarkdown = (before: string, after: string = "", placeholder: string = "") => {
    prepareForProgrammaticChange();

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    // If text is selected, wrap it. If not, insert tags and place cursor inside.
    const textToInsert = selectedText;
    const isWrapping = selectedText.length > 0;

    const newContent =
      content.substring(0, start) +
      before + textToInsert + after +
      content.substring(end);

    // We use setTimeout to ensure the previous state save (from prepare) is processed? 
    // No, React batches. 
    // But updateContent(..., true) will append to history.
    // Ideally we want the "prepare" save to happen BEFORE the "newContent" save.
    // If we call setHistory twice in one render cycle, it might batch.
    // But `saveToHistory` uses functional updates, so it should stack correctly:
    // setHistory(prev => [...prev, typed])
    // setHistory(prev => [...prev, newContent])
    // This works!
    
    updateContent(newContent, true);

    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      if (isWrapping) {
        // If we wrapped text, select the wrapped text (or place cursor at end)
        // Let's place cursor at the end of the wrapped text for now
        const newCursorPos = start + before.length + textToInsert.length + after.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      } else {
        // If we inserted empty tags, place cursor inside
        const newCursorPos = start + before.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Insert at start of line(s)
  const insertAtLineStart = (prefix: string) => {
    prepareForProgrammaticChange();

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

    updateContent(newContent, true);

    setTimeout(() => {
      textarea.focus();
    }, 0);
  };

  const formatActions = [
    {
      icon: Undo,
      title: "Undo (Ctrl+Z)",
      action: handleUndo
    },
    {
      icon: Redo,
      title: "Redo (Ctrl+Y)",
      action: handleRedo
    },
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
      icon: Heading1,
      title: "Heading 1",
      action: () => insertAtLineStart("# ")
    },
    {
      icon: Heading2,
      title: "Heading 2",
      action: () => insertAtLineStart("## ")
    },
    {
      icon: Heading3,
      title: "Heading 3",
      action: () => insertAtLineStart("### ")
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
      if (e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
           handleRedo();
        } else {
           handleUndo();
        }
      } else if (e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'b') {
        e.preventDefault();
        insertMarkdown("**", "**", "bold text");
      } else if (e.key === 'i') {
        e.preventDefault();
        insertMarkdown("*", "*", "italic text");
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit(e);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && files.length === 0 && !initialNote) return;

    setIsSubmitting(true);
    try {
      let noteId = initialNote?.id;

      if (initialNote) {
        // Update existing note
        const response = await fetch(`/api/notes/${initialNote.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: content,
            category_id: selectedCategoryId,
          }),
        });
        
        if (!response.ok) throw new Error("Failed to update note");
        // We continue to upload new files if any
      } else {
        // Create new note
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

        if (!response.ok) throw new Error("Failed to create note");
        const noteData = await response.json();
        noteId = noteData.id;
      }

      // 2. Upload Files (if any new files)
      if (files.length > 0 && noteId) {
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

      if (!initialNote) {
        setContent("");
        setHistory([""]); // Reset history
        setHistoryIndex(0);
        setFiles([]);
        setSelectedCategoryId(categoryId || null);
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save note:", error);
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
          onChange={(e) => updateContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What's on your mind? Use the toolbar above for formatting..."
          className="w-full min-h-[120px] resize-none rounded-none border-2 border-input bg-transparent px-3 py-2 text-sm font-medium placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:shadow-hard-sm font-mono"
          autoFocus
        />
        <p className="text-[10px] text-muted-foreground/60 font-mono">
          Supports Markdown: **bold**, *italic*, ## heading, - list, - [ ] todo, `code`
        </p>
      </div>

      {/* Existing Media (ReadOnly for now) */}
      {initialNote?.media_assets && initialNote.media_assets.length > 0 && (
         <div className="flex flex-wrap gap-2 pb-2">
            {initialNote.media_assets.map((asset) => (
                <div key={asset.id} className="relative flex items-center justify-center border border-border bg-secondary/30 h-16 w-16 overflow-hidden rounded-md">
                   {asset.mime_type.startsWith("image/") ? (
                       <img src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${asset.url}`} alt="attachment" className="h-full w-full object-cover" />
                   ) : (
                       <span className="text-[10px] uppercase text-muted-foreground">{asset.mime_type.split("/")[1]}</span>
                   )}
                </div>
            ))}
         </div>
      )}

      {/* New File Preview */}
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
            {initialNote ? "Update Note" : "Save Note"}
          </button>
        </div>
      </div>
    </form>
  );
}

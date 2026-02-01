"use client";

import { Note } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Edit2, GripVertical, Image as ImageIcon, X } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onEdit: (note: Note) => void;
  onView?: (note: Note) => void;
  onToggleTodo?: (note: Note, index: number) => void;
  isOverlay?: boolean;
  dragAttributes?: any;
  dragListeners?: any;
}

export function NoteCard({
  note, 
  onDelete, 
  onEdit, 
  onView,
  onToggleTodo, 
  isOverlay = false,
  dragAttributes,
  dragListeners
}: NoteCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const getAssetUrl = (url: string) => `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${url}`;

  const handleTodoToggle = (index: number) => {
    if (!note.content || !onToggleTodo) return;
    onToggleTodo(note, index);
  };

  let checkboxIdx = 0;

  // Trim content to 15 lines
  const lines = note.content?.split('\n') || [];
  const isTrimmed = lines.length > 15;
  const displayContent = isTrimmed ? lines.slice(0, 15).join('\n') : note.content;

  return (
    <>
      <div
        className={`relative group flex flex-col gap-3 rounded-none border-2 border-foreground bg-background p-4 shadow-hard transition-all ${isOverlay ? "scale-105 rotate-2 shadow-hard-lg z-50 cursor-grabbing" : "hover:-translate-y-1 hover:shadow-hard-lg"}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header / Drag Handle */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <button 
              {...dragAttributes}
              {...dragListeners}
              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none p-1"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
              {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
            </span>
          </div>
          
          <div className={`flex gap-1 transition-opacity ${isHovered || isOverlay ? "opacity-100" : "opacity-0"}`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(note);
              }}
              className="p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              title="Edit Note"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
              className="p-1.5 text-muted-foreground hover:bg-destructive hover:text-white"
              title="Delete Note"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div 
          className="space-y-3 cursor-pointer"
          onClick={() => onView?.(note)}
        >
          {note.content && (
            <div className="relative prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:text-sm prose-p:leading-relaxed prose-a:text-primary prose-code:bg-secondary prose-code:px-1 prose-code:rounded prose-pre:bg-secondary/50 prose-pre:border prose-pre:border-border prose-li:marker:text-muted-foreground">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  input: ({ checked, ...props }) => {
                    const currentIdx = checkboxIdx++;
                    return (
                      <input
                        type="checkbox"
                        checked={!!checked}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleTodoToggle(currentIdx);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="mr-2 h-4 w-4 accent-primary cursor-pointer align-middle"
                        {...props}
                      />
                    );
                  },
                }}
              >
                {displayContent}
              </ReactMarkdown>
              
              {isTrimmed && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent flex items-end justify-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Click to read more</span>
                </div>
              )}
            </div>
          )}

          {/* Media Grid (Preview) */}
          {note.media_assets && note.media_assets.length > 0 && (
            <div className={`grid gap-2 ${note.media_assets.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
              {note.media_assets.slice(0, 2).map((asset, idx) => (
                <div key={asset.id} className="relative aspect-video w-full overflow-hidden border border-foreground/10 bg-secondary/30">
                  {asset.mime_type.startsWith("image/") ? (
                    <div className="relative h-full w-full">
                      <img 
                        src={getAssetUrl(asset.url)} 
                        alt="Note attachment" 
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      {idx === 1 && note.media_assets.length > 2 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">+{note.media_assets.length - 2}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <span className="text-xs font-mono uppercase">{asset.mime_type.split("/")[1]}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-lg shadow-2xl">
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 backdrop-blur-md"
            >
              <X className="h-6 w-6" />
            </button>
            <img 
              src={previewImage} 
              alt="Preview" 
              className="max-h-[90vh] w-auto object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
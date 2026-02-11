"use client";

import { Note } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Edit2, GripVertical, Image as ImageIcon, X } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Pre } from "./MarkdownComponents";
import { CustomAudioPlayer } from "./CustomAudioPlayer";

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

  // Preserve empty lines: markdown collapses consecutive blank lines into a
  // single paragraph break. Replace extra blank lines with non-breaking space
  // paragraphs so they render as visible empty space.
  const preserveEmptyLines = (text: string) =>
    text.replace(/\n{2,}/g, (match) => {
      const n = match.length; // number of consecutive newlines
      if (n === 2) return '\n\n'; // standard paragraph break — keep as-is
      // For each extra blank line beyond the first, insert a &nbsp; paragraph
      let result = '\n\n';
      for (let i = 0; i < n - 2; i++) {
        result += '\u00A0\n\n';
      }
      return result;
    });

  // Trim content to 35 lines
  const lines = note.content?.split('\n') || [];
  const MAX_LINES = 35;
  const isTrimmed = lines.length > MAX_LINES;
  const rawContent = isTrimmed ? lines.slice(0, MAX_LINES).join('\n') : (note.content || '');
  const displayContent = preserveEmptyLines(rawContent);

  return (
    <>
      <div
        className={`relative group flex flex-col gap-3 rounded-none border-2 border-foreground bg-background p-4 shadow-hard transition-all max-w-full min-w-0 overflow-hidden ${isOverlay ? "scale-105 rotate-2 shadow-hard-lg z-50 cursor-grabbing" : "hover:-translate-y-1 hover:shadow-hard-lg"}`}
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

        {/* Title */}
        {note.title && (
          <h3
            className="text-base font-bold leading-snug tracking-tight cursor-pointer line-clamp-2"
            onClick={() => onView?.(note)}
          >
            {note.title}
          </h3>
        )}

        {/* Content Area */}
        <div
          className="space-y-3 cursor-pointer overflow-hidden"
          onClick={() => onView?.(note)}
        >
          {/* Media Grid (Preview) - Moved to top */}
          {note.media_assets && note.media_assets.length > 0 && (
            <div 
              className={`grid gap-2 ${note.media_assets.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
              onClick={(e) => e.stopPropagation()}
            >
              {note.media_assets.slice(0, 2).map((asset, idx) => (
                <div 
                  key={asset.id} 
                  className="relative aspect-video w-full overflow-hidden border border-foreground/10 bg-secondary/30 cursor-zoom-in"
                  onClick={() => asset.mime_type.startsWith("image/") && setPreviewImage(getAssetUrl(asset.url))}
                >
                  {asset.mime_type.startsWith("image/") ? (
                    <div className="relative h-full w-full">
                      <img 
                        src={getAssetUrl(asset.url)} 
                        alt="Note attachment" 
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                        loading="lazy"
                      />
                      {idx === 1 && note.media_assets.length > 2 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">+{note.media_assets.length - 2}</span>
                        </div>
                      )}
                    </div>
                  ) : asset.mime_type.startsWith("audio/") ? (
                    <div className="flex h-full w-full items-center justify-center bg-secondary/50 p-2" onClick={(e) => e.stopPropagation()}>
                       <audio 
                        src={getAssetUrl(asset.url)} 
                        controls 
                        className="w-full max-h-8 h-8"
                       />
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

          {note.content && (
            <div className="relative prose prose-sm dark:prose-invert max-w-none break-words [overflow-wrap:anywhere] [word-break:break-word] prose-headings:font-bold prose-headings:tracking-tight prose-h1:text-xl prose-h1:mt-4 prose-h1:mb-2 prose-h2:text-lg prose-h2:mt-3 prose-h2:mb-1.5 prose-h3:text-base prose-h3:mt-2 prose-h3:mb-1 prose-p:text-sm prose-p:leading-relaxed prose-p:my-1.5 prose-a:text-primary prose-a:font-bold prose-a:underline prose-code:text-foreground prose-code:bg-secondary/50 prose-code:px-1 prose-code:rounded prose-code:font-mono prose-code:before:content-none prose-code:after:content-none prose-pre:bg-secondary/50 prose-pre:text-foreground prose-pre:border prose-pre:border-border prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-li:marker:text-muted-foreground [&_br]:block [&_br]:content-[''] [&_br]:mt-1">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{
                  pre: Pre,
                  input: ({ checked, disabled, ...props }) => {
                    return (
                      <input
                        type="checkbox"
                        checked={!!checked}
                        disabled={false}
                        onChange={(e) => {
                          e.stopPropagation();
                          // Calculate index at click time by finding position among all checkboxes
                          const container = e.currentTarget.closest('.prose');
                          if (container) {
                            const allCheckboxes = container.querySelectorAll('input[type="checkbox"]');
                            const index = Array.from(allCheckboxes).indexOf(e.currentTarget);
                            if (index !== -1) {
                              handleTodoToggle(index);
                            }
                          }
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
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background from-30% to-transparent flex items-end justify-center pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-background/80 px-2 py-0.5 rounded-full shadow-sm">Click to read more</span>
                </div>
              )}
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
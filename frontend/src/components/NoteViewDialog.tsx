"use client";

import { useEffect, useState } from "react";
import { X, Edit2, ArrowLeft, Trash2, GripVertical } from "lucide-react";
import { Note } from "@/lib/types";
import { NoteForm } from "./NoteForm";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { formatDistanceToNow } from "date-fns";

interface NoteViewDialogProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onSuccess: () => void;
  onToggleTodo?: (note: Note, index: number) => void;
}

export function NoteViewDialog({
  note,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onSuccess,
  onToggleTodo,
}: NoteViewDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsEditing(false); // Default to view mode when opening
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;
  if (!note && !isEditing) return null;

  const getAssetUrl = (url: string) => `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${url}`;

  return (
    <>
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-200 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className={`relative w-full max-w-4xl max-h-[90vh] flex flex-col transform overflow-hidden rounded-none border-4 border-foreground bg-background shadow-hard-lg transition-all duration-300 ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-8"}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-4 border-foreground p-4 bg-secondary/10">
           <div className="flex items-center gap-4">
              {isEditing ? (
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 text-sm font-bold uppercase hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to View
                </button>
              ) : (
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                    Note Details — {formatDistanceToNow(new Date(note!.created_at), { addSuffix: true })}
                </span>
              )}
           </div>
           
           <div className="flex items-center gap-2">
              {!isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 border-2 border-foreground bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-hard-sm hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (note) onDelete(note.id);
                      onClose();
                    }}
                    className="flex items-center gap-2 border-2 border-foreground bg-destructive px-3 py-1.5 text-xs font-bold text-white shadow-hard-sm hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="ml-2 p-1 border-2 border-foreground bg-background hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
           </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          {isEditing ? (
            <div className="max-w-2xl mx-auto">
               <NoteForm 
                initialNote={note!}
                onSuccess={() => {
                  setIsEditing(false);
                  onSuccess();
                }}
                onCancel={() => setIsEditing(false)}
              />
            </div>
          ) : (
            <div className="space-y-8">
               {/* Media Assets - Moved to top */}
               {note!.media_assets && note!.media_assets.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b-2 border-foreground/10">
                     {note!.media_assets.map((asset) => (
                        <div key={asset.id} className="flex flex-col gap-2 group">
                           <div 
                            className="relative aspect-video w-full overflow-hidden border-2 border-foreground bg-secondary/20 shadow-hard-sm group-hover:shadow-hard transition-all cursor-zoom-in"
                            onClick={() => asset.mime_type.startsWith("image/") && setPreviewImage(getAssetUrl(asset.url))}
                           >
                              {asset.mime_type.startsWith("image/") ? (
                                  <img 
                                      src={getAssetUrl(asset.url)} 
                                      alt="Attachment" 
                                      className="h-full w-full object-contain transition-transform group-hover:scale-[1.02]"
                                  />
                              ) : (
                                  <div className="flex h-full w-full items-center justify-center font-mono text-sm uppercase font-bold text-muted-foreground">
                                      {asset.mime_type}
                                  </div>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>
               )}

               {/* Markdown Content */}
               <div className="prose prose-lg dark:prose-invert max-w-none break-words [overflow-wrap:anywhere] prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-p:leading-relaxed prose-a:text-primary prose-pre:border-2 prose-pre:border-foreground prose-pre:bg-secondary/20 prose-pre:rounded-none prose-img:border-2 prose-img:border-foreground">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                    components={{
                      input: ({ checked, disabled, ...props }) => {
                        return (
                          <input
                            type="checkbox"
                            checked={!!checked}
                            disabled={false}
                            onChange={(e) => {
                              // Calculate index at click time by finding position among all checkboxes
                              const container = e.currentTarget.closest('.prose');
                              if (container && note && onToggleTodo) {
                                const allCheckboxes = container.querySelectorAll('input[type="checkbox"]');
                                const index = Array.from(allCheckboxes).indexOf(e.currentTarget);
                                if (index !== -1) {
                                  onToggleTodo(note, index);
                                }
                              }
                            }}
                            className="mr-2 h-5 w-5 accent-primary cursor-pointer align-middle"
                            {...props}
                          />
                        );
                      },
                    }}
                  >
                    {note!.content || ""}
                  </ReactMarkdown>
               </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-4 border-foreground p-4 bg-secondary/5 flex justify-between items-center text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground/60">
           <span>Created: {new Date(note?.created_at || '').toLocaleString()}</span>
           <span>Last Updated: {new Date(note?.updated_at || '').toLocaleString()}</span>
        </div>
      </div>
    </div>

    {/* Image Preview Modal */}
    {previewImage && (
      <div 
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        onClick={() => setPreviewImage(null)}
      >
        <div className="relative max-h-[95vh] max-w-[95vw] overflow-hidden rounded-lg shadow-2xl border-2 border-white/20">
          <button 
            onClick={() => setPreviewImage(null)}
            className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 backdrop-blur-md border border-white/10"
          >
            <X className="h-6 w-6" />
          </button>
          <img 
            src={previewImage} 
            alt="Preview" 
            className="max-h-[95vh] w-auto object-contain"
          />
        </div>
      </div>
    )}
    </>
  );
}

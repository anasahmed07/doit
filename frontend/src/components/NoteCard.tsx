"use client";

import { Note } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Edit2, GripVertical, Image as ImageIcon, X, Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onEdit: (note: Note) => void;
  isOverlay?: boolean; // For drag overlay
}

export function NoteCard({ note, onDelete, onEdit, isOverlay = false }: NoteCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const getAssetUrl = (url: string) => `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${url}`;

  return (
    <>
        <div
        className={`relative group flex flex-col gap-3 rounded-none border-2 border-foreground bg-background p-4 shadow-hard transition-all ${
            isOverlay ? "scale-105 rotate-2 shadow-hard-lg z-50 cursor-grabbing" : "hover:-translate-y-1 hover:shadow-hard-lg"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        >
        {/* Header / Drag Handle */}
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
                <button className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none">
                    <GripVertical className="h-4 w-4" />
                </button>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                    {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                </span>
            </div>
            
            <div className={`flex gap-1 transition-opacity ${isHovered || isOverlay ? "opacity-100" : "opacity-0"}`}>
                <button
                    onClick={() => onEdit(note)}
                    className="p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    title="Edit Note"
                >
                    <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                    onClick={() => onDelete(note.id)}
                    className="p-1.5 text-muted-foreground hover:bg-destructive hover:text-white"
                    title="Delete Note"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
            {note.content && (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:text-sm prose-p:leading-relaxed prose-a:text-primary prose-code:bg-secondary prose-code:px-1 prose-code:rounded prose-pre:bg-secondary/50 prose-pre:border prose-pre:border-border">
                    <ReactMarkdown>{note.content}</ReactMarkdown>
                </div>
            )}

            {/* Media Grid */}
            {note.media_assets && note.media_assets.length > 0 && (
                <div className={`grid gap-2 ${note.media_assets.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                    {note.media_assets.map((asset) => (
                        <div key={asset.id} className="relative aspect-video w-full overflow-hidden border border-foreground/10 bg-secondary/30 group/media">
                            {asset.mime_type.startsWith("image/") ? (
                                <div 
                                    className="relative h-full w-full cursor-zoom-in"
                                    onClick={() => setPreviewImage(getAssetUrl(asset.url))}
                                >
                                    <img 
                                        src={getAssetUrl(asset.url)} 
                                        alt="Note attachment" 
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover/media:scale-110"
                                        loading="lazy"
                                    />
                                </div>
                            ) : asset.mime_type.startsWith("audio/") ? (
                                <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-secondary/20 p-2">
                                    <audio controls className="w-full max-w-[200px] h-8">
                                        <source src={getAssetUrl(asset.url)} type={asset.mime_type} />
                                        Your browser does not support the audio element.
                                    </audio>
                                    <span className="text-[10px] font-mono uppercase text-muted-foreground">Audio Clip</span>
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

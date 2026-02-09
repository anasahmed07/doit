"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, X, Plus, Trash2 } from "lucide-react";
import { ChatPanel } from "./ChatPanel";
import type { Conversation } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { usePathname } from "next/navigation";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showList, setShowList] = useState(false);
  const pathname = usePathname();

  // Don't render the widget on the /chat page (it has its own full UI)
  if (pathname === "/chat") return null;

  const loadConversations = async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data: Conversation[] = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    loadConversations();
  };

  const handleConversationCreated = (id: string) => {
    setActiveConversationId(id);
    loadConversations();
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (activeConversationId === id) {
          setActiveConversationId(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-all hover:scale-110 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          title="Open chat"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed bottom-0 right-0 z-50 flex h-[85vh] w-full flex-col bg-card shadow-2xl transition-all lg:bottom-6 lg:right-6 lg:h-[600px] lg:w-[450px] lg:rounded-2xl lg:border lg:border-border/50">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 p-4 bg-muted/30 lg:rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold leading-none">DoIt Assistant</h3>
                  <button
                    onClick={() => setShowList(!showList)}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors mt-1"
                  >
                    {showList ? "Back to Chat" : "View Conversations"}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setActiveConversationId(null);
                    setShowList(false);
                  }}
                  className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  title="New conversation"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  title="Close chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col bg-background lg:rounded-b-2xl">
              {showList ? (
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                      <MessageSquare className="h-8 w-8 opacity-20" />
                      <p className="text-xs">No conversations yet.</p>
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={`group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-all hover:bg-secondary/50 ${
                          activeConversationId === conv.id ? "bg-secondary" : ""
                        }`}
                      >
                        <button
                          className="flex-1 min-w-0"
                          onClick={() => {
                            setActiveConversationId(conv.id);
                            setShowList(false);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium text-foreground">
                              {conv.title || "New conversation"}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                          </p>
                        </button>
                        <button
                          onClick={(e) => handleDeleteConversation(conv.id, e)}
                          className="shrink-0 rounded-md p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <ChatPanel
                  conversationId={activeConversationId}
                  onConversationCreated={handleConversationCreated}
                />
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

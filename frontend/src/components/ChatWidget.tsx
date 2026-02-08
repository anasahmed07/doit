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
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center border border-border bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
          title="Open chat"
        >
          <MessageSquare className="h-5 w-5" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed bottom-0 right-0 z-50 flex h-full w-full flex-col border-l border-border bg-card shadow-xl lg:bottom-6 lg:right-6 lg:h-[600px] lg:w-[400px] lg:border">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowList(!showList)}
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                >
                  {showList ? "Back to Chat" : "Conversations"}
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setActiveConversationId(null);
                    setShowList(false);
                  }}
                  className="p-1.5 text-muted-foreground hover:text-foreground"
                  title="New conversation"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground"
                  title="Close chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            {showList ? (
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    No conversations yet.
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setActiveConversationId(conv.id);
                        setShowList(false);
                      }}
                      className={`flex w-full items-center gap-2 border-b border-border px-3 py-2.5 text-left hover:bg-muted ${
                        activeConversationId === conv.id ? "bg-muted" : ""
                      }`}
                    >
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm text-foreground">
                          {conv.title || "New conversation"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteConversation(conv.id, e)}
                        className="shrink-0 p-1 text-muted-foreground hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <ChatPanel
                key={activeConversationId || "new"}
                conversationId={activeConversationId}
                onConversationCreated={handleConversationCreated}
              />
            )}
          </div>
        </>
      )}
    </>
  );
}

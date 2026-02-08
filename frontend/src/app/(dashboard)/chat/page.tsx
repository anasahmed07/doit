"use client";

import { useState, useEffect, useCallback } from "react";
import { ChatPanel } from "@/components/ChatPanel";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import type { Conversation } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data: Conversation[] = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleNewConversation = () => {
    setActiveConversationId(null);
  };

  const handleConversationCreated = (id: string) => {
    setActiveConversationId(id);
    // Reload conversation list to show the new one
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
    <div className="flex h-full">
      {/* Conversation Sidebar */}
      <div className="hidden w-72 flex-col border-r border-border bg-card md:flex">
        <div className="flex items-center justify-between border-b border-border p-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Conversations
          </h2>
          <button
            onClick={handleNewConversation}
            className="flex h-7 w-7 items-center justify-center border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            title="New conversation"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoadingConversations ? (
            <div className="p-3 text-xs text-muted-foreground">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-3 text-xs text-muted-foreground">
              No conversations yet. Start chatting!
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`flex w-full items-center gap-2 border-b border-border px-3 py-2.5 text-left transition-colors hover:bg-muted ${
                  activeConversationId === conv.id
                    ? "bg-muted border-l-2 border-l-primary"
                    : ""
                }`}
              >
                <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
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
                  className="shrink-0 p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 hover:opacity-100"
                  title="Delete conversation"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Panel */}
      <div className="flex flex-1 flex-col">
        {/* Mobile conversation selector */}
        <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-2 md:hidden">
          <select
            value={activeConversationId || ""}
            onChange={(e) =>
              setActiveConversationId(e.target.value || null)
            }
            className="flex-1 border border-border bg-background px-2 py-1 text-sm text-foreground"
          >
            <option value="">New conversation</option>
            {conversations.map((conv) => (
              <option key={conv.id} value={conv.id}>
                {conv.title || "Untitled"}
              </option>
            ))}
          </select>
          <button
            onClick={handleNewConversation}
            className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground hover:bg-muted"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <ChatPanel
          key={activeConversationId || "new"}
          conversationId={activeConversationId}
          onConversationCreated={handleConversationCreated}
        />
      </div>
    </div>
  );
}
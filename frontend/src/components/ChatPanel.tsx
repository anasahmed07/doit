"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ChatInput } from "./ChatInput";
import { ChatMessageList } from "./ChatMessageList";
import type { ChatMessage, SSEEvent } from "@/lib/types";

interface ChatPanelProps {
  conversationId: string | null;
  onConversationCreated?: (id: string) => void;
  onResponseDone?: () => void;
}

export function ChatPanel({ 
  conversationId: externalConvId, 
  onConversationCreated,
  onResponseDone 
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Internal conversation ID that only this component controls
  const [internalConvId, setInternalConvId] = useState<string | null>(externalConvId);
  const prevExternalId = useRef(externalConvId);

  // Sync from external prop only when it's a genuine navigation change
  // (user clicked a different conversation in the sidebar)
  useEffect(() => {
    if (externalConvId !== prevExternalId.current) {
      prevExternalId.current = externalConvId;
      setInternalConvId(externalConvId);
      setMessages([]);
      setStreamingContent("");
      setIsStreaming(false);
    }
  }, [externalConvId]);

  // Load messages when internalConvId changes (navigation or initial load)
  useEffect(() => {
    if (!internalConvId) return;
    
    // If we already have messages (e.g. from just creating the conversation), 
    // don't reload and trigger a loading state. 
    // Navigation to a different chat clears messages first, so this is safe.
    if (messages.length > 0) return;

    let cancelled = false;

    async function loadMessages() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/conversations/${internalConvId}/messages`);
        if (res.ok) {
          const data: ChatMessage[] = await res.json();
          if (!cancelled) {
            setMessages(data);
          }
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadMessages();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internalConvId]);

  const sendMessage = useCallback(
    async (content: string) => {
      // Optimistically add user message
      const tempUserMsg: ChatMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: internalConvId || "",
        role: "user",
        content,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMsg]);
      setIsStreaming(true);
      setStreamingContent("");

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversation_id: internalConvId,
            message: content,
          }),
        });

        if (!res.ok) {
          throw new Error(`Chat error: ${res.status}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let accumulated = "";
        let fullAssistantContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          accumulated += decoder.decode(value, { stream: true });

          // Parse SSE lines
          const lines = accumulated.split("\n");
          // Keep the last potentially incomplete line
          accumulated = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const event: SSEEvent = JSON.parse(jsonStr);

              if (event.type === "text_delta" && event.content) {
                fullAssistantContent += event.content;
                setStreamingContent(fullAssistantContent);
              } else if (event.type === "done") {
                // Finalize: add assistant message to list
                if (fullAssistantContent.trim()) {
                  const assistantMsg: ChatMessage = {
                    id: event.message_id || `msg-${Date.now()}`,
                    conversation_id: event.conversation_id || internalConvId || "",
                    role: "assistant",
                    content: fullAssistantContent,
                    created_at: new Date().toISOString(),
                  };
                  setMessages((prev) => [...prev, assistantMsg]);
                }

                // Update internal ID and notify parent (without causing remount)
                if (event.conversation_id && !internalConvId) {
                  setInternalConvId(event.conversation_id);
                  prevExternalId.current = event.conversation_id;
                  onConversationCreated?.(event.conversation_id);
                }
              } else if (event.type === "error") {
                const errorMsg: ChatMessage = {
                  id: `error-${Date.now()}`,
                  conversation_id: internalConvId || "",
                  role: "assistant",
                  content: `⚠️ ${event.content || "An error occurred. Please try again."}`,
                  created_at: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, errorMsg]);
              }
            } catch {
              // Skip unparseable lines
            }
          }
        }
      } catch (err: unknown) {
        console.error("Chat error:", err);
        const is401 = err instanceof Error && err.message.includes("401");
        const errorContent = is401
          ? "Your session has expired. Please refresh the page and sign in again."
          : "Failed to connect to the chat service. Please check your connection and try again.";
        const errorMsg: ChatMessage = {
          id: `error-${Date.now()}`,
          conversation_id: internalConvId || "",
          role: "assistant",
          content: `⚠️ ${errorContent}`,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
        onResponseDone?.();
      }
    },
    [internalConvId, onConversationCreated, onResponseDone]
  );

  return (
    <div className="flex h-full flex-col">
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
          Loading messages...
        </div>
      ) : (
        <ChatMessageList
          messages={messages}
          streamingContent={streamingContent}
          isStreaming={isStreaming}
        />
      )}
      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}

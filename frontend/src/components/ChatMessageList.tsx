"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Bot, User } from "lucide-react";

interface MessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatMessageListProps {
  messages: MessageItem[];
  streamingContent?: string;
  isStreaming?: boolean;
}

export function ChatMessageList({
  messages,
  streamingContent = "",
  isStreaming = false,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {messages.length === 0 && !isStreaming && (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <Bot className="h-12 w-12 mb-3 opacity-50" />
          <p className="text-sm font-medium">DoIt Assistant</p>
          <p className="text-xs mt-1">Ask me to manage your tasks, notes, or projects.</p>
        </div>
      )}

      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          {msg.role === "assistant" && (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-border bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </div>
          )}
          <div
            className={`max-w-[80%] border border-border px-3 py-2 text-sm ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-card-foreground"
            }`}
          >
            {msg.role === "assistant" ? (
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                  {msg.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{msg.content}</p>
            )}
          </div>
          {msg.role === "user" && (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-border bg-accent text-accent-foreground">
              <User className="h-4 w-4" />
            </div>
          )}
        </div>
      ))}

      {/* Streaming message */}
      {isStreaming && streamingContent && (
        <div className="flex gap-3 justify-start">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-border bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </div>
          <div className="max-w-[80%] border border-border bg-card px-3 py-2 text-sm text-card-foreground">
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                {streamingContent}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* Streaming indicator */}
      {isStreaming && !streamingContent && (
        <div className="flex gap-3 justify-start">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-border bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </div>
          <div className="border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
            <span className="inline-flex gap-1">
              <span className="animate-pulse">●</span>
              <span className="animate-pulse" style={{ animationDelay: "0.2s" }}>●</span>
              <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>●</span>
            </span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

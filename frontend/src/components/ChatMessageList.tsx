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
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      {messages.length === 0 && !isStreaming && (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/50">
            <Bot className="h-8 w-8 opacity-50" />
          </div>
          <div className="text-center max-w-[200px]">
            <p className="text-sm font-semibold text-foreground">DoIt Assistant</p>
            <p className="text-xs mt-1">Ask me to manage your tasks, notes, or projects.</p>
          </div>
        </div>
      )}

      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          {msg.role === "assistant" && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background shadow-sm">
              <Bot className="h-4 w-4 text-primary" />
            </div>
          )}
          <div
            className={`max-w-[85%] px-4 py-3 text-sm shadow-sm ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                : "bg-card text-card-foreground border border-border/50 rounded-2xl rounded-tl-sm"
            }`}
          >
            {msg.role === "assistant" ? (
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-headings:text-foreground prose-a:text-primary">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                  {msg.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{msg.content}</p>
            )}
          </div>
          {msg.role === "user" && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-sm">
              <User className="h-4 w-4" />
            </div>
          )}
        </div>
      ))}

      {/* Streaming message */}
      {isStreaming && streamingContent && (
        <div className="flex gap-3 justify-start">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background shadow-sm">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div className="max-w-[85%] border border-border/50 bg-card px-4 py-3 text-sm text-card-foreground rounded-2xl rounded-tl-sm shadow-sm">
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
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background shadow-sm">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div className="border border-border/50 bg-card px-4 py-3 text-sm text-muted-foreground rounded-2xl rounded-tl-sm shadow-sm">
            <span className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

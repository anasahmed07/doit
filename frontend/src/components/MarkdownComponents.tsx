"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function Pre({ children, ...props }: any) {
  const [copied, setCopied] = useState(false);

  const extractText = (node: any): string => {
    if (typeof node === "string") return node;
    if (Array.isArray(node)) return node.map(extractText).join("");
    if (node?.props?.children) return extractText(node.props.children);
    return "";
  };

  const handleCopy = async () => {
    const text = extractText(children);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="relative group/code">
      <pre {...props} className={`${props.className} !mt-0 !mb-0`}>
        {children}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 p-1.5 rounded-md bg-secondary/80 text-muted-foreground hover:text-foreground opacity-0 group-hover/code:opacity-100 transition-opacity border border-border"
        title="Copy code"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

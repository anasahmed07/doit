"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Send } from "lucide-react";

interface InviteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onInviteSent?: () => void;
}

export function InviteDialog({
  isOpen,
  onClose,
  projectId,
  onInviteSent,
}: InviteDialogProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId, email: email.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to send invitation");
      }

      setSuccess(`Invitation sent to ${email.trim()}`);
      setEmail("");
      onInviteSent?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md border-2 border-foreground bg-background p-6 shadow-hard animate-in fade-in zoom-in-95 duration-200">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-black uppercase tracking-tight">
            Invite Member
          </h2>
          <button
            onClick={onClose}
            className="rounded-none p-1 text-muted-foreground hover:bg-destructive hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="invite-email"
              className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground"
            >
              Email Address
            </label>
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-none border-2 border-input bg-transparent px-3 py-2 text-sm font-bold placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:shadow-hard-sm"
              placeholder="colleague@example.com"
              autoFocus
            />
          </div>

          {error && (
            <div className="border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="border border-green-500/20 bg-green-500/10 px-3 py-2 text-xs font-medium text-green-700 dark:text-green-400">
              {success}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 border-2 border-transparent px-4 text-sm font-bold text-muted-foreground hover:text-foreground hover:underline disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              className="flex h-10 items-center justify-center gap-2 border-2 border-foreground bg-primary px-6 text-sm font-bold text-white shadow-hard-sm transition-transform hover:-translate-y-0.5 hover:shadow-hard active:translate-y-0 active:shadow-hard-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

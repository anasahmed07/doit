"use client";

import { useState, useEffect } from "react";
import { X, Bell, AlertCircle, Clock, UserPlus, Mail, Loader2, CheckCheck } from "lucide-react";
import { Notification } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const typeConfig: Record<string, { icon: typeof AlertCircle; color: string; bg: string }> = {
  overdue: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
  due_soon: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  task_assigned: { icon: UserPlus, color: "text-blue-500", bg: "bg-blue-500/10" },
  project_invitation: { icon: Mail, color: "text-purple-500", bg: "bg-purple-500/10" },
  invitation_accepted: { icon: CheckCheck, color: "text-green-500", bg: "bg-green-500/10" },
};

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      if (!res.ok) return;
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      // silently ignore
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications/read-all", { method: "PATCH" });
      if (!res.ok) return;
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // silently ignore
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md h-full bg-background border-l-2 border-foreground shadow-hard-lg animate-in slide-in-from-right duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-foreground/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-primary/10 rounded-lg">
              <Bell className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight">Notifications</h2>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                {unreadCount} unread
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border-2 border-foreground bg-primary text-white shadow-hard-sm hover:-translate-y-0.5 hover:shadow-hard active:translate-y-0 transition-all"
              >
                Mark All Read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:bg-destructive hover:text-white transition-colors rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Bell className="h-10 w-10 mb-4 opacity-20" />
              <p className="text-sm font-bold">No notifications</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                You&apos;re all caught up!
              </p>
            </div>
          ) : (
            notifications.map((notification) => {
              const config = typeConfig[notification.type] || typeConfig.due_soon;
              const Icon = config.icon;
              return (
                <button
                  key={notification.id}
                  onClick={() => {
                    if (!notification.is_read) markAsRead(notification.id);
                  }}
                  className={`w-full text-left border-2 border-foreground/20 bg-background p-4 space-y-2 hover:border-foreground/40 transition-colors ${
                    !notification.is_read ? "border-l-4 border-l-primary" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold leading-relaxed ${
                        notification.is_read ? "text-muted-foreground" : "text-foreground"
                      }`}>
                        {notification.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 break-words">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";

interface NotificationBellProps {
  onClick: () => void;
}

export function NotificationBell({ onClick }: NotificationBellProps) {
  const [count, setCount] = useState(0);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/unread-count");
      if (!res.ok) return;
      const data = await res.json();
      setCount(data.count);
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
      title="Notifications"
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

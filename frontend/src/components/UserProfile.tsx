"use client";

import { useEffect, useState } from "react";
import { Settings, LogOut, User as UserIcon, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { User } from "@/lib/types";
import { auth } from "@/lib/auth";

export function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/auth/me");
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    try {
      // Use Better Auth client to sign out
      await auth.signOut();
      // Redirect to sign-in page after successful sign-out
      window.location.href = "/sign-in";
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <div className="border-t-2 border-foreground bg-secondary/30 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 flex items-center justify-center rounded-none border-2 border-foreground bg-white">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : user?.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserIcon className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-none">
              {isLoading ? 'Loading...' : user?.name || 'Anonymous'}
            </span>
            <span className="text-xs text-muted-foreground">
               {user ? 'Pro Plan' : 'Free Plan'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 text-muted-foreground hover:text-foreground" title="Settings">
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={handleSignOut}
            className="p-1 text-muted-foreground hover:text-destructive"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

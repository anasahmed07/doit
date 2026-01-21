"use client";

import { useEffect, useState, useRef } from "react";
import { Settings, LogOut, User as UserIcon, Loader2 } from "lucide-react";
import { User } from "@/lib/types";
import { authClient } from "@/lib/auth-client";

interface UserProfileProps {
  minimal?: boolean;
}

export function UserProfile({ minimal = false }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // @ts-ignore
        const { data } = await authClient.session();
        if (data && data.session && data.session.user) {
          setUser(data.session.user);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      localStorage.removeItem('bearer_token'); // Explicitly remove the token
      window.location.href = "/sign-in";
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  if (minimal) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="h-9 w-9 overflow-hidden rounded-full border border-border bg-secondary hover:ring-2 hover:ring-primary/20 transition-all focus:outline-none"
        >
          {isLoading ? (
            <div className="flex h-full w-full items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : user?.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground font-bold text-xs">
              {user?.name?.[0] || <UserIcon className="h-4 w-4" />}
            </div>
          )}
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-md border border-border bg-background shadow-lg z-50 py-1">
             <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground mt-1">{user?.email}</p>
             </div>
             <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
             >
                <LogOut className="h-4 w-4" />
                Sign Out
             </button>
          </div>
        )}
      </div>
    );
  }

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

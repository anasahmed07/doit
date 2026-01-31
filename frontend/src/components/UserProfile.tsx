"use client";

import { useEffect, useState, useRef } from "react";
import { Settings, LogOut, User as UserIcon, Loader2, Sun, Moon } from "lucide-react";
import { User } from "@/lib/types";
import { authClient } from "@/lib/auth-client";
import { useTheme } from "next-themes";

interface UserProfileProps {
  minimal?: boolean;
}

export function UserProfile({ minimal = false }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const fetchUser = async () => {
      try {
        const { data } = await authClient.getSession();
        if (data && data.user) {
          setUser(data.user);
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
      localStorage.removeItem('bearer_token');
      window.location.href = "/sign-in";
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const isLight = mounted && (theme === "light" || (theme === "system" && resolvedTheme === "light"));
  const isDark = mounted && (theme === "dark" || (theme === "system" && resolvedTheme === "dark"));

  const ThemeToggle = () => (
    <div className="flex items-center justify-between px-4 py-2 text-sm border-b border-border">
      <span className="text-muted-foreground">Theme</span>
      <div className="flex bg-secondary/50 rounded p-0.5 border border-border">
        <button
          onClick={() => setTheme("light")}
          className={`p-1 rounded transition-all ${isLight ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
          title="Light Mode"
        >
          <Sun className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setTheme("dark")}
          className={`p-1 rounded transition-all ${isDark ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
          title="Dark Mode"
        >
          <Moon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );

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
          <div className="absolute right-0 mt-2 w-56 rounded-md border-2 border-foreground bg-background shadow-hard z-50 py-1">
             <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-bold leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground mt-1.5">{user?.email}</p>
             </div>
             
             <ThemeToggle />

             <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
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
    <div className="relative border-t-2 border-foreground bg-secondary/30 p-4" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 flex items-center justify-center rounded-none border-2 border-foreground bg-card">
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
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`p-1.5 transition-colors ${isDropdownOpen ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`} 
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isDropdownOpen && (
        <div className="absolute bottom-full right-4 mb-2 w-56 rounded-none border-2 border-foreground bg-background shadow-hard z-50 py-1">
           <div className="px-4 py-3 border-b-2 border-foreground bg-secondary/20">
              <p className="text-sm font-bold leading-none">{user?.name}</p>
              <p className="text-[10px] font-mono leading-none text-muted-foreground mt-1.5 truncate">{user?.email}</p>
           </div>
           
           <ThemeToggle />

           <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-destructive hover:bg-destructive hover:text-white transition-all"
           >
              <LogOut className="h-4 w-4" />
              Sign Out
           </button>
        </div>
      )}
    </div>
  );
}

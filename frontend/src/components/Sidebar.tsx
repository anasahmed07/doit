"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Plus,
  Grid,
  Layout,
  ChevronRight,
  Loader2,
  Sun,
  Moon
} from "lucide-react";
import { Category } from "@/lib/types";
import { CreateCategoryDialog } from "@/components/CreateCategoryDialog";
import { UserProfile } from "@/components/UserProfile";

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && (theme === "light" || (theme === "system" && resolvedTheme === "light"));
  const isDark = mounted && (theme === "dark" || (theme === "system" && resolvedTheme === "dark"));

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-foreground/10 bg-background/50 backdrop-blur-xl">
      {/* Header */}
      <div className="flex h-20 items-center px-6 border-b border-foreground/10">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="font-pixel text-xl font-bold tracking-tighter uppercase group-hover:scale-105 transition-transform">DOIT</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-10">
        <div className="space-y-3">
          <h3 className="px-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">
            Main Menu
          </h3>
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                pathname === "/dashboard"
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <Grid className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/projects"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                pathname === "/projects"
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <Layout className="h-4 w-4" />
              Projects
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between px-3">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">
              Categories
            </h3>
            <button
              className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
              onClick={() => setIsCreateCategoryOpen(true)}
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-4 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : categories.map((category) => (
              <Link
                key={category.id}
                href={`/dashboard?category=${category.id}`}
                className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary/50 hover:text-foreground"
              >
                <div className="flex items-center gap-3">
                  <span 
                    className="h-2 w-2 rounded-full ring-2 ring-opacity-20 ring-current" 
                    style={{ color: category.color, backgroundColor: category.color }} 
                  />
                  <span>{category.name}</span>
                </div>
                <ChevronRight className="h-3 w-3 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Theme Toggle */}
      <div className="px-4 py-3 border-t border-foreground/10">
        <div className="flex items-center justify-center bg-secondary/50 border border-border rounded-md p-1">
          <button
            onClick={() => setTheme("light")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all flex-1 justify-center ${
              isLight ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sun className="h-3 w-3" /> Light
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all flex-1 justify-center ${
              isDark ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Moon className="h-3 w-3" /> Dark
          </button>
        </div>
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-foreground/10">
         <UserProfile />
      </div>

      <CreateCategoryDialog
        isOpen={isCreateCategoryOpen}
        onClose={() => setIsCreateCategoryOpen(false)}
        onSuccess={fetchCategories}
      />
    </aside>
  );
}

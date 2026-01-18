"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap,
  Plus,
  Grid,
  Layout,
  Settings,
  LogOut,
  ChevronRight,
  Loader2,
  FolderOpen
} from "lucide-react";
import api from "@/lib/api";
import { Category } from "@/lib/types";
import { CreateCategoryDialog } from "@/components/CreateCategoryDialog";
import { UserProfile } from "@/components/UserProfile";

export function Sidebar() {
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories/");
      setCategories(response.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
      // setError("Failed to load categories"); // Optional: suppress error for cleaner UI if empty
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <aside className="flex h-screen w-64 flex-col border-r-2 border-foreground bg-background">
      {/* Header */}
      <div className="flex h-16 items-center border-b-2 border-foreground px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center bg-primary text-white border-2 border-foreground shadow-hard-sm">
            <Zap className="h-5 w-5" fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-tighter">DoIt.</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8">

        {/* Workspace Section */}
        <div className="space-y-2">
          <h3 className="px-2 text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
            Workspace
          </h3>
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 rounded-none border border-transparent px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-foreground ${
                pathname === "/dashboard"
                  ? "bg-secondary text-foreground border-foreground font-bold shadow-hard-sm"
                  : "text-muted-foreground"
              }`}
            >
              <Grid className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/projects"
              className={`flex items-center gap-3 rounded-none border border-transparent px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-foreground ${
                pathname === "/projects"
                  ? "bg-secondary text-foreground border-foreground font-bold shadow-hard-sm"
                  : "text-muted-foreground"
              }`}
            >
              <Layout className="h-4 w-4" />
              Projects
            </Link>
          </div>
        </div>

        {/* Categories Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
              Categories
            </h3>
            <button
              className="text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setIsCreateCategoryOpen(true)}
              aria-label="Create Category"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-4 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : error ? (
              <div className="px-2 text-xs text-destructive">{error}</div>
            ) : categories.length === 0 ? (
              <div className="px-2 text-xs text-muted-foreground italic">
                No categories yet
              </div>
            ) : (
              categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/dashboard?category=${category.id}`}
                  className="group flex items-center justify-between rounded-none border border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground hover:border-foreground hover:shadow-hard-sm"
                >
                  <div className="flex items-center gap-3">
                    <FolderOpen className="h-4 w-4" style={{ color: category.color }} />
                    <span>{category.name}</span>
                  </div>
                  <ChevronRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))
            )}
          </div>
        </div>

      </nav>

      {/* Footer / User Profile */}
      <UserProfile />

      <CreateCategoryDialog
        isOpen={isCreateCategoryOpen}
        onClose={() => setIsCreateCategoryOpen(false)}
        onSuccess={fetchCategories}
      />
    </aside>
  );
}

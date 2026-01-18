"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap,
  Plus,
  Grid,
  Layout,
  ChevronRight,
  Loader2
} from "lucide-react";
import api from "@/lib/api";
import { Category } from "@/lib/types";
import { CreateCategoryDialog } from "@/components/CreateCategoryDialog";
import { UserProfile } from "@/components/UserProfile";

export function Sidebar() {
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories/");
      setCategories(response.data);
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

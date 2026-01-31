"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Plus,
  Grid,
  Layout,
  ChevronRight,
  ChevronDown,
  Loader2,
  Sun,
  Moon
} from "lucide-react";
import { Category, Project } from "@/lib/types";
import { CreateCategoryDialog } from "@/components/CreateCategoryDialog";
import { UserProfile } from "@/components/UserProfile";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Resizable Sidebar State
  const [width, setWidth] = useState(288); // Default w-72 (18rem * 16)
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing) {
        const newWidth = mouseMoveEvent.clientX;
        if (newWidth >= 200 && newWidth <= 480) {
          setWidth(newWidth);
        }
      }
    },
    [isResizing]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setIsProjectsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProjects();
  }, []);

  return (
    <aside
      ref={sidebarRef}
      className="relative flex h-screen flex-col border-r border-border bg-card transition-none"
      style={{ width: `${width}px` }}
    >
      {/* Drag Handle */}
      <div
        className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/50 active:bg-primary z-50 transition-colors"
        onMouseDown={startResizing}
      />

      {/* Header */}
      <div className="flex h-20 items-center px-6 border-b border-border">
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
            <div className="space-y-1">
              <button
                onClick={() => {
                  router.push("/projects");
                  setIsProjectsOpen(!isProjectsOpen);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  pathname.startsWith("/projects")
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layout className="h-4 w-4" />
                  Projects
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isProjectsOpen ? "" : "-rotate-90"
                  }`}
                />
              </button>
              {isProjectsOpen && (
                <div className="ml-4 space-y-1 border-l border-border pl-3">
                  {isProjectsLoading ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    projects.slice(0, 5).map((project) => (
                      <Link
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className={`group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                          pathname === `/projects/${project.id}`
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className="truncate">{project.name}</span>
                        <ChevronRight className="h-3 w-3 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                      </Link>
                    ))
                  )}
                  {projects.length > 5 && (
                    <Link
                      href="/projects"
                      className="block px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors"
                    >
                      View all ({projects.length})
                    </Link>
                  )}
                </div>
              )}
            </div>
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
      <div className="p-4 border-t border-border">
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

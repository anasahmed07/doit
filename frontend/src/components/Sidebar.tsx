import { Suspense } from "react";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Plus,
  Grid,
  Layout,
  ChevronRight,
  ChevronDown,
  Loader2,
  Sun,
  Moon,
  FileText,
  MessageSquare,
  Trash2
} from "lucide-react";
import { Category, Project } from "@/lib/types";
import { CategoryDialog } from "@/components/CreateCategoryDialog";
import { ProjectCreationDialog } from "@/components/ProjectCreationDialog";
import { UserProfile } from "@/components/UserProfile";
import { useProjects } from "@/components/ProjectsContext";
import { X, Settings2 } from "lucide-react";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { NotificationBell } from "@/components/NotificationBell";
import { NotificationPanel } from "@/components/NotificationPanel";

// Helper to determine text color based on background luminance
function getContrastColor(hexColor: string) {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light backgrounds, white for dark
  return luminance > 0.5 ? "black" : "white";
}

function SidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategoryId = searchParams.get("category");
  const router = useRouter();
  const {
    projects,
    isLoading: isProjectsLoading,
    fetchProjects,
    isSidebarOpen,
    toggleSidebar
  } = useProjects();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

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
        if (isResizing) {
          const newWidth = mouseMoveEvent.clientX;
          if (newWidth >= 200 && newWidth <= 480) {
            setWidth(newWidth);
          }
        }
      }
    },
    [isResizing]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isResizing, resize, stopResizing]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (window.innerWidth < 1024) {
      toggleSidebar(false);
    }
  }, [pathname, currentCategoryId, toggleSidebar]);

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

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      const res = await fetch(`/api/projects/${projectToDelete.id}`, { method: "DELETE" });
      if (res.ok) {
        fetchProjects(); // Reload list
        if (pathname === `/projects/${projectToDelete.id}`) {
          router.push("/projects");
        }
      }
    } catch (err) {
      console.error("Failed to delete project", err);
    } finally {
      setProjectToDelete(null);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => toggleSidebar(false)}
        />
      )}

      <aside
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-[60] flex h-screen flex-col border-r border-border bg-card transition-transform lg:static lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } group/sidebar`}
        style={{ width: `${width}px` }}
      >
        {/* Drag Handle (Desktop only) */}
        <div
          className="absolute -right-1 top-0 h-full w-2 cursor-col-resize z-50 hidden justify-center hover:bg-primary/10 transition-colors lg:flex"
          onMouseDown={startResizing}
        >
          <div className="h-full w-[1px] bg-border group-hover/sidebar:bg-primary transition-colors delay-75" />
        </div>

        {/* Header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-border">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="font-pixel text-xl font-bold tracking-tighter uppercase group-hover:scale-105 transition-transform">DOIT</span>
          </Link>
          <div className="flex items-center gap-1">
            <NotificationBell onClick={() => setIsNotificationPanelOpen(true)} />
            <button
              onClick={() => toggleSidebar(false)}
              className="p-2 text-muted-foreground hover:text-foreground lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-10">
          <div className="space-y-3">
            <h3 className="px-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">
              Main Menu
            </h3>
            
            {/* Dashboard & Notes Group */}
            <div className="space-y-1">
              {/* Dashboard Link */}
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

              {/* Chat Link */}
              <Link
                href="/chat"
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  pathname === "/chat"
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                Chat
              </Link>

              {/* Notes Collapsible */}
              <div className="space-y-1">
                <div className="flex items-center justify-between pr-2 group">
                  <Link
                    href="/notes"
                    onClick={() => {
                      if (!isNotesOpen) {
                        setIsNotesOpen(true);
                      }
                    }}
                    className={`flex flex-1 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      pathname === "/notes" || pathname.startsWith("/notes")
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    Notes
                  </Link>
                  <div className="flex items-center">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setIsNotesOpen(!isNotesOpen);
                      }}
                      className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          isNotesOpen ? "" : "-rotate-90"
                        }`}
                      />
                    </button>
                    <button
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all ml-1"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push("/notes?new=true");
                      }}
                      title="New Note"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {isNotesOpen && (
                  <div className="ml-4 space-y-1 border-l border-border pl-3">
                    {/* Categories Header */}
                    <div className="flex items-center justify-between px-3 py-2 mt-2 group">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                        Categories
                      </span>
                      <button
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
                        onClick={(e) => {
                          e.preventDefault();
                          setEditingCategory(undefined);
                          setIsCategoryDialogOpen(true);
                        }}
                        title="Add Category"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Indented Categories */}
                    <div className="space-y-1 border-l border-border pl-3 ml-1">
                      {isLoading ? (
                        <div className="flex items-center py-2 text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                        </div>
                      ) : categories.map((category) => (
                        <div key={category.id} className="group flex items-center gap-1">
                          <Link
                            href={`/notes?category=${category.id}`}
                            style={{ 
                              backgroundColor: category.color,
                              color: getContrastColor(category.color)
                            }}
                            className={`flex-1 flex items-center justify-between rounded-md px-3 py-1.5 text-xs font-bold transition-all hover:opacity-90 hover:translate-x-1 ${
                              currentCategoryId === category.id
                                ? "ring-2 ring-foreground ring-offset-1"
                                : ""
                            }`}
                          >
                            <span className="truncate">{category.name}</span>
                          </Link>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setEditingCategory(category);
                              setIsCategoryDialogOpen(true);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-foreground transition-opacity"
                            title="Edit Category"
                          >
                            <Settings2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Projects Group */}
            <div className="space-y-1">
              <div className="flex items-center justify-between pr-2 group">
                <Link
                  href="/projects"
                  onClick={() => {
                    // Ensure it opens when navigating
                    if (!isProjectsOpen) {
                      fetchProjects();
                      setIsProjectsOpen(true);
                    }
                  }}
                  className={`flex flex-1 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    pathname.startsWith("/projects")
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
                >
                  <Layout className="h-4 w-4" />
                  Projects
                </Link>
                <div className="flex items-center">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (!isProjectsOpen) {
                         fetchProjects();
                      }
                      setIsProjectsOpen(!isProjectsOpen);
                    }}
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isProjectsOpen ? "" : "-rotate-90"
                      }`}
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setIsProjectDialogOpen(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all ml-1"
                    title="Create Project"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              
              {isProjectsOpen && (
                <div className="ml-4 space-y-1 border-l border-border pl-3">
                  {isProjectsLoading ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    projects.slice(0, 5).map((project) => (
                      <div key={project.id} className="group flex items-center justify-between pr-2">
                        <Link
                          href={`/projects/${project.id}`}
                          className={`flex-1 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                            pathname === `/projects/${project.id}`
                              ? "text-primary"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span className="truncate">{project.name}</span>
                        </Link>
                        {!project.is_default && (
                          <button
                            onClick={async (e) => {
                              e.preventDefault();
                              setProjectToDelete(project);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                            title="Delete Project"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
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
        </nav>

        {/* Footer / User Profile */}
        <div className="p-4 border-t border-border">
           <UserProfile />
        </div>
      </aside>

      <CategoryDialog
        isOpen={isCategoryDialogOpen}
        onClose={() => setIsCategoryDialogOpen(false)}
        onSuccess={fetchCategories}
        initialCategory={editingCategory}
      />

      <ProjectCreationDialog
        isOpen={isProjectDialogOpen}
        onClose={() => setIsProjectDialogOpen(false)}
        onSuccess={() => {
          fetchProjects();
        }}
      />

      <ConfirmationDialog
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={confirmDeleteProject}
        title="Delete Project"
        description={`Are you sure you want to delete the project "${projectToDelete?.name}"? This action cannot be undone and all tasks within it will be removed.`}
        variant="destructive"
        confirmText="Delete Project"
      />

      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
      />
    </>
  );
}

export function Sidebar() {
  return (
    <Suspense fallback={
      <aside className="hidden lg:flex w-72 h-screen border-r border-border bg-card flex-col">
        <div className="h-20 border-b border-border" />
        <div className="flex-1 p-4">
          <div className="h-8 w-3/4 bg-muted/20 animate-pulse rounded mb-4" />
          <div className="h-8 w-1/2 bg-muted/20 animate-pulse rounded mb-4" />
        </div>
      </aside>
    }>
      <SidebarContent />
    </Suspense>
  );
}
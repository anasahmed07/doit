"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Layout, Trash2, Edit2, ChevronRight, Users } from "lucide-react";
import Link from "next/link";
import { Project } from "@/lib/types";
import { ProjectCreationDialog } from "@/components/ProjectCreationDialog";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { useProjects } from "@/components/ProjectsContext";

type Tab = "my" | "collaborations";

function ProjectCard({
  project,
  isCollaboration,
  onEdit,
  onDelete,
}: {
  project: Project;
  isCollaboration?: boolean;
  onEdit: (project: Project, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group relative flex flex-col gap-4 border-2 border-foreground bg-background p-6 shadow-hard transition-all hover:-translate-y-1 hover:shadow-hard-lg"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-black uppercase tracking-tight text-lg group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            {project.is_default && (
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-primary/10 text-primary">
                Default
              </span>
            )}
            {isCollaboration && (
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-purple-500/10 text-purple-500">
                Shared
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
            Framework: {project.framework}
          </span>
        </div>
        {!isCollaboration && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => onEdit(project, e)}
              className="p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              title="Edit Project"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            {!project.is_default && (
              <button
                onClick={(e) => onDelete(project.id, e)}
                className="p-2 text-muted-foreground hover:bg-destructive hover:text-white transition-colors"
                title="Delete Project"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm font-bold text-primary mt-4">
        <span>View Board</span>
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

export default function ProjectsPage() {
  const { projects, isLoading, fetchProjects, updateProject, removeProject } = useProjects();
  const [collaborations, setCollaborations] = useState<Project[]>([]);
  const [isCollabLoading, setIsCollabLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("my");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects(true);
    fetchCollaborations();
  }, [fetchProjects]);

  const fetchCollaborations = async () => {
    setIsCollabLoading(true);
    try {
      const res = await fetch("/api/projects/collaborations");
      if (!res.ok) throw new Error("Failed to fetch collaborations");
      setCollaborations(await res.json());
    } catch (error) {
      console.error("Failed to fetch collaborations", error);
    } finally {
      setIsCollabLoading(false);
    }
  };

  const handleEdit = (project: Project, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProject(project);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await fetch(`/api/projects/${deleteId}`, { method: "DELETE" });
      removeProject(deleteId);
    } catch (error) {
      console.error("Failed to delete project", error);
    } finally {
      setDeleteId(null);
    }
  };

  const currentLoading = activeTab === "my" ? isLoading : isCollabLoading;
  const currentProjects = activeTab === "my" ? projects : collaborations;

  return (
    <div className="container mx-auto max-w-7xl p-6 space-y-8">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
            <Layout className="h-6 w-6" />
            Projects
         </h1>
         <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 border-2 border-foreground bg-primary px-4 py-2 text-sm font-bold text-white shadow-hard transition-transform hover:-translate-y-0.5 hover:shadow-hard-lg active:translate-y-0 active:shadow-hard"
         >
            New Project
            <Plus className="h-4 w-4" />
         </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1 border border-border w-fit">
        <button
          onClick={() => setActiveTab("my")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all ${
            activeTab === "my"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layout className="h-3.5 w-3.5" />
          My Projects
        </button>
        <button
          onClick={() => setActiveTab("collaborations")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all ${
            activeTab === "collaborations"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          Collaborations
          {collaborations.length > 0 && (
            <span className="text-[9px] font-black bg-purple-500/10 text-purple-500 px-1.5 py-0.5 rounded-sm">
              {collaborations.length}
            </span>
          )}
        </button>
      </div>

      {currentLoading ? (
        <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : currentProjects.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 border-2 border-dashed border-foreground/20 rounded-lg text-muted-foreground">
            {activeTab === "my" ? (
              <>
                <p className="font-mono text-sm uppercase tracking-widest">No projects found</p>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="text-sm font-bold hover:text-foreground underline"
                >
                    Create your first project
                </button>
              </>
            ) : (
              <>
                <Users className="h-10 w-10 opacity-20" />
                <p className="font-mono text-sm uppercase tracking-widest">No collaborations yet</p>
                <p className="text-xs text-muted-foreground/60">
                  Projects shared with you will appear here
                </p>
              </>
            )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {currentProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isCollaboration={activeTab === "collaborations"}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <ProjectCreationDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => fetchProjects(true)}
      />

      {/* Edit Dialog */}
      <ProjectCreationDialog
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        initialProject={editingProject || undefined}
        onSuccess={(updated) => {
          if (updated) updateProject(updated.id, updated);
          setEditingProject(null);
        }}
      />

      <ConfirmationDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        variant="destructive"
        confirmText="Delete"
      />
    </div>
  );
}

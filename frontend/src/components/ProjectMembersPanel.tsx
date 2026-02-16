"use client";

import { useState, useEffect } from "react";
import { X, Users, UserPlus, Loader2, Trash2, Clock } from "lucide-react";
import { ProjectMember, ProjectInvitation } from "@/lib/types";
import { InviteDialog } from "@/components/InviteDialog";
import { formatDistanceToNow } from "date-fns";

interface ProjectMembersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectOwnerId: string;
  currentUserId: string;
}

export function ProjectMembersPanel({
  isOpen,
  onClose,
  projectId,
  projectOwnerId,
  currentUserId,
}: ProjectMembersPanelProps) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const isOwner = currentUserId === projectOwnerId;

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, projectId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [membersRes, invitationsRes] = await Promise.all([
        fetch(`/api/invitations/project/${projectId}/members`),
        isOwner
          ? fetch(`/api/invitations/project/${projectId}`)
          : Promise.resolve(null),
      ]);

      if (membersRes.ok) {
        setMembers(await membersRes.json());
      }
      if (invitationsRes && invitationsRes.ok) {
        const allInvitations: ProjectInvitation[] = await invitationsRes.json();
        setInvitations(allInvitations.filter((inv) => inv.status === "pending"));
      }
    } catch (error) {
      console.error("Failed to fetch members", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    setRemovingId(userId);
    try {
      const res = await fetch(
        `/api/invitations/project/${projectId}/members/${userId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to remove member");
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
    } catch (error) {
      console.error("Failed to remove member", error);
    } finally {
      setRemovingId(null);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    setCancellingId(invitationId);
    try {
      const res = await fetch(`/api/invitations/${invitationId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to cancel invitation");
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
    } catch (error) {
      console.error("Failed to cancel invitation", error);
    } finally {
      setCancellingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md h-full bg-background border-l-2 border-foreground shadow-hard-lg animate-in slide-in-from-right duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-foreground/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-purple-500/10 rounded-lg">
              <Users className="h-4.5 w-4.5 text-purple-500" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight">
                Members
              </h2>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                {members.length} member{members.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOwner && (
              <button
                onClick={() => setIsInviteOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border-2 border-foreground bg-primary text-white shadow-hard-sm hover:-translate-y-0.5 hover:shadow-hard active:translate-y-0 transition-all"
              >
                <UserPlus className="h-3 w-3" />
                Invite
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:bg-destructive hover:text-white transition-colors rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Members List */}
              <div className="space-y-3">
                {members.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Users className="h-10 w-10 mb-4 opacity-20" />
                    <p className="text-sm font-bold">No members yet</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      Invite collaborators to this project
                    </p>
                  </div>
                ) : (
                  members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 border-2 border-foreground/20 bg-background p-4 hover:border-foreground/40 transition-colors"
                    >
                      {/* Avatar */}
                      {member.user_image ? (
                        <img
                          src={member.user_image}
                          alt={member.user_name}
                          className="h-9 w-9 rounded-full border-2 border-foreground/10 shrink-0"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 border-2 border-foreground/10 shrink-0">
                          <span className="text-xs font-black text-primary">
                            {member.user_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">
                          {member.user_name}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {member.user_email}
                        </p>
                      </div>

                      {/* Role Badge */}
                      <span
                        className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 shrink-0 ${
                          member.role === "owner"
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {member.role}
                      </span>

                      {/* Remove Button */}
                      {isOwner && member.role !== "owner" && (
                        <button
                          onClick={() => handleRemoveMember(member.user_id)}
                          disabled={removingId === member.user_id}
                          className="p-1.5 text-muted-foreground hover:bg-destructive hover:text-white transition-all shrink-0"
                          title="Remove member"
                        >
                          {removingId === member.user_id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Pending Invitations */}
              {isOwner && invitations.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                    Pending Invitations
                  </h3>
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center gap-3 border-2 border-dashed border-foreground/15 bg-background p-4"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-500/10 shrink-0">
                        <Clock className="h-4 w-4 text-yellow-500" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">
                          {invitation.invitee_name || invitation.invitee_email}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {invitation.invitee_email}
                        </p>
                      </div>

                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-yellow-500/10 text-yellow-600 shrink-0">
                        Pending
                      </span>

                      <button
                        onClick={() => handleCancelInvitation(invitation.id)}
                        disabled={cancellingId === invitation.id}
                        className="p-1.5 text-muted-foreground hover:bg-destructive hover:text-white transition-all shrink-0"
                        title="Cancel invitation"
                      >
                        {cancellingId === invitation.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <X className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Invite Dialog */}
      <InviteDialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        projectId={projectId}
        onInviteSent={fetchData}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import {
  FileText,
  Layout,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  ArrowRight,
  CalendarClock,
  TrendingUp,
  Flame,
  Target,
  FolderKanban,
  Bell,
} from "lucide-react";
import Link from "next/link";

interface TaskByStatus {
  status: string;
  count: number;
}

interface TaskByPriority {
  priority: string;
  count: number;
}

interface UpcomingTask {
  id: string;
  content: string;
  due_date: string;
  priority: string;
  status: string;
  project_name: string;
}

interface ProjectProgress {
  id: string;
  name: string;
  total_tasks: number;
  completed_tasks: number;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
}

interface DashboardStats {
  total_projects: number;
  active_tasks: number;
  completed_tasks: number;
  total_tasks: number;
  total_notes: number;
  overdue_count: number;
  completion_rate: number;
  tasks_by_status: TaskByStatus[];
  tasks_by_priority: TaskByPriority[];
  upcoming_deadlines: UpcomingTask[];
  overdue_tasks: UpcomingTask[];
  project_progress: ProjectProgress[];
  recent_activity: RecentActivity[];
}

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  HIGH: { color: "text-red-600 dark:text-red-400", bg: "bg-red-500", label: "High" },
  MEDIUM: { color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500", label: "Medium" },
  LOW: { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500", label: "Low" },
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  TODO: { color: "text-zinc-600 dark:text-zinc-400", bg: "bg-zinc-400", label: "To Do" },
  IN_PROGRESS: { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500", label: "In Progress" },
  DONE: { color: "text-green-600 dark:text-green-400", bg: "bg-green-500", label: "Done" },
};

const ACTIVITY_ICON_CONFIG: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  overdue: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
  due_soon: { icon: CalendarClock, color: "text-orange-500", bg: "bg-orange-500/10" },
  task_assigned: { icon: Target, color: "text-blue-500", bg: "bg-blue-500/10" },
  project_invitation: { icon: FolderKanban, color: "text-purple-500", bg: "bg-purple-500/10" },
  invitation_accepted: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
};

function CompletionRing({ rate, size = 120, strokeWidth = 10 }: { rate: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (rate / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/50"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-green-500 transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-black tracking-tight">{Math.round(rate)}%</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Done</span>
      </div>
    </div>
  );
}

function StatusBar({ statuses, total }: { statuses: TaskByStatus[]; total: number }) {
  if (total === 0) {
    return (
      <div className="h-4 w-full rounded-full bg-muted border border-foreground/10" />
    );
  }
  return (
    <div className="flex h-4 w-full overflow-hidden rounded-full border border-foreground/10">
      {statuses.map((s) => {
        const pct = (s.count / total) * 100;
        if (pct === 0) return null;
        const cfg = STATUS_CONFIG[s.status];
        return (
          <div
            key={s.status}
            className={`${cfg?.bg || "bg-zinc-300"} transition-all duration-700 ease-out`}
            style={{ width: `${pct}%` }}
            title={`${cfg?.label || s.status}: ${s.count}`}
          />
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Total Projects",
      value: stats?.total_projects ?? 0,
      icon: Layout,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Active Tasks",
      value: stats?.active_tasks ?? 0,
      icon: Clock,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      label: "Completed",
      value: stats?.completed_tasks ?? 0,
      icon: CheckCircle2,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Total Notes",
      value: stats?.total_notes ?? 0,
      icon: FileText,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full p-6 space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black uppercase tracking-tighter">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            Overview of your workspace &bull; {format(new Date(), "EEEE, MMMM do")}
          </p>
        </div>
        {stats && stats.overdue_count > 0 && (
          <div className="flex items-center gap-2 rounded-lg border-2 border-red-500 bg-red-500/10 px-3 py-1.5 text-sm font-bold text-red-600 dark:text-red-400">
            <AlertTriangle className="h-4 w-4" />
            {stats.overdue_count} overdue
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-lg border-2 border-foreground bg-background p-4 shadow-hard transition-all hover:-translate-y-0.5 hover:shadow-hard-lg"
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
              <p className="text-2xl font-black tracking-tight">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

        {/* Left Column: Task Breakdown + Priority */}
        <div className="space-y-6 lg:col-span-5">
          {/* Completion + Status Breakdown */}
          <div className="rounded-lg border-2 border-foreground bg-background p-6 shadow-hard">
            <h2 className="mb-5 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Task Overview
            </h2>
            <div className="flex items-center gap-6">
              <CompletionRing rate={stats?.completion_rate ?? 0} />
              <div className="flex-1 space-y-3">
                {stats?.tasks_by_status.map((s) => {
                  const cfg = STATUS_CONFIG[s.status];
                  const pct = stats.total_tasks > 0 ? Math.round((s.count / stats.total_tasks) * 100) : 0;
                  return (
                    <div key={s.status} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-bold ${cfg?.color}`}>{cfg?.label || s.status}</span>
                        <span className="font-mono font-bold text-muted-foreground">{s.count} <span className="text-[10px]">({pct}%)</span></span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${cfg?.bg} transition-all duration-700 ease-out`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="rounded-lg border-2 border-foreground bg-background p-6 shadow-hard">
            <h2 className="mb-5 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Priority Breakdown
            </h2>
            <div className="space-y-3">
              {stats?.tasks_by_priority.map((p) => {
                const cfg = PRIORITY_CONFIG[p.priority];
                const pct = stats.total_tasks > 0 ? Math.round((p.count / stats.total_tasks) * 100) : 0;
                return (
                  <div key={p.priority} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {p.priority === "HIGH" && <Flame className="h-3.5 w-3.5 text-red-500" />}
                        <span className={`font-bold ${cfg?.color}`}>{cfg?.label || p.priority}</span>
                      </div>
                      <span className="font-mono font-bold text-muted-foreground">{p.count}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${cfg?.bg} transition-all duration-700 ease-out`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {stats && stats.total_tasks > 0 && (
              <div className="mt-4 pt-3 border-t border-border">
                <StatusBar statuses={stats.tasks_by_status} total={stats.total_tasks} />
                <div className="mt-2 flex items-center justify-between">
                  {stats.tasks_by_status.map((s) => {
                    const cfg = STATUS_CONFIG[s.status];
                    return (
                      <div key={s.status} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <div className={`h-2 w-2 rounded-full ${cfg?.bg}`} />
                        <span>{cfg?.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Column: Overdue + Upcoming */}
        <div className="space-y-6 lg:col-span-4">
          {/* Overdue Tasks */}
          {stats && stats.overdue_tasks.length > 0 && (
            <div className="rounded-lg border-2 border-red-500 bg-red-500/5 p-6 shadow-hard">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                  Overdue Tasks
                </h2>
              </div>
              <div className="space-y-3">
                {stats.overdue_tasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-md border border-red-200 dark:border-red-900 bg-background p-3"
                  >
                    <p className="text-sm font-bold leading-tight">{task.content}</p>
                    <div className="mt-1.5 flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="font-mono font-bold text-red-500">
                        {formatDistanceToNow(parseISO(task.due_date), { addSuffix: true })}
                      </span>
                      <span className="truncate">{task.project_name}</span>
                      <span className={`font-bold ${PRIORITY_CONFIG[task.priority]?.color}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Deadlines */}
          <div className="rounded-lg border-2 border-foreground bg-background p-6 shadow-hard">
            <div className="mb-4 flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-orange-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Upcoming (7 days)
              </h2>
            </div>
            {stats && stats.upcoming_deadlines.length > 0 ? (
              <div className="space-y-3">
                {stats.upcoming_deadlines.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 rounded-md border border-border bg-muted/30 p-3"
                  >
                    <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${PRIORITY_CONFIG[task.priority]?.bg}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold leading-tight truncate">{task.content}</p>
                      <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="font-mono font-bold">
                          {format(parseISO(task.due_date), "MMM d")}
                        </span>
                        <span className="truncate">{task.project_name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming deadlines this week.</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/notes"
              className="group flex items-center gap-3 rounded-lg border-2 border-foreground bg-background p-4 shadow-hard-sm transition-all hover:-translate-y-0.5 hover:shadow-hard"
            >
              <FileText className="h-5 w-5 text-purple-500" />
              <div className="min-w-0">
                <p className="text-xs font-bold">Notes</p>
                <p className="text-[10px] text-muted-foreground">Manage</p>
              </div>
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
            <Link
              href="/projects"
              className="group flex items-center gap-3 rounded-lg border-2 border-foreground bg-background p-4 shadow-hard-sm transition-all hover:-translate-y-0.5 hover:shadow-hard"
            >
              <Layout className="h-5 w-5 text-blue-500" />
              <div className="min-w-0">
                <p className="text-xs font-bold">Projects</p>
                <p className="text-[10px] text-muted-foreground">View all</p>
              </div>
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          </div>
        </div>

        {/* Right Column: Project Progress + Activity */}
        <div className="space-y-6 lg:col-span-3">
          {/* Project Progress */}
          <div className="rounded-lg border-2 border-foreground bg-background p-6 shadow-hard">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Project Progress
              </h2>
            </div>
            {stats && stats.project_progress.length > 0 ? (
              <div className="space-y-4">
                {stats.project_progress.slice(0, 6).map((project) => {
                  const pct = project.total_tasks > 0
                    ? Math.round((project.completed_tasks / project.total_tasks) * 100)
                    : 0;
                  return (
                    <div key={project.id} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate max-w-[140px]">{project.name}</span>
                        <span className="text-[10px] font-mono font-bold text-muted-foreground">
                          {project.completed_tasks}/{project.total_tasks}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No projects with tasks yet.</p>
            )}
          </div>

          {/* Recent Activity */}
          <div className="rounded-lg border-2 border-foreground bg-background p-6 shadow-hard">
            <div className="mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Recent Activity
              </h2>
            </div>
            {stats && stats.recent_activity.length > 0 ? (
              <div className="space-y-3">
                {stats.recent_activity.slice(0, 6).map((activity) => {
                  const iconCfg = ACTIVITY_ICON_CONFIG[activity.type] || {
                    icon: Bell,
                    color: "text-muted-foreground",
                    bg: "bg-muted",
                  };
                  const IconComp = iconCfg.icon;
                  return (
                    <div key={activity.id} className="flex gap-2.5">
                      <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${iconCfg.bg}`}>
                        <IconComp className={`h-3 w-3 ${iconCfg.color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold leading-tight truncate">{activity.title}</p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          {formatDistanceToNow(parseISO(activity.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

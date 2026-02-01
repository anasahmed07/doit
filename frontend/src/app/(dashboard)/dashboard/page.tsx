"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { 
  FileText, 
  Layout, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  total_projects: number;
  active_tasks: number;
  completed_tasks: number;
  total_notes: number;
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
      bg: "bg-blue-500/10"
    },
    {
      label: "Active Tasks",
      value: stats?.active_tasks ?? 0,
      icon: Clock,
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    },
    {
      label: "Completed Tasks",
      value: stats?.completed_tasks ?? 0,
      icon: CheckCircle2,
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    {
      label: "Total Notes",
      value: stats?.total_notes ?? 0,
      icon: FileText,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: "note",
      action: "created a note",
      target: "Project Meeting Notes",
      time: "2 hours ago"
    },
    {
      id: 2,
      type: "project",
      action: "updated project",
      target: "Website Redesign",
      time: "5 hours ago"
    },
    {
      id: 3,
      type: "task",
      action: "completed task",
      target: "Design Homepage Hero",
      time: "Yesterday"
    }
  ];

  return (
    <div className="w-full p-6 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black uppercase tracking-tighter">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm">
          Overview of your workspace • {format(new Date(), "EEEE, MMMM do")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div 
            key={stat.label}
            className="flex items-center gap-4 rounded-lg border-2 border-foreground bg-background p-4 shadow-hard transition-all hover:-translate-y-0.5 hover:shadow-hard-lg"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.bg} ${stat.color}`}>
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <stat.icon className="h-6 w-6" />}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
              <p className="text-2xl font-black tracking-tight">
                {isLoading ? "-" : stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Quick Links */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold uppercase tracking-tight">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link 
              href="/notes"
              className="group flex flex-col justify-between rounded-lg border-2 border-foreground bg-background p-6 shadow-hard transition-all hover:-translate-y-0.5 hover:shadow-hard-lg"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono font-bold text-muted-foreground group-hover:text-primary transition-colors">
                  GO TO NOTES &rarr;
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-bold">Manage Notes</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create, edit, and organize your markdown notes.
                </p>
              </div>
            </Link>

            <Link 
              href="/projects"
              className="group flex flex-col justify-between rounded-lg border-2 border-foreground bg-background p-6 shadow-hard transition-all hover:-translate-y-0.5 hover:shadow-hard-lg"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <Layout className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono font-bold text-muted-foreground group-hover:text-primary transition-colors">
                  GO TO PROJECTS &rarr;
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-bold">View Projects</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Track progress with Kanban boards and tasks.
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold uppercase tracking-tight">
            Recent Activity
          </h2>
          <div className="rounded-lg border-2 border-foreground bg-background p-6 shadow-hard">
            <div className="space-y-6">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="relative mt-1">
                    <div className="h-2 w-2 rounded-full bg-primary ring-4 ring-primary/20" />
                    {activity.id !== recentActivity.length && (
                      <div className="absolute left-1 top-2 h-full w-[2px] bg-border -ml-[1px]" />
                    )}
                  </div>
                  <div className="pb-2">
                    <p className="text-sm font-medium">
                      You <span className="text-muted-foreground">{activity.action}</span>{" "}
                      <span className="font-bold text-primary">{activity.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

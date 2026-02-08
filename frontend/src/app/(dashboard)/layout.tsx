"use client";

import { Sidebar } from "@/components/Sidebar";
import { ChatWidget } from "@/components/ChatWidget";
import { ProjectsProvider, useProjects } from "@/components/ProjectsContext";
import { Menu } from "lucide-react";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { toggleSidebar } = useProjects();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background font-sans text-foreground lg:flex-row">
      {/* Mobile Top Bar */}
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => toggleSidebar(true)}
            className="p-2 text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-pixel text-lg font-bold tracking-tighter uppercase">DOIT</span>
        </div>
      </header>

      <Sidebar />
      <main className="relative flex-1 overflow-y-auto bg-muted/20">
        {children}
      </main>
      <ChatWidget />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProjectsProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ProjectsProvider>
  );
}

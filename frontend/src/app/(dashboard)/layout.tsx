import { Sidebar } from "@/components/Sidebar";
import { ProjectsProvider } from "@/components/ProjectsContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProjectsProvider>
      <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-muted/20 relative">
          {children}
        </main>
      </div>
    </ProjectsProvider>
  );
}

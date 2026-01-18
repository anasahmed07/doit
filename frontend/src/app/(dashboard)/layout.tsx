import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-muted/20 relative">
        {children}
      </main>
    </div>
  );
}

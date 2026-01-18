import Link from "next/link";
import {
  Layers,
  Mic,
  Image as ImageIcon,
  Layout,
  CheckSquare,
  ArrowRight,
  Zap,
  Move,
  Grid
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans selection:bg-accent selection:text-white">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b-2 border-foreground bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center bg-primary text-white border-2 border-foreground shadow-hard-sm">
              <Zap className="h-5 w-5" fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tighter">DoIt.</span>
          </div>

          <nav className="flex items-center gap-6">
            <Link
              href="/signin"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="group relative flex items-center gap-2 border-2 border-foreground bg-foreground px-4 py-2 text-sm font-bold text-background transition-transform hover:-translate-y-1 hover:shadow-hard-sm active:translate-y-0 active:shadow-none"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b-2 border-foreground bg-background">
          {/* Decorative Grid Background (CSS generated) */}
          <div className="absolute inset-0 opacity-[0.03]"
               style={{
                 backgroundImage: 'linear-gradient(#18181b 1px, transparent 1px), linear-gradient(90deg, #18181b 1px, transparent 1px)',
                 backgroundSize: '40px 40px'
               }}
          />

          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-24 lg:grid-cols-2 lg:py-32">
            <div className="flex flex-col justify-center space-y-8">
              <div className="inline-flex w-fit items-center gap-2 border border-foreground bg-white px-3 py-1 text-xs font-mono font-bold uppercase tracking-widest shadow-hard-sm">
                <span className="h-2 w-2 bg-accent"></span>
                v2.0 Release
              </div>

              <h1 className="text-6xl font-black uppercase tracking-tighter leading-[0.9] text-foreground sm:text-7xl lg:text-8xl">
                Build <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Momentum</span>
              </h1>

              <p className="max-w-md text-xl font-medium text-muted-foreground">
                The precision tool for multimedia notes and Kanban project management.
                Designed for builders, engineers, and creators.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/signup"
                  className="flex h-14 items-center justify-center gap-2 border-2 border-foreground bg-accent px-8 text-lg font-bold text-white shadow-hard transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--foreground)] active:translate-y-0 active:shadow-hard"
                >
                  Start Building Free
                </Link>
                <Link
                  href="#features"
                  className="flex h-14 items-center justify-center gap-2 border-2 border-foreground bg-white px-8 text-lg font-bold text-foreground shadow-hard transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--foreground)] active:translate-y-0 active:shadow-hard"
                >
                   Specs & Features
                </Link>
              </div>
            </div>

            {/* Abstract UI Visualization */}
            <div className="relative flex items-center justify-center lg:justify-end">
              <div className="relative h-[500px] w-full max-w-md border-2 border-foreground bg-white p-2 shadow-hard md:rotate-3 transition-transform hover:rotate-0 duration-500">
                <div className="absolute -top-3 -left-3 flex gap-1 border border-foreground bg-white px-2 py-1 shadow-sm z-10">
                  <div className="h-2 w-2 rounded-full bg-red-500 border border-black"></div>
                  <div className="h-2 w-2 rounded-full bg-yellow-500 border border-black"></div>
                  <div className="h-2 w-2 rounded-full bg-green-500 border border-black"></div>
                </div>

                {/* Mock UI Content */}
                <div className="h-full w-full bg-secondary/30 p-4 flex flex-col gap-4">
                  {/* Mock Sidebar */}
                  <div className="flex gap-4 h-full">
                    <div className="w-12 border-r-2 border-dashed border-foreground/20 flex flex-col gap-4 items-center py-4">
                       <div className="w-8 h-8 bg-foreground/10 rounded-sm"></div>
                       <div className="w-8 h-8 bg-foreground/10 rounded-sm"></div>
                       <div className="w-8 h-8 bg-primary/20 rounded-sm border border-primary"></div>
                    </div>

                    {/* Mock Board */}
                    <div className="flex-1 flex flex-col gap-4">
                      <div className="flex justify-between items-end border-b-2 border-foreground pb-2">
                        <h3 className="font-bold text-2xl uppercase">Q1 Roadmap</h3>
                        <span className="font-mono text-xs bg-foreground text-white px-1">STATUS: ACTIVE</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 h-full">
                         {/* Column 1 */}
                         <div className="bg-white border-2 border-foreground p-3 shadow-sm flex flex-col gap-3">
                           <span className="font-mono text-xs font-bold text-muted-foreground uppercase">Backlog [03]</span>
                           <div className="bg-secondary/50 p-2 border border-foreground/10 text-xs font-bold">Research Competitors</div>
                           <div className="bg-secondary/50 p-2 border border-foreground/10 text-xs font-bold flex gap-2 items-center">
                              <ImageIcon className="w-3 h-3" /> Mockups V1
                           </div>
                         </div>

                         {/* Column 2 */}
                         <div className="bg-white border-2 border-foreground p-3 shadow-sm flex flex-col gap-3">
                           <span className="font-mono text-xs font-bold text-primary uppercase">In Progress [02]</span>
                           <div className="bg-accent/10 p-2 border border-accent text-xs font-bold flex flex-col gap-1">
                              <span>Database Schema</span>
                              <div className="h-1 w-full bg-accent/20 rounded-full overflow-hidden">
                                <div className="h-full w-[60%] bg-accent"></div>
                              </div>
                           </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute bottom-10 -left-4 border-2 border-foreground bg-primary p-4 text-white shadow-hard-sm hidden md:block animate-bounce duration-[3000ms]">
                <div className="flex items-center gap-3">
                   <div className="bg-white text-primary p-1 rounded-sm"><CheckSquare className="w-5 h-5"/></div>
                   <div className="font-mono text-sm">
                     <div className="uppercase text-[10px] opacity-70">Tasks Completed</div>
                     <div className="font-bold text-xl">1,248</div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Marquee / Tech Stack Strip */}
        <div className="border-b-2 border-foreground bg-foreground py-3 overflow-hidden whitespace-nowrap">
           <div className="inline-flex animate-marquee gap-12 text-background font-mono font-bold uppercase tracking-widest text-sm">
             {Array(10).fill("Unified Workspace // Multimedia Support // Kanban Workflows //").map((text, i) => (
               <span key={i}>{text}</span>
             ))}
           </div>
        </div>

        {/* Features Grid */}
        <section id="features" className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="text-4xl font-black uppercase tracking-tighter text-foreground md:text-5xl">
              System <br />Modules
            </h2>
            <p className="max-w-xs font-mono text-sm text-muted-foreground">
              // CORE_CAPABILITIES<br />
              Loaded with essential tools for high-velocity teams and individuals.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="group relative border-2 border-foreground bg-white p-8 shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              <div className="mb-6 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center bg-secondary border border-foreground">
                  <Layers className="h-6 w-6" />
                </div>
                <span className="font-mono text-4xl font-bold text-foreground/20 group-hover:text-primary/20">01</span>
              </div>
              <h3 className="mb-3 text-xl font-bold uppercase tracking-tight">Multimedia Notes</h3>
              <p className="text-muted-foreground">
                Capture thoughts in any format. Text, audio, and images live side-by-side in a unified document stream.
              </p>
              <div className="mt-6 flex gap-2">
                 <Mic className="h-4 w-4 text-accent" />
                 <ImageIcon className="h-4 w-4 text-accent" />
                 <span className="text-xs font-mono text-muted-foreground">+ Audio & Image Support</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative border-2 border-foreground bg-white p-8 shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              <div className="mb-6 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center bg-secondary border border-foreground">
                  <Layout className="h-6 w-6" />
                </div>
                <span className="font-mono text-4xl font-bold text-foreground/20 group-hover:text-primary/20">02</span>
              </div>
              <h3 className="mb-3 text-xl font-bold uppercase tracking-tight">Kanban Projects</h3>
              <p className="text-muted-foreground">
                Switch context instantly. Turn loose notes into structured projects with rigid Kanban workflows.
              </p>
              <div className="mt-6 border-t-2 border-dashed border-foreground/20 pt-4 w-full">
                 <div className="flex justify-between text-xs font-mono font-bold uppercase">
                    <span>To Do</span>
                    <span>Doing</span>
                    <span>Done</span>
                 </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative border-2 border-foreground bg-white p-8 shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              <div className="mb-6 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center bg-secondary border border-foreground">
                  <Grid className="h-6 w-6" />
                </div>
                <span className="font-mono text-4xl font-bold text-foreground/20 group-hover:text-primary/20">03</span>
              </div>
              <h3 className="mb-3 text-xl font-bold uppercase tracking-tight">Smart Dashboard</h3>
              <p className="text-muted-foreground">
                Your command center. Drag-and-drop organization, custom categories, and global search.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase text-primary">
                 <Move className="h-3 w-3" /> Drag & Drop Enabled
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t-2 border-foreground bg-accent text-white">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 py-24 text-center">
            <h2 className="text-5xl font-black uppercase tracking-tighter md:text-7xl">
              Ready to <br />Execute?
            </h2>
            <p className="max-w-lg text-xl font-medium text-white/90">
              Join the workspace designed for clarity, speed, and execution. No clutter, just tools.
            </p>
            <Link
              href="/signup"
              className="mt-4 flex h-16 min-w-[200px] items-center justify-center border-2 border-white bg-white px-8 text-xl font-bold text-accent shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-0 active:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
            >
              Get Started Now
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-foreground bg-background py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <span className="text-lg font-bold tracking-tighter">DoIt. Inc</span>
          </div>
          <p className="font-mono text-sm text-muted-foreground">
            © 2026 DoIt Systems. All rights reserved.
          </p>
          <div className="flex gap-6">
             <a href="#" className="text-sm font-bold hover:underline">Privacy</a>
             <a href="#" className="text-sm font-bold hover:underline">Terms</a>
             <a href="#" className="text-sm font-bold hover:underline">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

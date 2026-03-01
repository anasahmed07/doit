import { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/Hero";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import {
  Layers,
  Mic,
  Image as ImageIcon,
  Layout,
  Move,
  Grid
} from "lucide-react";

export const metadata: Metadata = {
  title: "DOIT - Modern Task & Project Management",
  description: "DOIT is the modern workspace for high-velocity teams. Features multimedia notes, Kanban project management, and an AI-powered chat assistant.",
};

export default function Home() {
  return (
    <div className="bg-background font-sans selection:bg-accent selection:text-white">
      {/* Hero Section */}
      <Hero />

      {/* Marquee / Tech Stack Strip */}
      <div className="border-b-2 border-foreground bg-foreground py-3 overflow-hidden whitespace-nowrap">
         <div className="inline-flex animate-marquee gap-12 text-background font-mono font-bold uppercase tracking-widest text-sm">
           {Array(10).fill("Unified Workspace // Multimedia Support // Kanban Workflows //").map((text, i) => (
             <span key={i}>{text}</span>
           ))}
         </div>
      </div>

      {/* Features Grid */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24 border-b-2 border-foreground">
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
          <div className="group relative border-2 border-foreground bg-card p-8 shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
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
          <div className="group relative border-2 border-foreground bg-card p-8 shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
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
          <div className="group relative border-2 border-foreground bg-card p-8 shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
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

      {/* Testimonials Section */}
      <Testimonials />

      {/* FAQ Section */}
      <FAQ />

      {/* CTA Section */}
      <section className="bg-accent text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 py-24 text-center">
          <h2 className="text-5xl font-black uppercase tracking-tighter md:text-7xl">
            Ready to <br />Execute?
          </h2>
          <p className="max-w-lg text-xl font-medium text-white/90">
            Join the workspace designed for clarity, speed, and execution. No clutter, just tools.
          </p>
          <Link
            href="/sign-up"
            className="mt-4 flex h-16 min-w-[200px] items-center justify-center border-2 border-white bg-white px-8 text-xl font-bold text-accent shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-0 active:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}

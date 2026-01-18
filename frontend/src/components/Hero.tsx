"use client";

import Link from "next/link";
import { ArrowDown } from "lucide-react";

const cards = [
  { color: "bg-red-500", rotation: "rotate-6", z: "z-10" },
  { color: "bg-orange-500", rotation: "-rotate-3", z: "z-20" },
  { color: "bg-amber-500", rotation: "rotate-2", z: "z-30" },
  { color: "bg-yellow-500", rotation: "rotate-12", z: "z-10" },
  { color: "bg-lime-500", rotation: "-rotate-6", z: "z-20" },
  { color: "bg-green-500", rotation: "rotate-3", z: "z-10" },
  { color: "bg-emerald-500", rotation: "-rotate-12", z: "z-30" },
  { color: "bg-teal-500", rotation: "rotate-6", z: "z-20" },
  { color: "bg-cyan-500", rotation: "-rotate-3", z: "z-10" },
  { color: "bg-sky-500", rotation: "rotate-2", z: "z-30" },
  { color: "bg-blue-500", rotation: "-rotate-6", z: "z-20" },
  { color: "bg-indigo-500", rotation: "rotate-3", z: "z-10" },
  { color: "bg-violet-500", rotation: "-rotate-2", z: "z-30" },
  { color: "bg-purple-500", rotation: "rotate-6", z: "z-20" },
  { color: "bg-fuchsia-500", rotation: "-rotate-3", z: "z-10" },
  { color: "bg-pink-500", rotation: "rotate-2", z: "z-30" },
  { color: "bg-rose-500", rotation: "-rotate-6", z: "z-20" },
];

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-background pt-32 pb-48 border-b-2 border-foreground min-h-[800px] flex items-center">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
           style={{
             backgroundImage: 'radial-gradient(#18181b 1px, transparent 1px)',
             backgroundSize: '24px 24px'
           }}
      />

      {/* Animated Stream of Cards (Now in Background) */}
      <div className="absolute inset-0 z-0 flex items-center py-20 overflow-visible perspective-1000 pointer-events-none opacity-40">
        {/* The Scrolling Track */}
        <div className="flex w-max animate-scroll-left">
          {/* We duplicate the set of cards multiple times for smooth infinite scroll */}
          {[...cards, ...cards, ...cards, ...cards].map((card, idx) => (
            <div
              key={idx}
              className={`relative mx-[-30px] h-64 w-48 flex-shrink-0 rounded-2xl border-2 border-white/20 shadow-2xl transition-all ${card.color} ${card.rotation} ${card.z}`}
            >
              {/* Internal card details to look like tasks */}
              <div className="p-4 h-full flex flex-col justify-between opacity-60">
                 <div className="w-10 h-1.5 bg-white/50 rounded-full"></div>
                 <div className="space-y-3">
                    <div className="w-full h-2.5 bg-white/30 rounded-full"></div>
                    <div className="w-2/3 h-2.5 bg-white/30 rounded-full"></div>
                 </div>
                 <div className="self-end w-8 h-8 rounded-full bg-white/40"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 z-10">
        
        {/* Header Layout */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 items-start mb-32">
          {/* Left Column: Headline */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
              <span className="h-2 w-2 bg-accent"></span>
              <span>v2.0 Release</span>
            </div>
            
            <h1 className="text-6xl font-black uppercase tracking-tighter leading-[0.9] text-foreground sm:text-7xl lg:text-8xl drop-shadow-sm">
              Precision <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                Execution
              </span>
            </h1>
          </div>

          {/* Right Column: Subtext */}
          <div className="flex flex-col md:items-end md:text-right pt-2">
            <p className="max-w-md text-xl font-medium text-muted-foreground drop-shadow-sm">
              The precision tool for multimedia notes and Kanban project management.
              <br className="hidden md:block" />
              Designed for builders, engineers, and creators.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex flex-col items-center justify-center text-center gap-8">
          <p className="max-w-md text-base font-bold text-foreground drop-shadow-sm">
            Are you ready to take the first step and <br />
            start your journey today?
          </p>
          
          <Link
            href="/signup"
            className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-foreground px-10 font-bold text-background transition-all hover:bg-primary hover:text-white shadow-hard-sm hover:shadow-hard hover:-translate-y-1"
          >
            <span className="relative z-10 text-sm uppercase tracking-widest">Get Started</span>
          </Link>

          <div className="mt-8 animate-bounce">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <ArrowDown className="h-4 w-4" />
              Discover More
            </div>
          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); } /* Move 1/3 of the width (since we have 3 sets of cards) */
        }
        .animate-scroll-left {
          animation: scroll-left 40s linear infinite;
        }
        .perspective-1000 {
           perspective: 1000px;
        }
      `}</style>
    </section>
  );
}

"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";

/* ─── Data ──────────────────────────────────────────────────────────────── */

const taskCards = [
  { label: "Design System", status: "Done",        color: "#f97316", rotate: -14, x: -220, y: -90,  progress: 100 },
  { label: "API Integration", status: "In Progress", color: "#3b82f6", rotate:   8, x:  200, y: -110, progress: 55  },
  { label: "User Research",  status: "Todo",        color: "#8b5cf6", rotate:  -6, x: -140, y:  120, progress: 20  },
  { label: "Deploy v2.0",    status: "In Progress", color: "#10b981", rotate:  18, x:  240, y:   95,  progress: 45  },
  { label: "Write Docs",     status: "Todo",        color: "#ec4899", rotate:  -9, x:   55, y:  165, progress: 10  },
];

const stats = [
  { value: 12000, label: "Active Users", suffix: "+" },
  { value: 98,    label: "Uptime",       suffix: "%" },
  { value: 4,     label: "Core Modules", suffix: "x" },
];

/* ─── Hero ───────────────────────────────────────────────────────────────── */

export function Hero() {
  const sectionRef      = useRef<HTMLElement>(null);
  const badgeRef        = useRef<HTMLDivElement>(null);
  const headlineRef     = useRef<HTMLHeadingElement>(null);
  const subtextRef      = useRef<HTMLParagraphElement>(null);
  const ctaRef          = useRef<HTMLDivElement>(null);
  const clusterRef      = useRef<HTMLDivElement>(null);
  const countRefs       = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    // Prevent browser from restoring scroll position on reload
    if (typeof window !== "undefined") {
      window.history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
    }

    const section = sectionRef.current;
    if (!section) return;

    /* ── Mouse parallax on card cluster ── */
    const handleMouse = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const mx   = e.clientX - rect.left;
      const my   = e.clientY - rect.top;
      const dx   = (mx - rect.width  / 2) / (rect.width  / 2);
      const dy   = (my - rect.height / 2) / (rect.height / 2);
      gsap.to(clusterRef.current, {
        x: dx * 28,
        y: dy * 14,
        duration: 1.0,
        ease: "power2.out",
      });
    };

    section.addEventListener("mousemove", handleMouse);

    /* ── GSAP context (all animations tracked for cleanup) ── */
    const ctx = gsap.context(() => {
      const words      = headlineRef.current?.querySelectorAll(".word-wrap") ?? [];
      const cardEls    = section.querySelectorAll<HTMLElement>(".task-card");

      /* --- Initial states --- */
      gsap.set(words,             { yPercent: 115, rotate: 3 });
      gsap.set(badgeRef.current,  { x: -28, opacity: 0 });
      gsap.set(subtextRef.current,{ y: 22,  opacity: 0 });
      gsap.set(ctaRef.current,    { y: 18,  opacity: 0 });
      gsap.set(".stat-item",      { y: 18,  opacity: 0 });
      gsap.set(cardEls,           { scale: 0, x: 0, y: 0, rotation: 0, opacity: 0 });

      /* --- Entrance sequence --- */
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl
        .to(badgeRef.current,  { x: 0, opacity: 1, duration: 0.65 }, 0.25)
        .to(words,             { yPercent: 0, rotate: 0, stagger: 0.13, duration: 0.85 }, 0.45)
        .to(subtextRef.current,{ y: 0, opacity: 1, duration: 0.65 }, 1.0)
        .to(ctaRef.current,    { y: 0, opacity: 1, duration: 0.65, ease: "back.out(1.5)" }, 1.2)
        .to(".stat-item",      { y: 0, opacity: 1, stagger: 0.1,  duration: 0.55 }, 1.4)
        /* Fan-out cards */
        .to(cardEls, {
          scale:    1,
          opacity:  1,
          rotation: (i: number) => taskCards[i]?.rotate ?? 0,
          x:        (i: number) => taskCards[i]?.x      ?? 0,
          y:        (i: number) => taskCards[i]?.y      ?? 0,
          stagger:  0.07,
          duration: 1.05,
          ease:     "back.out(1.8)",
        }, 0.9);

      /* --- Card hover 3-D tilt --- */
      cardEls.forEach((card) => {
        const handleEnter = () => {
          gsap.to(card, { scale: 1.08, zIndex: 10, boxShadow: `0 32px 80px -10px ${card.style.background}cc`, duration: 0.3, ease: "power2.out" });
        };
        const handleLeave = () => {
          const baseRotate = parseFloat(card.dataset.rotate ?? "0");
          gsap.to(card, { rotation: baseRotate, scale: 1, zIndex: 1, duration: 0.45, ease: "power2.out" });
        };
        card.dataset.rotate = String(
          taskCards[Array.from(cardEls).indexOf(card)]?.rotate ?? 0
        );
        card.addEventListener("mouseover", handleEnter as EventListener);
        card.addEventListener("mouseleave", handleLeave);
      });

      /* --- Continuous float (after entrance settles) --- */
      cardEls.forEach((card, i) => {
        gsap.to(card, {
          y:        `+=${14 + i * 3}`,
          duration: 1.9 + i * 0.38,
          ease:     "sine.inOut",
          yoyo:     true,
          repeat:   -1,
          delay:    2.5 + i * 0.12,
        });
      });

      /* --- Count-up stats --- */
      stats.forEach((stat, i) => {
        const el  = countRefs.current[i];
        if (!el) return;
        const obj = { val: 0 };
        gsap.to(obj, {
          val:      stat.value,
          duration: 2.4,
          delay:    1.55 + i * 0.15,
          ease:     "power2.out",
          onUpdate() { if (el) el.textContent = Math.round(obj.val).toLocaleString(); },
        });
      });

      /* --- Scanline streak on headline loop --- */
      const streak = section.querySelector<HTMLElement>(".headline-streak");
      if (streak) {
        gsap.fromTo(streak,
          { xPercent: -100 },
          {
            xPercent:    220,
            duration:    1.0,
            ease:        "power1.inOut",
            delay:       2.0,
            repeat:      -1,
            repeatDelay: 8,
          }
        );
      }
    }, section);

    return () => {
      ctx.revert();
      section.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-background min-h-screen flex items-center border-b-2 border-foreground"
    >
      {/* ── Dot grid ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:  "radial-gradient(rgba(24,24,27,.07) 1px, transparent 1px)",
          backgroundSize:   "26px 26px",
        }}
      />

      {/* ── Horizontal rule accent lines ── */}
      <div className="absolute left-0 right-0 top-1/3 h-px bg-foreground/[0.04] pointer-events-none" />
      <div className="absolute left-0 right-0 top-2/3 h-px bg-foreground/[0.04] pointer-events-none" />

      {/* ── Main layout ── */}
      <div className="relative z-10 mx-auto max-w-7xl w-full px-6 py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-6 items-center">

          {/* ════════════ LEFT: Text ════════════ */}
          <div className="flex flex-col gap-8">

            {/* Badge */}
            <div ref={badgeRef}>
              <span className="inline-flex items-center gap-3 border border-foreground/20 rounded-full px-4 py-1.5">
                <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                  <span className="relative flex rounded-full h-2.5 w-2.5 bg-accent" />
                </span>
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                  v2.0 — Now Live
                </span>
              </span>
            </div>

            {/* Headline */}
            <h1
              ref={headlineRef}
              className="relative font-black uppercase tracking-tighter leading-[0.86] text-foreground"
              style={{ fontSize: "clamp(3.6rem, 8.5vw, 6.2rem)" }}
            >
              {/* Scanline streak overlay */}
              <span
                className="headline-streak absolute inset-y-0 w-16 pointer-events-none"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(249,115,22,0.15) 50%, transparent 100%)",
                  zIndex: 2,
                }}
              />

              <span className="block overflow-hidden pb-1">
                <span className="word-wrap inline-block">Precision</span>
              </span>
              <span className="block overflow-hidden pb-1">
                <span
                  className="word-wrap inline-block text-transparent bg-clip-text"
                  style={{
                    backgroundImage: "linear-gradient(135deg, #f97316 0%, #3b82f6 55%, #8b5cf6 100%)",
                  }}
                >
                  Execution
                </span>
              </span>
            </h1>

            {/* Subtext */}
            <p
              ref={subtextRef}
              className="max-w-[22rem] text-[1.1rem] font-medium text-muted-foreground leading-relaxed"
            >
              The precision workspace for multimedia notes and Kanban workflows.{" "}
              Built for builders, engineers, and creators.
            </p>

            {/* CTAs */}
            <div ref={ctaRef} className="flex items-center gap-5 flex-wrap">
              <Link
                href="/sign-up"
                className="inline-flex h-14 items-center justify-center rounded-full bg-foreground px-8 font-bold text-background text-sm uppercase tracking-widest transition-all duration-200 hover:bg-accent hover:text-white"
                style={{ boxShadow: "0 4px 0 0 rgba(0,0,0,.28)" }}
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget, { y: -4, duration: 0.25, ease: "power2.out" });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget, { y: 0,  duration: 0.35, ease: "bounce.out" });
                }}
              >
                Get Started Free
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors group"
              >
                Explore Features
                <span className="transition-transform group-hover:translate-x-1 inline-block">→</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-9 pt-5 border-t border-foreground/10">
              {stats.map((stat, i) => (
                <div key={i} className="stat-item flex flex-col gap-0.5">
                  <div className="flex items-baseline gap-0.5 font-black text-[1.6rem] text-foreground tabular-nums leading-none">
                    <span ref={(el) => { countRefs.current[i] = el; }}>0</span>
                    <span className="text-accent text-xl">{stat.suffix}</span>
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ════════════ RIGHT: Cards ════════════ */}
          <div className="hidden lg:flex items-center justify-center h-[540px] relative">

            {/* Decorative orbit rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-[18rem] h-[18rem] rounded-full border border-foreground/[0.07] animate-spin"
                style={{ animationDuration: "28s" }}
              />
              <div
                className="absolute w-[28rem] h-[28rem] rounded-full border border-foreground/[0.05] animate-spin"
                style={{ animationDuration: "44s", animationDirection: "reverse" }}
              />
              {/* Center glow */}
              <div
                className="absolute w-24 h-24 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)",
                  filter: "blur(12px)",
                }}
              />
            </div>

            {/* Card cluster */}
            <div
              ref={clusterRef}
              className="relative"
              style={{ width: "192px", height: "256px" }}
            >
              {taskCards.map((card, i) => (
                <div
                  key={i}
                  className="task-card absolute rounded-2xl p-5 flex flex-col justify-between select-none"
                  style={{
                    inset:        0,
                    background:   card.color,
                    boxShadow:    `0 24px 70px -12px ${card.color}90`,
                    border:       "1.5px solid rgba(255,255,255,0.22)",
                    cursor:       "default",
                  }}
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-white/40" />
                      <div className="w-2 h-2 rounded-full bg-white/25" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-white/85 bg-black/20 px-2 py-[3px] rounded-full">
                      {card.status}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <p className="font-bold text-sm text-white leading-snug">{card.label}</p>
                    <div className="space-y-[5px]">
                      <div className="h-1.5 bg-white/30 rounded-full" />
                      <div className="h-1.5 bg-white/20 rounded-full w-3/4" />
                      <div className="h-1.5 bg-white/15 rounded-full w-1/2" />
                    </div>
                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-white/60 font-mono">
                        <span>Progress</span>
                        <span>{card.progress}%</span>
                      </div>
                      <div className="h-1 bg-black/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white/70 rounded-full transition-none"
                          style={{ width: `${card.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottom row */}
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-1.5">
                      {Array.from({ length: (i % 3) + 1 }).map((_, a) => (
                        <div
                          key={a}
                          className="w-6 h-6 rounded-full bg-white/35 ring-[1.5px] ring-white/20"
                        />
                      ))}
                    </div>
                    <span className="font-mono text-[10px] text-white/45">{`0${i + 1}`}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* ─────────────────────────────────── */}

        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { MoveLeft, Home, Search, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CustomCursor } from "@/components/CustomCursor";

export default function NotFound() {
  const containerRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HTMLDivElement>(null);
  const eyeLeftRef = useRef<HTMLDivElement>(null);
  const eyeRightRef = useRef<HTMLDivElement>(null);
  const glitchRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Floating animation for the bot
      gsap.to(botRef.current, {
        y: -15,
        duration: 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Eye blinking animation
      const blink = () => {
        gsap.to([eyeLeftRef.current, eyeRightRef.current], {
          scaleY: 0.1,
          duration: 0.1,
          repeat: 1,
          yoyo: true,
          onComplete: () => {
            setTimeout(blink, Math.random() * 4000 + 2000);
          },
        });
      };
      setTimeout(blink, 2000);

      // Glitch effect on the 404 text
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 3 });
      tl.to(glitchRef.current, { skewX: 20, duration: 0.1, ease: "power4.inOut" })
        .to(glitchRef.current, { skewX: -20, duration: 0.1, ease: "power4.inOut" })
        .to(glitchRef.current, { skewX: 0, duration: 0.1, ease: "power4.inOut" })
        .to(glitchRef.current, { x: -10, duration: 0.05 })
        .to(glitchRef.current, { x: 10, duration: 0.05 })
        .to(glitchRef.current, { x: 0, duration: 0.05 });

      // Staggered entry for text
      gsap.from(".not-found-item", {
        y: 20,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!eyeLeftRef.current || !eyeRightRef.current) return;
    
    const { clientX, clientY } = e;
    const eyes = [eyeLeftRef.current, eyeRightRef.current];
    
    eyes.forEach((eye) => {
      const rect = eye.getBoundingClientRect();
      const x = (clientX - rect.left) / 25;
      const y = (clientY - rect.top) / 25;
      gsap.to(eye, { x, y, duration: 0.3 });
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <CustomCursor />
      <Navbar />
      <main 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative flex-1 w-full flex flex-col items-center bg-background overflow-hidden p-6 pt-36 pb-20"
      >
        {/* Background Decor */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20 z-0"
          style={{
            backgroundImage: "radial-gradient(rgb(var(--foreground) / 0.15) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        
        {/* Decorative scanline */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%] z-10" />

        {/* Mascot: D-Bot (Scaled Down) */}
        <div ref={botRef} className="relative mb-10 select-none scale-90 md:scale-100 transform transition-transform">
          {/* Antenna */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-1 h-6 bg-foreground">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-accent rounded-full animate-pulse" />
          </div>
          
          {/* Head */}
          <div className="w-40 h-32 bg-card border-[3px] border-foreground shadow-hard flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-foreground/10" />
            
            <div className="flex gap-6 mb-3">
              <div className="w-8 h-8 bg-foreground flex items-center justify-center rounded-sm">
                <div ref={eyeLeftRef} className="w-3 h-3 bg-accent rounded-full shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
              </div>
              <div className="w-8 h-8 bg-foreground flex items-center justify-center rounded-sm">
                <div ref={eyeRightRef} className="w-3 h-3 bg-accent rounded-full shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
              </div>
            </div>
            
            <div className="w-20 h-3 bg-foreground/10 rounded-full border border-foreground/20 flex items-center justify-center overflow-hidden">
              <div 
                className="w-full h-full bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,rgb(var(--accent)/0.2)_4px,rgb(var(--accent)/0.2)_8px)] animate-[marquee_2s_linear_infinite]" 
                style={{ animationName: "marquee" }}
              />
            </div>
          </div>
          
          <div className="mx-auto w-10 h-5 bg-foreground/20 border-x-[3px] border-foreground" />
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-24 h-3 bg-foreground/10 rounded-[100%] blur-md" />
        </div>

        {/* Content */}
        <div className="text-center z-10 space-y-5 max-w-lg">
          <div className="not-found-item">
            <h1 
              ref={glitchRef}
              className="font-pixel text-5xl md:text-7xl tracking-tighter text-foreground mb-1"
            >
              404
            </h1>
            <div className="h-1.5 w-full bg-accent shadow-hard-sm mb-6" />
          </div>

          <div className="not-found-item space-y-3">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-foreground">
              Route Not Found
            </h2>
            <p className="text-muted-foreground font-medium text-base leading-relaxed">
              Even our most precise execution units couldn&apos;t find this page. 
              It might have been archived, deleted, or never existed in this timeline.
            </p>
          </div>

          <div className="not-found-item flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 bg-foreground px-6 font-bold text-background text-xs uppercase tracking-widest transition-all duration-200 hover:bg-accent hover:text-white shadow-hard active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <Home className="w-3.5 h-3.5" />
              Return to Base
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 border-2 border-foreground bg-background px-6 font-bold text-foreground text-xs uppercase tracking-widest transition-all duration-200 hover:bg-muted shadow-hard active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <MoveLeft className="w-3.5 h-3.5" />
              Go Back
            </button>
          </div>

          <div className="not-found-item pt-10 flex items-center justify-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em]">
              <Search className="w-2.5 h-2.5" />
              Scanning...
            </div>
            <div className="h-px w-8 bg-foreground/10" />
            <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em]">
              <AlertCircle className="w-2.5 h-2.5 text-accent" />
              Status: Lost
            </div>
          </div>
        </div>

        <style jsx global>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-24px); }
          }
        `}</style>
      </main>
      <Footer />
    </div>
  );
}

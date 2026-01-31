"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Github,
  Twitter,
  Linkedin,
  Youtube,
  ArrowRight,
  MessageSquare,
  Cloud,
  Moon,
  Sun
} from "lucide-react";

export function Footer() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && (theme === "light" || (theme === "system" && resolvedTheme === "light"));
  const isDark = mounted && (theme === "dark" || (theme === "system" && resolvedTheme === "dark"));

  return (
    <footer className="bg-background text-foreground pt-20 pb-6 overflow-hidden font-sans border-t border-border">
      <div className="mx-auto max-w-7xl px-6">
        {/* Top Section: Navigation & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-24">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <span className="font-pixel text-2xl font-bold tracking-tighter uppercase text-foreground">DOIT</span>
            </Link>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="mb-6 font-bold text-xs uppercase tracking-widest text-muted-foreground/60">Product</h4>
            <ul className="space-y-4 text-sm font-medium text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">What is DoIt</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Customers</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Research</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">News</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 font-bold text-xs uppercase tracking-widest text-muted-foreground/60">Developers</h4>
            <ul className="space-y-4 text-sm font-medium text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground transition-colors flex items-center gap-2">
                  GitHub <span className="bg-foreground/10 text-muted-foreground px-1.5 py-0.5 rounded text-[10px]">20.6K</span>
                </Link>
              </li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Documentation</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Community</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Demos</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 font-bold text-xs uppercase tracking-widest text-muted-foreground/60">Company</h4>
            <ul className="space-y-4 text-sm font-medium text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">About us</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Open positions</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Privacy policy</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Terms of service</Link></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-1">
            <h4 className="mb-6 font-bold text-xs uppercase tracking-widest text-muted-foreground/60">Newsletter</h4>
            <form className="flex w-full relative">
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full bg-transparent border border-border px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/50 transition-all"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 aspect-square bg-foreground/10 hover:bg-foreground/20 flex items-center justify-center transition-colors"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Middle Section: Giant Text */}
      <div className="w-full border-y border-border py-4 mb-8 bg-secondary/30 overflow-hidden select-none flex">
        <div className="flex whitespace-nowrap animate-marquee min-w-full">
          <h1 className="text-[8rem] md:text-[12rem] font-black leading-none tracking-tighter text-foreground opacity-90 px-8">
            DOIT FOLLOW DOIT
          </h1>
          <h1 className="text-[8rem] md:text-[12rem] font-black leading-none tracking-tighter text-foreground opacity-90 px-8">
            DOIT FOLLOW DOIT
          </h1>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Social Icons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#" className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Github className="h-4 w-4" /> GitHub
            </Link>
            <Link href="#" className="flex items-center gap-2 hover:text-foreground transition-colors">
              <MessageSquare className="h-4 w-4" /> Discord
            </Link>
            <Link href="#" className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Twitter className="h-4 w-4" /> Twitter/X
            </Link>
            <Link href="#" className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Cloud className="h-4 w-4" /> Bluesky
            </Link>
            <Link href="#" className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Youtube className="h-4 w-4" /> YouTube
            </Link>
            <Link href="#" className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Linkedin className="h-4 w-4" /> LinkedIn
            </Link>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center bg-secondary/50 border border-border rounded-sm p-1">
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center gap-2 px-3 py-1 rounded-sm text-xs font-medium transition-all ${
                isLight ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sun className="h-3 w-3" /> Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-2 px-3 py-1 rounded-sm text-xs font-medium transition-all ${
                isDark ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Moon className="h-3 w-3" /> Dark
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
"use client";

import Link from "next/link";
import { Zap, Twitter, Github, Linkedin, ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-background pt-24 pb-12 border-t-2 border-foreground">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="flex h-8 w-8 items-center justify-center bg-background text-foreground rounded-sm border-2 border-transparent group-hover:border-primary group-hover:text-primary transition-all">
                <Zap className="h-5 w-5 fill-current" />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase">DoIt.</span>
            </Link>
            <p className="mb-6 max-w-xs text-sm text-background/70 leading-relaxed font-mono">
              The precision tool for multimedia notes and Kanban project management. 
              Built for builders.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-background/70 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-background/70 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-background/70 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="mb-6 font-bold uppercase tracking-wider text-sm text-primary">Product</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="#" className="text-background/70 hover:text-white hover:translate-x-1 transition-all inline-block">Features</Link></li>
              <li><Link href="#" className="text-background/70 hover:text-white hover:translate-x-1 transition-all inline-block">Pricing</Link></li>
              <li><Link href="#" className="text-background/70 hover:text-white hover:translate-x-1 transition-all inline-block">Download</Link></li>
              <li><Link href="#" className="text-background/70 hover:text-white hover:translate-x-1 transition-all inline-block">Changelog</Link></li>
              <li><Link href="#" className="text-background/70 hover:text-white hover:translate-x-1 transition-all inline-block">Docs</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="mb-6 font-bold uppercase tracking-wider text-sm text-primary">Company</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="#" className="text-background/70 hover:text-white hover:translate-x-1 transition-all inline-block">About</Link></li>
              <li><Link href="#" className="text-background/70 hover:text-white hover:translate-x-1 transition-all inline-block">Careers</Link></li>
              <li><Link href="#" className="text-background/70 hover:text-white hover:translate-x-1 transition-all inline-block">Blog</Link></li>
              <li><Link href="#" className="text-background/70 hover:text-white hover:translate-x-1 transition-all inline-block">Contact</Link></li>
              <li><Link href="#" className="text-background/70 hover:text-white hover:translate-x-1 transition-all inline-block">Partners</Link></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 className="mb-6 font-bold uppercase tracking-wider text-sm text-primary">Stay Updated</h4>
            <p className="mb-4 text-xs text-background/70">
              Join our newsletter for the latest updates and workflow tips.
            </p>
            <form className="flex flex-col gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-background/10 border border-background/20 px-4 py-3 text-sm text-white placeholder:text-background/40 focus:outline-none focus:border-primary focus:bg-background/20 transition-all rounded-none"
              />
              <button 
                type="submit" 
                className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-3 text-sm font-bold uppercase tracking-wide hover:bg-primary/90 transition-colors"
              >
                Subscribe
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-background/50">
            © 2026 DoIt Inc. All rights reserved.
          </p>
          <div className="flex gap-8 text-xs font-bold text-background/70">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

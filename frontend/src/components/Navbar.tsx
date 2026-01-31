"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { UserProfile } from "@/components/UserProfile";

export function Navbar() {
  const { data: session } = authClient.useSession();

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
      <header className="flex h-16 w-full max-w-7xl items-center justify-between rounded-2xl border-2 border-foreground/10 bg-background/80 px-6 backdrop-blur-xl shadow-hard-sm transition-all hover:shadow-hard hover:-translate-y-0.5">
        
        {/* Left: Logo & Tagline */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
             <span className="font-pixel text-xl font-bold tracking-tighter uppercase">DOIT</span>
          </Link>
          
          <div className="hidden h-6 w-[2px] bg-foreground/10 lg:block"></div>
          
          <span className="hidden text-xs font-bold tracking-wide text-muted-foreground uppercase lg:block">
            The modern way to organize your tasks & projects.
          </span>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden items-center gap-8 md:flex">
          {["Product", "Solutions", "Learn"].map((item) => (
            <div key={item} className="group relative flex cursor-pointer items-center gap-1 text-sm font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground">
              {item}
              <ChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180" />
            </div>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-xs font-bold uppercase tracking-wide hover:underline">
                Dashboard
              </Link>
              <UserProfile minimal />
            </div>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hidden text-xs font-bold uppercase tracking-wide hover:underline sm:block"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-background transition-transform hover:scale-105 active:scale-95"
              >
                [ Get Started ]
              </Link>
            </>
          )}
        </div>

      </header>
    </div>
  );
}

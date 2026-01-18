"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { LogIn, Loader2, ArrowRight, Zap, Eye, EyeOff } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    await authClient.signIn.email(
      { email, password },
      {
        onSuccess: () => {
          router.push("/dashboard");
        },
        onError: (ctx) => {
          setError(ctx.error.message);
          setIsLoading(false);
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 font-sans">
       <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-lg font-bold tracking-tighter">
          <div className="flex h-8 w-8 items-center justify-center bg-primary text-white border-2 border-foreground shadow-hard-sm">
             <Zap className="h-5 w-5" fill="currentColor" />
          </div>
          DoIt.
       </Link>

      <div className="w-full max-w-sm border-2 border-foreground bg-white p-8 shadow-hard">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black uppercase tracking-tighter">
            Access Terminal
          </h1>
          <p className="font-mono text-xs text-muted-foreground">
            // Authenticate to continue
          </p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-6" autoComplete="off">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-none border-2 border-input bg-transparent px-3 py-2 text-sm font-bold placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:shadow-hard-sm"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-2 relative">
            <label
              htmlFor="password"
              className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground"
            >
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-none border-2 border-input bg-transparent px-3 py-2 text-sm font-bold placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:shadow-hard-sm pr-10"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {error && (
            <div className="border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full h-12 items-center justify-center gap-2 border-2 border-foreground bg-primary px-6 text-sm font-bold text-white shadow-hard-sm transition-transform hover:-translate-y-0.5 hover:shadow-hard active:translate-y-0 active:shadow-hard-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              Authenticate
            </button>
          </div>
        </form>

        <div className="mt-8 border-t-2 border-dashed border-foreground/20 pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            No account?{" "}
            <Link
              href="/sign-up"
              className="font-bold text-primary hover:underline underline-offset-2"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
       <p className="mt-8 font-mono text-xs text-muted-foreground">© 2026 DoIt Systems. All rights reserved.</p>
    </div>
  );
}

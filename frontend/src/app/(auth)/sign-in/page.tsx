"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Loader2, Eye, EyeOff, CheckCircle2, Mail, Lock, Github } from "lucide-react";

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
        onSuccess: (ctx) => {
          const authToken = ctx.response.headers.get("set-auth-token");
          if (authToken) {
            localStorage.setItem("bearer_token", authToken);
          }
          router.push("/dashboard");
        },
        onError: (ctx) => {
          setError(ctx.error.message);
          setIsLoading(false);
        },
      }
    );
  };

  const handleSocialSignIn = async (provider: "github" | "google") => {
    setIsLoading(true);
    setError(null);
    await authClient.signIn.social(
      {
        provider,
        callbackURL: "/dashboard",
      },
      {
        onSuccess: (ctx) => {
          const authToken = ctx.response.headers.get("set-auth-token");
          if (authToken) {
            localStorage.setItem("bearer_token", authToken);
          }
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
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      {/* Left Column: Form */}
      <div className="flex items-center justify-center py-12 px-6 bg-background">
        <div className="mx-auto w-full max-w-[400px] space-y-8">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-3xl font-black uppercase tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSocialSignIn("github")}
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Github className="h-4 w-4" />
              GitHub
            </button>
            <button
              onClick={() => handleSocialSignIn("google")}
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg role="img" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.908 3.152-1.928 4.176-1.02 1.024-2.6 2.052-5.912 2.052-5.452 0-9.872-4.448-9.872-9.9s4.42-9.9 9.872-9.9c2.952 0 5.16 1.152 6.708 2.592l2.304-2.304C19.464 1.14 16.488 0 12.48 0 5.58 0 0 5.58 0 12.48s5.58 12.48 12.48 12.48c3.756 0 6.6-1.224 8.76-3.492 2.22-2.22 2.928-5.328 2.928-7.788 0-.756-.06-1.488-.18-2.22h-11.52z" />
              </svg>
              Google
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-bold tracking-widest">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4" autoComplete="off">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all focus:border-primary"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs underline font-bold text-primary"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all focus:border-primary"
                  placeholder="••••••••"
                  required
                />
                 <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive font-bold border border-destructive/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-foreground text-background hover:bg-foreground/90 h-11 w-full uppercase tracking-widest shadow-lg"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="underline font-black hover:text-primary transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </div>

      {/* Right Column: Decorative - dark in light mode, light in dark mode */}
      <div className="hidden lg:block relative bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">
        <div className="absolute inset-0 opacity-20"
             style={{
                 backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
                 backgroundSize: '32px 32px'
             }}
        />
        <div className="relative h-full flex flex-col justify-between p-12">
           <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white flex items-center justify-center rounded font-bold">D.</div>
              <span className="font-mono tracking-widest uppercase text-sm">System Access</span>
           </div>

           <div className="space-y-6">
             <blockquote className="space-y-2">
               <p className="text-lg font-medium leading-relaxed">
                 &ldquo;DoIt has revolutionized how we track our sprint velocity. It&apos;s the only tool that actually makes us faster.&rdquo;
               </p>
               <footer className="text-sm opacity-60">Marcus Chen, Product Lead</footer>
             </blockquote>
             <div className="flex gap-4">
                <div className="flex items-center gap-2 text-xs font-mono uppercase opacity-40">
                   <CheckCircle2 className="h-4 w-4" /> Secure
                </div>
                <div className="flex items-center gap-2 text-xs font-mono uppercase opacity-40">
                   <CheckCircle2 className="h-4 w-4" /> Encrypted
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
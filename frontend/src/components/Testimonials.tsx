"use client";

import { GitPullRequest, GitMerge, Clock, CheckCircle2 } from "lucide-react";

const testimonials = [
  {
    user: "alex-code",
    repo: "doit/core-platform",
    time: "2h",
    title: "Refactor auth middleware for better performance",
    description: "Switched to stateless session handling. Reduced latency by 40ms on average.",
    status: "merged",
    avatarColor: "bg-blue-500",
  },
  {
    user: "sarah-dev",
    repo: "marketing/landing-page",
    time: "4h",
    title: "Implement new hero section animations",
    description: "Added GSAP interactions for the main headline. distinct visual improvement.",
    status: "merged",
    avatarColor: "bg-green-500",
  },
  {
    user: "jason-k8s",
    repo: "infra/cluster-ops",
    time: "1d",
    title: "Upgrade cluster to v1.29",
    description: "Rolling update completed. Node pools scaled successfully without downtime.",
    status: "merged",
    avatarColor: "bg-red-500",
  },
  {
    user: "emily-ux",
    repo: "design/system-ui",
    time: "5h",
    title: "Standardize button component variants",
    description: "Consolidated primary, secondary, and ghost variants into a single versatile component.",
    status: "merged",
    avatarColor: "bg-purple-500",
  },
  {
    user: "david-backend",
    repo: "api/graphql-gateway",
    time: "2d",
    title: "Optimize resolver query complexity",
    description: "Added depth limiting and query cost analysis to prevent abuse.",
    status: "merged",
    avatarColor: "bg-orange-500",
  },
  {
    user: "lisa-qa",
    repo: "testing/e2e-suite",
    time: "6h",
    title: "Add Cypress tests for checkout flow",
    description: "Covered critical path scenarios including payment gateway mocking.",
    status: "merged",
    avatarColor: "bg-teal-500",
  },
];

export function Testimonials() {
  return (
    <section className="bg-background py-24 border-b-2 border-foreground">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-5xl font-black uppercase tracking-tighter text-foreground md:text-6xl mb-4">
            Stay ahead of <br className="hidden md:block" /> the curve
          </h2>
          <p className="mx-auto max-w-2xl text-lg font-medium text-muted-foreground">
            Thousands of top developers use DoIt daily to orchestrate their workflows and ship faster.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="group flex flex-col justify-between border-2 border-dashed border-foreground/30 bg-card p-6 transition-all hover:border-solid hover:border-primary hover:shadow-hard-sm"
            >
              <div className="mb-4 flex items-center justify-between text-xs font-mono text-muted-foreground">
                <div className="flex items-center gap-2">
                  <GitPullRequest className="h-4 w-4" />
                  <span>{item.repo}</span>
                </div>
                <div className="flex items-center gap-1">
                   <Clock className="h-3 w-3" />
                   {item.time}
                </div>
              </div>

              <div className="mb-6 space-y-2">
                <h3 className="font-bold leading-tight text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-auto">
                 <div className="flex items-center gap-2">
                    <div className={`h-6 w-6 rounded-full ${item.avatarColor} border border-foreground shadow-sm`}></div>
                    <span className="text-xs font-bold text-foreground">{item.user}</span>
                 </div>
                 
                 <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-sm border border-primary/20 text-primary text-[10px] font-mono font-bold uppercase tracking-wider">
                    <GitMerge className="h-3 w-3" />
                    Merged
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

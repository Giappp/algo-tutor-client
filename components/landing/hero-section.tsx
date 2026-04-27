"use client";

import { ArrowRight, PlayCircle, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BrainCircuit } from "lucide-react";
import { useLandingData } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import type { PlatformStats } from "@/lib/types/landing";

function HeroBanner() {
  return (
    <div className="relative w-full max-w-2xl mx-auto hidden md:block" aria-hidden="true">
      <div className="absolute inset-0 bg-primary/20 orb-primary rounded-full blur-3xl" />

      <div className="relative code-border rounded-2xl overflow-hidden shadow-2xl shadow-primary/10">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/40">
          <div className="flex gap-1.5">
            <div className="size-3 rounded-full bg-[oklch(0.65_0.2_25)]" />
            <div className="size-3 rounded-full bg-[oklch(0.7_0.18_85)]" />
            <div className="size-3 rounded-full bg-[oklch(0.65_0.2_145)]" />
          </div>
          <span className="text-xs text-muted-foreground ml-2 font-mono">two-sum.js</span>
        </div>

        <div className="grid grid-cols-2 divide-x divide-border/50">
          <div className="p-4 font-mono text-xs leading-relaxed">
            <div className="space-y-1">
              <div>
                <span className="text-[oklch(0.55_0.15_250)]">function</span>{" "}
                <span className="text-[oklch(0.7_0.18_195)]">twoSum</span>
                <span className="text-[oklch(0.9_0_0)]">(</span>
                <span className="text-[oklch(0.6_0.12_280)]">nums</span>,
                <span className="text-[oklch(0.9_0_0)]"> </span>
                <span className="text-[oklch(0.6_0.12_280)]">target</span>
                <span className="text-[oklch(0.9_0_0)]">) {"{"}</span>
              </div>
              <div className="pl-4">
                <span className="text-[oklch(0.55_0.15_250)]">const</span>{" "}
                <span className="text-[oklch(0.6_0.12_280)]">map</span>
                <span className="text-[oklch(0.9_0_0)]"> = </span>
                <span className="text-[oklch(0.55_0.15_250)]">new</span>{" "}
                <span className="text-[oklch(0.7_0.18_195)]">Map</span>
                <span className="text-[oklch(0.9_0_0)]">();</span>
              </div>
              <div className="pl-4">
                <span className="text-[oklch(0.55_0.15_250)]">for</span>
                <span className="text-[oklch(0.9_0_0)]">(</span>
                <span className="text-[oklch(0.55_0.15_250)]">let</span>{" "}
                <span className="text-[oklch(0.6_0.12_280)]">i</span>
                <span className="text-[oklch(0.9_0_0)]"> = </span>
                <span className="text-[oklch(0.8_0.1_30)]">0</span>
                <span className="text-[oklch(0.9_0_0)]">; ...)</span>
              </div>
              <div className="pl-8">
                <span className="text-[oklch(0.55_0.15_250)]">const</span>{" "}
                <span className="text-[oklch(0.6_0.12_280)]">complement</span>
                <span className="text-[oklch(0.9_0_0)]"> = </span>
                <span className="text-[oklch(0.6_0.12_280)]">target</span>
                <span className="text-[oklch(0.9_0_0)]"> - </span>
                <span className="text-[oklch(0.6_0.12_280)]">nums</span>
                <span className="text-[oklch(0.9_0_0)]">[</span>
                <span className="text-[oklch(0.6_0.12_280)]">i</span>
                <span className="text-[oklch(0.9_0_0)]">];</span>
              </div>
              <div className="pl-8">
                <span className="text-[oklch(0.55_0.15_250)]">if</span>
                <span className="text-[oklch(0.9_0_0)]">(</span>
                <span className="text-[oklch(0.6_0.12_280)]">map</span>
                <span className="text-[oklch(0.9_0_0)]">.</span>
                <span className="text-[oklch(0.7_0.18_195)]">has</span>
                <span className="text-[oklch(0.9_0_0)]">(</span>
                <span className="text-[oklch(0.6_0.12_280)]">complement</span>
                <span className="text-[oklch(0.9_0_0)]">)) ...</span>
              </div>
              <div className="pl-4 text-muted-foreground">
                <span className="text-[oklch(0.6_0.12_280)]">map</span>
                <span className="text-[oklch(0.9_0_0)]">.</span>
                <span className="text-[oklch(0.7_0.18_195)]">set</span>
                <span className="text-[oklch(0.9_0_0)]">(nums[i], i);</span>
              </div>
              <div className="text-[oklch(0.9_0_0)]">{"}"}</div>
            </div>
          </div>

          <div className="p-4 bg-primary/[0.03]">
            <div className="flex items-center gap-2 mb-3">
              <div className="size-6 rounded-full bg-primary flex items-center justify-center">
                <BrainCircuit className="size-3.5 text-primary-foreground" />
              </div>
              <span className="text-xs font-semibold text-primary">AI Tutor</span>
            </div>
            <div className="space-y-2">
              <div className="bg-card rounded-lg p-3 border border-border/50 shadow-sm">
                <p className="text-xs text-card-foreground leading-relaxed">
                  <span className="text-primary font-medium">Hint: </span>
                  A hash map lets you look up complement in O(1) time. What value are you looking
                  for each element?
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="size-3.5 text-[oklch(0.65_0.2_145)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-muted-foreground">Hint consumed — no spoilers!</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -top-6 -left-10 size-12 float-slow opacity-40">
        <svg viewBox="0 0 48 48" fill="none" className="text-primary">
          <circle cx="24" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="36" r="6" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="36" cy="36" r="6" stroke="currentColor" strokeWidth="1.5" />
          <line x1="24" y1="18" x2="12" y2="30" stroke="currentColor" strokeWidth="1.5" />
          <line x1="24" y1="18" x2="36" y2="30" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
      <div className="absolute -bottom-4 -right-8 size-10 float-medium opacity-30">
        <svg viewBox="0 0 40 40" fill="none" className="text-[oklch(0.7_0.18_85)]">
          <rect x="4" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="16" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="28" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="4" y="16" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="16" y="16" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="28" y="16" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
      <div className="absolute top-1/2 -right-16 size-8 float-fast opacity-25">
        <svg viewBox="0 0 32 32" fill="none" className="text-[oklch(0.65_0.15_340)]">
          <circle cx="16" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="6" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="26" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="6" cy="24" r="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="26" cy="24" r="3" stroke="currentColor" strokeWidth="1.5" />
          <line x1="16" y1="13" x2="6" y2="11" stroke="currentColor" strokeWidth="1" />
          <line x1="16" y1="13" x2="26" y2="11" stroke="currentColor" strokeWidth="1" />
          <line x1="16" y1="19" x2="6" y2="21" stroke="currentColor" strokeWidth="1" />
          <line x1="16" y1="19" x2="26" y2="21" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}

export function HeroSection() {
  const { data: stats, isLoading } = useLandingData<PlatformStats>("/landing/stats");

  const studentCount = stats?.totalStudents
    ? `${(stats.totalStudents / 1000).toFixed(0)}K+`
    : isLoading ? "" : "50K+";
  const problemCount = stats?.totalProblems
    ? `${stats.totalProblems}+`
    : isLoading ? "" : "1K+";
  const topicCount = stats?.totalTopics
    ? `${stats.totalTopics}`
    : isLoading ? "" : "12";

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      <div className="absolute inset-0 bg-dotgrid opacity-40" />
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 orb-primary rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-[oklch(0.65_0.15_340)]/10 orb-primary rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text content */}
          <div className="space-y-8">
            <Badge variant="secondary" className="gap-1.5 text-xs px-3 py-1">
              <Zap className="size-3 text-primary" />
              AI-Powered Learning Platform
            </Badge>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              Master
              <br />
              <span className="text-gradient">Algorithms</span>
              <br />
              the Smart Way
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Learn algorithms systematically through structured roadmaps, hands-on coding, and an AI tutor
              that guides you — without spoiling the answer.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" className="gap-2 text-base px-6 h-11 glow-border">
                Start Learning Free
                <ArrowRight className="size-4" />
              </Button>
              <Button variant="outline" size="lg" className="gap-2 text-base px-6 h-11">
                <PlayCircle className="size-4" />
                Watch Demo
              </Button>
            </div>

            {/* Dynamic stats — show skeletons while loading */}
            <div className="flex items-center gap-6 pt-2">
              {isLoading ? (
                <>
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-12" />
                </>
              ) : (
                <>
                  {[
                    { value: studentCount, label: "Students" },
                    { value: problemCount, label: "Problems" },
                    { value: topicCount, label: "Topics" },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-2">
                      <span className="text-xl font-bold text-foreground">{stat.value}</span>
                      <span className="text-xs text-muted-foreground">{stat.label}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          <HeroBanner />
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

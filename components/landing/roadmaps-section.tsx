"use client";

import { useLandingData } from "@/hooks";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getIcon } from "@/lib/lucide-icons";
import { Skeleton } from "@/components/ui/skeleton";
import type { RoadmapTopic } from "@/lib/types/landing";

const ROADMAP_GRADIENTS = [
  "[oklch(0.65_0.2_145)]",
  "[oklch(0.7_0.18_250)]",
  "[oklch(0.6_0.18_180)]",
  "[oklch(0.7_0.18_85)]",
  "[oklch(0.65_0.15_340)]",
  "[oklch(0.6_0.18_25)]",
  "[oklch(0.7_0.18_195)]",
  "[oklch(0.55_0.15_280)]",
];

export function RoadmapsSection() {
  const { data: roadmaps, isLoading } = useLandingData<RoadmapTopic[]>("/landing/roadmaps");

  return (
    <section id="roadmaps" className="py-24 lg:py-32 bg-muted/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 reveal-up">
          <div className="space-y-3">
            <Badge variant="secondary" className="text-xs">
              Learning Roadmaps
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              12 topics, zero gaps
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg">
              Each roadmap is a curated path from fundamentals to advanced mastery.
            </p>
          </div>
          <Button variant="outline" className="gap-2 self-start sm:self-auto shrink-0">
            View All Roadmaps
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible no-scrollbar">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="flex-shrink-0 border-border/50" style={{ width: "280px" }}>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <Skeleton className="size-10 rounded-lg" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-5 w-32" />
                    <div className="space-y-1.5">
                      {[60, 30, 10].map((w, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <Skeleton className="h-1.5 flex-1" style={{ width: `${w}%` }} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            : roadmaps?.map((roadmap, i) => {
                const Icon = getIcon(roadmap.iconKey);
                const color = ROADMAP_GRADIENTS[i % ROADMAP_GRADIENTS.length];
                const { easy, medium, hard } = roadmap.difficultyBreakdown;
                const total = easy + medium + hard;

                return (
                  <Card
                    key={roadmap.id}
                    className="group flex-shrink-0 sm:flex-shrink border-border/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer reveal-up"
                    style={{ transitionDelay: `${i * 60}ms`, width: "280px" }}
                  >
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div
                          className="size-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `oklch(from ${color} l c h / 0.15)` }}
                        >
                          <Icon className="size-5" style={{ color: `oklch(from ${color} l c h)` }} />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {roadmap.problemCount} problems
                        </Badge>
                      </div>

                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {roadmap.name}
                      </h3>

                      <div className="space-y-1.5">
                        {[
                          { label: "Easy", pct: (easy / total) * 100, col: "bg-[oklch(0.65_0.2_145)]" },
                          { label: "Medium", pct: (medium / total) * 100, col: "bg-[oklch(0.7_0.18_85)]" },
                          { label: "Hard", pct: (hard / total) * 100, col: "bg-[oklch(0.6_0.22_25)]" },
                        ].map((d) => (
                          <div key={d.label} className="flex items-center gap-2">
                            <div className="w-14 text-xs text-muted-foreground">{d.label}</div>
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn("h-full rounded-full transition-all", d.col)}
                                style={{ width: `${d.pct}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
        </div>
      </div>
    </section>
  );
}

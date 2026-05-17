"use client";

import { useApiData } from "@/hooks";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { RoadmapTopic } from "@/lib/types/landing";
import Link from "next/link";

export function RoadmapsSection() {
    const { data: roadmaps, isLoading } = useApiData<RoadmapTopic[]>("/landing/roadmaps");

    return (
        <section id="roadmaps" className="py-24 lg:py-32 bg-muted/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 reveal-up">
                    <div className="space-y-3">
                        <Badge variant="secondary" className="text-xs">
                            Learning Roadmaps
                        </Badge>
                        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
                            10+ topics, zero gaps
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

                <div
                    className="flex gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible no-scrollbar">
                    {isLoading
                        ? Array.from({ length: 4 }).map((_, i) => (
                            <Link
                                key={i}
                                href="#"
                                className="flex-shrink-0 sm:flex-shrink reveal-up"
                                style={{ width: "280px" }}
                            >
                                <Card size="sm" className="overflow-hidden">
                                    <div className="relative h-40 w-full">
                                        <Skeleton className="size-full rounded-none" />
                                    </div>
                                    <CardContent className="p-3 space-y-1.5">
                                        <Skeleton className="h-4 w-28" />
                                        <Skeleton className="h-3 w-full" />
                                        <Skeleton className="h-3 w-2/3" />
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                        : roadmaps?.map((roadmap, i) => (
                            <Link
                                key={roadmap.slug}
                                href={`/roadmaps/${roadmap.slug}`}
                                className="flex-shrink-0 sm:flex-shrink group reveal-up"
                                style={{ transitionDelay: `${i * 60}ms` }}
                            >
                                <div className="hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                                    <div className="relative rounded-2xl overflow-hidden group">
                                        <div className="group relative w-full aspect-video overflow-hidden rounded-lg">
                                            <Image
                                                fill
                                                priority
                                                src={roadmap.thumbnailUrl}
                                                alt={roadmap.name}
                                                sizes="(max-width: 768px) 100vw, 400px"
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                                        <div className="absolute top-2.5 right-2.5">
                                            <Badge
                                                variant="outline"
                                                className="text-[10px] font-semibold border-white/25 bg-black/40 text-white backdrop-blur-sm px-1.5 py-0"
                                            >
                                                {roadmap.level}
                                            </Badge>
                                        </div>

                                        {roadmap.isPremium && (
                                            <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-[oklch(0.7_0.16_85)]/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                                                <svg viewBox="0 0 12 12" className="size-3 fill-[oklch(0.9_0.15_85)]">
                                                    <path d="M6 1l1.35 2.73L10.5 4.1l-2.25 2.19.53 3.09L6 8.05 3.22 9.38l.53-3.09L1.5 4.1l3.15-.37z" />
                                                </svg>
                                                Premium
                                            </div>
                                        )}
                                    </div>

                                    <CardContent className="p-3 space-y-1.5">
                                        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
                                            {roadmap.name}
                                        </h3>
                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                            {roadmap.description}
                                        </p>
                                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                            <span>{roadmap.topicCount} topics</span>
                                            <span className="text-border/50">·</span>
                                            <span>{roadmap.lessonCount} lessons</span>
                                        </div>
                                    </CardContent>
                                </div>
                            </Link>
                        ))}
                </div>
            </div>
        </section>
    );
}

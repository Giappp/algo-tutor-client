"use client";

import { cn } from "@/lib/utils";
import type { Difficulty, Level } from "@/lib/types";
import { DifficultyBadge } from "./difficulty-badge";
import { BookOpenIcon, FileTextIcon, UsersIcon } from "lucide-react";
import Image from "next/image";

interface LearningPathCardProps {
    path: {
        name: string;
        slug: string;
        level: string;
        description: string;
        goal: string;
        thumbnailUrl: string;
        isPremium: boolean;
        enrollmentCount: number;
        topicCount: number;
        lessonCount: number;
    };
    className?: string;
    onEnroll?: (slug: string) => void;
    onViewDetail?: (slug: string) => void;
}

function levelToDifficulty(level: string): Level | Difficulty {
    const map: Record<string, Level | Difficulty> = {
        BEGINNER: "BEGINNER",
        INTERMEDIATE: "INTERMEDIATE",
        ADVANCED: "ADVANCED",
    };
    return map[level.toUpperCase()] ?? "INTERMEDIATE";
}

export function LearningPathCard({
    path,
    className,
    onEnroll,
    onViewDetail,
}: LearningPathCardProps) {
    return (
        <div
            className={cn(
                "group/card relative flex flex-col rounded-2xl overflow-hidden",
                "bg-card text-card-foreground ring-1 ring-border",
                "transition-all duration-500 ease-out",
                "hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/[0.08] hover:ring-primary/20",
                className
            )}
        >
            {/* ─── Thumbnail ─────────────────────────────────────── */}
            <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                    fill
                    src={path.thumbnailUrl}
                    alt={path.name}
                    className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />

                {/* Layered overlay: vignette + gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/5" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,0,0,0.3),transparent_70%)]" />

                {/* Difficulty Badge */}
                <div className="absolute top-3 right-3 z-10">
                    <DifficultyBadge difficulty={levelToDifficulty(path.level)} />
                </div>

                {/* Premium Badge */}
                {path.isPremium && (
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-full bg-[oklch(0.7_0.16_85)]/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                        <svg viewBox="0 0 12 12" className="size-3 shrink-0 fill-[oklch(0.9_0.15_85)]">
                            <path d="M6 1l1.35 2.73L10.5 4.1l-2.25 2.19.53 3.09L6 8.05 3.22 9.38l.53-3.09L1.5 4.1l3.15-.37z" />
                        </svg>
                        Premium
                    </div>
                )}

                {/* Hover Action Overlay */}
                {(onViewDetail || onEnroll) && (
                    <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-center gap-3 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-5 opacity-0 translate-y-3 transition-all duration-400 group-hover/card:opacity-100 group-hover/card:translate-y-0">
                        {onViewDetail && (
                            <button
                                onClick={() => onViewDetail(path.slug)}
                                className="flex items-center gap-2 h-10 rounded-xl border border-white/30 bg-white/10 px-5 text-sm font-medium text-white backdrop-blur-md transition-all duration-200 hover:bg-white/20 hover:border-white/50 hover:scale-105 active:scale-95"
                            >
                                <svg viewBox="0 0 16 16" className="size-4 shrink-0 fill-white/80">
                                    <path d="M8 3.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z" />
                                    <path d="M8 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                                </svg>
                                View Details
                            </button>
                        )}
                        {onEnroll && (
                            <button
                                onClick={() => onEnroll(path.slug)}
                                className="flex items-center gap-2 h-10 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 px-5 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-purple-600/40 active:scale-95"
                            >
                                <svg viewBox="0 0 16 16" className="size-4 shrink-0 fill-white">
                                    <path d="M8 1a.5.5 0 0 1 .5.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 7.293V1.5A.5.5 0 0 1 8 1z" transform="rotate(90 8 8)" />
                                </svg>
                                Enroll Now
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ─── Content ─────────────────────────────────────────── */}
            <div className="flex flex-col gap-3 p-4">
                {/* Title */}
                <h3 className="text-base font-bold leading-tight tracking-tight line-clamp-1 group-hover/card:text-primary transition-colors duration-300">
                    {path.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {path.description}
                </p>

                {/* Stats Row */}
                <div className="flex items-center gap-4 pt-0.5 pb-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
                        <UsersIcon className="size-3.5 text-primary/60" />
                        <span>{path.enrollmentCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
                        <BookOpenIcon className="size-3.5 text-primary/60" />
                        <span>{path.topicCount} topics</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
                        <FileTextIcon className="size-3.5 text-primary/60" />
                        <span>{path.lessonCount} lessons</span>
                    </div>
                </div>

                {/* Goal — elevated card-within-card */}
                <div className="relative flex items-start gap-3 rounded-xl border border-border/80 bg-muted/50 p-3.5 overflow-hidden">
                    {/* Decorative top accent line */}
                    <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/10">
                        <svg
                            viewBox="0 0 20 20"
                            fill="none"
                            className="size-4 text-primary"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="10" cy="10" r="8" />
                            <path d="M10 6v4l3 3" />
                        </svg>
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-primary/70">
                            Goal
                        </span>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 font-medium">
                            {path.goal}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

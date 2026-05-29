"use client";

import { cn } from "@/lib/utils";
import type { Difficulty, Level } from "@/lib/types";
import { DifficultyBadge } from "./difficulty-badge";
import { BookOpenIcon, FileTextIcon, UsersIcon, CheckCircle2Icon, PlayIcon, SparklesIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

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
    viewMode?: "grid" | "list";
    isEnrolled?: boolean;
    progressPercentage?: number;
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
    viewMode = "grid",
    isEnrolled = false,
    progressPercentage = 0,
    onEnroll,
    onViewDetail,
}: LearningPathCardProps) {
    const isList = viewMode === "list";
    const difficulty = levelToDifficulty(path.level);

    // Dynamic glow and border style based on difficulty levels
    const glowColors = {
        BEGINNER: "hover:shadow-[0_0_30px_rgba(59,130,246,0.18)] hover:ring-blue-500/30",
        INTERMEDIATE: "hover:shadow-[0_0_30px_rgba(245,158,11,0.18)] hover:ring-amber-500/30",
        ADVANCED: "hover:shadow-[0_0_30px_rgba(168,85,247,0.18)] hover:ring-purple-500/30",
    };

    const activeGlow = glowColors[difficulty as keyof typeof glowColors] || "hover:shadow-2xl hover:ring-primary/20";

    const isCompleted = progressPercentage === 100;

    return (
        <div
            className={cn(
                "group/card relative flex bg-card text-card-foreground ring-1 ring-border rounded-2xl overflow-hidden",
                "transition-all duration-500 ease-out",
                isList ? "flex-col md:flex-row md:items-stretch w-full min-h-[220px]" : "flex-col hover:-translate-y-2",
                activeGlow,
                className
            )}
        >
            {/* ─── Thumbnail ─────────────────────────────────────── */}
            <div className={cn(
                "relative overflow-hidden shrink-0", 
                isList ? "w-full md:w-[320px] aspect-[16/10] md:aspect-auto" : "aspect-[16/10]"
            )}>
                <Image
                    fill
                    src={path.thumbnailUrl}
                    alt={path.name}
                    className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
                    sizes={isList ? "(max-width: 768px) 100vw, 320px" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
                />

                {/* Layered overlay: vignette + gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/5" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,0,0,0.3),transparent_70%)]" />

                {/* Difficulty Badge */}
                <div className="absolute top-3.5 right-3.5 z-10">
                    <DifficultyBadge difficulty={difficulty} />
                </div>

                {/* Enrolled Progress Indicator */}
                {isEnrolled && (
                    <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 rounded-full bg-black/75 backdrop-blur-md px-3 py-1.5 text-[10px] font-bold text-white shadow-md border border-white/10">
                        {isCompleted ? (
                            <CheckCircle2Icon className="size-3.5 text-emerald-400 fill-emerald-400/20" />
                        ) : (
                            <span className="relative flex size-2 mr-0.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
                                <span className="relative inline-flex size-2 rounded-full bg-purple-500" />
                            </span>
                        )}
                        <span className={cn(isCompleted ? "text-emerald-400" : "text-purple-300")}>
                            {isCompleted ? "Đã hoàn thành" : `Đang học: ${progressPercentage}%`}
                        </span>
                    </div>
                )}

                {/* Premium Badge (only if not enrolled or placed underneath) */}
                {path.isPremium && !isEnrolled && (
                    <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1 rounded-full bg-[oklch(0.7_0.16_85)]/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                        <svg viewBox="0 0 12 12" className="size-3 shrink-0 fill-[oklch(0.9_0.15_85)]">
                            <path d="M6 1l1.35 2.73L10.5 4.1l-2.25 2.19.53 3.09L6 8.05 3.22 9.38l.53-3.09L1.5 4.1l3.15-.37z" />
                        </svg>
                        Premium
                    </div>
                )}

                {/* Hover Action Overlay (only shown for grid view on hover) */}
                {!isList && (onViewDetail || onEnroll) && (
                    <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-center gap-2.5 bg-gradient-to-t from-black/90 via-black/55 to-transparent p-5 opacity-0 translate-y-3 transition-all duration-400 group-hover/card:opacity-100 group-hover/card:translate-y-0">
                        {onViewDetail && (
                            <button
                                onClick={() => onViewDetail(path.slug)}
                                className="flex items-center justify-center gap-1.5 h-9 rounded-xl border border-white/20 bg-white/10 px-4 text-xs font-semibold text-white backdrop-blur-md transition-all duration-200 hover:bg-white/20 hover:border-white/40 hover:scale-105 active:scale-95 cursor-pointer"
                            >
                                Chi tiết
                            </button>
                        )}
                        {onEnroll && (
                            <button
                                onClick={() => onEnroll(path.slug)}
                                className="flex items-center justify-center gap-1.5 h-9 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 px-4 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-purple-600/40 active:scale-95 cursor-pointer"
                            >
                                {isEnrolled ? (
                                    <>
                                        <PlayIcon className="size-3 fill-current" />
                                        Học tiếp
                                    </>
                                ) : (
                                    "Đăng ký"
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ─── Content ─────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col justify-between p-5 gap-3.5">
                <div className="space-y-2">
                    {/* Title & Badge */}
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-extrabold leading-tight tracking-tight line-clamp-2 group-hover/card:text-primary transition-colors duration-300">
                            {path.name}
                        </h3>
                        {path.isPremium && isList && (
                            <span className="shrink-0 flex items-center gap-0.5 rounded-full bg-[oklch(0.7_0.16_85)]/15 border border-[oklch(0.7_0.16_85)]/30 px-2 py-0.5 text-[9px] font-bold text-[oklch(0.7_0.16_85)]">
                                PRO
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {path.description}
                    </p>
                </div>

                {/* Progress bar inside content when enrolled (and in List mode) */}
                {isEnrolled && isList && (
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-muted-foreground">Tiến độ lộ trình</span>
                            <span className={isCompleted ? "text-emerald-500" : "text-primary"}>
                                {progressPercentage}%
                            </span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/40">
                            <div 
                                className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    isCompleted ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-purple-500 to-indigo-500"
                                )}
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Bottom Section: Stats, Goal & CTA Buttons */}
                <div className="space-y-3.5">
                    {/* Stats Row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/40 pt-3">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground/80">
                            <UsersIcon className="size-3.5 text-primary/60" />
                            <span>{path.enrollmentCount.toLocaleString()} đăng ký</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground/80">
                            <BookOpenIcon className="size-3.5 text-primary/60" />
                            <span>{path.topicCount} chủ đề</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground/80">
                            <FileTextIcon className="size-3.5 text-primary/60" />
                            <span>{path.lessonCount} bài học</span>
                        </div>
                    </div>

                    {/* Goal — elevated card-within-card (Only shown in grid mode, or list mode if space permits) */}
                    {!isList && (
                        <div className="relative flex items-start gap-3 rounded-xl border border-border/80 bg-muted/40 p-3 overflow-hidden">
                            <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/10">
                                <SparklesIcon className="size-3.5 text-primary" />
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary/70">
                                    Mục tiêu
                                </span>
                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1 font-medium">
                                    {path.goal}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* CTA Action Buttons for List View Mode */}
                    {isList && (
                        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/40">
                            {onViewDetail && (
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => onViewDetail(path.slug)}
                                    className="h-8.5 rounded-xl text-xs font-bold px-4"
                                >
                                    Xem chi tiết
                                </Button>
                            )}
                            {onEnroll && (
                                <Button 
                                    onClick={() => onEnroll(path.slug)}
                                    className="h-8.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 text-white font-bold text-xs px-4 shadow-md hover:shadow-lg transition-transform active:scale-97 border-0"
                                >
                                    {isEnrolled ? (
                                        <>
                                            <PlayIcon className="size-3.5 mr-1.5 fill-current" />
                                            Học tiếp
                                        </>
                                    ) : (
                                        "Đăng ký ngay"
                                    )}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

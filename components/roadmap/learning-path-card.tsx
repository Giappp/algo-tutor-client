"use client";

import {cn} from "@/lib/utils";
import type {Difficulty, Level} from "@/lib/types";
import {DifficultyBadge} from "./difficulty-badge";
import {BookOpenIcon, FileTextIcon, UsersIcon} from "lucide-react";
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
                "group/card relative flex flex-col rounded-xl overflow-hidden",
                "bg-card text-card-foreground ring-1 ring-foreground/10",
                "transition-all duration-300 ease-out",
                "hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:ring-primary/20",
                className
            )}
        >
            {/* Thumbnail */}
            <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                    fill
                    src={path.thumbnailUrl}
                    alt={path.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"/>

                {/* Difficulty Badge - top right */}
                <div className="absolute top-3 right-3 z-10">
                    <DifficultyBadge difficulty={levelToDifficulty(path.level)}/>
                </div>

                {/* Premium Badge */}
                {path.isPremium && (
                    <div
                        className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-full bg-[oklch(0.7_0.16_85)]/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                        <svg
                            viewBox="0 0 12 12"
                            className="size-3 shrink-0 fill-[oklch(0.9_0.15_85)]"
                        >
                            <path
                                d="M6 1l1.35 2.73L10.5 4.1l-2.25 2.19.53 3.09L6 8.05 3.22 9.38l.53-3.09L1.5 4.1l3.15-.37z"/>
                        </svg>
                        Premium
                    </div>
                )}

                {/* Hover Action Buttons */}
                {(onViewDetail || onEnroll) && (
                    <div
                        className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-center gap-2 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4 opacity-0 translate-y-2 transition-all duration-300 group-hover/card:opacity-100 group-hover/card:translate-y-0">
                        {onViewDetail && (
                            <button
                                onClick={() => onViewDetail(path.slug)}
                                className="flex items-center gap-1.5 h-9 rounded-lg border border-white/30 bg-white/10 px-4 text-sm font-medium text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/25 hover:border-white/50 hover:scale-105"
                            >
                                View Details
                            </button>
                        )}
                        {onEnroll && (
                            <button
                                onClick={() => onEnroll(path.slug)}
                                className="flex items-center gap-1.5 h-9 rounded-lg bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 px-4 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-purple-600/40 active:scale-95"
                            >
                                Enroll Now
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col gap-2.5 p-4">
                <h3 className="text-base font-semibold leading-tight line-clamp-1 group-hover/card:text-primary transition-colors">
                    {path.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {path.description}
                </p>

                {/* Stats Row */}
                <div className="flex items-center gap-4 pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <UsersIcon className="size-3.5 text-muted-foreground/70"/>
                        <span>
                            {path.enrollmentCount.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <BookOpenIcon className="size-3.5 text-muted-foreground/70"/>
                        <span>{path.topicCount} topics</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <FileTextIcon className="size-3.5 text-muted-foreground/70"/>
                        <span>{path.lessonCount} lessons</span>
                    </div>
                </div>

                {/* Goal */}
                <div className="flex items-start gap-2 rounded-lg bg-muted/60 p-2.5">
                    <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/10">
                        <svg
                            className="size-3.5 text-primary"
                            viewBox="0 0 12 12"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M6 1v4M4.5 2.5L6 4l1.5-1.5M2 10h8"/>
                        </svg>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {path.goal}
                    </p>
                </div>
            </div>
        </div>
    );
}

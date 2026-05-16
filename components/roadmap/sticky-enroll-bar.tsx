"use client";

import {useEffect, useState} from "react";
import type {RoadmapDetailResponse} from "@/api/roadmap";
import {DifficultyBadge} from "./difficulty-badge";
import {cn} from "@/lib/utils";
import {BookOpenIcon, StarIcon} from "lucide-react";

interface StickyEnrollBarProps {
    path: RoadmapDetailResponse;
    onEnroll: () => void;
    enrolled: boolean;
}

export function StickyEnrollBar({
                                    path,
                                    onEnroll,
                                    enrolled,
                                }: StickyEnrollBarProps) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 420);
        };
        window.addEventListener("scroll", handleScroll, {passive: true});
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div
            className={cn(
                "fixed top-0 inset-x-0 z-50 transition-all duration-300",
                scrolled
                    ? "translate-y-0 opacity-100 pointer-events-auto"
                    : "-translate-y-full opacity-0 pointer-events-none"
            )}
        >
            <div className="bg-background/90 backdrop-blur-xl border-b border-border shadow-sm">
                <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
                    {/* Path info */}
                    <div className="flex items-center gap-3 min-w-0">
                        <img
                            src={path.thumbnailUrl}
                            alt={path.name}
                            className="size-8 rounded-md object-cover shrink-0"
                        />
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate leading-tight">
                                {path.name}
                            </p>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <StarIcon className="size-3 text-amber-500 fill-amber-500"/>
                                    <span className="text-[11px] text-muted-foreground"></span>
                                </div>
                                <span className="text-muted-foreground text-xs">
                                    {path.enrollmentCount.toLocaleString()} enrolled
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Difficulty */}
                    <DifficultyBadge
                        difficulty={path.level}
                    />

                    {/* CTA */}
                    {enrolled ? (
                        <span className="text-sm font-medium text-primary whitespace-nowrap">
                            Enrolled
                        </span>
                    ) : (
                        <button
                            onClick={onEnroll}
                            className="flex items-center gap-1.5 h-9 rounded-lg bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 px-5 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 whitespace-nowrap transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-purple-600/35 active:scale-95"
                        >
                            <BookOpenIcon className="size-4"/>
                            Enroll Free
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

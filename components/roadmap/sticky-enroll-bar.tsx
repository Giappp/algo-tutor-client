"use client";

import {type RefObject, useEffect, useState} from "react";
import Link from "next/link";
import type {RoadmapDetailResponse} from "@/lib/types";
import {DifficultyBadge} from "./difficulty-badge";
import Image from "next/image";
import {cn} from "@/lib/utils";
import {BookOpenIcon, Loader2Icon, PlayIcon, UsersIcon} from "lucide-react";

interface StickyEnrollBarProps {
    path: RoadmapDetailResponse;
    onEnroll: () => void;
    enrolled: boolean;
    isEnrolling?: boolean;
    scrollContainerRef?: RefObject<HTMLElement | null>;
    sentinelRef?: RefObject<Element | null>;
}

export function StickyEnrollBar({
                                    path,
                                    onEnroll,
                                    enrolled,
                                    isEnrolling = false,
                                    scrollContainerRef,
                                    sentinelRef,
                                }: StickyEnrollBarProps) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const sentinel = sentinelRef?.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            ([entry]) => setScrolled(!entry.isIntersecting),
            {
                root: scrollContainerRef?.current ?? null,
                rootMargin: "-24px 0px 0px 0px",
                threshold: 0,
            }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [scrollContainerRef, sentinelRef]);

    return (
        <div
            className={cn(
                "fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-out",
                scrolled
                    ? "translate-y-0 opacity-100 pointer-events-auto"
                    : "-translate-y-full opacity-0 pointer-events-none"
            )}
        >
            <div className="border-b border-border/70 bg-background/95 shadow-sm shadow-primary/5 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3 min-w-0">
                        <Image
                            src={path.thumbnailUrl}
                            alt={path.name}
                            width={32}
                            height={32}
                            className="size-8 rounded-md object-cover shrink-0"
                        />
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate leading-tight">
                                {path.name}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <UsersIcon className="size-3"/>
                                <span>
                                    {path.enrollmentCount.toLocaleString()} học viên
                                </span>
                            </div>
                        </div>
                    </div>

                    <DifficultyBadge difficulty={path.level} className="hidden sm:inline-flex"/>

                    {enrolled ? (
                        <Link
                            href={`/learn/${path.slug}`}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:translate-y-px"
                        >
                            <PlayIcon className="size-3.5"/>
                            Học tiếp
                        </Link>
                    ) : (
                        <button
                            onClick={onEnroll}
                            disabled={isEnrolling}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-60"
                        >
                            {isEnrolling ? (
                                <Loader2Icon className="size-4 animate-spin"/>
                            ) : (
                                <BookOpenIcon className="size-4"/>
                            )}
                            {isEnrolling ? "Đang đăng ký" : "Đăng ký"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

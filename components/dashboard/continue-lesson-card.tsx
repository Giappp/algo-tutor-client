"use client";

import { useEnrollments } from "@/hooks/use-enrollments";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";
import { PlayIcon, BookOpenIcon, CheckCircle2Icon, SparklesIcon } from "lucide-react";

export function ContinueLessonCard() {
    const { enrollments, isLoading, isError } = useEnrollments();

    if (isLoading) {
        return (
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-md" />
                    <Skeleton className="h-6 w-40" />
                </div>
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 border border-border/40 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Skeleton className="size-12 rounded-lg" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-48" />
                                </div>
                            </div>
                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                <div className="space-y-1 w-20">
                                    <Skeleton className="h-2 w-full" />
                                    <Skeleton className="h-3 w-8" />
                                </div>
                                <Skeleton className="h-9 w-24 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return null;
    }

    if (!enrollments || enrollments.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />
                <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto shadow-inner">
                    <BookOpenIcon className="size-5 text-muted-foreground/70" />
                </div>
                <div className="max-w-sm mx-auto space-y-1">
                    <h3 className="font-semibold text-foreground">Chưa có lộ trình học nào</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Đăng ký một lộ trình học tập để bắt đầu rèn luyện kỹ năng giải thuật toán của bạn ngay hôm nay!
                    </p>
                </div>
                <Link href="/roadmaps" className="inline-block pt-1">
                    <Button size="sm" className="gap-1.5 shadow-md shadow-primary/10">
                        <SparklesIcon className="size-3.5 fill-current" />
                        Khám phá lộ trình
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="p-5 border-b border-border/50 bg-muted/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
                        <PlayIcon className="size-4 fill-current" />
                    </div>
                    <h3 className="font-bold text-foreground tracking-tight">
                        Lộ trình đang học
                    </h3>
                </div>
                <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">
                    {enrollments.length} Lộ trình
                </span>
            </div>

            <div className="p-5 space-y-4">
                {enrollments.map((item) => {
                    const isCompleted = item.completionPercentage === 100 || !item.nextLessonSlug;
                    const ctaHref = isCompleted
                        ? `/roadmaps/${item.roadmapSlug}`
                        : `/learn/${item.roadmapSlug}/${item.nextLessonSlug}`;

                    return (
                        <div
                            key={item.roadmapSlug}
                            className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-border/40 hover:border-primary/20 dark:hover:border-primary/30 rounded-xl bg-card transition-all duration-300 hover:shadow-md hover:shadow-primary/5"
                        >
                            {/* Left: Thumbnail & Info */}
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="relative size-12 sm:size-14 shrink-0 rounded-lg overflow-hidden border border-border/60 bg-muted group-hover:scale-105 transition-transform duration-300 shadow-sm">
                                    {item.thumbnailUrl ? (
                                        <Image
                                            src={item.thumbnailUrl}
                                            alt={item.roadmapName}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="size-full flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-indigo-500/10 text-purple-500">
                                            <BookOpenIcon className="size-5 sm:size-6" />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 space-y-1">
                                    <h4 className="font-semibold text-sm sm:text-base text-foreground truncate group-hover:text-primary transition-colors">
                                        {item.roadmapName}
                                    </h4>
                                    <p className="text-xs text-muted-foreground truncate max-w-[280px] sm:max-w-md">
                                        {isCompleted ? (
                                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                                <CheckCircle2Icon className="size-3" /> Hoàn thành lộ trình!
                                            </span>
                                        ) : (
                                            <>
                                                Bài tiếp theo: <span className="text-foreground/80 font-medium">{item.nextLessonTitle}</span>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Right: Progress & CTA */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t border-border/30 sm:border-0 pt-3 sm:pt-0">
                                {/* Progress bar */}
                                <div className="space-y-1.5 min-w-[120px]">
                                    <div className="flex items-center justify-between text-xs font-semibold">
                                        <span className="text-muted-foreground">Tiến độ</span>
                                        <span className={item.completionPercentage > 0 ? "text-purple-600 dark:text-purple-400" : "text-muted-foreground"}>
                                            {item.completionPercentage}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500 group-hover:from-purple-600 group-hover:to-indigo-600"
                                            style={{ width: `${item.completionPercentage}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Action Button */}
                                <Link href={ctaHref} className="w-full sm:w-auto">
                                    <Button
                                        size="sm"
                                        variant={isCompleted ? "outline" : "default"}
                                        className={`w-full sm:w-auto h-9 px-4 font-semibold rounded-lg shadow-sm whitespace-nowrap transition-all duration-200 active:scale-95 ${isCompleted
                                                ? "hover:bg-muted"
                                                : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-500/10 hover:shadow-md hover:shadow-purple-500/20"
                                            }`}
                                    >
                                        {isCompleted ? (
                                            "Xem lộ trình"
                                        ) : (
                                            <>
                                                Học tiếp
                                                <PlayIcon className="size-3 ml-1 fill-current" />
                                            </>
                                        )}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

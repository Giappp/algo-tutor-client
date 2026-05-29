"use client";

import { useMemo, useState } from "react";
import { useEnrollments } from "@/hooks/use-enrollments";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";
import {
    BookOpenIcon,
    SearchIcon,
    SparklesIcon,
    GraduationCapIcon,
    CheckCircle2Icon,
    PlayIcon,
    ListFilterIcon,
    ArrowUpDownIcon,
    ClockIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type FilterStatus = "ALL" | "IN_PROGRESS" | "COMPLETED";
type SortOption = "PROGRESS_DESC" | "PROGRESS_ASC" | "NAME_ASC" | "NAME_DESC";

export default function MyRoadmapsPage() {
    const { enrollments, isLoading, isError } = useEnrollments();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
    const [sortBy, setSortBy] = useState<SortOption>("PROGRESS_DESC");

    const filteredAndSortedEnrollments = useMemo(() => {
        if (!enrollments) return [];

        return enrollments
            .filter((item) => {
                // 1. Search Query
                const matchesSearch = item.roadmapName.toLowerCase().includes(searchQuery.toLowerCase());
                if (!matchesSearch) return false;

                // 2. Status Filter
                const isCompleted = item.completionPercentage === 100 || !item.nextLessonSlug;
                if (statusFilter === "IN_PROGRESS") return !isCompleted;
                if (statusFilter === "COMPLETED") return isCompleted;

                return true;
            })
            .sort((a, b) => {
                // 3. Sorting
                if (sortBy === "PROGRESS_DESC") {
                    return b.completionPercentage - a.completionPercentage;
                }
                if (sortBy === "PROGRESS_ASC") {
                    return a.completionPercentage - b.completionPercentage;
                }
                if (sortBy === "NAME_ASC") {
                    return a.roadmapName.localeCompare(b.roadmapName);
                }
                if (sortBy === "NAME_DESC") {
                    return b.roadmapName.localeCompare(a.roadmapName);
                }
                return 0;
            });
    }, [enrollments, searchQuery, statusFilter, sortBy]);

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Header Skeleton */}
                <div className="space-y-3">
                    <Skeleton className="h-8 w-64 rounded-lg" />
                    <Skeleton className="h-4 w-96 rounded-lg" />
                </div>

                {/* Filter Skeleton */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <Skeleton className="h-9 w-full sm:max-w-xs rounded-lg" />
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-24 rounded-lg" />
                        <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>
                </div>

                {/* Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="rounded-2xl border border-border/50 bg-card p-5 space-y-4 animate-pulse"
                        >
                            <Skeleton className="aspect-16/10 rounded-xl bg-muted" />
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-3/4 rounded" />
                                <Skeleton className="h-4 w-5/6 rounded" />
                            </div>
                            <div className="space-y-1.5 pt-2">
                                <Skeleton className="h-3 w-full rounded" />
                                <Skeleton className="h-2 w-full rounded" />
                            </div>
                            <Skeleton className="h-9 w-full rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center space-y-4">
                <div className="size-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" className="size-8" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground">Đã xảy ra lỗi</h3>
                <p className="text-muted-foreground max-w-md">
                    Không thể tải danh sách lộ trình đã tham gia. Vui lòng làm mới trang hoặc thử lại sau.
                </p>
                <Button onClick={() => window.location.reload()}>Tải lại trang</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background/50">
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/40">
                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <GraduationCapIcon className="size-5.5 text-primary" />
                                <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                                    Học tập cá nhân
                                </span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                                Khóa học của tôi
                            </h1>
                            <p className="text-muted-foreground text-sm mt-1">
                                Theo dõi, quản lý tiến trình và tiếp tục các lộ trình thuật toán bạn đã đăng ký.
                            </p>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground bg-muted/60 border border-border/40 px-3 py-1.5 rounded-xl shadow-xs">
                                Tổng cộng: <span className="text-foreground">{enrollments.length}</span> lộ trình
                            </span>
                        </div>
                    </div>

                    {/* Controls Bar: Filter, Search, Sort */}
                    {enrollments.length > 0 && (
                        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                            {/* Search Input */}
                            <div className="relative w-full sm:max-w-xs">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm lộ trình..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-9.5 pl-9 pr-3 rounded-xl bg-card border border-border/50 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40 shadow-xs transition-colors"
                                />
                            </div>

                            {/* Filters & Sorting */}
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Status Filters */}
                                <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border/40 gap-1">
                                    {(["ALL", "IN_PROGRESS", "COMPLETED"] as FilterStatus[]).map((status) => {
                                        const label = status === "ALL" ? "Tất cả" : status === "IN_PROGRESS" ? "Đang học" : "Hoàn thành";
                                        const isActive = statusFilter === status;
                                        return (
                                            <button
                                                key={status}
                                                onClick={() => setStatusFilter(status)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                                                    isActive
                                                        ? "bg-card text-foreground shadow-xs ring-1 ring-border/20"
                                                        : "text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Sort Menu */}
                                <div className="flex items-center gap-1.5 bg-card px-2.5 py-1.5 rounded-xl border border-border/50 shadow-xs">
                                    <ArrowUpDownIcon className="size-3.5 text-muted-foreground" />
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                                        className="bg-transparent border-0 text-xs font-semibold text-muted-foreground focus:outline-none cursor-pointer hover:text-foreground transition-colors"
                                    >
                                        <option value="PROGRESS_DESC">Tiến độ (Giảm dần)</option>
                                        <option value="PROGRESS_ASC">Tiến độ (Tăng dần)</option>
                                        <option value="NAME_ASC">Tên (A-Z)</option>
                                        <option value="NAME_DESC">Tên (Z-A)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Roadmap Grid & Content */}
                    {enrollments.length === 0 ? (
                        /* Empty State: No enrollments at all */
                        <div className="rounded-3xl border border-border/60 bg-card p-12 text-center space-y-6 relative overflow-hidden group shadow-md max-w-2xl mx-auto mt-8">
                            {/* Decorative design elements */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />
                            <div className="absolute -top-24 -right-24 size-48 rounded-full bg-primary/5 blur-3xl" />
                            <div className="absolute -bottom-24 -left-24 size-48 rounded-full bg-indigo-500/5 blur-3xl" />

                            <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto shadow-inner text-primary">
                                <BookOpenIcon className="size-8" />
                            </div>

                            <div className="max-w-md mx-auto space-y-2">
                                <h3 className="text-xl font-extrabold text-foreground tracking-tight">
                                    Bạn chưa đăng ký lộ trình nào
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Bắt đầu hành trình chinh phục cấu trúc dữ liệu và thuật toán của bạn ngay bằng cách khám phá các lộ trình bài bản của chúng tôi.
                                </p>
                            </div>

                            <div className="pt-2">
                                <Link href="/roadmaps">
                                    <Button size="lg" className="gap-2 font-semibold shadow-lg shadow-primary/20 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl active:scale-98 transition-transform">
                                        <SparklesIcon className="size-4 fill-current animate-pulse" />
                                        Khám phá lộ trình học tập
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : filteredAndSortedEnrollments.length === 0 ? (
                        /* Filtered Empty State */
                        <div className="flex flex-col items-center justify-center py-20 text-center bg-card/40 rounded-3xl border border-border/30">
                            <div className="size-14 rounded-full bg-muted flex items-center justify-center mb-4">
                                <ListFilterIcon className="size-6 text-muted-foreground/60" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-1">
                                Không tìm thấy lộ trình phù hợp
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-sm">
                                Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc của bạn.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setStatusFilter("ALL");
                                    setSearchQuery("");
                                }}
                                className="mt-4 rounded-xl text-xs font-semibold"
                            >
                                Xóa bộ lọc
                            </Button>
                        </div>
                    ) : (
                        /* Learning Path Enrolled Grid */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredAndSortedEnrollments.map((item) => {
                                const isCompleted = item.completionPercentage === 100 || !item.nextLessonSlug;
                                const ctaHref = isCompleted
                                    ? `/roadmaps/${item.roadmapSlug}`
                                    : `/learn/${item.roadmapSlug}/${item.nextLessonSlug}`;

                                return (
                                    <div
                                        key={item.roadmapSlug}
                                        className="group/card relative flex flex-col rounded-2xl overflow-hidden bg-card text-card-foreground ring-1 ring-border/50 hover:ring-primary/20 shadow-xs hover:shadow-xl transition-all duration-500 ease-out hover:-translate-y-1.5"
                                    >
                                        {/* Card Thumbnail / Banner */}
                                        <div className="relative aspect-18/10 w-full overflow-hidden bg-muted">
                                            {item.thumbnailUrl ? (
                                                <Image
                                                    src={item.thumbnailUrl}
                                                    alt={item.roadmapName || "Roadmap thumbnail"}
                                                    fill
                                                    className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
                                                    sizes="(max-width: 768px) 100vw, 33vw"
                                                />
                                            ) : (
                                                <div className="flex size-full flex-col items-center justify-center bg-gradient-to-br from-purple-500/10 via-violet-500/5 to-indigo-500/10 p-6 text-purple-500/80">
                                                    <div className="mb-2 rounded-2xl border border-purple-500/10 bg-purple-500/10 p-3">
                                                        <BookOpenIcon className="size-7" />
                                                    </div>

                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-purple-500/70">
                                                        AlgoTutor Path
                                                    </span>
                                                </div>
                                            )}

                                            {/* Vignette Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                                            {/* Status Badge */}
                                            <div className="absolute top-3.5 right-3.5 z-10">
                                                {isCompleted ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/90 text-white font-bold text-[10px] tracking-wide shadow-md backdrop-blur-xs">
                                                        <CheckCircle2Icon className="size-3 fill-current" />
                                                        ĐÃ HOÀN THÀNH
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-600/90 text-white font-bold text-[10px] tracking-wide shadow-md backdrop-blur-xs">
                                                        <ClockIcon className="size-3 fill-current" />
                                                        ĐANG HỌC
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Card content */}
                                        <div className="flex-1 flex flex-col p-5 space-y-4">
                                            {/* Roadmap Title & Description */}
                                            <div className="space-y-1.5 flex-1">
                                                <h3 className="text-base font-bold leading-snug tracking-tight text-foreground line-clamp-2 group-hover/card:text-primary transition-colors duration-300">
                                                    {item.roadmapName}
                                                </h3>
                                                <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                                                    {isCompleted ? (
                                                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                            <CheckCircle2Icon className="size-3" /> Chúc mừng! Bạn đã hoàn thành.
                                                        </span>
                                                    ) : (
                                                        <>
                                                            <PlayIcon className="size-3 text-primary fill-current opacity-70" />
                                                            <span className="truncate">
                                                                Kế tiếp: <strong className="text-foreground/80">{item.nextLessonTitle}</strong>
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Progress Info */}
                                            <div className="space-y-2 pt-1 border-t border-border/30">
                                                <div className="flex items-center justify-between text-xs font-bold">
                                                    <span className="text-muted-foreground/80">Tiến độ khóa học</span>
                                                    <span className={cn(
                                                        isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-purple-600 dark:text-purple-400"
                                                    )}>
                                                        {item.completionPercentage}%
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden shadow-inner border border-border/10">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-700 ease-out",
                                                            isCompleted
                                                                ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                                                                : "bg-gradient-to-r from-purple-500 to-indigo-500"
                                                        )}
                                                        style={{ width: `${item.completionPercentage}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* CTA Button */}
                                            <div className="pt-1">
                                                <Link href={ctaHref} className="w-full block">
                                                    <Button
                                                        variant={isCompleted ? "outline" : "default"}
                                                        className={cn(
                                                            "w-full h-9.5 rounded-xl font-bold text-xs tracking-wide shadow-xs hover:shadow-md transition-all duration-300 active:scale-97",
                                                            isCompleted
                                                                ? "border-border hover:bg-muted/50 text-foreground"
                                                                : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 border-0"
                                                        )}
                                                    >
                                                        {isCompleted ? (
                                                            "Xem lại lộ trình"
                                                        ) : (
                                                            <>
                                                                Học tiếp bài mới
                                                                <PlayIcon className="size-3 ml-1 fill-current" />
                                                            </>
                                                        )}
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DIFFICULTY_LEVELS, DifficultyLevel } from "@/lib/types/learning-path";
import { LearningPathCard } from "@/components/roadmap/learning-path-card";
import { DifficultyBadge } from "@/components/roadmap/difficulty-badge";
import { Button } from "@/components/ui/button";
import { 
    BookOpenIcon, 
    LayoutGridIcon, 
    ListIcon, 
    SearchIcon, 
    UsersIcon, 
    SparklesIcon, 
    ChevronRightIcon, 
    GraduationCapIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePaginatedData } from "@/hooks";
import { useEnrollments } from "@/hooks/use-enrollments";
import type { RoadmapListItem } from "@/lib/types/roadmap";

const ALL_LEVELS = ["All", DIFFICULTY_LEVELS.EASY, DIFFICULTY_LEVELS.MEDIUM, DIFFICULTY_LEVELS.HARD] as const;

const QUICK_TAGS = [
    { label: "Phòng phỏng vấn", query: "Phỏng vấn" },
    { label: "Cho người mới", query: "Cơ bản" },
    { label: "Cấu trúc dữ liệu", query: "Cấu trúc dữ liệu" },
    { label: "Thuật toán tối ưu", query: "Thuật toán" },
    { label: "Cực khó", query: "Nâng cao" },
];

export default function RoadMapPage() {
    const router = useRouter();
    const [selectedLevel, setSelectedLevel] = useState<"All" | DifficultyLevel>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Fetch catalogue
    const { data: paths, pagination, isLoading } = usePaginatedData<
        RoadmapListItem,
        { level?: string }
    >("/roadmaps", { page: 0, size: 10, level: selectedLevel === "All" ? undefined : selectedLevel });

    // Fetch personal enrollments
    const { enrollments } = useEnrollments();

    const filteredPaths = useMemo(() => {
        if (!paths) return [];
        return paths.filter((path) => {
            return !searchQuery ||
                path.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                path.description.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [paths, searchQuery]);

    // Active enrolled map for looking up progress
    const enrolledMap = useMemo(() => {
        if (!enrollments) return new Map<string, typeof enrollments[number]>();
        const map = new Map<string, typeof enrollments[number]>();
        enrollments.forEach((item) => {
            map.set(item.roadmapSlug, item);
        });
        return map;
    }, [enrollments]);

    const handleEnroll = (slug: string) => {
        router.push(`/roadmaps/${slug}`);
    };

    const handleViewDetail = (slug: string) => {
        router.push(`/roadmaps/${slug}`);
    };

    const handleAIAdvisorConsult = () => {
        const event = new CustomEvent("open-ai-chat", {
            detail: {
                prompt: "Tôi là người mới bắt đầu học, hãy tư vấn lộ trình học cấu trúc dữ liệu và giải thuật tối ưu nhất cho tôi.",
            },
        });
        window.dispatchEvent(event);
    };

    return (
        <div className="flex flex-col h-full bg-background/30">
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                    {/* Hero Section */}
                    <div
                        className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[oklch(0.13_0.02_260)] via-[oklch(0.16_0.03_250)] to-[oklch(0.13_0.02_260)] p-8 sm:p-10 text-primary-foreground shadow-xl border border-border/10">
                        {/* Background pattern */}
                        <div
                            className="absolute inset-0 opacity-20"
                            style={{
                                backgroundImage:
                                    "radial-gradient(circle, oklch(0.75_0.15_220) 1px, transparent 1px)",
                                backgroundSize: "28px 28px",
                            }}
                        />
                        {/* Gradient orbs */}
                        <div className="absolute -top-16 -right-16 size-64 rounded-full bg-primary/20 blur-3xl animate-pulse duration-5000" />
                        <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-indigo-500/10 blur-3xl" />

                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="relative flex size-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                                    <span className="relative inline-flex size-2 rounded-full bg-primary" />
                                </span>
                                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                                    Lộ trình học tập chuyên nghiệp
                                </span>
                            </div>
                            
                            <h1 className="text-3xl sm:text-4xl font-black mb-2 leading-tight tracking-tight text-white">
                                Chinh phục thuật toán
                                <br />
                                <span className="bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
                                    từng bước một
                                </span>
                            </h1>
                            
                            <p className="text-sm sm:text-base max-w-lg leading-relaxed text-slate-300 font-medium">
                                Lộ trình học bài bản từ con số 0 đến nâng cao. Giúp bạn làm chủ các thuật toán cốt lõi, tự tin vượt qua các vòng phỏng vấn kỹ thuật cam go nhất.
                            </p>

                            {/* AI Advisor Button & Stats */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-6 pt-6 border-t border-white/10">
                                <Button
                                    onClick={handleAIAdvisorConsult}
                                    className="w-full sm:w-auto h-11 px-6 rounded-xl font-bold text-xs tracking-wide text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-700 hover:to-indigo-700 border-0 shadow-lg shadow-purple-600/30 active:scale-97 transition-all cursor-pointer gap-2"
                                >
                                    <SparklesIcon className="size-4 animate-pulse fill-current text-white" />
                                    Tư vấn Lộ trình bằng AI
                                </Button>
                                
                                <div className="flex flex-wrap items-center gap-6 text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <BookOpenIcon className="size-4 text-primary" />
                                        <span className="text-xs font-bold">
                                            {isLoading ? "..." : pagination.totalElements} Lộ trình học
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <UsersIcon className="size-4 text-primary" />
                                        <span className="text-xs font-bold">
                                            {isLoading ? "..." : paths.reduce((sum, p) => sum + p.enrollmentCount, 0).toLocaleString()}+ Học viên
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active In-Progress Roadmaps Section */}
                    {enrollments && enrollments.length > 0 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="flex items-center justify-between pb-1 border-b border-border/40">
                                <div className="flex items-center gap-2">
                                    <GraduationCapIcon className="size-5 text-primary" />
                                    <h2 className="text-base font-extrabold text-foreground tracking-tight">
                                        Lộ trình bạn đang học
                                    </h2>
                                </div>
                                <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border/40">
                                    Đang tham gia {enrollments.length} lộ trình
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {enrollments.slice(0, 3).map((item) => {
                                    const isCompleted = item.completionPercentage === 100 || !item.nextLessonSlug;
                                    const ctaHref = isCompleted
                                        ? `/roadmaps/${item.roadmapSlug}`
                                        : `/learn/${item.roadmapSlug}/${item.nextLessonSlug}`;

                                    return (
                                        <div
                                            key={item.roadmapSlug}
                                            className="group/progress relative flex flex-col rounded-2xl overflow-hidden bg-card/60 p-4 border border-border hover:border-primary/20 shadow-xs hover:shadow-md transition-all duration-300"
                                        >
                                            <div className="flex items-start justify-between gap-3 mb-3.5">
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-sm font-extrabold text-foreground line-clamp-1 leading-snug group-hover/progress:text-primary transition-colors">
                                                        {item.roadmapName}
                                                    </h3>
                                                    <p className="text-[10px] text-muted-foreground truncate font-semibold mt-1">
                                                        {isCompleted ? "Đã hoàn thành xuất sắc!" : `Tiếp theo: ${item.nextLessonTitle}`}
                                                    </p>
                                                </div>
                                                <span className={cn(
                                                    "shrink-0 text-[10px] font-extrabold rounded-full px-2 py-0.5 border shadow-xs",
                                                    isCompleted 
                                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                                        : "bg-purple-500/10 border-purple-500/20 text-purple-500"
                                                )}>
                                                    {item.completionPercentage}%
                                                </span>
                                            </div>

                                            {/* Mini Progress Bar */}
                                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mb-4 border border-border/20">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-500",
                                                        isCompleted ? "bg-emerald-500" : "bg-primary"
                                                    )}
                                                    style={{ width: `${item.completionPercentage}%` }}
                                                />
                                            </div>

                                            <Button
                                                asChild
                                                size="sm"
                                                className="w-full h-8.5 rounded-xl font-bold text-xs bg-card hover:bg-muted border border-border text-foreground hover:text-foreground hover:shadow-xs active:scale-97 cursor-pointer"
                                            >
                                                <Link href={ctaHref}>
                                                    {isCompleted ? "Xem lại lộ trình" : "Học tiếp bài mới"}
                                                    <ChevronRightIcon className="size-3.5 ml-1" />
                                                </Link>
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Filters, Search & Categories catalogue section */}
                    <div className="space-y-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <h2 className="text-base font-extrabold text-foreground tracking-tight flex items-center gap-2">
                                    <BookOpenIcon className="size-4.5 text-primary" />
                                    Khám phá tất cả lộ trình
                                </h2>
                                
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant={viewMode === "grid" ? "secondary" : "ghost"}
                                        size="icon-sm"
                                        onClick={() => setViewMode("grid")}
                                        className="size-8 rounded-lg"
                                    >
                                        <LayoutGridIcon className="size-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === "list" ? "secondary" : "ghost"}
                                        size="icon-sm"
                                        onClick={() => setViewMode("list")}
                                        className="size-8 rounded-lg"
                                    >
                                        <ListIcon className="size-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
                                {/* Search */}
                                <div className="relative w-full lg:max-w-xs">
                                    <SearchIcon
                                        className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Tìm lộ trình..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full h-9.5 pl-9 pr-3 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary shadow-xs transition-colors"
                                    />
                                </div>

                                {/* Level Filters */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {ALL_LEVELS.map((level) => {
                                        const isActive = selectedLevel === level;
                                        return (
                                            <Button
                                                key={level === "All" ? "all" : level}
                                                variant={isActive ? "default" : "outline"}
                                                size="sm"
                                                onClick={() =>
                                                    setSelectedLevel(level)
                                                }
                                                className="h-8.5 text-xs font-bold rounded-xl"
                                            >
                                                {level === "All" ? (
                                                    "Tất cả cấp độ"
                                                ) : (
                                                    <DifficultyBadge
                                                        difficulty={level}
                                                        className="scale-90 origin-left"
                                                    />
                                                )}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Quick search tag suggestions */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-full">
                                <span className="text-xs font-bold text-muted-foreground whitespace-nowrap mr-1">Gợi ý tìm kiếm:</span>
                                {QUICK_TAGS.map((tag) => (
                                    <button
                                        key={tag.label}
                                        onClick={() => setSearchQuery(tag.query)}
                                        className="px-3 py-1 rounded-full text-xs font-semibold bg-card hover:bg-primary/10 hover:text-primary border border-border hover:border-primary/20 whitespace-nowrap transition-all cursor-pointer shadow-xs active:scale-95"
                                    >
                                        #{tag.label}
                                    </button>
                                ))}
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="px-3 py-1 rounded-full text-xs font-extrabold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 whitespace-nowrap transition-all cursor-pointer"
                                    >
                                        Xóa bộ lọc
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Results count */}
                        <div className="text-sm font-semibold text-muted-foreground pb-2 border-b border-border/30">
                            Hiển thị{" "}
                            <span className="font-extrabold text-foreground">
                                {isLoading ? "..." : filteredPaths.length}
                            </span>{" "}
                            {isLoading ? "" : "lộ trình tìm thấy"}
                            {selectedLevel !== "All" && (
                                <span>
                                    {" "}
                                    cấp độ{" "}
                                    <span className="font-extrabold text-foreground capitalize">
                                        {selectedLevel}
                                    </span>
                                </span>
                            )}
                        </div>

                        {/* Learning Path Grid */}
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="rounded-2xl overflow-hidden bg-card border border-border animate-pulse"
                                    >
                                        <div className="aspect-16/10 bg-muted" />
                                        <div className="p-5 space-y-3.5">
                                            <div className="h-5 bg-muted rounded w-3/4" />
                                            <div className="h-4 bg-muted rounded w-full" />
                                            <div className="h-4 bg-muted rounded w-5/6" />
                                            <div className="flex gap-4 pt-1 border-t border-border/20 mt-4">
                                                <div className="h-3.5 bg-muted rounded w-12" />
                                                <div className="h-3.5 bg-muted rounded w-16" />
                                                <div className="h-3.5 bg-muted rounded w-14" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredPaths.length > 0 ? (
                            <div
                                className={cn(
                                    viewMode === "grid"
                                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                                        : "flex flex-col gap-5"
                                )}
                            >
                                {filteredPaths.map((path) => {
                                    const enrollment = enrolledMap.get(path.slug);
                                    return (
                                        <LearningPathCard
                                            key={path.slug}
                                            path={path}
                                            viewMode={viewMode}
                                            isEnrolled={!!enrollment}
                                            progressPercentage={enrollment?.completionPercentage ?? 0}
                                            onEnroll={handleEnroll}
                                            onViewDetail={handleViewDetail}
                                        />
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-border/60">
                                <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                                    <SearchIcon className="size-8 text-muted-foreground/50" />
                                </div>
                                <h3 className="text-lg font-bold mb-1">
                                    Không tìm thấy lộ trình phù hợp
                                </h3>
                                <p className="text-sm text-muted-foreground max-w-sm">
                                    Thử thay đổi từ khóa tìm kiếm hoặc chọn tag gợi ý để tìm lộ trình học.
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedLevel("All");
                                        setSearchQuery("");
                                    }}
                                    className="mt-4 rounded-xl text-xs font-bold"
                                >
                                    Xóa bộ lọc và đặt lại
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

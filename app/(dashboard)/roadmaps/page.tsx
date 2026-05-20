"use client";

import {useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {DIFFICULTY_LEVELS, DifficultyLevel} from "@/lib/types/learning-path";
import {LearningPathCard} from "@/components/roadmap/learning-path-card";
import {DifficultyBadge} from "@/components/roadmap/difficulty-badge";
import {Button} from "@/components/ui/button";
import {BookOpenIcon, LayoutGridIcon, ListIcon, SearchIcon, StarIcon, UsersIcon,} from "lucide-react";
import {cn} from "@/lib/utils";
import {usePaginatedData} from "@/hooks";
import type {RoadmapListItem} from "@/lib/types/roadmap";

const ALL_LEVELS = ["All", DIFFICULTY_LEVELS.EASY, DIFFICULTY_LEVELS.MEDIUM, DIFFICULTY_LEVELS.HARD] as const;

export default function RoadMapPage() {
    const router = useRouter();
    const [selectedLevel, setSelectedLevel] = useState<"All" | DifficultyLevel>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const {data: paths, pagination, isLoading} = usePaginatedData<
        RoadmapListItem,
        { level?: string }
    >("/roadmaps", {page: 0, size: 10, level: selectedLevel === "All" ? undefined : selectedLevel});

    const filteredPaths = useMemo(() => {
        if (!paths) return [];
        return paths.filter((path) => {
            return !searchQuery ||
                path.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                path.description.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [paths, searchQuery]);

    const handleEnroll = (slug: string) => {
        router.push(`/roadmaps/${slug}`);
    };

    const handleViewDetail = (slug: string) => {
        router.push(`/roadmaps/${slug}`);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                    {/* Hero Section */}
                    <div
                        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[oklch(0.15_0.015_260)] via-[oklch(0.17_0.02_250)] to-[oklch(0.15_0.015_260)] p-8 sm:p-10 text-primary-foreground">
                        {/* Background pattern */}
                        <div
                            className="absolute inset-0 opacity-30"
                            style={{
                                backgroundImage:
                                    "radial-gradient(circle, oklch(0.7_0.18_195) 1px, transparent 1px)",
                                backgroundSize: "28px 28px",
                            }}
                        />
                        {/* Gradient orbs */}
                        <div className="absolute -top-16 -right-16 size-64 rounded-full bg-primary/20 blur-3xl"/>
                        <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-primary/10 blur-3xl"/>

                        <div className="relative">
                            <div className="flex items-center gap-2 mb-3">
                                <BookOpenIcon className="size-5 text-primary"/>
                                <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                                    Lộ trình học tập
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight">
                                Chinh phục thuật toán
                                <br/>
                                <span className="text-primary">
                                    từng bước một
                                </span>
                            </h1>
                            <p className="text-base sm:text-lg max-w-lg leading-relaxed opacity-90">
                                Lộ trình học có hệ thống, từ nền tảng đến nâng cao. Theo dõi tiến độ, luyện tập với bài toán phỏng vấn thực tế.
                            </p>

                            {/* Quick Stats */}
                            <div className="flex items-center gap-6 mt-6">
                                <div className="flex items-center gap-2">
                                    <BookOpenIcon className="size-4 text-primary/70"/>
                                    <span className="text-sm font-medium">
                                        {pagination.totalElements} lộ trình
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <UsersIcon className="size-4 text-primary/70"/>
                                    <span className="text-sm font-medium">
                                        {paths.reduce((sum, p) => sum + p.enrollmentCount, 0).toLocaleString()}+ đã đăng ký
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StarIcon
                                        className="size-4 text-[oklch(0.9_0.15_85)]/70 fill-[oklch(0.9_0.15_85)]"/>
                                    <span className="text-sm font-medium">
                                        {paths.filter((p) => p.isPremium).length} Premium
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters & Search */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* Search */}
                        <div className="relative w-full sm:max-w-xs">
                            <SearchIcon
                                className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"/>
                            <input
                                type="text"
                                placeholder="Tìm lộ trình..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted/50 border-0 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                            />
                        </div>

                        {/* Level Filters */}
                        <div className="flex items-center gap-2 flex-wrap">
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
                                        className="h-8 text-sm"
                                    >
                                        {level === "All" ? (
                                            "Tất cả"
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

                        <div className="flex items-center gap-1 ml-auto">
                            <Button
                                variant={viewMode === "grid" ? "secondary" : "ghost"}
                                size="icon-sm"
                                onClick={() => setViewMode("grid")}
                                className="size-8"
                            >
                                <LayoutGridIcon className="size-4"/>
                            </Button>
                            <Button
                                variant={viewMode === "list" ? "secondary" : "ghost"}
                                size="icon-sm"
                                onClick={() => setViewMode("list")}
                                className="size-8"
                            >
                                <ListIcon className="size-4"/>
                            </Button>
                        </div>
                    </div>

                    {/* Results count */}
                    <div className="text-sm text-muted-foreground">
                        Hiển thị{" "}
                        <span className="font-medium text-foreground">
                            {isLoading ? "..." : filteredPaths.length}
                        </span>{" "}
                        {isLoading ? "" : "lộ trình"}
                        {selectedLevel !== "All" && (
                            <span>
                                {" "}
                                cấp độ{" "}
                                <span className="font-medium text-foreground capitalize">
                                    {selectedLevel}
                                </span>
                            </span>
                        )}
                    </div>

                    {/* Learning Path Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({length: 6}).map((_, i) => (
                                <div
                                    key={i}
                                    className="rounded-xl overflow-hidden bg-card ring-1 ring-foreground/10 animate-pulse"
                                >
                                    <div className="aspect-[16/10] bg-muted"/>
                                    <div className="p-4 space-y-2.5">
                                        <div className="h-5 bg-muted rounded w-3/4"/>
                                        <div className="h-4 bg-muted rounded w-full"/>
                                        <div className="h-4 bg-muted rounded w-5/6"/>
                                        <div className="flex gap-4 pt-1">
                                            <div className="h-3 bg-muted rounded w-12"/>
                                            <div className="h-3 bg-muted rounded w-16"/>
                                            <div className="h-3 bg-muted rounded w-14"/>
                                        </div>
                                        <div className="h-12 bg-muted rounded mt-1"/>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredPaths.length > 0 ? (
                        <div
                            className={cn(
                                viewMode === "grid"
                                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                                    : "flex flex-col gap-4"
                            )}
                        >
                            {filteredPaths.map((path) => (
                                <LearningPathCard
                                    key={path.slug}
                                    path={path}
                                    onEnroll={handleEnroll}
                                    onViewDetail={handleViewDetail}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <SearchIcon className="size-8 text-muted-foreground/50"/>
                            </div>
                            <h3 className="text-lg font-semibold mb-1">
                                Không tìm thấy lộ trình
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-sm">
                                Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để tìm lộ trình phù hợp.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSelectedLevel("All");
                                    setSearchQuery("");
                                }}
                                className="mt-4"
                            >
                                Xóa bộ lọc
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

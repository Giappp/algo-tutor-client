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

const FALLBACK_ROADMAPS: RoadmapTopic[] = [
    {
        name: "Nền tảng cấu trúc dữ liệu",
        slug: "data-structures-foundation",
        level: "BEGINNER",
        thumbnailUrl: "",
        description: "Mảng, chuỗi, hash map và các kỹ thuật xử lý dữ liệu cốt lõi.",
        goal: "Xây nền tư duy giải thuật",
        topicCount: 6,
        lessonCount: 28,
    },
    {
        name: "Cây và đồ thị",
        slug: "trees-and-graphs",
        level: "INTERMEDIATE",
        thumbnailUrl: "",
        description: "Từ duyệt cây cơ bản đến BFS, DFS và bài toán đường đi.",
        goal: "Làm chủ cấu trúc phi tuyến",
        topicCount: 8,
        lessonCount: 34,
    },
    {
        name: "Quy hoạch động",
        slug: "dynamic-programming",
        level: "ADVANCED",
        thumbnailUrl: "",
        description: "Nhận diện trạng thái, chuyển tiếp và tối ưu lời giải từng bước.",
        goal: "Giải bài toán tối ưu phức tạp",
        topicCount: 7,
        lessonCount: 31,
    },
];

export function RoadmapsSection() {
    const { data: roadmaps, isLoading, error } = useApiData<RoadmapTopic[]>("/landing/roadmaps");
    const visibleRoadmaps = roadmaps?.length ? roadmaps.slice(0, 3) : FALLBACK_ROADMAPS;

    return (
        <section id="roadmaps" className="bg-muted/20 py-24 lg:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end reveal-up">
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-primary">Lộ trình học</p>
                        <h2 className="max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                            Đi từ nền tảng đến bài toán khó mà không bỏ sót mắt xích.
                        </h2>
                        <p className="max-w-lg text-lg leading-8 text-muted-foreground">
                            Mỗi lộ trình nối lý thuyết, ví dụ và bài tập theo đúng thứ tự cần thiết.
                        </p>
                    </div>
                    <Button variant="outline" className="shrink-0 gap-2 self-start sm:self-auto" asChild>
                        <Link href="/roadmaps">
                            Xem tất cả lộ trình
                            <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                    {isLoading
                        ? Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="reveal-up">
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
                            </div>
                        ))
                        : visibleRoadmaps.map((roadmap, i) => (
                            <Link
                                key={roadmap.slug}
                                href={`/roadmaps/${roadmap.slug}`}
                                className="group reveal-up"
                                style={{ transitionDelay: `${i * 60}ms` }}
                            >
                                <article className="h-full rounded-2xl border border-border/60 bg-card p-2 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/5">
                                    <div className="relative rounded-2xl overflow-hidden group">
                                        <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-foreground">
                                            {roadmap.thumbnailUrl ? (
                                            <Image
                                                fill
                                                src={roadmap.thumbnailUrl}
                                                alt={roadmap.name}
                                                sizes="(max-width: 768px) 100vw, 400px"
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            ) : (
                                                <div className="absolute inset-0 bg-dotgrid opacity-20"/>
                                            )}
                                            <div className="absolute inset-x-5 bottom-5 font-mono text-xs leading-6 text-background/65">
                                                <span className="text-primary">const</span> nextStep =<br/>
                                                roadmap.continue();
                                            </div>
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

                                    <CardContent className="space-y-2 p-4">
                                        <h3 className="text-base font-semibold transition-colors group-hover:text-primary">
                                            {roadmap.name}
                                        </h3>
                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                            {roadmap.description}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{roadmap.topicCount} chủ đề</span>
                                            <span className="text-border/50">·</span>
                                            <span>{roadmap.lessonCount} bài học</span>
                                        </div>
                                    </CardContent>
                                </article>
                            </Link>
                        ))}
                </div>
                {error && !roadmaps?.length && (
                    <p className="mt-5 text-sm text-muted-foreground">
                        Đang hiển thị lộ trình mẫu trong khi kết nối dữ liệu nền tảng.
                    </p>
                )}
            </div>
        </section>
    );
}

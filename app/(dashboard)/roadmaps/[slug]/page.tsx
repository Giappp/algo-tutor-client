"use client";

import {use, useMemo, useRef, useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {useRoadmapDetail} from "@/hooks";
import {useRoadmapActions} from "@/hooks/use-roadmap-actions";
import type {LessonType, RoadmapDetailResponse} from "@/lib/types";
import {DifficultyBadge} from "@/components/roadmap/difficulty-badge";
import {LessonTypeIcon} from "@/components/roadmap/lesson-type-icon";
import {TopicAccordion} from "@/components/roadmap/topic-accordion";
import {WhatYoullLearn} from "@/components/roadmap/what-youll-learn";
import {StickyEnrollBar} from "@/components/roadmap/sticky-enroll-bar";
import {RevealOnScroll} from "@/components/ui/reveal-on-scroll";
import {Button} from "@/components/ui/button";
import {Accordion} from "@/components/ui/accordion";
import {
    ArrowLeftIcon,
    BookOpenIcon,
    CheckCircleIcon,
    CircleDashedIcon,
    ClockIcon,
    CopyCheckIcon,
    FileTextIcon,
    Loader2Icon,
    LockIcon,
    PlayIcon,
    Share2Icon,
    TargetIcon,
    UsersIcon,
} from "lucide-react";

interface PageProps {
    params: Promise<{ slug: string }>;
}

function isTopicUnlocked(topic: RoadmapDetailResponse["topics"][number]) {
    return !(topic.isLocked || topic.unlocked === false);
}

function getCompletedCountByTopic(
    topics: RoadmapDetailResponse["topics"]
): number[] {
    return topics.map((topic) =>
        topic.lessons.filter((lesson) => lesson.progress === "COMPLETED").length
    );
}

function RoadmapDetailSkeleton() {
    return (
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            <div className="mb-6 h-5 w-40 rounded-md bg-muted"/>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
                <div className="aspect-[16/8.5] animate-pulse rounded-2xl bg-muted"/>
                <div className="space-y-3 rounded-2xl border border-border/70 bg-card/70 p-5">
                    <div className="h-5 w-28 rounded-md bg-muted"/>
                    <div className="h-9 w-4/5 rounded-md bg-muted"/>
                    <div className="h-4 w-full rounded-md bg-muted"/>
                    <div className="h-4 w-2/3 rounded-md bg-muted"/>
                    <div className="mt-5 h-10 w-full rounded-lg bg-muted"/>
                </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({length: 4}).map((_, index) => (
                    <div key={index} className="h-24 animate-pulse rounded-xl border border-border/70 bg-card/70"/>
                ))}
            </div>
        </div>
    );
}

export default function LearningPathDetailPage({params}: PageProps) {
    const {slug} = use(params);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const stickySentinelRef = useRef<HTMLDivElement>(null);
    const [shareCopied, setShareCopied] = useState(false);

    const {roadmap: path, error, isLoading, mutate} = useRoadmapDetail(slug);
    const {enroll, isEnrolling} = useRoadmapActions();

    const enrolled = path?.enrolled ?? false;
    const completedCounts = useMemo(
        () => (path ? getCompletedCountByTopic(path.topics) : []),
        [path]
    );

    const handleEnroll = async () => {
        if (!path || isEnrolling) return;
        const result = await enroll(path.slug);
        if (result) {
            mutate({...path, enrolled: true}, false);
        }
    };

    const handleShare = async () => {
        if (!path || typeof window === "undefined") return;

        const url = window.location.href;
        if (navigator.share) {
            await navigator.share({title: path.name, text: path.description, url});
            return;
        }

        await navigator.clipboard?.writeText(url);
        setShareCopied(true);
        window.setTimeout(() => setShareCopied(false), 1800);
    };

    if (isLoading) {
        return (
            <div className="flex h-full flex-col bg-background/50">
                <div className="flex-1 overflow-y-auto">
                    <RoadmapDetailSkeleton/>
                </div>
            </div>
        );
    }

    if (error || !path) {
        return (
            <div className="flex h-full flex-col">
                <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20">
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
                        <BookOpenIcon className="size-8 text-muted-foreground/50"/>
                    </div>
                    <div className="max-w-sm text-center">
                        <h2 className="mb-1 text-lg font-semibold">
                            Không tìm thấy lộ trình
                        </h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Lộ trình bạn tìm không tồn tại hoặc đã bị xóa.
                        </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/roadmaps">
                            <ArrowLeftIcon className="size-4"/>
                            Quay lại danh sách
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    const totalLessons =
        path.lessonCount || path.topics.reduce((sum, topic) => sum + topic.lessonCount, 0);
    const unlockedTopics = path.topics.filter(isTopicUnlocked);
    const enrolledCompleted = unlockedTopics.reduce((sum, topic) => {
        const topicIndex = path.topics.findIndex((item) => item.id === topic.id);
        return sum + (completedCounts[topicIndex] ?? 0);
    }, 0);
    const progressPercent =
        totalLessons > 0 ? Math.round((enrolledCompleted / totalLessons) * 100) : 0;

    const skills = unlockedTopics
        .flatMap((topic) =>
            topic.lessons
                .filter((lesson) => lesson.type === "THEORY")
                .map((lesson) => `Nắm vững ${lesson.title} qua bài học có định hướng`)
        )
        .slice(0, 5);

    const firstOpenTopic = path.topics.find(isTopicUnlocked);
    const hasLockedTopics = path.topics.some((topic) => !isTopicUnlocked(topic));
    const stats = [
        {
            icon: UsersIcon,
            label: "Học viên",
            value: path.enrollmentCount.toLocaleString(),
        },
        {
            icon: BookOpenIcon,
            label: "Chủ đề",
            value: String(path.topicCount || path.topics.length),
        },
        {
            icon: FileTextIcon,
            label: "Bài học",
            value: String(totalLessons),
        },
        {
            icon: ClockIcon,
            label: "Ước tính",
            value: `~${Math.max(path.topicCount * 5, 1)} giờ`,
        },
    ];

    return (
        <div className="flex h-full flex-col bg-background/50">
            <StickyEnrollBar
                path={path}
                onEnroll={handleEnroll}
                enrolled={enrolled}
                isEnrolling={isEnrolling}
                scrollContainerRef={scrollContainerRef}
                sentinelRef={stickySentinelRef}
            />

            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
                    <RevealOnScroll delay={0}>
                        <Link
                            href="/roadmaps"
                            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                        >
                            <ArrowLeftIcon className="size-4"/>
                            Quay lại danh sách
                        </Link>
                    </RevealOnScroll>
                    <div ref={stickySentinelRef} aria-hidden className="h-px"/>

                    <RevealOnScroll delay={50} direction="up">
                        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.42fr)_minmax(320px,0.58fr)]">
                            <div className="group relative min-h-[360px] overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-border/70">
                                <Image
                                    fill
                                    priority
                                    src={path.thumbnailUrl}
                                    alt={path.name}
                                    sizes="(max-width: 1024px) 100vw, 760px"
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.82))]"/>
                                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                        <DifficultyBadge difficulty={path.level}/>
                                        {path.isPremium && (
                                            <span className="inline-flex h-6 items-center rounded-md border border-amber-300/30 bg-amber-400/20 px-2.5 text-[11px] font-semibold text-amber-100 backdrop-blur">
                                                Premium
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight text-white text-balance sm:text-4xl">
                                        {path.name}
                                    </h1>
                                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
                                        {path.description}
                                    </p>
                                </div>
                            </div>

                            <aside className="flex flex-col justify-between rounded-xl bg-card/80 p-5 shadow-sm ring-1 ring-border/70">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                                        <TargetIcon className="size-3.5"/>
                                        Mục tiêu học tập
                                    </div>
                                    <p className="text-sm leading-relaxed text-foreground">
                                        {path.goal}
                                    </p>
                                </div>

                                {enrolled && (
                                    <div className="mt-6 rounded-lg bg-muted/60 p-4">
                                        <div className="mb-2 flex items-center justify-between text-sm">
                                            <span className="font-semibold">Tiến độ của bạn</span>
                                            <span className="font-semibold text-primary">{progressPercent}%</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-background">
                                            <div
                                                className="h-full rounded-full bg-primary transition-all duration-700"
                                                style={{width: `${progressPercent}%`}}
                                            />
                                        </div>
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            {enrolledCompleted}/{totalLessons} bài học đã hoàn thành
                                        </p>
                                    </div>
                                )}

                                <div className="mt-6 flex flex-col gap-2 sm:flex-row lg:flex-col">
                                    {enrolled ? (
                                        <Button asChild className="h-10 flex-1 bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90">
                                            <Link href={`/learn/${slug}`}>
                                                <PlayIcon className="size-4"/>
                                                {enrolledCompleted > 0 ? "Tiếp tục học" : "Bắt đầu học"}
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleEnroll}
                                            disabled={isEnrolling}
                                            className="h-10 flex-1 bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
                                        >
                                            {isEnrolling ? (
                                                <Loader2Icon className="size-4 animate-spin"/>
                                            ) : (
                                                <BookOpenIcon className="size-4"/>
                                            )}
                                            {isEnrolling ? "Đang đăng ký" : "Đăng ký miễn phí"}
                                        </Button>
                                    )}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleShare}
                                        className="h-10 flex-1"
                                    >
                                        {shareCopied ? (
                                            <CopyCheckIcon className="size-4 text-emerald-500"/>
                                        ) : (
                                            <Share2Icon className="size-4"/>
                                        )}
                                        {shareCopied ? "Đã sao chép" : "Chia sẻ"}
                                    </Button>
                                </div>
                            </aside>
                        </section>
                    </RevealOnScroll>

                    <RevealOnScroll delay={100} direction="up">
                        <section className="mt-5 overflow-hidden rounded-xl bg-card/70 shadow-sm ring-1 ring-border/70">
                            <div className="grid grid-cols-2 divide-x divide-y divide-border/60 sm:grid-cols-4 sm:divide-y-0">
                            {stats.map((stat) => (
                                <div
                                    key={stat.label}
                                    className="group p-4 transition-colors duration-300 hover:bg-muted/35"
                                >
                                    <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                                        <stat.icon className="size-4 transition-colors group-hover:text-primary"/>
                                        <span className="text-xs font-medium">{stat.label}</span>
                                    </div>
                                    <span className="text-lg font-bold tabular-nums text-foreground sm:text-xl">
                                        {stat.value}
                                    </span>
                                </div>
                            ))}
                            </div>
                        </section>
                    </RevealOnScroll>

                    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(260px,0.28fr)]">
                        <div className="space-y-8">
                            {skills.length > 0 && (
                                <RevealOnScroll delay={140} direction="up">
                                    <WhatYoullLearn skills={skills}/>
                                </RevealOnScroll>
                            )}

                            <RevealOnScroll delay={180} direction="up">
                                <section className="space-y-4">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold text-foreground">
                                                Nội dung khóa học
                                            </h2>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Học theo từng chủ đề, hoàn thành phần hiện tại để mở khóa phần tiếp theo.
                                            </p>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {unlockedTopics.length}/{path.topics.length} chủ đề đang mở
                                        </div>
                                    </div>

                                    <div className="overflow-hidden rounded-xl bg-card/70 shadow-sm ring-1 ring-border/70">
                                        <Accordion
                                            type="multiple"
                                            defaultValue={firstOpenTopic ? [firstOpenTopic.name] : undefined}
                                            className="p-2"
                                        >
                                            {path.topics.map((topic, index) => (
                                                <TopicAccordion
                                                    key={topic.id}
                                                    topic={topic}
                                                    completedCount={enrolled ? completedCounts[index] ?? 0 : 0}
                                                    roadmapSlug={slug}
                                                />
                                            ))}
                                        </Accordion>
                                    </div>
                                </section>
                            </RevealOnScroll>
                        </div>

                        <RevealOnScroll delay={220} direction="up">
                            <aside className="sticky top-6 space-y-4">
                                <div className="rounded-xl bg-card/70 p-4 shadow-sm ring-1 ring-border/70">
                                    <p className="text-sm font-semibold text-foreground">Loại bài học</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <LessonTypeIcon type={"THEORY" as LessonType} showLabel/>
                                        <LessonTypeIcon type={"QUIZ" as LessonType} showLabel/>
                                        <LessonTypeIcon type={"CODING" as LessonType} showLabel/>
                                        <LessonTypeIcon type={"VIDEO" as LessonType} showLabel/>
                                    </div>
                                </div>

                                <div className="rounded-xl bg-card/70 p-4 text-sm shadow-sm ring-1 ring-border/70">
                                    <div className="flex items-start gap-2.5">
                                        {hasLockedTopics ? (
                                            <LockIcon className="mt-0.5 size-4 text-muted-foreground"/>
                                        ) : (
                                            <CircleDashedIcon className="mt-0.5 size-4 text-muted-foreground"/>
                                        )}
                                        <p className="leading-relaxed text-muted-foreground">
                                            {hasLockedTopics
                                                ? "Một số chủ đề sẽ mở sau khi bạn hoàn thành các phần trước."
                                                : "Toàn bộ chủ đề trong lộ trình này đang sẵn sàng để học."}
                                        </p>
                                    </div>
                                </div>

                                {!enrolled && (
                                    <div className="hidden rounded-xl bg-primary/8 p-4 shadow-sm ring-1 ring-primary/20 lg:block">
                                        <p className="text-sm font-semibold text-foreground">
                                            Sẵn sàng bắt đầu?
                                        </p>
                                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                            Đăng ký để lưu tiến độ và mở bài học theo thứ tự.
                                        </p>
                                        <Button
                                            onClick={handleEnroll}
                                            disabled={isEnrolling}
                                            size="sm"
                                            className="mt-3 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                        >
                                            {isEnrolling ? (
                                                <Loader2Icon className="size-4 animate-spin"/>
                                            ) : (
                                                <BookOpenIcon className="size-4"/>
                                            )}
                                            Đăng ký
                                        </Button>
                                    </div>
                                )}
                            </aside>
                        </RevealOnScroll>
                    </div>

                    <div className="h-24 sm:hidden"/>
                </div>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-4 backdrop-blur-xl sm:hidden">
                <div className="flex items-center gap-3">
                    {enrolled ? (
                        <Button asChild className="h-10 flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                            <Link href={`/learn/${slug}`}>
                                <CheckCircleIcon className="size-4"/>
                                Học tiếp
                            </Link>
                        </Button>
                    ) : (
                        <Button
                            onClick={handleEnroll}
                            disabled={isEnrolling}
                            className="h-10 flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            {isEnrolling ? (
                                <Loader2Icon className="size-4 animate-spin"/>
                            ) : (
                                <BookOpenIcon className="size-4"/>
                            )}
                            {isEnrolling ? "Đang đăng ký" : "Đăng ký ngay"}
                        </Button>
                    )}
                    <DifficultyBadge difficulty={path.level} className="shrink-0"/>
                </div>
            </div>
        </div>
    );
}

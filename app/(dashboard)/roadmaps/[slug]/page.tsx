"use client";

import {use} from "react";
import Link from "next/link";
import {useApiData} from "@/hooks";
import {useRoadmapActions} from "@/hooks/use-roadmap-actions";
import type {LessonType, Level, RoadmapDetailResponse} from "@/lib/types";
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
    FileTextIcon,
    Loader2Icon,
    UsersIcon,
} from "lucide-react";
import Image from "next/image";

interface PageProps {
    params: Promise<{ slug: string }>;
}

function getCompletedCountByTopic(
    topics: RoadmapDetailResponse["topics"]
): number[] {
    return topics.map((topic) =>
        topic.lessons.filter((l) => l.progress === "COMPLETED").length
    );
}

export default function LearningPathDetailPage({params}: PageProps) {
    const {slug} = use(params);

    const {data: path, error, isLoading, mutate} = useApiData<RoadmapDetailResponse>(
        `/roadmaps/${slug}`,
        {revalidateOnFocus: false}
    );
    const {enroll, isEnrolling} = useRoadmapActions();

    const enrolled = path?.enrolled ?? false;
    const completedCounts = path ? getCompletedCountByTopic(path.topics) : [];

    const handleEnroll = async () => {
        if (!path || isEnrolling) return;
        const result = await enroll(path.slug);
        if (result) {
            mutate({...path, enrolled: true}, false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <Loader2Icon className="size-8 animate-spin text-muted-foreground"/>
                    <p className="text-sm text-muted-foreground">Đang tải lộ trình...</p>
                </div>
            </div>
        );
    }

    if (error || !path) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
                    <div className="size-16 rounded-full bg-muted flex items-center justify-center">
                        <BookOpenIcon className="size-8 text-muted-foreground/50"/>
                    </div>
                    <div className="text-center">
                        <h2 className="text-lg font-semibold mb-1">
                            Không tìm thấy lộ trình
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Lộ trình bạn tìm không tồn tại hoặc đã bị xóa.
                        </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/roadmaps">
                            <ArrowLeftIcon className="size-4 mr-1.5"/>
                            Quay lại
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    const totalLessons =
        path.topics?.reduce((sum, t) => sum + t.lessonCount, 0) ?? 0;
    const enrolledCompleted = path.topics
        ?.filter((t) => !t.isLocked)
        .reduce((sum, _, i) => sum + (completedCounts[i] ?? 0), 0) ?? 0;

    const skills = path.topics
        ?.filter((t) => !t.isLocked)
        .flatMap((t) =>
            t.lessons
                .filter((l) => l.type === "THEORY")
                .map((l) => `Master "${l.title}" with hands-on practice`)
        )
        .slice(0, 5) ?? [];

    return (
        <div className="flex flex-col h-full">
            <StickyEnrollBar
                path={path}
                onEnroll={handleEnroll}
                enrolled={enrolled}
            />
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-6 py-8 space-y-10">
                    {/* Back Navigation */}
                    <RevealOnScroll delay={0}>
                        <Link
                            href="/roadmaps"
                            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeftIcon className="size-4"/>
                            Quay lại danh sách
                        </Link>
                    </RevealOnScroll>

                    {/* Hero Section */}
                    <RevealOnScroll delay={50} direction="scale">
                        <div className="relative rounded-2xl overflow-hidden group">
                            <div className="group relative w-full aspect-video overflow-hidden rounded-lg">
                                <Image
                                    fill
                                    priority
                                    src={path.thumbnailUrl}
                                    alt={path.name}
                                    sizes="(max-width: 768px) 100vw, 400px"
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10"/>

                            {/* Badges */}
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                <DifficultyBadge difficulty={path.level as Level}/>
                            </div>
                            {path.isPremium && (
                                <div
                                    className="absolute top-4 left-4 flex items-center gap-1 rounded-full bg-[oklch(0.7_0.16_85)]/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                                    <svg
                                        viewBox="0 0 12 12"
                                        className="size-3 fill-[oklch(0.9_0.15_85)]"
                                    >
                                        <path
                                            d="M6 1l1.35 2.73L10.5 4.1l-2.25 2.19.53 3.09L6 8.05 3.22 9.38l.53-3.09L1.5 4.1l3.15-.37z"/>
                                    </svg>
                                    Premium
                                </div>
                            )}

                            {/* Hero Info */}
                            <div className="absolute bottom-0 inset-x-0 p-6">
                                <h1 className="text-2xl font-bold text-white mb-2 leading-tight">
                                    {path.name}
                                </h1>
                                <p className="text-sm text-white/80 max-w-2xl line-clamp-2 leading-relaxed">
                                    {path.description}
                                </p>
                            </div>
                        </div>
                    </RevealOnScroll>

                    {/* Stats Bar */}
                    <RevealOnScroll delay={100} direction="up">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                {
                                    icon: UsersIcon,
                                    label: "Đã đăng ký",
                                    value: path.enrollmentCount.toLocaleString(),
                                },
                                {
                                    icon: BookOpenIcon,
                                    label: "Chủ đề",
                                    value: String(path.topicCount),
                                },
                                {
                                    icon: FileTextIcon,
                                    label: "Bài học",
                                    value: String(totalLessons),
                                },
                                {
                                    icon: ClockIcon,
                                    label: "Thời gian",
                                    value: `~${path.topicCount * 5}h`,
                                },
                            ].map((stat, i) => (
                                <div
                                    key={i}
                                    className="group flex flex-col gap-1 rounded-xl bg-card border border-border p-4 transition-all duration-300 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5"
                                >
                                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                                        <stat.icon className="size-4 transition-colors group-hover:text-primary"/>
                                        <span className="text-xs font-medium">
                                            {stat.label}
                                        </span>
                                    </div>
                                    <span className="text-lg font-bold text-foreground">
                                        {stat.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </RevealOnScroll>

                    {/* CTA */}
                    <RevealOnScroll delay={150} direction="up">
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            {enrolled ? (
                                <>
                                    <div className="flex items-center gap-2 text-sm text-primary font-medium">
                                        <CheckCircleIcon className="size-5"/>
                                        Bạn đã đăng ký lộ trình này
                                    </div>
                                    <Button
                                        asChild
                                        className="bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 text-white shadow-lg shadow-purple-600/30 hover:shadow-xl hover:shadow-purple-600/40 w-full sm:w-auto"
                                    >
                                        <Link href={`/learn/${slug}`}>
                                            {enrolledCompleted > 0 ? "Tiếp tục học" : "Bắt đầu học"}
                                        </Link>
                                    </Button>
                                </>
                            ) : (
                                <button
                                    onClick={handleEnroll}
                                    disabled={isEnrolling}
                                    className="flex items-center gap-1.5 h-10 rounded-lg bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 px-6 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-purple-600/40 active:scale-95 w-full sm:w-auto justify-center disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
                                >
                                    {isEnrolling ? (
                                        <Loader2Icon className="size-4 animate-spin"/>
                                    ) : (
                                        <BookOpenIcon className="size-4"/>
                                    )}
                                    {isEnrolling ? "Đang đăng ký..." : "Đăng ký miễn phí"}
                                </button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto"
                            >
                                Chia sẻ
                            </Button>
                        </div>
                    </RevealOnScroll>

                    {/* Goal Banner */}
                    <RevealOnScroll delay={200} direction="up">
                        <div
                            className="flex items-start gap-3 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-5">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                                <svg
                                    className="size-5 text-primary"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M10 2v5M7.5 4.5L10 7l2.5-2.5M4 16h12M10 11v5M7.5 14l2.5 2 2.5-2"/>
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-primary mb-1 uppercase tracking-wider">
                                    Mục tiêu học tập
                                </p>
                                <p className="text-sm text-foreground leading-relaxed">
                                    {path.goal}
                                </p>
                            </div>
                        </div>
                    </RevealOnScroll>

                    {/* What You'll Learn */}
                    {skills.length > 0 && (
                        <RevealOnScroll delay={250} direction="up">
                            <WhatYoullLearn skills={skills}/>
                        </RevealOnScroll>
                    )}

                    {/* Progress (if enrolled) */}
                    {enrolled && (
                        <RevealOnScroll delay={280} direction="up">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">
                                        Tiến độ của bạn
                                    </span>
                                    <span className="text-muted-foreground">
                                        {totalLessons > 0
                                            ? Math.round(
                                                (enrolledCompleted /
                                                    totalLessons) *
                                                100
                                            )
                                            : 0}
                                        %
                                    </span>
                                </div>
                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-500 transition-all duration-700"
                                        style={{
                                            width: `${totalLessons > 0
                                                ? Math.round(
                                                    (enrolledCompleted /
                                                        totalLessons) *
                                                    100
                                                )
                                                : 0
                                            }%`,
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {enrolledCompleted} / {totalLessons}{" "}
                                    bài học đã hoàn thành
                                </p>
                            </div>
                        </RevealOnScroll>
                    )}

                    {/* Lesson Type Legend */}
                    <RevealOnScroll delay={300} direction="up">
                        <div className="flex flex-wrap items-center gap-4 py-3 border-y border-border/50">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Loại bài học:
                            </span>
                            <LessonTypeIcon
                                type={"THEORY" as LessonType}
                                showLabel={true}
                            />
                            <LessonTypeIcon
                                type={"QUIZ" as LessonType}
                                showLabel={true}
                            />
                            <LessonTypeIcon
                                type={"CODING" as LessonType}
                                showLabel={true}
                            />
                            <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
                                <CircleDashedIcon className="size-3.5"/>
                                Hoàn thành topic để mở khóa topic tiếp theo
                            </div>
                        </div>
                    </RevealOnScroll>

                    {/* Topics Accordion */}
                    <RevealOnScroll delay={350} direction="up">
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-foreground">
                                Nội dung khóa học
                            </h2>
                            <div className="rounded-xl border border-border bg-card overflow-hidden">
                                <Accordion
                                    type="multiple"
                                    defaultValue={
                                        path.topics?.find((t) => !t.isLocked)
                                            ? [
                                                path.topics.find(
                                                    (t) => !t.isLocked
                                                )!.name,
                                            ]
                                            : undefined
                                    }
                                    className="p-2"
                                >
                                    {path.topics?.map((topic, i) => (
                                        <TopicAccordion
                                            key={topic.id}
                                            topic={topic}
                                            completedCount={
                                                enrolled
                                                    ? completedCounts[i] ?? 0
                                                    : 0
                                            }
                                            roadmapSlug={slug}
                                        />
                                    ))}
                                </Accordion>
                            </div>
                        </div>
                    </RevealOnScroll>

                    {/* Spacer for mobile sticky CTA */}
                    <div className="h-20 sm:hidden"/>
                </div>
            </div>

            {/* Mobile Sticky CTA */}
            <div
                className="fixed bottom-0 inset-x-0 p-4 bg-background/90 backdrop-blur-xl border-t border-border sm:hidden z-50">
                <div className="flex items-center gap-3">
                    {enrolled ? (
                        <div className="flex items-center gap-2 text-sm text-primary font-medium flex-1">
                            <CheckCircleIcon className="size-5"/>
                            Đã đăng ký
                        </div>
                    ) : (
                        <button
                            onClick={handleEnroll}
                            disabled={isEnrolling}
                            className="flex items-center gap-1.5 h-10 rounded-lg bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 px-5 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 flex-1 justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isEnrolling ? (
                                <Loader2Icon className="size-4 animate-spin"/>
                            ) : (
                                "Đăng ký ngay"
                            )}
                        </button>
                    )}
                    <DifficultyBadge difficulty={path.level as Level}/>
                </div>
            </div>
        </div>
    );
}

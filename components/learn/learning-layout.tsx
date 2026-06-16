"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { RoadmapNavigator } from "@/components/learn/roadmap-navigator";
import { LessonContentArea } from "@/components/learn/lesson-content-area";
import { AITutorPanel } from "@/components/lessons/ai-tutor-panel";
import type {
    RoadmapDetailResponse,
    LessonWithProgress,
    LessonType,
} from "@/lib/types/roadmap";
import type { LessonContext } from "@/lib/types/lesson";
import { cn } from "@/lib/utils";
import {
    ArrowLeftIcon,
    ChevronsLeftIcon,
    ChevronsRightIcon,
    CircleIcon,
    Loader2Icon,
    MessageSquareIcon,
    PanelLeftOpenIcon,
} from "lucide-react";

interface LearningLayoutProps {
    roadmapSlug: string;
    lessonSlug: string;
    lessonType: LessonType;
    roadmapData: RoadmapDetailResponse | undefined;
    onMarkComplete: () => void;
    isUpdating?: boolean;
    isCompleted?: boolean;
    isLocked?: boolean;
    allowManualComplete?: boolean;
    children: React.ReactNode;
}

function useIsDesktop() {
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 1024px)");

        const sync = () => {
            setIsDesktop(mediaQuery.matches);
        };

        sync();
        mediaQuery.addEventListener("change", sync);

        return () => {
            mediaQuery.removeEventListener("change", sync);
        };
    }, []);

    return isDesktop;
}

function buildLessonNav(
    topics: RoadmapDetailResponse["topics"],
    currentLessonSlug: string
): { prev: LessonWithProgress | null; next: LessonWithProgress | null } {
    const allLessons: LessonWithProgress[] = topics
        .filter((topic) => !(topic.isLocked || topic.unlocked === false))
        .flatMap((topic) => topic.lessons);

    const currentIndex = allLessons.findIndex(
        (lesson) => lesson.slug === currentLessonSlug
    );

    return {
        prev: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
        next:
            currentIndex >= 0 && currentIndex < allLessons.length - 1
                ? allLessons[currentIndex + 1]
                : null,
    };
}

function buildLessonContext(
    roadmap: RoadmapDetailResponse,
    lessonSlug: string,
    lessonType: LessonType
): LessonContext {
    const allLessons = roadmap.topics
        .filter((topic) => !(topic.isLocked || topic.unlocked === false))
        .flatMap((topic) => topic.lessons);

    const current =
        allLessons.find((lesson) => lesson.slug === lessonSlug) ?? allLessons[0];

    return {
        roadmapSlug: roadmap.slug,
        roadmapName: roadmap.name,
        lessonSlug: current?.slug ?? lessonSlug,
        lessonTitle: current?.title ?? "",
        lessonType,
        lessonId: current?.id,
    };
}

function getCurrentLessonProgress(
    topics: RoadmapDetailResponse["topics"],
    lessonSlug: string
): string | null {
    for (const topic of topics) {
        const lesson = topic.lessons.find((item) => item.slug === lessonSlug);
        if (lesson) return lesson.progress ?? null;
    }

    return null;
}

function getCurrentLesson(
    topics: RoadmapDetailResponse["topics"],
    lessonSlug: string
): LessonWithProgress | null {
    for (const topic of topics) {
        const lesson = topic.lessons.find((item) => item.slug === lessonSlug);
        if (lesson) return lesson;
    }

    return null;
}

export function LearningLayout({
    roadmapSlug,
    lessonSlug,
    lessonType,
    roadmapData: roadmap,
    onMarkComplete,
    isUpdating = false,
    isCompleted: isCompletedProp,
    isLocked = false,
    allowManualComplete = true,
    children,
}: LearningLayoutProps) {
    const router = useRouter();
    const isDesktop = useIsDesktop();

    const [navigatorOpen, setNavigatorOpen] = useState(true);
    const [aiOpen, setAiOpen] = useState(false);
    const [mobileNavigatorOpen, setMobileNavigatorOpen] = useState(false);

    useEffect(() => {
        const handleOpen = () => setAiOpen(true);
        const handleClose = () => setAiOpen(false);
        const handleToggle = () => setAiOpen((prev) => !prev);

        window.addEventListener("ai-tutor-open", handleOpen);
        window.addEventListener("ai-tutor-close", handleClose);
        window.addEventListener("ai-tutor-toggle", handleToggle);

        return () => {
            window.removeEventListener("ai-tutor-open", handleOpen);
            window.removeEventListener("ai-tutor-close", handleClose);
            window.removeEventListener("ai-tutor-toggle", handleToggle);
        };
    }, []);

    const handleLessonSelect = (selectedSlug: string) => {
        router.push(`/learn/${roadmapSlug}/${selectedSlug}`);
    };

    if (!roadmap) {
        return (
            <div className="flex h-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Loader2Icon className="size-8 animate-spin" />
                    <span className="text-sm font-medium">Đang tải bài học...</span>
                </div>
            </div>
        );
    }

    const { prev, next } = buildLessonNav(roadmap.topics, lessonSlug);
    const lessonContext = buildLessonContext(roadmap, lessonSlug, lessonType);
    const currentProgress = getCurrentLessonProgress(roadmap.topics, lessonSlug);
    const currentLesson = getCurrentLesson(roadmap.topics, lessonSlug);
    const isCompleted = isCompletedProp ?? currentProgress === "COMPLETED";

    return (
        <div className="flex h-screen overflow-hidden bg-background noise-texture">
            {/* Desktop navigator */}
            <aside
                className={cn(
                    "relative hidden shrink-0 border-r border-border/50 bg-card/70 shadow-[8px_0_24px_-28px_var(--foreground)] backdrop-blur-xl transition-[width] duration-300 ease-in-out md:flex",
                    navigatorOpen ? "w-[318px]" : "w-12"
                )}
            >
                <div
                    className={cn(
                        "flex h-full min-w-0 flex-col overflow-hidden transition-opacity duration-200",
                        navigatorOpen ? "w-full opacity-100" : "w-0 opacity-0 pointer-events-none"
                    )}
                >
                    <div className="shrink-0 border-b border-border/50 bg-muted/30 px-4 py-3.5">
                        <Link
                            href={`/roadmaps/${roadmapSlug}`}
                            className="group flex min-w-0 items-center gap-2"
                        >
                            <ArrowLeftIcon className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                            <span className="truncate text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                                {roadmap.name}
                            </span>
                        </Link>
                    </div>

                    <RoadmapNavigator
                        roadmap={roadmap}
                        currentLessonSlug={lessonSlug}
                        roadmapSlug={roadmapSlug}
                        onLessonSelect={(slug) => handleLessonSelect(slug)}
                        panelVariant="desktop"
                    />
                </div>

                <button
                    type="button"
                    onClick={() => setNavigatorOpen((prev) => !prev)}
                    aria-label={navigatorOpen ? "Thu gọn mục lục" : "Mở mục lục"}
                    title={navigatorOpen ? "Thu gọn mục lục" : "Mở mục lục"}
                    className={cn(
                        "absolute top-16 z-30 flex size-8 items-center justify-center rounded-full border border-border/70 bg-background shadow-md transition-all",
                        "text-muted-foreground hover:-translate-y-0.5 hover:bg-muted hover:text-foreground",
                        navigatorOpen ? "-right-4" : "left-1/2 -translate-x-1/2"
                    )}
                >
                    {navigatorOpen ? (
                        <ChevronsLeftIcon className="size-5" />
                    ) : (
                        <ChevronsRightIcon className="size-5" />
                    )}
                </button>
            </aside>

            {/* Main content */}
            <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <header className="relative flex h-14 shrink-0 items-center gap-3 border-b border-border/50 bg-background/90 px-3 backdrop-blur-xl sm:px-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMobileNavigatorOpen(true)}
                        className="h-8 gap-1.5 text-xs md:hidden"
                    >
                        <PanelLeftOpenIcon className="size-4" />
                        <span>Mục lục</span>
                    </Button>

                    <div className="hidden min-w-0 flex-1 items-center gap-3 md:flex">
                        {!navigatorOpen && (
                            <Link
                                href={`/roadmaps/${roadmapSlug}`}
                                className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground transition-colors hover:text-foreground"
                                aria-label="Quay lại lộ trình"
                            >
                                <ArrowLeftIcon className="size-3.5" />
                            </Link>
                        )}

                        <div className="min-w-0">
                            <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
                                <span className="truncate">{roadmap.name}</span>
                                <CircleIcon className="size-1 fill-current" />
                                <span className="capitalize">
                                    {lessonType.toLowerCase()}
                                </span>
                            </div>
                            <h1 className="truncate text-sm font-bold leading-tight text-foreground">
                                {currentLesson?.title ?? lessonContext.lessonTitle}
                            </h1>
                        </div>
                    </div>

                    <div className="min-w-0 flex-1 md:hidden" />

                    <Button
                        variant={aiOpen ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setAiOpen((prev) => !prev)}
                        className={cn(
                            "h-8 gap-1.5 overflow-hidden text-xs font-bold transition-all duration-200",
                            aiOpen
                                ? "border-none bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <MessageSquareIcon
                            className={cn(
                                "size-3.5",
                                aiOpen ? "text-primary-foreground" : "text-primary"
                            )}
                        />
                        <span className="hidden sm:inline">AI Tutor</span>

                        <span className="relative flex size-1.5">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                        </span>
                    </Button>
                </header>

                <section className="min-h-0 flex-1 overflow-y-auto">
                    {isLocked ? (
                        <div className="h-full overflow-y-auto bg-background/50 backdrop-blur-sm">
                            {children}
                        </div>
                    ) : (
                        <LessonContentArea
                            roadmapSlug={roadmapSlug}
                            prev={prev}
                            next={next}
                            onMarkComplete={onMarkComplete}
                            isUpdating={isUpdating}
                            isCompleted={isCompleted}
                            allowManualComplete={allowManualComplete}
                        >
                            {children}
                        </LessonContentArea>
                    )}
                </section>
            </main>

            {/* Mobile navigator sheet */}
            <Sheet open={mobileNavigatorOpen} onOpenChange={setMobileNavigatorOpen}>
                <SheetContent
                    side="left"
                    className="flex w-full max-w-[320px] flex-col p-0 sm:max-w-[360px]"
                >
                    <div className="shrink-0 border-b border-border/50 bg-muted/30 px-4 py-3.5">
                        <h3 className="line-clamp-2 text-sm font-bold text-foreground">
                            {roadmap.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Nội dung lộ trình
                        </p>
                    </div>

                    <RoadmapNavigator
                        roadmap={roadmap}
                        currentLessonSlug={lessonSlug}
                        roadmapSlug={roadmapSlug}
                        onLessonSelect={(slug) => {
                            handleLessonSelect(slug);
                            setMobileNavigatorOpen(false);
                        }}
                        panelVariant="mobile"
                    />
                </SheetContent>
            </Sheet>

            {/* Desktop AI panel */}
            {aiOpen && isDesktop && (
                <aside className="hidden h-full w-[380px] shrink-0 flex-col border-l border-border/50 bg-card/70 shadow-[-8px_0_24px_-28px_var(--foreground)] backdrop-blur-xl lg:flex">
                    <AITutorPanel context={lessonContext} />
                </aside>
            )}

            {/* Mobile AI sheet */}
            <Sheet open={aiOpen && !isDesktop} onOpenChange={setAiOpen}>
                <SheetContent
                    side="right"
                    className="flex w-full max-w-full flex-col p-0 sm:max-w-[420px]"
                >
                    <AITutorPanel context={lessonContext} />
                </SheetContent>
            </Sheet>
        </div>
    );
}

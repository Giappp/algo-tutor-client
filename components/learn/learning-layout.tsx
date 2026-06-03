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

export function LearningLayout({
    roadmapSlug,
    lessonSlug,
    lessonType,
    roadmapData: roadmap,
    onMarkComplete,
    isUpdating = false,
    isCompleted: isCompletedProp,
    isLocked = false,
    children,
}: LearningLayoutProps) {
    const router = useRouter();
    const isDesktop = useIsDesktop();

    const [navigatorOpen, setNavigatorOpen] = useState(false);
    const [prevIsDesktop, setPrevIsDesktop] = useState(isDesktop);
    const [aiOpen, setAiOpen] = useState(false);
    const [mobileNavigatorOpen, setMobileNavigatorOpen] = useState(false);

    if (isDesktop !== prevIsDesktop) {
        setPrevIsDesktop(isDesktop);
        setAiOpen(isDesktop);
    }

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
    const isCompleted = isCompletedProp ?? currentProgress === "COMPLETED";

    return (
        <div className="flex h-screen overflow-hidden bg-background noise-texture">
            {/* Desktop navigator */}
            <aside className="relative hidden shrink-0 md:flex">
                <div
                    className={cn(
                        "flex h-full flex-col overflow-hidden border-r border-border/50 bg-card/80 backdrop-blur-xl transition-[width] duration-300 ease-in-out",
                        navigatorOpen ? "w-auto" : "w-0 border-r-0"
                    )}
                >
                    {navigatorOpen && (
                        <>
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
                        </>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => setNavigatorOpen((prev) => !prev)}
                    aria-label={navigatorOpen ? "Collapse navigator" : "Expand navigator"}
                    title={navigatorOpen ? "Collapse navigator" : "Expand navigator"}
                    className={cn(
                        "absolute top-1/2 z-20 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background shadow-sm transition-colors",
                        "text-muted-foreground hover:bg-muted hover:text-foreground",
                        navigatorOpen ? "-right-4" : "-right-4"
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
                <header className="relative flex h-12 shrink-0 items-center gap-2 border-b border-border/50 bg-background/90 px-3 backdrop-blur-xl sm:px-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMobileNavigatorOpen(true)}
                        className="h-8 gap-1.5 text-xs md:hidden"
                    >
                        <PanelLeftOpenIcon className="size-4" />
                        <span>Contents</span>
                    </Button>

                    {!navigatorOpen && (
                        <Link
                            href={`/roadmaps/${roadmapSlug}`}
                            className="hidden min-w-0 items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground md:flex"
                        >
                            <ArrowLeftIcon className="size-3.5" />
                            <span className="max-w-[240px] truncate">
                                {roadmap.name}
                            </span>
                        </Link>
                    )}

                    <div className="min-w-0 flex-1" />

                    <Button
                        variant={aiOpen ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setAiOpen((prev) => !prev)}
                        className={cn(
                            "h-8 gap-1.5 overflow-hidden text-xs font-bold transition-all duration-200",
                            aiOpen
                                ? "border-none bg-gradient-to-r from-primary to-indigo-600 text-primary-foreground shadow-sm shadow-primary/20"
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
                            Course contents
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
                <aside className="hidden w-[360px] h-full shrink-0 flex-col border-l border-border/50 bg-background/95 backdrop-blur-xl lg:flex">
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
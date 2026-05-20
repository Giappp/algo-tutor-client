"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { RoadmapNavigator } from "@/components/learn/roadmap-navigator";
import { LessonContentArea } from "@/components/learn/lesson-content-area";
import { AITutorPanel } from "@/components/lessons/ai-tutor-panel";
import type { RoadmapDetailResponse, LessonWithProgress, LessonType } from "@/lib/types/roadmap";
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
    children: React.ReactNode;
}

function buildLessonNav(
    topics: RoadmapDetailResponse["topics"],
    currentLessonSlug: string
): { prev: LessonWithProgress | null; next: LessonWithProgress | null } {
    const allLessons: LessonWithProgress[] = topics
        .filter((t) => !t.isLocked)
        .flatMap((t) => t.lessons);

    const currentIndex = allLessons.findIndex((l) => l.slug === currentLessonSlug);
    return {
        prev: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
        next: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null,
    };
}

function buildLessonContext(
    roadmap: RoadmapDetailResponse,
    lessonSlug: string,
    lessonType: LessonType
): LessonContext {
    const allLessons = roadmap.topics
        .filter((t) => !t.isLocked)
        .flatMap((t) => t.lessons);
    const current = allLessons.find((l) => l.slug === lessonSlug) ?? allLessons[0];
    return {
        roadmapSlug: roadmap.slug,
        roadmapName: roadmap.name,
        lessonSlug: current.slug,
        lessonTitle: current.title,
        lessonType: lessonType,
    };
}

function getCurrentLessonProgress(
    topics: RoadmapDetailResponse["topics"],
    lessonSlug: string
): string | null {
    for (const topic of topics) {
        const lesson = topic.lessons.find((l) => l.slug === lessonSlug);
        if (lesson) return lesson.progress;
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
    children,
}: LearningLayoutProps) {
    const [navigatorOpen, setNavigatorOpen] = useState(true);
    const [aiOpen, setAiOpen] = useState(false);
    const [mobileNavigatorOpen, setMobileNavigatorOpen] = useState(false);
    const router = useRouter();

    const handleLessonSelect = (selectedSlug: string, _type: LessonType) => {
        router.push(`/learn/${roadmapSlug}/${selectedSlug}`);
    };

    if (!roadmap) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const { prev, next } = buildLessonNav(roadmap.topics, lessonSlug);
    const lessonContext = buildLessonContext(roadmap, lessonSlug, lessonType);
    const currentProgress = roadmap
        ? getCurrentLessonProgress(roadmap.topics, lessonSlug)
        : null;
    const isCompleted = isCompletedProp ?? currentProgress === "COMPLETED";

    return (
        <div className="flex h-full overflow-hidden">
            {/* ─── Left: Collapsible Navigator ─── */}
            <div className="hidden md:flex shrink-0 relative">
                <div
                    className={cn(
                        "flex flex-col border-r border-border/50 bg-card h-full overflow-hidden transition-all duration-300 ease-in-out",
                        navigatorOpen ? "w-72" : "w-0"
                    )}
                >
                    {navigatorOpen && (
                        <>
                            {/* Navigator header */}
                            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/40 shrink-0 bg-muted/30">
                                <Link
                                    href={`/roadmaps/${roadmapSlug}`}
                                    className="flex items-center gap-2 min-w-0 flex-1 group"
                                >
                                    <ArrowLeftIcon className="size-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <span className="truncate text-base font-bold text-foreground group-hover:text-primary transition-colors">
                                        {roadmap.name}
                                    </span>
                                </Link>
                            </div>
                            <RoadmapNavigator
                                roadmap={roadmap}
                                currentLessonSlug={lessonSlug}
                                roadmapSlug={roadmapSlug}
                                onLessonSelect={handleLessonSelect}
                                panelVariant="desktop"
                            />
                        </>
                    )}
                </div>

                {/* Collapse/Expand toggle - vertically centered on the edge */}
                <button
                    onClick={() => setNavigatorOpen(!navigatorOpen)}
                    className="absolute top-1/2 -translate-y-1/2 -right-4 z-10 flex items-center justify-center size-8 rounded-full border border-border/60 bg-background shadow-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                    title={navigatorOpen ? "Collapse sidebar" : "Expand sidebar"}
                >
                    {navigatorOpen ? (
                        <ChevronsLeftIcon className="size-6" />
                    ) : (
                        <ChevronsRightIcon className="size-6" />
                    )}
                </button>
            </div>

            {/* ─── Center: Content Area ─── */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* Top bar */}
                <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50 bg-background shrink-0">
                    {/* Mobile: Contents button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMobileNavigatorOpen(true)}
                        className="md:hidden gap-1.5 h-8 text-xs"
                    >
                        <PanelLeftOpenIcon className="size-4" />
                        <span>Contents</span>
                    </Button>

                    {/* Breadcrumb (when navigator is collapsed) */}
                    {!navigatorOpen && (
                        <Link
                            href={`/roadmaps/${roadmapSlug}`}
                            className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <span className="truncate max-w-[200px]">{roadmap.name}</span>
                        </Link>
                    )}

                    <div className="flex-1" />

                    {/* AI Tutor toggle */}
                    <Button
                        variant={aiOpen ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setAiOpen(!aiOpen)}
                        className="gap-1.5 h-8 text-xs"
                    >
                        <MessageSquareIcon className="size-3.5" />
                        <span className="hidden sm:inline">AI Tutor</span>
                    </Button>
                </div>

                {/* Lesson content with action bar */}
                <LessonContentArea
                    lessonType={lessonType}
                    lessonSlug={lessonSlug}
                    roadmapSlug={roadmapSlug}
                    prev={prev}
                    next={next}
                    onMarkComplete={onMarkComplete}
                    isUpdating={isUpdating}
                    isCompleted={isCompleted}
                >
                    {children}
                </LessonContentArea>
            </div>

            {/* ─── Mobile Navigator Sheet ─── */}
            <Sheet open={mobileNavigatorOpen} onOpenChange={setMobileNavigatorOpen}>
                <SheetContent side="left" className="w-72 p-0 flex flex-col">
                    <div className="px-4 py-3.5 border-b border-border/40 bg-muted/30">
                        <h3 className="text-base font-bold text-foreground">{roadmap.name}</h3>
                        <p className="text-xs text-muted-foreground/80 mt-0.5">Course Contents</p>
                    </div>
                    <RoadmapNavigator
                        roadmap={roadmap}
                        currentLessonSlug={lessonSlug}
                        roadmapSlug={roadmapSlug}
                        onLessonSelect={(slug, type) => {
                            handleLessonSelect(slug, type);
                            setMobileNavigatorOpen(false);
                        }}
                        panelVariant="mobile"
                    />
                </SheetContent>
            </Sheet>

            {/* ─── AI Tutor Panel (desktop) ─── */}
            {aiOpen && (
                <div className="hidden lg:flex w-80 shrink-0 flex-col border-l border-border/50">
                    <AITutorPanel context={lessonContext} />
                </div>
            )}

            {/* ─── AI Tutor Panel (mobile sheet) ─── */}
            <Sheet open={aiOpen} onOpenChange={setAiOpen}>
                <SheetContent side="right" className="w-full p-0 flex flex-col">
                    <AITutorPanel context={lessonContext} />
                </SheetContent>
            </Sheet>
        </div>
    );
}

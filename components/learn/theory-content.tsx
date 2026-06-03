"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
    BookOpenIcon,
    CheckCircle2Icon,
    ClockIcon,
    LightbulbIcon,
    ListIcon,
    MessageSquareIcon,
    SparklesIcon,
    XIcon,
} from "lucide-react";

import type { TheoryLesson } from "@/lib/types/lesson";
import { LessonTypeIcon } from "@/components/roadmap/lesson-type-icon";
import { DifficultyBadge } from "@/components/roadmap/difficulty-badge";
import { MarkdownRenderer } from "@/components/learn/markdown-renderer";
import { useSectionVisibility } from "@/hooks/use-section-visibility";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface TheoryContentProps {
    lesson: TheoryLesson;
    onComplete: () => void;
    isCompleted: boolean;
}

interface HeadingItem {
    id: string;
    text: string;
    depth: 2 | 3;
}

function getPlainTextFromNode(node: ReactNode): string {
    if (node === null || node === undefined || typeof node === "boolean") {
        return "";
    }

    if (typeof node === "string" || typeof node === "number") {
        return String(node);
    }

    if (Array.isArray(node)) {
        return node.map(getPlainTextFromNode).join("");
    }

    return "";
}

function slugifyHeading(value: ReactNode): string {
    return getPlainTextFromNode(value)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

function extractHeadings(markdown: string): HeadingItem[] {
    return markdown
        .split("\n")
        .filter((line) => line.startsWith("## ") || line.startsWith("### "))
        .map((line) => {
            const depth = line.startsWith("### ") ? 3 : 2;
            const text = line.replace(/^#{2,3}\s+/, "").trim();

            return {
                id: slugifyHeading(text),
                text,
                depth,
            };
        });
}

function dispatchAITutorAsk(message: string) {
    window.dispatchEvent(new CustomEvent("ai-tutor-open"));
    window.dispatchEvent(
        new CustomEvent("ai-tutor-ask", {
            detail: {
                message,
                mode: "EXPLAIN",
            },
        })
    );
}

export function TheoryContent({
    lesson,
    onComplete,
    isCompleted,
}: TheoryContentProps) {
    const contentRef = useRef<HTMLDivElement>(null);

    const [autoCompleted, setAutoCompleted] = useState(false);
    const [dismissedBanner, setDismissedBanner] = useState(false);
    const [activeId, setActiveId] = useState("");

    const handleAutoComplete = useCallback(() => {
        if (autoCompleted || isCompleted) return;

        setAutoCompleted(true);
        onComplete();
    }, [autoCompleted, isCompleted, onComplete]);

    const { percentVisible } = useSectionVisibility(
        contentRef,
        "h1, h2, h3, h4, p, pre, table, blockquote, ul, ol, li",
        0.9,
        handleAutoComplete
    );

    const progressPercent = Math.round(percentVisible * 100);
    const completed = isCompleted || autoCompleted;

    const headings = useMemo(() => {
        if (!lesson.content) return [];
        return extractHeadings(lesson.content);
    }, [lesson.content]);

    useEffect(() => {
        if (!isCompleted) return;

        const timer = window.setTimeout(() => {
            setAutoCompleted(true);
        }, 0);

        return () => window.clearTimeout(timer);
    }, [isCompleted]);

    useEffect(() => {
        const container = contentRef.current;
        if (!container || headings.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntries = entries.filter((entry) => entry.isIntersecting);

                if (visibleEntries.length === 0) return;

                const closest = visibleEntries.reduce((prev, current) =>
                    Math.abs(current.boundingClientRect.top) <
                        Math.abs(prev.boundingClientRect.top)
                        ? current
                        : prev
                );

                if (closest.target.id) {
                    setActiveId(closest.target.id);
                }
            },
            {
                root: container,
                rootMargin: "-12% 0px -72% 0px",
                threshold: 0.1,
            }
        );

        const headingElements = container.querySelectorAll("h2[id], h3[id]");
        headingElements.forEach((element) => observer.observe(element));

        return () => {
            headingElements.forEach((element) => observer.unobserve(element));
            observer.disconnect();
        };
    }, [headings]);

    const scrollToHeading = useCallback((id: string) => {
        const element = document.getElementById(id);
        element?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }, []);

    return (
        <div className="flex h-full flex-col overflow-hidden bg-background">
            {!dismissedBanner && (
                <div
                    className={cn(
                        "shrink-0 border-b px-4 py-2 backdrop-blur-xl",
                        completed
                            ? "border-emerald-500/20 bg-emerald-500/[0.06]"
                            : "border-border/50 bg-background/85"
                    )}
                >
                <div className="mx-auto flex max-w-6xl items-center gap-3">
                        {completed ? (
                            <>
                                <CheckCircle2Icon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                    {isCompleted
                                        ? "Bài học đã hoàn thành"
                                        : "Đã tự động hoàn thành sau khi bạn đọc phần lớn nội dung"}
                                </span>
                            </>
                        ) : (
                            <>
                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                                    <motion.div
                                        className="h-full rounded-full bg-[var(--lesson-accent)]"
                                        initial={false}
                                        animate={{ width: `${progressPercent}%` }}
                                        transition={springs.gentle}
                                    />
                                </div>

                                <span className="w-14 text-right text-[11px] font-semibold text-muted-foreground">
                                    {progressPercent}% đọc
                                </span>
                            </>
                        )}

                        <button
                            type="button"
                            onClick={() => setDismissedBanner(true)}
                            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label="Ẩn thông báo tiến độ"
                        >
                            <XIcon className="size-3.5" />
                        </button>
                    </div>
                </div>
            )}

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-muted/[0.16]">
                <div className="mx-auto grid min-h-0 w-full max-w-6xl flex-1 grid-cols-1 gap-7 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_286px] lg:py-7">
                    <div
                        ref={contentRef}
                        className="min-h-0 overflow-y-auto scroll-smooth pr-0 scrollbar-thin lg:pr-4"
                    >
                        <header className="mb-7 overflow-hidden rounded-2xl border border-border/60 bg-card/75 p-5 shadow-sm sm:p-6">
                            <div className="mb-4 flex flex-wrap items-center gap-2.5">
                                <LessonTypeIcon type="THEORY" showLabel />
                                <DifficultyBadge difficulty="EASY" />

                                <div className="ml-0 flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground sm:ml-auto">
                                    <ClockIcon className="size-3.5" />
                                    <span>{lesson.estimatedMinutes} phút đọc</span>
                                </div>
                            </div>

                            <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                                {lesson.title}
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                                Đọc kỹ nội dung, theo dõi các mục bên phải và dùng AI Tutor khi cần tóm tắt, lấy ví dụ hoặc tự kiểm tra kiến thức.
                            </p>
                        </header>

                        <article className="max-w-none">
                            <MarkdownRenderer
                                content={lesson.content}
                                variant="theory"
                                getHeadingId={(children) => slugifyHeading(children)}
                            />
                        </article>

                        <section className="mt-10 rounded-2xl border border-[var(--lesson-accent-border)] bg-card/75 p-5 shadow-sm sm:p-6">
                            <div className="flex items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--lesson-accent)] text-primary-foreground shadow-sm">
                                    <SparklesIcon className="size-5" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h2 className="text-base font-bold text-foreground">
                                        Cần AI Tutor hỗ trợ bài học này?
                                    </h2>
                                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                        Dùng các thao tác nhanh bên dưới để tóm tắt, lấy ví dụ hoặc tự kiểm tra kiến thức.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-2.5">
                                <button
                                    type="button"
                                    onClick={() =>
                                        dispatchAITutorAsk(
                                            `Tôi đang đọc bài học "${lesson.title}". Hãy tóm tắt giúp tôi những kiến thức cốt lõi và quan trọng nhất dưới dạng các gạch đầu dòng ngắn gọn, dễ nhớ.`
                                        )
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--lesson-accent)] px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:opacity-95 active:scale-95"
                                >
                                    <SparklesIcon className="size-3.5" />
                                    Tóm tắt trọng tâm
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        dispatchAITutorAsk(
                                            `Hãy lấy các ví dụ thực tế trực quan hoặc hình ảnh ẩn dụ sinh động liên quan đến bài học "${lesson.title}" để tôi ghi nhớ tốt hơn.`
                                        )
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background px-3.5 py-2 text-xs font-bold text-foreground transition-all hover:bg-muted active:scale-95"
                                >
                                    <LightbulbIcon className="size-3.5 text-amber-500" />
                                    Cho ví dụ trực quan
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        dispatchAITutorAsk(
                                            `Hãy kiểm tra kiến thức của tôi về bài học "${lesson.title}" bằng 2-3 câu hỏi ngắn. Đưa đáp án gợi ý ở cuối.`
                                        )
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background px-3.5 py-2 text-xs font-bold text-foreground transition-all hover:bg-muted active:scale-95"
                                >
                                    <MessageSquareIcon className="size-3.5 text-primary" />
                                    Đố vui ôn tập
                                </button>
                            </div>
                        </section>

                        <div className="h-16" />
                    </div>

                    <aside className="hidden min-h-0 lg:flex lg:flex-col">
                        <div className="min-h-0 flex-1">
                            <div className="mb-4 rounded-2xl border border-border/60 bg-card/70 p-3 shadow-sm">
                                <div className="flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--lesson-accent-muted)] text-[var(--lesson-accent)]">
                                    <ListIcon className="size-4" />
                                </div>

                                <div>
                                    <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                                        Mục lục
                                    </h2>
                                    <p className="text-xs text-muted-foreground/80">
                                        Theo dõi nội dung bài học
                                    </p>
                                </div>
                                </div>
                            </div>

                            {headings.length > 0 ? (
                                <nav className="max-h-[calc(100vh-260px)] space-y-1 overflow-y-auto pr-2 scrollbar-thin">
                                    {headings.map((heading) => {
                                        const isActive = activeId === heading.id;

                                        return (
                                            <button
                                                key={heading.id}
                                                type="button"
                                                onClick={() => scrollToHeading(heading.id)}
                                                className={cn(
                                                    "relative block w-full rounded-lg py-2 text-left text-xs transition-all",
                                                    heading.depth === 3 ? "pl-6 pr-3" : "pl-3 pr-3",
                                                    isActive
                                                        ? "bg-[var(--lesson-accent-muted)] font-bold text-[var(--lesson-accent)]"
                                                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                                                )}
                                            >
                                                {isActive && (
                                                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[var(--lesson-accent)]" />
                                                )}

                                                <span className="line-clamp-2 leading-5">
                                                    {heading.text}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </nav>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                                    Không tìm thấy mục lục trong bài học.
                                </div>
                            )}
                        </div>

                        <div className="mt-6 shrink-0 rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm">
                            <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                                <BookOpenIcon className="size-3.5 text-primary" />
                                Thống kê đọc
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Thời lượng</span>
                                    <span className="font-semibold text-foreground">
                                        {lesson.estimatedMinutes} phút
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Tiến độ</span>
                                    <span className="font-semibold text-foreground">
                                        {completed ? "Hoàn thành" : `${progressPercent}%`}
                                    </span>
                                </div>

                                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                    <motion.div
                                        className={cn(
                                            "h-full rounded-full",
                                            completed
                                                ? "bg-emerald-500"
                                                : "bg-[var(--lesson-accent)]"
                                        )}
                                        initial={false}
                                        animate={{
                                            width: completed ? "100%" : `${progressPercent}%`,
                                        }}
                                        transition={springs.gentle}
                                    />
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div >
    );
}

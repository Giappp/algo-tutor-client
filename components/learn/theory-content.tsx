"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { motion } from "framer-motion";
import type { TheoryLesson } from "@/lib/types/lesson";
import { LessonTypeIcon } from "@/components/roadmap/lesson-type-icon";
import { DifficultyBadge } from "@/components/roadmap/difficulty-badge";
import { ClockIcon } from "lucide-react";
import { useSectionVisibility } from "@/hooks/use-section-visibility";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface TheoryContentProps {
    lesson: TheoryLesson;
    onComplete: () => void;
    isCompleted: boolean;
}

export function TheoryContent({ lesson, onComplete, isCompleted }: TheoryContentProps) {
    const contentRef = useRef<HTMLDivElement>(null);
    const [autoCompleted, setAutoCompleted] = useState(false);
    const [dismissedBanner, setDismissedBanner] = useState(false);

    const handleAutoComplete = useCallback(() => {
        if (!autoCompleted && !isCompleted) {
            setAutoCompleted(true);
            onComplete();
        }
    }, [autoCompleted, isCompleted, onComplete]);

    const { visibleSectionCount, totalSectionCount, percentVisible } =
        useSectionVisibility(contentRef, "h1, h2, h3, h4, p, pre, table, blockquote, ul, ol, li", 0.9, handleAutoComplete);

    const progressPercent = Math.round(percentVisible * 100);

    useEffect(() => {
        if (isCompleted) {
            setAutoCompleted(true);
        }
    }, [isCompleted]);

    return (
        <div className="flex flex-col h-full">
            {/* Reading progress — thin bar at top */}
            {!autoCompleted && !isCompleted && progressPercent > 0 && !dismissedBanner && (
                <div className="shrink-0 px-6 py-2 border-b border-border/40 bg-muted/20">
                    <div className="max-w-[680px] mx-auto flex items-center gap-3">
                        <div className={cn("h-1 flex-1 rounded-full bg-muted overflow-hidden")}>
                            <motion.div
                                className="h-full rounded-full bg-[var(--lesson-accent)]"
                                animate={{ width: `${progressPercent}%` }}
                                transition={springs.gentle}
                            />
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {progressPercent}%
                        </span>
                    </div>
                </div>
            )}

            {/* Completed banner */}
            {(autoCompleted || isCompleted) && !dismissedBanner && (
                <div className="shrink-0 px-6 py-2 border-b border-emerald-500/20 bg-emerald-500/5">
                    <div className="max-w-[680px] mx-auto flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <div className="size-1.5 rounded-full bg-emerald-500" />
                        <span className="text-xs font-medium">
                            {isCompleted ? "Lesson completed" : "Auto-completed — you read 90% of the content"}
                        </span>
                        <button
                            onClick={() => setDismissedBanner(true)}
                            className="ml-auto text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Scrollable content — Medium-like typography */}
            <div ref={contentRef} className="flex-1 overflow-y-auto">
                <div className="max-w-[680px] mx-auto px-6 py-10 sm:py-14">
                    {/* Lesson Header — Medium style */}
                    <header className="mb-10 space-y-5">
                        <div className="flex items-center gap-3 flex-wrap">
                            <LessonTypeIcon type={"THEORY"} showLabel={true} />
                            <DifficultyBadge difficulty={"EASY"} />
                        </div>

                        <h1 className="text-[2.5rem] sm:text-[2.75rem] font-bold text-foreground leading-[1.15] tracking-tight font-heading">
                            {lesson.title}
                        </h1>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-1">
                            <div className="flex items-center gap-1.5">
                                <ClockIcon className="size-4" />
                                <span>{lesson.estimatedMinutes} min read</span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-border" />
                    </header>

                    {/* Markdown Content — Clean, readable: larger font, sans body, generous line-height */}
                    <article className="
                        prose prose-lg dark:prose-invert max-w-none
                        prose-p:text-[1.125rem] prose-p:leading-[1.85] prose-p:text-foreground/90 prose-p:tracking-[-0.01em]
                        prose-headings:font-sans prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
                        prose-h1:text-[2.125rem] prose-h1:mt-12 prose-h1:mb-5
                        prose-h2:text-[1.625rem] prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-3 prose-h2:border-b prose-h2:border-border/60
                        prose-h3:text-[1.375rem] prose-h3:mt-8 prose-h3:mb-3
                        prose-strong:text-foreground prose-strong:font-bold
                        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                        prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[0.9rem] prose-code:font-mono prose-code:before:content-[''] prose-code:after:content-['']
                        prose-pre:bg-[#1e1e1e] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-pre:p-5 prose-pre:overflow-x-auto prose-pre:text-[0.9rem] prose-pre:leading-relaxed
                        prose-blockquote:border-l-[3px] prose-blockquote:border-foreground/20 prose-blockquote:pl-5 prose-blockquote:italic prose-blockquote:text-foreground/70 prose-blockquote:text-[1.125rem]
                        prose-ul:space-y-2.5 prose-ol:space-y-2.5
                        prose-li:text-[1.125rem] prose-li:leading-[1.8] prose-li:text-foreground/90
                        prose-table:text-[0.9rem] prose-table:border-collapse prose-table:rounded-lg prose-table:overflow-hidden
                        prose-th:border prose-th:border-border prose-th:bg-muted/60 prose-th:px-4 prose-th:py-2.5 prose-th:text-left prose-th:font-semibold prose-th:text-foreground
                        prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2.5
                        prose-hr:border-border prose-hr:my-10
                        prose-img:rounded-xl prose-img:shadow-lg
                    ">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                            {lesson.content}
                        </ReactMarkdown>
                    </article>

                    {/* Footer spacer */}
                    <div className="h-20" />
                </div>
            </div>
        </div>
    );
}

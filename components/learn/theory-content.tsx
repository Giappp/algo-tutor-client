"use client";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { motion } from "framer-motion";
import type { TheoryLesson } from "@/lib/types/lesson";
import { LessonTypeIcon } from "@/components/roadmap/lesson-type-icon";
import { DifficultyBadge } from "@/components/roadmap/difficulty-badge";
import { ClockIcon, ListIcon, BookOpenIcon, SparklesIcon, LightbulbIcon, MessageSquareIcon } from "lucide-react";
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
    const [activeId, setActiveId] = useState<string>("");

    const handleAutoComplete = useCallback(() => {
        if (!autoCompleted && !isCompleted) {
            setAutoCompleted(true);
            onComplete();
        }
    }, [autoCompleted, isCompleted, onComplete]);

    const { percentVisible } =
        useSectionVisibility(contentRef, "h1, h2, h3, h4, p, pre, table, blockquote, ul, ol, li", 0.9, handleAutoComplete);

    const progressPercent = Math.round(percentVisible * 100);

    useEffect(() => {
        if (isCompleted) {
            const timer = setTimeout(() => setAutoCompleted(true), 0);
            return () => clearTimeout(timer);
        }
    }, [isCompleted]);

    // Extract headings from markdown to generate Table of Contents
    const headings = useMemo(() => {
        if (!lesson.content) return [];
        return lesson.content
            .split("\n")
            .filter((line) => line.startsWith("## ") || line.startsWith("### "))
            .map((line) => {
                const isH2 = line.startsWith("## ");
                const text = line.replace(/^##\s+|^###\s+/, "").trim();
                const id = text
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, "")
                    .replace(/\s+/g, "-");
                return { text, id, depth: isH2 ? 2 : 3 };
            });
    }, [lesson.content]);

    // Dynamic active heading tracking via IntersectionObserver
    useEffect(() => {
        const currentRef = contentRef.current;
        if (!currentRef || headings.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntries = entries.filter((entry) => entry.isIntersecting);
                if (visibleEntries.length > 0) {
                    // Find the entry that's closest to the top of the viewport
                    const closest = visibleEntries.reduce((prev, curr) => {
                        return Math.abs(curr.boundingClientRect.top) < Math.abs(prev.boundingClientRect.top)
                            ? curr
                            : prev;
                    });
                    if (closest.target.id) {
                        setActiveId(closest.target.id);
                    }
                }
            },
            {
                root: currentRef,
                rootMargin: "-10% 0px -70% 0px",
                threshold: 0.1,
            }
        );

        const headingElements = currentRef.querySelectorAll("h2[id], h3[id]");
        headingElements.forEach((el) => observer.observe(el));

        return () => {
            headingElements.forEach((el) => observer.unobserve(el));
        };
    }, [headings]);

    const scrollToHeading = (id: string) => {
        const element = document.getElementById(id);
        if (element && contentRef.current) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-background">
            {/* Reading progress — thin bar at top */}
            {!autoCompleted && !isCompleted && progressPercent > 0 && !dismissedBanner && (
                <div className="shrink-0 px-6 py-2 border-b border-border/40 bg-muted/20">
                    <div className="max-w-[980px] mx-auto flex items-center gap-3">
                        <div className={cn("h-1 flex-1 rounded-full bg-muted overflow-hidden")}>
                            <motion.div
                                className="h-full rounded-full bg-[var(--lesson-accent)]"
                                animate={{ width: `${progressPercent}%` }}
                                transition={springs.gentle}
                            />
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {progressPercent}% read
                        </span>
                    </div>
                </div>
            )}

            {/* Completed banner */}
            {(autoCompleted || isCompleted) && !dismissedBanner && (
                <div className="shrink-0 px-6 py-2 border-b border-emerald-500/20 bg-emerald-500/5">
                    <div className="max-w-[980px] mx-auto flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
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

            {/* Main responsive grid layout */}
            <div className="flex-1 overflow-hidden">
                <div className="h-full lg:grid lg:grid-cols-[1fr_260px] lg:gap-8 max-w-[1040px] mx-auto px-6 py-6 sm:py-8">

                    {/* Left Column: Scrollable Reading Pane */}
                    <div
                        ref={contentRef}
                        className="h-full overflow-y-auto pr-0 lg:pr-6 scrollbar-thin scroll-smooth"
                        style={{ contentVisibility: "auto" }}
                    >
                        {/* Lesson Header */}
                        <header className="mb-8 space-y-4">
                            <div className="flex items-center gap-3 flex-wrap">
                                <LessonTypeIcon type={"THEORY"} showLabel={true} />
                                <DifficultyBadge difficulty={"EASY"} />
                            </div>

                            <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-[1.2] tracking-tight font-heading">
                                {lesson.title}
                            </h1>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-1">
                                <div className="flex items-center gap-1.5">
                                    <ClockIcon className="size-4" />
                                    <span>{lesson.estimatedMinutes} min read</span>
                                </div>
                            </div>

                            <div className="h-px bg-border/60" />
                        </header>

                        {/* Markdown Content */}
                        <article className="
                            prose prose-base dark:prose-invert max-w-none
                            prose-p:text-[1.05rem] prose-p:leading-[1.75] prose-p:text-foreground/90 prose-p:tracking-[-0.005em] prose-p:mb-5
                            prose-headings:font-heading prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
                            prose-h1:text-[1.85rem] prose-h1:mt-10 prose-h1:mb-4
                            prose-h2:text-[1.5rem] prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-2.5 prose-h2:border-b prose-h2:border-border/50
                            prose-h3:text-[1.25rem] prose-h3:mt-7 prose-h3:mb-3
                            prose-strong:text-foreground prose-strong:font-bold
                            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                            prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[0.875rem] prose-code:font-mono prose-code:before:content-[''] prose-code:after:content-['']
                            prose-pre:bg-[#18181b] prose-pre:border prose-pre:border-zinc-800 prose-pre:rounded-xl prose-pre:p-4 prose-pre:overflow-x-auto prose-pre:text-[0.875rem] prose-pre:leading-relaxed
                            prose-blockquote:border-l-[3px] prose-blockquote:border-[var(--lesson-accent)]/40 prose-blockquote:pl-5 prose-blockquote:italic prose-blockquote:text-foreground/80 prose-blockquote:text-[1.05rem] prose-blockquote:my-6
                            prose-ul:space-y-2 prose-ol:space-y-2 prose-ul:mb-5 prose-ol:mb-5
                            prose-li:text-[1.05rem] prose-li:leading-[1.7] prose-li:text-foreground/90
                            prose-table:text-[0.875rem] prose-table:border-collapse prose-table:rounded-lg prose-table:overflow-hidden prose-table:my-6
                            prose-th:border prose-th:border-border prose-th:bg-muted/40 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-th:text-foreground
                            prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2
                            prose-hr:border-border/60 prose-hr:my-8
                            prose-img:rounded-xl prose-img:shadow-md
                        ">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                    h2: ({ children }) => {
                                        const text = Array.isArray(children) ? children.join("") : String(children || "");
                                        const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
                                        return <h2 id={id}>{children}</h2>;
                                    },
                                    h3: ({ children }) => {
                                        const text = Array.isArray(children) ? children.join("") : String(children || "");
                                        const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
                                        return <h3 id={id}>{children}</h3>;
                                    }
                                }}
                            >
                                {lesson.content}
                            </ReactMarkdown>
                        </article>

                        {/* AI Tutor Quick Explainer Card */}
                        <div className="mt-10 p-5 rounded-2xl border border-primary/20 bg-linear-to-br from-primary/5 via-transparent to-purple-500/5 shadow-2xs space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="size-9 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-primary-foreground shadow-sm shrink-0">
                                    <SparklesIcon className="size-4.5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-foreground">Bạn cần AI giảng giải thêm về bài học?</h4>
                                    <p className="text-xs text-muted-foreground">AI Tutor đã sẵn sàng đồng hành cùng bạn học tập.</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                                <button
                                    onClick={() => {
                                        window.dispatchEvent(new CustomEvent("ai-tutor-open"));
                                        window.dispatchEvent(new CustomEvent("ai-tutor-ask", {
                                            detail: {
                                                message: `Tôi đang đọc bài học "${lesson.title}". Hãy tóm tắt giúp tôi những kiến thức cốt lõi và quan trọng nhất dưới dạng các gạch đầu dòng ngắn gọn, dễ nhớ!`,
                                                mode: "EXPLAIN"
                                            }
                                        }));
                                    }}
                                    className="text-xs font-bold px-3.5 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                                >
                                    <SparklesIcon className="size-3.5" />
                                    Tóm tắt kiến thức trọng tâm
                                </button>
                                <button
                                    onClick={() => {
                                        window.dispatchEvent(new CustomEvent("ai-tutor-open"));
                                        window.dispatchEvent(new CustomEvent("ai-tutor-ask", {
                                            detail: {
                                                message: `Hãy lấy cho tôi các ví dụ thực tế trực quan hoặc các hình ảnh ẩn dụ sinh động liên quan đến nội dung bài học "${lesson.title}" để tôi ghi nhớ tốt hơn!`,
                                                mode: "EXPLAIN"
                                            }
                                        }));
                                    }}
                                    className="text-xs font-bold px-3.5 py-2 rounded-xl bg-background hover:bg-muted text-foreground border border-border/60 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                                >
                                    <LightbulbIcon className="size-3.5 text-amber-500" />
                                    Cho ví dụ thực tế trực quan
                                </button>
                                <button
                                    onClick={() => {
                                        window.dispatchEvent(new CustomEvent("ai-tutor-open"));
                                        window.dispatchEvent(new CustomEvent("ai-tutor-ask", {
                                            detail: {
                                                message: `Hãy kiểm tra kiến thức của tôi về bài học "${lesson.title}" bằng cách đặt cho tôi 2-3 câu hỏi ngắn (kèm đáp án gợi ý ở phần sau) để tôi tự ôn luyện!`,
                                                mode: "EXPLAIN"
                                            }
                                        }));
                                    }}
                                    className="text-xs font-bold px-3.5 py-2 rounded-xl bg-background hover:bg-muted text-foreground border border-border/60 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                                >
                                    <MessageSquareIcon className="size-3.5 text-primary" />
                                    Đố vui ôn tập kiến thức
                                </button>
                            </div>
                        </div>

                        {/* Footer spacer */}
                        <div className="h-16" />
                    </div>

                    {/* Right Column: Sticky Table of Contents & Stats */}
                    <aside className="hidden lg:flex shrink-0 h-full flex-col sticky top-0 py-1 border-l border-border/40 pl-6 space-y-6">

                        {/* Section: Table of Contents */}
                        <div className="flex-1 flex flex-col min-h-0">
                            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-4">
                                <ListIcon className="size-3 text-primary" />
                                Table of Contents
                            </h3>

                            {headings.length > 0 ? (
                                <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 scrollbar-thin max-h-[70vh]">
                                    {headings.map((heading) => {
                                        const isActive = activeId === heading.id;
                                        return (
                                            <button
                                                key={heading.id}
                                                onClick={() => scrollToHeading(heading.id)}
                                                className={cn(
                                                    "w-full text-left py-1 text-xs transition-all relative rounded-md pl-3 block",
                                                    heading.depth === 3 ? "text-muted-foreground/80 hover:text-foreground font-normal pl-6" : "font-medium",
                                                    isActive
                                                        ? "text-[var(--lesson-accent)] font-semibold bg-[var(--lesson-accent)]/5"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                                                )}
                                            >
                                                {isActive && (
                                                    <span
                                                        className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-[var(--lesson-accent)]"
                                                        style={{ content: "''" }}
                                                    />
                                                )}
                                                <span className="truncate block">{heading.text}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground italic">No sections found</p>
                            )}
                        </div>

                        {/* Section: Quick Stats */}
                        <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-3 shrink-0">
                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <BookOpenIcon className="size-3 text-primary" />
                                Reading Stats
                            </h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground">Estimate:</span>
                                    <span className="font-semibold text-foreground">{lesson.estimatedMinutes} mins</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground">Difficulty:</span>
                                    <span className="font-semibold text-foreground uppercase text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Easy</span>
                                </div>
                                {progressPercent > 0 && (
                                    <div className="space-y-1 pt-1.5 border-t border-border/30">
                                        <div className="flex justify-between text-[10px] text-muted-foreground">
                                            <span>Progress</span>
                                            <span>{progressPercent}%</span>
                                        </div>
                                        <div className="h-1 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className="h-full bg-[var(--lesson-accent)]"
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>

                </div>
            </div>
        </div>
    );
}

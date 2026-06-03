"use client";

import type { CodingProblem } from "@/lib/types/lesson";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkdownRenderer } from "@/components/learn/markdown-renderer";
import {
    CheckCircle2Icon,
    ClockIcon,
    CpuIcon,
    LightbulbIcon,
    SparklesIcon,
    WandSparklesIcon,
    BarChart3Icon,
    TerminalIcon,
} from "lucide-react";

interface ProblemDescriptionProps {
    problem: CodingProblem;
    isSolved: boolean;
    revealedHints: number;
    onRevealHint: () => void;
}

function dispatchAITutorAsk(message: string, mode: "HINT" | "COMPLEXITY") {
    window.dispatchEvent(new CustomEvent("ai-tutor-open"));
    window.dispatchEvent(
        new CustomEvent("ai-tutor-ask", {
            detail: {
                message,
                mode,
            },
        })
    );
}

function LimitBadge({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">
            <span className="text-primary">{icon}</span>
            <span>{label}</span>
            <span className="font-mono text-foreground">{value}</span>
        </div>
    );
}

function CodeBlock({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="min-w-0 overflow-hidden rounded-xl border border-border/60 bg-muted/30">
            <div className="flex items-center justify-between border-b border-border/50 bg-muted/50 px-3 py-2">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    <TerminalIcon className="size-3.5 text-primary" />
                    {label}
                </div>
            </div>

            <pre className="max-h-[260px] overflow-auto whitespace-pre-wrap break-words bg-background/70 p-3 font-mono text-sm leading-6 text-foreground">
                {value}
            </pre>
        </div>
    );
}

export function ProblemDescription({
    problem,
    isSolved,
    revealedHints,
    onRevealHint,
}: ProblemDescriptionProps) {
    const visibleTestCases = problem.testCases.filter((tc) => !tc.isHidden);
    const hasHints = problem.hints.length > 0;
    const hasVisibleHints = revealedHints > 0;

    return (
        <ScrollArea className="h-full">
            <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-5 sm:px-6">
                <section className="rounded-2xl border border-border/60 bg-card/75 p-5 shadow-sm">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                    <Badge
                                        variant="secondary"
                                        className="rounded-md px-2.5 py-1 text-[11px] font-bold"
                                    >
                                        Bài lập trình
                                    </Badge>

                                    {isSolved && (
                                        <Badge className="rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400">
                                            <CheckCircle2Icon className="mr-1 size-3.5" />
                                            Đã giải
                                        </Badge>
                                    )}
                                </div>

                                <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
                                    {problem.title}
                                </h1>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <LimitBadge
                                icon={<ClockIcon className="size-3.5" />}
                                label="Time"
                                value={`${problem.timeLimit}ms`}
                            />
                            <LimitBadge
                                icon={<CpuIcon className="size-3.5" />}
                                label="Memory"
                                value={`${problem.memoryLimit}MB`}
                            />
                        </div>
                    </div>
                </section>

                <section className="max-w-none">
                    <MarkdownRenderer
                        content={problem.description}
                        variant="problem"
                    />
                </section>

                {visibleTestCases.length > 0 && (
                    <section className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-base font-bold text-foreground">
                                    Examples
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Một vài test mẫu để nắm rõ định dạng input/output.
                                </p>
                            </div>

                            <Badge
                                variant="outline"
                                    className="rounded-md text-xs"
                            >
                                {visibleTestCases.length} sample
                            </Badge>
                        </div>

                        <div className="space-y-4">
                            {visibleTestCases.map((testCase, index) => (
                                <article
                                    key={index}
                                    className="overflow-hidden rounded-2xl border border-border/60 bg-card/75 shadow-sm"
                                >
                                    <div className="border-b border-border/50 bg-muted/40 px-4 py-3">
                                        <h3 className="text-sm font-bold text-foreground">
                                            Example {index + 1}
                                        </h3>
                                    </div>

                                    <div className="grid gap-3 p-3 sm:grid-cols-2">
                                        <CodeBlock label="Input" value={testCase.input} />
                                        <CodeBlock
                                            label="Output"
                                            value={testCase.expectedOutput}
                                        />
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {hasHints && (
                    <section className="flex flex-col gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
                                    <LightbulbIcon className="size-4 text-amber-500" />
                                    Gợi ý
                                </h2>
                                <p className="mt-0.5 text-sm text-muted-foreground">
                                    Đã mở {revealedHints}/{problem.hints.length}
                                </p>
                            </div>

                            {revealedHints < problem.hints.length && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onRevealHint}
                                    className="h-8 rounded-full border-amber-500/30 bg-background/80 px-3 text-xs font-bold text-amber-600 hover:bg-amber-500/10 hover:text-amber-700 dark:text-amber-400"
                                >
                                    Mở gợi ý
                                </Button>
                            )}
                        </div>

                        {hasVisibleHints ? (
                            <div className="space-y-2">
                                {problem.hints
                                    .slice(0, revealedHints)
                                    .map((hint, index) => (
                                        <div
                                            key={index}
                                            className="rounded-2xl border border-amber-500/20 bg-background/70 p-3"
                                        >
                                            <p className="text-sm leading-7 text-foreground/85">
                                                <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-amber-500/15 text-xs font-bold text-amber-600 dark:text-amber-400">
                                                    {index + 1}
                                                </span>
                                                {hint}
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-amber-500/25 bg-background/50 p-4 text-sm text-muted-foreground">
                                Chưa mở gợi ý nào. Hãy thử tự phân tích trước, sau đó mở hint nếu cần.
                            </div>
                        )}
                    </section>
                )}

                <section className="overflow-hidden rounded-2xl border border-[var(--lesson-accent-border)] bg-card/75 shadow-sm">
                    <div className="p-5">
                        <div className="flex gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--lesson-accent)] text-primary-foreground shadow-sm">
                                <SparklesIcon className="size-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <h2 className="text-base font-bold text-foreground">
                                    Bạn bị bí ý tưởng thuật toán?
                                </h2>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    AI Tutor có thể gợi mở hướng tiếp cận, phân tích cấu trúc dữ liệu phù hợp và đánh giá độ phức tạp.
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    dispatchAITutorAsk(
                                        `Tôi đang suy nghĩ hướng giải cho bài tập "${problem.title}". Hãy phân tích yêu cầu đề bài và cho tôi một số gợi ý nhỏ về cấu trúc dữ liệu hoặc giải thuật tối ưu nên dùng. Không đưa lời giải hoàn chỉnh ngay.`,
                                        "HINT"
                                    )
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--lesson-accent)] px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:opacity-95 active:scale-95"
                            >
                                <WandSparklesIcon className="size-3.5" />
                                Xin gợi ý hướng giải
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    dispatchAITutorAsk(
                                        `Độ phức tạp thời gian và không gian tốt nhất cho bài toán "${problem.title}" là bao nhiêu? Hãy giải thích cách đạt được độ phức tạp đó mà không đưa full code.`,
                                        "COMPLEXITY"
                                    )
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background px-3.5 py-2 text-xs font-bold text-foreground transition-all hover:bg-muted active:scale-95"
                            >
                                <BarChart3Icon className="size-3.5 text-primary" />
                                Phân tích độ phức tạp
                            </button>
                        </div>
                    </div>
                </section>

                <div className="h-4" />
            </div>
        </ScrollArea>
    );
}

"use client";

import type { TestResult, Submission } from "@/lib/types/lesson";
import { VerdictBanner } from "./verdict-banner";
import { TestCaseResult } from "./test-case-result";
import { CompilationError } from "./compilation-error";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TerminalIcon, SparklesIcon } from "lucide-react";

export interface JudgeResult {
    verdict: Submission["status"];
    results: TestResult[];
    totalTimeMs: number;
    maxMemoryKb: number;
    compilationError: string | null;
    passed: number;
    total: number;
}

interface JudgeResultsPanelProps {
    result: JudgeResult | null;
    className?: string;
}

export function JudgeResultsPanel({ result, className }: JudgeResultsPanelProps) {
    if (!result) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                <TerminalIcon className="size-8 mb-2 opacity-30" />
                <p className="text-xs">Run your code to see results</p>
            </div>
        );
    }

    const isInProgress =
        result.verdict === "PENDING" || result.verdict === "PROCESSING";

    return (
        <ScrollArea className={className}>
            <div className="p-4 space-y-3">
                {/* Verdict banner */}
                <VerdictBanner
                    verdict={result.verdict}
                    passed={result.passed}
                    total={result.total}
                    totalTimeMs={result.totalTimeMs}
                    maxMemoryKb={result.maxMemoryKb}
                />

                {/* AI Assistant Quick Tutor Help */}
                {result.verdict !== "ACCEPTED" && !isInProgress && (
                    <div className="p-3 rounded-xl border border-primary/20 bg-linear-to-r from-primary/5 via-indigo-500/5 to-purple-500/5 flex items-center justify-between gap-3 text-xs shadow-2xs animate-in fade-in duration-300">
                        <div className="flex gap-2.5 min-w-0">
                            <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-primary-foreground shrink-0 shadow-xs animate-pulse">
                                <SparklesIcon className="size-4" />
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="font-bold text-foreground truncate">Bạn đang gặp lỗi ở bài tập này?</span>
                                <span className="text-[10px] text-muted-foreground/90 line-clamp-1">AI Tutor có thể phân tích code và hướng dẫn cách sửa lỗi cho bạn.</span>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                window.dispatchEvent(new CustomEvent("ai-tutor-open"));
                                window.dispatchEvent(new CustomEvent("ai-tutor-ask", {
                                    detail: {
                                        message: `Mã nguồn hiện tại của tôi đang gặp lỗi [${result.verdict}]. Hãy phân tích lỗi biên dịch hoặc lỗi kiểm thử và hướng dẫn tôi các bước sửa lỗi chi tiết, gợi mở tư duy để tôi tự code lại nhé!`,
                                        mode: "DEBUG"
                                    }
                                }));
                            }}
                            className="shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95 whitespace-nowrap"
                        >
                            Phân tích lỗi với AI
                        </button>
                    </div>
                )}

                {/* Compilation error */}
                {result.compilationError && (
                    <CompilationError error={result.compilationError} />
                )}

                {/* Test case results */}
                {result.results.length > 0 && (
                    <div className="space-y-2">
                        {result.results.map((tc, i) => (
                            <TestCaseResult key={i} result={tc} index={i} />
                        ))}
                    </div>
                )}
            </div>
        </ScrollArea>
    );
}

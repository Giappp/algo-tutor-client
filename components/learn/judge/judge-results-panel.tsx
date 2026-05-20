"use client";

import type { TestResult, Submission } from "@/lib/types/lesson";
import { VerdictBanner } from "./verdict-banner";
import { TestCaseResult } from "./test-case-result";
import { CompilationError } from "./compilation-error";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TerminalIcon } from "lucide-react";

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

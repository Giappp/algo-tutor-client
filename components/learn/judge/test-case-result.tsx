"use client";

import { cn } from "@/lib/utils";
import type { TestResult } from "@/lib/types/lesson";
import {
    CheckCircleIcon,
    XCircleIcon,
    AlertTriangleIcon,
    BugIcon,
    EyeOffIcon,
} from "lucide-react";

interface TestCaseResultProps {
    result: TestResult;
    index: number;
}

function getStatusInfo(result: TestResult) {
    if (result.passed) {
        return {
            icon: CheckCircleIcon,
            label: "Accepted",
            color: "text-emerald-500",
            borderColor: "border-emerald-500/30",
            bgColor: "bg-emerald-500/5",
        };
    }
    if (result.error) {
        return {
            icon: BugIcon,
            label: "Runtime Error",
            color: "text-orange-500",
            borderColor: "border-orange-500/30",
            bgColor: "bg-orange-500/5",
        };
    }
    return {
        icon: XCircleIcon,
        label: "Wrong Answer",
        color: "text-rose-500",
        borderColor: "border-rose-500/30",
        bgColor: "bg-rose-500/5",
    };
}

export function TestCaseResult({ result, index }: TestCaseResultProps) {
    // Hidden test case with no visible data
    if (result.hidden && !result.stdin && !result.expected) {
        return (
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <EyeOffIcon className="size-3.5" />
                        <span className="font-medium">Test #{index + 1}</span>
                        <span className="text-muted-foreground/60">— Hidden</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {result.passed ? (
                            <CheckCircleIcon className="size-3.5 text-emerald-500" />
                        ) : (
                            <XCircleIcon className="size-3.5 text-rose-500" />
                        )}
                        {result.executionTime !== undefined && result.executionTime > 0 && (
                            <span className="text-[10px] text-muted-foreground font-mono">
                                {result.executionTime}ms
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const status = getStatusInfo(result);
    const Icon = status.icon;

    return (
        <div
            className={cn(
                "rounded-lg border p-3 space-y-2.5",
                status.borderColor,
                status.bgColor
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon className={cn("size-3.5", status.color)} />
                    <span className="text-xs font-semibold text-foreground">
                        Test #{index + 1}
                    </span>
                    <span className={cn("text-[10px] font-medium", status.color)}>
                        {status.label}
                    </span>
                </div>
                {result.executionTime !== undefined && result.executionTime > 0 && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                        {result.executionTime}ms
                    </span>
                )}
            </div>

            {/* Input / Expected / Actual grid */}
            <div className="grid grid-cols-1 gap-2">
                {/* Input */}
                {result.stdin && (
                    <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                            Input
                        </div>
                        <pre className="text-xs font-mono bg-background/80 border border-border/50 rounded p-2 overflow-x-auto whitespace-pre-wrap text-foreground/80">
                            {result.stdin}
                        </pre>
                    </div>
                )}

                {/* Expected vs Actual side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.expected && (
                        <div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                                Expected Output
                            </div>
                            <pre className="text-xs font-mono bg-background/80 border border-border/50 rounded p-2 overflow-x-auto whitespace-pre-wrap text-foreground/80">
                                {result.expected}
                            </pre>
                        </div>
                    )}
                    {!result.passed && (
                        <div>
                            <div className={cn(
                                "text-[10px] font-bold uppercase tracking-wider mb-1",
                                result.error ? "text-orange-500/80" : "text-rose-500/80"
                            )}>
                                {result.error ? "Error" : "Your Output"}
                            </div>
                            <pre className={cn(
                                "text-xs font-mono border rounded p-2 overflow-x-auto whitespace-pre-wrap",
                                result.error
                                    ? "bg-orange-500/5 border-orange-500/20 text-orange-600 dark:text-orange-400"
                                    : "bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400"
                            )}>
                                {result.error || result.actual || "(empty)"}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

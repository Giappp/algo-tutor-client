"use client";

import { cn } from "@/lib/utils";
import type { TestResult } from "@/lib/types/lesson";
import {
    CheckCircleIcon,
    XCircleIcon,
    BugIcon,
    AlertTriangleIcon,
} from "lucide-react";

interface TestCaseResultProps {
    result: TestResult;
    index: number;
}

function getStatusInfo(result: TestResult) {
    if (!result.status && result.passed) {
        return {
            icon: CheckCircleIcon,
            label: "Accepted",
            color: "text-emerald-500",
            borderColor: "border-emerald-500/30",
            bgColor: "bg-emerald-500/5",
        };
    }

    switch (result.status) {
    case "ACCEPTED":
        return {
            icon: CheckCircleIcon,
            label: "Accepted",
            color: "text-emerald-500",
            borderColor: "border-emerald-500/30",
            bgColor: "bg-emerald-500/5",
        };
    case "RUNTIME_ERROR":
    case "COMPILATION_ERROR":
    case "SYSTEM_ERROR":
        return {
            icon: BugIcon,
            label: result.status.replaceAll("_", " "),
            color: "text-orange-500",
            borderColor: "border-orange-500/30",
            bgColor: "bg-orange-500/5",
        };
    case "TIME_LIMIT_EXCEEDED":
    case "MEMORY_LIMIT_EXCEEDED":
        return {
            icon: AlertTriangleIcon,
            label: result.status.replaceAll("_", " "),
            color: "text-yellow-500",
            borderColor: "border-yellow-500/30",
            bgColor: "bg-yellow-500/5",
        };
    default:
        return {
            icon: XCircleIcon,
            label: "Wrong Answer",
            color: "text-rose-500",
            borderColor: "border-rose-500/30",
            bgColor: "bg-rose-500/5",
        };
    }
}

export function TestCaseResult({ result, index }: TestCaseResultProps) {
    const status = getStatusInfo(result);
    const Icon = status.icon;
    const stderr = result.stderr ?? result.error ?? "";
    const stdout = result.stdout ?? result.actual ?? "";

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
                <div className="flex gap-2 text-[10px] text-muted-foreground font-mono">
                    <span>{result.executionTime ?? 0}ms</span>
                    <span>{result.memoryKb ?? 0}KB</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
                {stderr && (
                    <div>
                        <div className="text-[10px] font-bold text-orange-500/80 uppercase tracking-wider mb-1">
                            Stderr
                        </div>
                        <pre className="text-xs font-mono bg-orange-500/5 border border-orange-500/20 rounded p-2 overflow-x-auto whitespace-pre-wrap text-orange-600 dark:text-orange-400">
                            {stderr}
                        </pre>
                    </div>
                )}

                {stdout && (
                    <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                            Stdout
                        </div>
                        <pre className="text-xs font-mono bg-background/80 border border-border/50 rounded p-2 overflow-x-auto whitespace-pre-wrap text-foreground/80">
                            {stdout}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}

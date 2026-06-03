"use client";

import { cn } from "@/lib/utils";
import type { Submission } from "@/lib/types/lesson";
import { VERDICT_CONFIG } from "./verdict-banner";

interface SubmissionRowProps {
    submission: Submission;
}

export function SubmissionRow({ submission }: SubmissionRowProps) {
    const config = VERDICT_CONFIG[submission.status];

    return (
        <div className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors">
            {/* Status badge */}
            <div
                className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold shrink-0",
                    config.color,
                    config.bgColor
                )}
            >
                {config.label}
            </div>

            {/* Language + pass count */}
            <div className="flex-1 text-xs text-muted-foreground min-w-0">
                <span className="font-mono">{submission.language}</span>
                <span className="mx-1.5">·</span>
                <span>
                    {submission.passedTestcases}/{submission.totalTestcases} passed
                </span>
            </div>

            {/* Performance */}
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono shrink-0">
                <span>{submission.executionTime}ms</span>
                <span>{submission.memoryUsed}MB</span>
            </div>
        </div>
    );
}

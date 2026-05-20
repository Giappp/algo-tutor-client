"use client";

import { cn } from "@/lib/utils";
import { ZapIcon } from "lucide-react";

interface CompilationErrorProps {
    error: string;
    className?: string;
}

export function CompilationError({ error, className }: CompilationErrorProps) {
    return (
        <div
            className={cn(
                "rounded-lg border border-orange-500/30 bg-orange-500/5 p-3 space-y-2",
                className
            )}
        >
            <div className="flex items-center gap-2">
                <ZapIcon className="size-4 text-orange-500" />
                <span className="text-xs font-bold text-orange-500">
                    Compilation Error
                </span>
            </div>
            <pre className="text-xs font-mono bg-background/80 border border-orange-500/20 rounded p-3 overflow-x-auto whitespace-pre-wrap text-orange-600 dark:text-orange-400 max-h-48 overflow-y-auto">
                {error}
            </pre>
        </div>
    );
}

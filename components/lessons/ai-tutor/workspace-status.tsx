"use client";

import { Badge } from "@/components/ui/badge";
import { SparklesIcon, TerminalIcon } from "lucide-react";

interface WorkspaceStatusProps {
    lessonType: string;
    workspace: {
        code: string;
        language: string;
        verdict?: string;
        errorMessage?: string;
        failedCount: number;
        totalCount: number;
    } | null;
    onDebugRequest: () => void;
}

export function WorkspaceStatus({
    lessonType,
    workspace,
    onDebugRequest,
}: WorkspaceStatusProps) {
    if (lessonType !== "CODING" || !workspace) return null;

    const hasCode = workspace.code.trim().length > 0;
    const hasVerdict = !!workspace.verdict;

    return (
        <div className="animate-in fade-in mx-4 mt-3 flex shrink-0 flex-col gap-2 rounded-lg border border-border/50 bg-card/70 p-3 shadow-xs backdrop-blur-xs duration-200">
            <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                    <TerminalIcon className="size-3.5 text-primary" aria-hidden="true" />
                    <span className="font-semibold">Workspace</span>
                    <Badge variant="outline" className="rounded-sm border-border/50 bg-background px-1 font-mono text-xs font-semibold text-foreground">
                        {workspace.language}
                    </Badge>
                </div>
                {hasCode ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                        <span className="size-1.5 rounded-full bg-primary" />
                        Đã liên kết code ({workspace.code.length} ký tự)
                    </span>
                ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                        <span className="size-1.5 rounded-full bg-muted-foreground/70" />
                        Chưa viết code
                    </span>
                )}
            </div>

            {hasVerdict && (
                <div className="mt-1 flex items-center justify-between border-t border-border/30 pt-2 text-xs">
                    <div className="flex items-center gap-1">
                        <span className="font-semibold text-muted-foreground">Kết quả:</span>
                        {workspace.verdict === "ACCEPTED" ? (
                            <Badge variant="secondary" className="rounded px-1 py-0 text-xs font-semibold">
                                Accepted
                            </Badge>
                        ) : (
                            <Badge variant="destructive" className="rounded px-1 py-0 text-xs font-semibold">
                                {workspace.verdict} ({workspace.failedCount}/{workspace.totalCount} lỗi)
                            </Badge>
                        )}
                    </div>

                    {workspace.verdict !== "ACCEPTED" && (
                        <button
                            onClick={onDebugRequest}
                            className="flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                            <SparklesIcon className="size-3" aria-hidden="true" />
                            Nhờ AI sửa lỗi
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

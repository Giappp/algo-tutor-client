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
        <div className="mx-4 mt-3 p-3 rounded-xl border border-border/40 bg-muted/15 backdrop-blur-xs flex flex-col gap-2 shrink-0 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                    <TerminalIcon className="size-3.5 text-primary" />
                    <span className="font-bold">Trình biên dịch:</span>
                    <Badge variant="outline" className="text-xs px-1 rounded-sm bg-background border-border/40 font-mono font-extrabold text-foreground">
                        {workspace.language}
                    </Badge>
                </div>
                {hasCode ? (
                    <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Đã liên kết code ({workspace.code.length} ký tự)
                    </span>
                ) : (
                    <span className="text-xs text-amber-500 font-bold flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Chưa viết code
                    </span>
                )}
            </div>

            {hasVerdict && (
                <div className="flex items-center justify-between border-t border-border/20 pt-2 text-xs mt-1">
                    <div className="flex items-center gap-1">
                        <span className="font-bold text-muted-foreground">Kết quả:</span>
                        {workspace.verdict === "ACCEPTED" ? (
                            <Badge className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-extrabold uppercase rounded px-1 py-0">
                                SUCCESS (AC)
                            </Badge>
                        ) : (
                            <Badge className="text-xs bg-destructive/10 text-destructive border-destructive/20 font-extrabold uppercase rounded px-1 py-0">
                                {workspace.verdict} ({workspace.failedCount}/{workspace.totalCount} lỗi)
                            </Badge>
                        )}
                    </div>

                    {workspace.verdict !== "ACCEPTED" && (
                        <button
                            onClick={onDebugRequest}
                            className="text-xs font-extrabold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 cursor-pointer underline underline-offset-2"
                        >
                            <SparklesIcon className="size-3 text-amber-500 animate-pulse" />
                            Nhờ AI sửa lỗi
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import type { CodingProblem } from "@/lib/types/lesson";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    CheckCircleIcon,
    ClockIcon,
    CpuIcon,
    LightbulbIcon,
} from "lucide-react";

interface ProblemDescriptionProps {
    problem: CodingProblem;
    isSolved: boolean;
    revealedHints: number;
    onRevealHint: () => void;
}

export function ProblemDescription({
    problem,
    isSolved,
    revealedHints,
    onRevealHint,
}: ProblemDescriptionProps) {
    const visibleTestCases = problem.testCases.filter((tc) => !tc.isHidden);

    return (
        <ScrollArea className="h-full">
            <div className="p-5 space-y-5">
                {/* Title + meta */}
                <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                        <h2 className="text-3xl font-bold text-foreground">
                            {problem.title}
                        </h2>
                        {isSolved && (
                            <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-base">
                                <CheckCircleIcon className="size-3 mr-1" />
                                Solved
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <ClockIcon className="size-3" />
                            {problem.timeLimit}ms
                        </span>
                        <span className="flex items-center gap-1">
                            <CpuIcon className="size-3" />
                            {problem.memoryLimit}MB
                        </span>
                    </div>
                </div>

                {/* Problem markdown */}
                <div>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                        {problem.description}
                    </ReactMarkdown>
                </div>

                {/* Sample Test Cases */}
                {visibleTestCases.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-border">
                        <h4 className="text-base font-bold text-foreground uppercase tracking-wider">
                            Examples
                        </h4>
                        {visibleTestCases.map((tc, i) => (
                            <div
                                key={i}
                                className="rounded-lg border border-border p-3 space-y-2"
                            >
                                <span className="text-sm font-semibold text-foreground">
                                    Example #{i + 1}
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div>
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                                            Input
                                        </div>
                                        <pre className="text-sm font-mono bg-background/80 border border-border/50 rounded p-2 overflow-x-auto whitespace-pre-wrap text-foreground/80">
                                            {tc.input}
                                        </pre>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                                            Output
                                        </div>
                                        <pre className="text-sm font-mono bg-background/80 border border-border/50 rounded p-2 overflow-x-auto whitespace-pre-wrap text-foreground/80">
                                            {tc.expectedOutput}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Hints */}
                {problem.hints.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-border">
                        <div className="flex items-center justify-between">
                            <h4 className="text-base font-bold text-foreground flex items-center gap-1.5">
                                <LightbulbIcon className="size-3.5 text-amber-500" />
                                Hints ({revealedHints}/{problem.hints.length})
                            </h4>
                            {revealedHints < problem.hints.length && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onRevealHint}
                                    className="h-6 px-2 text-sm text-amber-500 hover:bg-amber-500/10"
                                >
                                    Reveal
                                </Button>
                            )}
                        </div>
                        {problem.hints.slice(0, revealedHints).map((hint, idx) => (
                            <div
                                key={idx}
                                className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3"
                            >
                                <p className="text-base text-muted-foreground leading-relaxed">
                                    <span className="font-bold text-amber-500 mr-1.5">
                                        {idx + 1}.
                                    </span>
                                    {hint}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ScrollArea>
    );
}

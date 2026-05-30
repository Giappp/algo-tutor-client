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
    SparklesIcon,
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
                    <div className="flex items-center justify-start gap-2 flex-wrap">
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                            {problem.title}
                        </h2>
                        {isSolved && (
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs py-0.5 px-2">
                                <CheckCircleIcon className="size-3 mr-1" />
                                Solved
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center justify-start gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded font-medium">
                            <ClockIcon className="size-3 text-primary" />
                            {problem.timeLimit}ms
                        </span>
                        <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded font-medium">
                            <CpuIcon className="size-3 text-primary" />
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
                                <span className="text-base font-semibold text-foreground">
                                    Example #{i + 1}
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div>
                                        <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">
                                            Input
                                        </div>
                                        <pre className="text-sm font-mono bg-background/80 border border-border/50 rounded p-2 overflow-x-auto whitespace-pre-wrap text-foreground/80">
                                            {tc.input}
                                        </pre>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">
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

                {/* AI Assistant Help Card in Problem Description */}
                <div className="p-4 rounded-xl border border-primary/25 bg-linear-to-br from-primary/5 via-indigo-500/5 to-purple-500/5 space-y-3 shadow-2xs mt-6 animate-in fade-in duration-300">
                    <div className="flex gap-2.5">
                        <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-primary-foreground shrink-0 shadow-xs">
                            <SparklesIcon className="size-4" />
                        </div>
                        <div>
                            <h5 className="font-bold text-base text-foreground">Bạn bị bí ý tưởng thuật toán?</h5>
                            <p className="text-sm text-muted-foreground leading-normal">
                                Hãy nhờ AI Tutor gợi mở hướng tiếp cận, phân tích độ phức tạp tối ưu để rèn luyện tư duy tốt nhất.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => {
                                window.dispatchEvent(new CustomEvent("ai-tutor-open"));
                                window.dispatchEvent(new CustomEvent("ai-tutor-ask", {
                                    detail: {
                                        message: `Tôi đang suy nghĩ hướng giải cho bài tập "${problem.title}". Bạn có thể phân tích yêu cầu đề bài và cho tôi một số gợi ý nhỏ về cấu trúc dữ liệu hoặc giải thuật tối ưu nên dùng được không?`,
                                        mode: "HINT"
                                    }
                                }));
                            }}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95 whitespace-nowrap"
                        >
                            💡 Xin gợi ý hướng giải
                        </button>
                        <button
                            onClick={() => {
                                window.dispatchEvent(new CustomEvent("ai-tutor-open"));
                                window.dispatchEvent(new CustomEvent("ai-tutor-ask", {
                                    detail: {
                                        message: `Độ phức tạp thời gian và không gian tốt nhất (Best Time/Space Complexity) cho bài toán "${problem.title}" là bao nhiêu và làm thế nào để đạt được độ phức tạp đó?`,
                                        mode: "COMPLEXITY"
                                    }
                                }));
                            }}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-background hover:bg-muted text-foreground border border-border/60 transition-all flex items-center gap-1 cursor-pointer active:scale-95 whitespace-nowrap"
                        >
                            📈 Phân tích độ phức tạp tối ưu
                        </button>
                    </div>
                </div>
            </div>
        </ScrollArea>
    );
}

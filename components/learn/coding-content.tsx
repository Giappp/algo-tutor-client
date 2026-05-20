"use client";

import { useCallback, useRef, useState } from "react";
import type { CodingProblem, Submission } from "@/lib/types/lesson";
import { judgeApi } from "@/api/judge";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { JudgeResult } from "@/components/learn/judge";
import {
    CodeIcon,
    GripHorizontalIcon,
    GripVerticalIcon,
    HistoryIcon,
    TimerIcon,
} from "lucide-react";
import {
    ProblemDescription,
    SubmissionHistory,
    CodeEditorPanel,
    OutputPanel,
    useTimer,
} from "@/components/learn/coding";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CodingContentProps {
    problem: CodingProblem;
    onComplete: () => void;
    onMarkComplete?: () => Promise<void>;
    isCompleted: boolean;
}

type LeftTab = "description" | "submissions";

// ─── Main Component ───────────────────────────────────────────────────────────

export function CodingContent({
    problem,
    onComplete,
    onMarkComplete,
    isCompleted,
}: CodingContentProps) {
    // ─── State ────────────────────────────────────────────────────────────────
    const [language, setLanguage] = useState("python");
    const [code, setCode] = useState(problem.starterCode.python || "");
    const [leftTab, setLeftTab] = useState<LeftTab>("description");
    const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [revealedHints, setRevealedHints] = useState(0);
    const [hasCompleted, setHasCompleted] = useState(isCompleted);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [leftWidth, setLeftWidth] = useState(45);
    const [editorHeight, setEditorHeight] = useState(60);

    const timer = useTimer();
    const containerRef = useRef<HTMLDivElement>(null);
    const rightPanelRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const isVDragging = useRef(false);

    const codeByLang = useRef<Record<string, string>>({
        python: problem.starterCode.python || "",
        java: problem.starterCode.java || "",
        cpp: problem.starterCode.cpp || "",
    });

    const isSolved = hasCompleted || isCompleted;

    // ─── Handlers ─────────────────────────────────────────────────────────────

    const handleLanguageChange = (value: string) => {
        codeByLang.current[language] = code;
        setLanguage(value);
        setCode(codeByLang.current[value] || problem.starterCode[value] || "");
    };

    const handleCodeChange = (value: string | undefined) => {
        const v = value ?? "";
        setCode(v);
        codeByLang.current[language] = v;
    };

    const handleReset = () => {
        const starter = problem.starterCode[language] || "";
        setCode(starter);
        codeByLang.current[language] = starter;
    };

    // Horizontal resize (left ↔ right)
    const handleHDragStart = useCallback(() => {
        isDragging.current = true;
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";

        const onMove = (e: MouseEvent) => {
            if (!isDragging.current || !containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const pct = ((e.clientX - rect.left) / rect.width) * 100;
            setLeftWidth(Math.max(25, Math.min(65, pct)));
        };

        const onUp = () => {
            isDragging.current = false;
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
        };

        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    }, []);

    // Vertical resize (editor ↕ results)
    const handleVDragStart = useCallback(() => {
        isVDragging.current = true;
        document.body.style.cursor = "row-resize";
        document.body.style.userSelect = "none";

        const onMove = (e: MouseEvent) => {
            if (!isVDragging.current || !rightPanelRef.current) return;
            const rect = rightPanelRef.current.getBoundingClientRect();
            const pct = ((e.clientY - rect.top) / rect.height) * 100;
            setEditorHeight(Math.max(20, Math.min(80, pct)));
        };

        const onUp = () => {
            isVDragging.current = false;
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
        };

        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    }, []);

    const handleRun = useCallback(async () => {
        setIsRunning(true);
        try {
            const response = await judgeApi.run({
                lessonSlug: problem.slug,
                language,
                code,
            });
            setJudgeResult({
                verdict: response.verdict,
                results: response.results,
                totalTimeMs: response.performance.totalTimeMs,
                maxMemoryKb: response.performance.maxMemoryKb,
                compilationError: response.compilationError,
                passed: response.summary.passed,
                total: response.summary.total,
            });
        } catch {
            // Error handled by API interceptor
        } finally {
            setIsRunning(false);
        }
    }, [code, language, problem.slug]);

    const handleSubmit = useCallback(async () => {
        setIsSubmitting(true);
        try {
            const response = await judgeApi.submit({
                lessonSlug: problem.slug,
                language,
                code,
            });

            setJudgeResult({
                verdict: response.status,
                results: response.results,
                totalTimeMs: response.performance.totalTimeMs,
                maxMemoryKb: response.performance.maxMemoryKb,
                compilationError: response.compilationError,
                passed: response.summary.passed,
                total: response.summary.total,
            });

            const submission: Submission = {
                id: response.id,
                timestamp: new Date(),
                language,
                status: response.status,
                passedCount: response.summary.passed,
                totalCount: response.summary.total,
                executionTime: response.totalTime,
                memoryUsed: response.memoryUsed,
                code,
            };
            setSubmissions((prev) => [submission, ...prev]);

            if (response.status === "ACCEPTED" && !hasCompleted && !isCompleted) {
                setHasCompleted(true);
                onComplete();

                if (response.lessonProgressUpdated && onMarkComplete) {
                    onMarkComplete().catch(() => {});
                }
            }
        } catch {
            // Error handled by API interceptor
        } finally {
            setIsSubmitting(false);
        }
    }, [code, language, problem.slug, hasCompleted, isCompleted, onComplete, onMarkComplete]);

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div ref={containerRef} className="flex h-full overflow-hidden">
            {/* ═══ Left Panel ═══ */}
            <div className="flex flex-col h-full overflow-hidden" style={{ width: `${leftWidth}%` }}>
                <Tabs
                    value={leftTab}
                    onValueChange={(v) => setLeftTab(v as LeftTab)}
                    className="flex flex-col h-full"
                >
                    {/* Tab header */}
                    <div className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0 bg-background">
                        <TabsList className="h-8 bg-muted/50">
                            <TabsTrigger value="description" className="text-sm h-7 px-3">
                                <CodeIcon className="size-3 mr-1.5" />
                                Description
                            </TabsTrigger>
                            <TabsTrigger value="submissions" className="text-sm h-7 px-3">
                                <HistoryIcon className="size-3 mr-1.5" />
                                History
                                {submissions.length > 0 && (
                                    <Badge variant="secondary" className="ml-1 text-sm h-4 px-1">
                                        {submissions.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>
                        <button
                            onClick={timer.toggle}
                            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                            title={timer.isRunning ? "Pause" : "Resume"}
                        >
                            <TimerIcon className="size-3.5" />
                            <span className="font-mono tabular-nums">{timer.formatted}</span>
                        </button>
                    </div>

                    <TabsContent value="description" className="flex-1 overflow-hidden mt-0">
                        <ProblemDescription
                            problem={problem}
                            isSolved={isSolved}
                            revealedHints={revealedHints}
                            onRevealHint={() => setRevealedHints((n) => n + 1)}
                        />
                    </TabsContent>

                    <TabsContent value="submissions" className="flex-1 overflow-hidden mt-0">
                        <SubmissionHistory submissions={submissions} />
                    </TabsContent>
                </Tabs>
            </div>

            {/* ═══ Vertical Divider (draggable) ═══ */}
            <div
                onMouseDown={handleHDragStart}
                className="w-1.5 shrink-0 cursor-col-resize bg-border/50 hover:bg-primary/40 active:bg-primary/60 transition-colors flex items-center justify-center group"
            >
                <GripVerticalIcon className="size-3 text-muted-foreground/50 group-hover:text-primary/70" />
            </div>

            {/* ═══ Right Panel (editor top / results bottom) ═══ */}
            <div ref={rightPanelRef} className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-[#1e1e1e]">
                {/* Editor section */}
                <div className="flex flex-col overflow-hidden" style={{ height: `${editorHeight}%` }}>
                    <CodeEditorPanel
                        language={language}
                        code={code}
                        onLanguageChange={handleLanguageChange}
                        onCodeChange={handleCodeChange}
                        onReset={handleReset}
                    />
                </div>

                {/* Horizontal Divider (draggable) */}
                <div
                    onMouseDown={handleVDragStart}
                    className="h-1.5 shrink-0 cursor-row-resize bg-white/5 hover:bg-primary/40 active:bg-primary/60 transition-colors flex items-center justify-center group"
                >
                    <GripHorizontalIcon className="size-3 text-muted-foreground/50 group-hover:text-primary/70" />
                </div>

                {/* Output section */}
                <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                    <OutputPanel
                        judgeResult={judgeResult}
                        isSolved={isSolved}
                        isRunning={isRunning}
                        isSubmitting={isSubmitting}
                        onRun={handleRun}
                        onSubmit={handleSubmit}
                    />
                </div>
            </div>
        </div>
    );
}

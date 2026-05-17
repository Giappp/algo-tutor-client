"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { CodingProblem, TestCase, TestResult, Submission } from "@/lib/types/lesson";
import { judgeApi } from "@/api/judge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
    CheckCircleIcon,
    ClockIcon,
    CodeIcon,
    CpuIcon,
    GripVerticalIcon,
    HistoryIcon,
    LightbulbIcon,
    Loader2Icon,
    PlayIcon,
    RotateCcwIcon,
    SendIcon,
    TerminalIcon,
    TimerIcon,
    XCircleIcon,
    ZapIcon,
} from "lucide-react";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface CodingContentProps {
    problem: CodingProblem;
    onComplete: () => void;
    isCompleted: boolean;
}

const LANGUAGES = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python 3" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
];

const MONACO_LANGUAGES: Record<string, string> = {
    python: "python",
    javascript: "javascript",
    java: "java",
    cpp: "cpp",
};

type ProblemTab = "description" | "submissions";

// ─── Timer ────────────────────────────────────────────────────────────────────

function useTimer() {
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [isRunning]);

    const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
    return { formatted: fmt(seconds), toggle: () => setIsRunning((r) => !r), isRunning };
}

// ─── Codeforces-style Test Case ───────────────────────────────────────────────

function CFTestCase({
    testCase,
    result,
    index,
}: {
    testCase: TestCase;
    result?: TestResult;
    index: number;
}) {
    const hasResult = result !== undefined && result.actual !== "";
    const passed = result?.passed;

    if (testCase.isHidden && !hasResult) {
        return (
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <TerminalIcon className="size-3.5" />
                    <span className="font-medium">Test #{index + 1}</span>
                    <span className="text-muted-foreground/60">— Hidden</span>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "rounded-lg border p-3 space-y-2",
            hasResult
                ? passed
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-rose-500/30 bg-rose-500/5"
                : "border-border"
        )}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {hasResult && (
                        passed
                            ? <CheckCircleIcon className="size-3.5 text-emerald-500" />
                            : <XCircleIcon className="size-3.5 text-rose-500" />
                    )}
                    <span className="text-xs font-semibold text-foreground">Test #{index + 1}</span>
                </div>
                {result?.executionTime !== undefined && result.executionTime > 0 && (
                    <span className="text-[10px] text-muted-foreground">{result.executionTime}ms</span>
                )}
            </div>

            {/* stdin / stdout grid — Codeforces style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Input (stdin) */}
                <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        Input
                    </div>
                    <pre className="text-xs font-mono bg-background/80 border border-border/50 rounded p-2 overflow-x-auto whitespace-pre-wrap text-foreground/80">
{testCase.input.replace(/\|/g, "\n")}
                    </pre>
                </div>
                {/* Expected Output (stdout) */}
                <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        Output
                    </div>
                    <pre className="text-xs font-mono bg-background/80 border border-border/50 rounded p-2 overflow-x-auto whitespace-pre-wrap text-foreground/80">
{testCase.expectedOutput}
                    </pre>
                </div>
            </div>

            {/* Actual output (if run) */}
            {hasResult && !passed && (
                <div>
                    <div className="text-[10px] font-bold text-rose-500/80 uppercase tracking-wider mb-1">
                        Your Output
                    </div>
                    <pre className="text-xs font-mono bg-rose-500/5 border border-rose-500/20 rounded p-2 overflow-x-auto whitespace-pre-wrap text-rose-600 dark:text-rose-400">
{result?.error ? `Error: ${result.error}` : (result?.actual || "(empty)")}
                    </pre>
                </div>
            )}
        </div>
    );
}

// ─── Submission Row ───────────────────────────────────────────────────────────

function SubmissionRow({ submission }: { submission: Submission }) {
    const statusConfig: Record<string, { color: string; label: string }> = {
        ACCEPTED: { color: "text-emerald-500 bg-emerald-500/10", label: "Accepted" },
        WRONG_ANSWER: { color: "text-rose-500 bg-rose-500/10", label: "Wrong Answer" },
        RUNTIME_ERROR: { color: "text-amber-500 bg-amber-500/10", label: "Runtime Error" },
        TIME_LIMIT_EXCEEDED: { color: "text-orange-500 bg-orange-500/10", label: "TLE" },
        COMPILATION_ERROR: { color: "text-red-500 bg-red-500/10", label: "CE" },
    };
    const cfg = statusConfig[submission.status] ?? statusConfig.WRONG_ANSWER;

    return (
        <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <div className={cn("px-2 py-0.5 rounded text-[10px] font-bold", cfg.color)}>
                {cfg.label}
            </div>
            <div className="flex-1 text-xs text-muted-foreground">
                <span className="font-mono">{submission.language}</span>
                <span className="mx-1.5">·</span>
                <span>{submission.passedCount}/{submission.totalCount}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>{submission.executionTime}ms</span>
                <span>{submission.memoryUsed}MB</span>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CodingContent({ problem, onComplete, isCompleted }: CodingContentProps) {
    const [language, setLanguage] = useState("javascript");
    const [code, setCode] = useState(problem.starterCode.javascript || "// Write your code here\n");
    const [problemTab, setProblemTab] = useState<ProblemTab>("description");
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [revealedHints, setRevealedHints] = useState(0);
    const [hasCompleted, setHasCompleted] = useState(isCompleted);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [leftWidth, setLeftWidth] = useState(45); // percentage
    const timer = useTimer();
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const codeByLang = useRef<Record<string, string>>({
        javascript: problem.starterCode.javascript || "",
        python: problem.starterCode.python || "",
        java: problem.starterCode.java || "",
        cpp: problem.starterCode.cpp || "",
    });

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

    // Drag to resize
    const handleMouseDown = useCallback(() => {
        isDragging.current = true;
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging.current || !containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const pct = ((e.clientX - rect.left) / rect.width) * 100;
            setLeftWidth(Math.max(25, Math.min(65, pct)));
        };

        const handleMouseUp = () => {
            isDragging.current = false;
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    }, []);

    const handleRun = useCallback(async () => {
        setIsRunning(true);
        try {
            const response = await judgeApi.run({
                lessonSlug: problem.slug,
                language,
                code,
            });
            setTestResults(response.results);
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
            setTestResults(response.results);

            // Add to local submission history
            const submission: Submission = {
                id: response.id,
                timestamp: new Date(),
                language,
                status: response.status,
                passedCount: response.results.filter((r) => r.passed).length,
                totalCount: response.results.length,
                executionTime: response.totalTime,
                memoryUsed: response.memoryUsed,
                code,
            };
            setSubmissions((prev) => [submission, ...prev]);

            if (response.status === "ACCEPTED" && !hasCompleted && !isCompleted) {
                setHasCompleted(true);
                onComplete();
            }
        } catch {
            // Error handled by API interceptor
        } finally {
            setIsSubmitting(false);
        }
    }, [code, language, problem.slug, hasCompleted, isCompleted, onComplete]);

    const handleReset = () => {
        const starter = problem.starterCode[language] || "";
        setCode(starter);
        codeByLang.current[language] = starter;
    };

    const allPassed = testResults.length > 0 && testResults.every((r) => r.passed);
    const passedCount = testResults.filter((r) => r.passed).length;

    return (
        <div ref={containerRef} className="flex h-full overflow-hidden">
            {/* ═══ Left: Problem Description ═══ */}
            <div className="flex flex-col h-full overflow-hidden" style={{ width: `${leftWidth}%` }}>
                <Tabs value={problemTab} onValueChange={(v) => setProblemTab(v as ProblemTab)} className="flex flex-col h-full">
                    {/* Tab header */}
                    <div className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0 bg-background">
                        <TabsList className="h-8 bg-muted/50">
                            <TabsTrigger value="description" className="text-xs h-7 px-3">
                                <CodeIcon className="size-3 mr-1.5" />
                                Description
                            </TabsTrigger>
                            <TabsTrigger value="submissions" className="text-xs h-7 px-3">
                                <HistoryIcon className="size-3 mr-1.5" />
                                History
                                {submissions.length > 0 && (
                                    <Badge variant="secondary" className="ml-1 text-[9px] h-4 px-1">{submissions.length}</Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>
                        <button
                            onClick={timer.toggle}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                            title={timer.isRunning ? "Pause" : "Resume"}
                        >
                            <TimerIcon className="size-3.5" />
                            <span className="font-mono tabular-nums">{timer.formatted}</span>
                        </button>
                    </div>

                    {/* Description tab */}
                    <TabsContent value="description" className="flex-1 overflow-hidden mt-0">
                        <ScrollArea className="h-full">
                            <div className="p-5 space-y-5">
                                {/* Title + meta */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h2 className="text-lg font-bold text-foreground">{problem.title}</h2>
                                        {(hasCompleted || isCompleted) && (
                                            <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[10px]">
                                                <CheckCircleIcon className="size-3 mr-1" />Solved
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1"><ClockIcon className="size-3" />{problem.timeLimit}ms</span>
                                        <span className="flex items-center gap-1"><CpuIcon className="size-3" />{problem.memoryLimit}MB</span>
                                    </div>
                                </div>

                                {/* Problem markdown */}
                                <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none
                                    prose-headings:font-semibold
                                    prose-h2:text-sm prose-h2:mt-5 prose-h2:mb-2
                                    prose-h3:text-sm prose-h3:mt-4 prose-h3:mb-1.5
                                    prose-p:text-[13px] prose-p:leading-relaxed prose-p:text-muted-foreground
                                    prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-[''] prose-code:after:content-['']
                                    prose-pre:bg-[#1e1e1e] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-lg prose-pre:p-3 prose-pre:text-xs
                                    prose-li:text-[13px] prose-li:text-muted-foreground
                                    prose-strong:text-foreground
                                ">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {problem.description}
                                    </ReactMarkdown>
                                </div>

                                {/* ─── Test Cases (Codeforces style) ─── */}
                                <div className="space-y-3 pt-4 border-t border-border">
                                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                                        Examples
                                    </h4>
                                    {problem.testCases.map((tc, i) => (
                                        <CFTestCase
                                            key={i}
                                            testCase={tc}
                                            result={testResults.find((r) => r.stdin === tc.input)}
                                            index={i}
                                        />
                                    ))}
                                </div>

                                {/* Hints */}
                                {problem.hints.length > 0 && (
                                    <div className="space-y-3 pt-4 border-t border-border">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                <LightbulbIcon className="size-3.5 text-amber-500" />
                                                Hints ({revealedHints}/{problem.hints.length})
                                            </h4>
                                            {revealedHints < problem.hints.length && (
                                                <Button variant="ghost" size="sm" onClick={() => setRevealedHints((n) => n + 1)}
                                                    className="h-6 px-2 text-[10px] text-amber-500 hover:bg-amber-500/10">
                                                    Reveal
                                                </Button>
                                            )}
                                        </div>
                                        {problem.hints.slice(0, revealedHints).map((hint, idx) => (
                                            <div key={idx} className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    <span className="font-bold text-amber-500 mr-1.5">{idx + 1}.</span>
                                                    {hint}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    {/* Submissions tab */}
                    <TabsContent value="submissions" className="flex-1 overflow-hidden mt-0">
                        <ScrollArea className="h-full">
                            <div className="p-4 space-y-2">
                                {submissions.length === 0 ? (
                                    <div className="flex flex-col items-center py-16 text-muted-foreground">
                                        <HistoryIcon className="size-8 mb-2 opacity-30" />
                                        <p className="text-xs">No submissions yet</p>
                                    </div>
                                ) : submissions.map((sub) => <SubmissionRow key={sub.id} submission={sub} />)}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </div>

            {/* ═══ Divider (draggable) ═══ */}
            <div
                onMouseDown={handleMouseDown}
                className="w-1.5 shrink-0 cursor-col-resize bg-border/50 hover:bg-primary/40 active:bg-primary/60 transition-colors flex items-center justify-center group"
            >
                <GripVerticalIcon className="size-3 text-muted-foreground/50 group-hover:text-primary/70" />
            </div>

            {/* ═══ Right: Code Editor ═══ */}
            <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-[#1e1e1e]">
                {/* Language bar */}
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-[#252526] shrink-0">
                    <div className="flex items-center gap-1.5">
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.value}
                                onClick={() => handleLanguageChange(lang.value)}
                                className={cn(
                                    "px-2 py-1 rounded text-[11px] font-medium transition-all",
                                    language === lang.value
                                        ? "bg-primary/20 text-primary"
                                        : "text-white/50 hover:text-white/80 hover:bg-white/5"
                                )}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleReset}
                        className="h-7 px-2 text-[11px] text-white/50 hover:text-white hover:bg-white/10">
                        <RotateCcwIcon className="size-3 mr-1" />Reset
                    </Button>
                </div>

                {/* Editor */}
                <div className="flex-1 min-h-0">
                    <Editor
                        height="100%"
                        language={MONACO_LANGUAGES[language] ?? language}
                        value={code}
                        onChange={handleCodeChange}
                        theme="vs-dark"
                        options={{
                            minimap: { enabled: false },
                            fontSize: 13,
                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                            fontLigatures: true,
                            padding: { top: 12, bottom: 12 },
                            scrollBeyondLastLine: false,
                            lineNumbers: "on",
                            glyphMargin: false,
                            folding: true,
                            lineDecorationsWidth: 0,
                            lineNumbersMinChars: 3,
                            renderLineHighlight: "line",
                            scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
                            automaticLayout: true,
                            tabSize: language === "python" ? 4 : 2,
                            insertSpaces: true,
                            wordWrap: "on",
                            bracketPairColorization: { enabled: true },
                            guides: { bracketPairs: true },
                        }}
                    />
                </div>

                {/* Bottom bar: status + actions */}
                <div className="flex items-center justify-between px-3 py-2 border-t border-white/10 bg-[#252526] shrink-0">
                    <div className="flex items-center gap-2 text-[11px] text-white/50">
                        <span className="font-mono">{code.split("\n").length} lines</span>
                        {testResults.length > 0 && (
                            <>
                                <span className="text-white/20">·</span>
                                <span className={allPassed ? "text-emerald-400" : "text-rose-400"}>
                                    {passedCount}/{testResults.length} passed
                                </span>
                            </>
                        )}
                        {(hasCompleted || isCompleted) && (
                            <>
                                <span className="text-white/20">·</span>
                                <span className="text-emerald-400 flex items-center gap-1">
                                    <CheckCircleIcon className="size-3" />Solved
                                </span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRun}
                            disabled={isRunning || isSubmitting}
                            className="gap-1.5 h-7 text-[11px] border-white/20 text-white/80 hover:text-white hover:bg-white/10 bg-transparent"
                        >
                            {isRunning ? <Loader2Icon className="size-3 animate-spin" /> : <PlayIcon className="size-3" />}
                            Run
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSubmit}
                            disabled={isRunning || isSubmitting}
                            className="gap-1.5 h-7 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                            {isSubmitting ? <Loader2Icon className="size-3 animate-spin" /> : <SendIcon className="size-3" />}
                            Submit
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

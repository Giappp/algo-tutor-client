"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import {
    CheckCircle2Icon,
    CodeIcon,
    GripHorizontalIcon,
    GripVerticalIcon,
    HistoryIcon,
    TimerIcon,
} from "lucide-react";

import {
    isSubmissionInProgress,
    judgeApi,
    mapTestCase,
    type SubmissionDetail,
    type SubmissionEvent,
    type SubmissionSummary,
} from "@/api/judge";
import type { CodingProblem, Submission } from "@/lib/types/lesson";
import type { JudgeResult } from "@/components/learn/judge";
import { Badge } from "@/components/ui/badge";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    CodeEditorPanel,
    OutputPanel,
    ProblemDescription,
    SubmissionHistory,
    useTimer,
} from "@/components/learn/coding";
import { cn } from "@/lib/utils";

interface CodingContentProps {
    problem: CodingProblem;
    onComplete: () => void;
    onMarkComplete?: () => Promise<void>;
    isCompleted: boolean;
}

type LeftTab = "description" | "submissions";

const DEFAULT_LANGUAGE = "java";
const DEFAULT_WS_ENDPOINT = "http://localhost:8080/ws";

const MIN_LEFT_WIDTH = 28;
const MAX_LEFT_WIDTH = 62;
const MIN_EDITOR_HEIGHT = 28;
const MAX_EDITOR_HEIGHT = 78;

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function getWsEndpointUrl(): string {
    if (process.env.NEXT_PUBLIC_WS_URL) {
        return process.env.NEXT_PUBLIC_WS_URL;
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) {
        return DEFAULT_WS_ENDPOINT;
    }

    try {
        const url = new URL(apiBaseUrl);
        return `${url.protocol}//${url.host}/ws`;
    } catch {
        return DEFAULT_WS_ENDPOINT;
    }
}

function getStarterCode(problem: CodingProblem, language: string): string {
    return problem.starterCode[language] || "";
}

function createPendingJudgeResult(total: number): JudgeResult {
    return {
        verdict: "PENDING",
        results: [],
        totalTimeMs: 0,
        maxMemoryKb: 0,
        compilationError: null,
        passed: 0,
        total,
    };
}

function mapHistoryToSubmission(sub: SubmissionSummary): Submission {
    return {
        id: sub.id,
        timestamp: new Date(sub.submittedAt),
        language: sub.language,
        status: sub.status,
        passedTestcases: sub.passedTestCases,
        totalTestcases: sub.totalTestCases,
        executionTime: sub.executionTime,
        memoryUsed: sub.memoryUsed,
        code: "",
    };
}

function mapDetailToJudgeResult(detail: SubmissionDetail): JudgeResult {
    return {
        verdict: detail.status,
        results: detail.results,
        totalTimeMs: detail.executionTime,
        maxMemoryKb: detail.memoryUsed,
        compilationError: detail.compileOutput,
        passed: detail.passedTestCases,
        total: detail.totalTestCases,
    };
}

function mapDetailToSubmission(detail: SubmissionDetail): Submission {
    return {
        id: detail.id,
        timestamp: new Date(detail.submittedAt),
        language: detail.language,
        status: detail.status,
        passedTestcases: detail.passedTestCases,
        totalTestcases: detail.totalTestCases,
        executionTime: detail.executionTime,
        memoryUsed: detail.memoryUsed,
        code: detail.sourceCode,
    };
}

function getActiveSubmissionKey(lessonSlug: string): string {
    return `active-submission-${lessonSlug}`;
}

function upsertSubmission(
    submissions: Submission[],
    submission: Submission
): Submission[] {
    return [
        submission,
        ...submissions.filter((item) => item.id !== submission.id),
    ];
}

function createStompClient(): Client {
    const endpointUrl = getWsEndpointUrl();

    const client = new Client({
        webSocketFactory: () => new SockJS(endpointUrl),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: (message) => {
            if (process.env.NODE_ENV === "development") {
                console.log("[STOMP]", message);
            }
        },
    });

    client.onConnect = () => {
        console.log("[WebSocket] Connected.");
    };

    client.onStompError = (frame) => {
        console.error("[WebSocket] STOMP error:", frame.headers["message"]);
    };

    client.onWebSocketError = (event) => {
        console.error("[WebSocket] Connection error:", event);
    };

    client.onWebSocketClose = () => {
        console.log("[WebSocket] Closed.");
    };

    return client;
}

export function CodingContent({
    problem,
    onComplete,
    onMarkComplete,
    isCompleted,
}: CodingContentProps) {
    const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
    const [code, setCode] = useState(() =>
        getStarterCode(problem, DEFAULT_LANGUAGE)
    );
    const [leftTab, setLeftTab] = useState<LeftTab>("description");
    const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [revealedHints, setRevealedHints] = useState(0);
    const [hasCompleted, setHasCompleted] = useState(isCompleted);
    const [leftWidth, setLeftWidth] = useState(45);
    const [editorHeight, setEditorHeight] = useState(62);

    const timer = useTimer();

    const containerRef = useRef<HTMLDivElement>(null);
    const rightPanelRef = useRef<HTMLDivElement>(null);
    const isDraggingHorizontal = useRef(false);
    const isDraggingVertical = useRef(false);
    const stompClientRef = useRef<Client | null>(null);
    const activeSubmissionIdRef = useRef<string | null>(null);
    const activeSubmissionContextRef = useRef({ language, code });
    const currentProblemSlugRef = useRef(problem.slug);

    const codeByLang = useRef<Record<string, string>>({
        python: problem.starterCode.python || "",
        java: problem.starterCode.java || "",
        cpp: problem.starterCode.cpp || "",
    });

    const isSolved = hasCompleted || isCompleted;
    const submitCount = submissions.length;
    const latestSubmissionStatus = submissions[0]?.status;

    const revealHint = useCallback(() => {
        setRevealedHints((value) => Math.min(value + 1, problem.hints.length));
    }, [problem.hints.length]);

    const deactivateStompClient = useCallback(() => {
        const client = stompClientRef.current;

        if (client) {
            client.deactivate().catch(() => undefined);
            stompClientRef.current = null;
        }
    }, []);

    const markLessonCompleted = useCallback(
        async (shouldUpdateProgress = true) => {
            if (hasCompleted || isCompleted) return;

            setHasCompleted(true);
            onComplete();

            if (shouldUpdateProgress && onMarkComplete) {
                await onMarkComplete().catch(() => undefined);
            }
        },
        [hasCompleted, isCompleted, onComplete, onMarkComplete]
    );

    useEffect(() => {
        currentProblemSlugRef.current = problem.slug;

        queueMicrotask(() => {
            setLanguage(DEFAULT_LANGUAGE);
            setCode(getStarterCode(problem, DEFAULT_LANGUAGE));
            setJudgeResult(null);
            setRevealedHints(0);
            setSubmissions([]);
            setIsRunning(false);
            setIsSubmitting(false);

            codeByLang.current = {
                python: problem.starterCode.python || "",
                java: problem.starterCode.java || "",
                cpp: problem.starterCode.cpp || "",
            };

            activeSubmissionIdRef.current = null;
            deactivateStompClient();
        });
    }, [problem, deactivateStompClient]);

    useEffect(() => {
        queueMicrotask(() => {
            setHasCompleted(isCompleted);
        });
    }, [isCompleted, problem.slug]);

    useEffect(() => {
        let isMounted = true;

        async function fetchHistory() {
            try {
                const history = await judgeApi.getSubmissions(problem.slug);

                if (!isMounted) return;

                setSubmissions(history.map(mapHistoryToSubmission));
            } catch (error) {
                console.error("Failed to fetch submission history:", error);
            }
        }

        fetchHistory();

        return () => {
            isMounted = false;
        };
    }, [problem.slug]);

    useEffect(() => {
        sessionStorage.setItem(`active-code-${problem.slug}`, code);
        sessionStorage.setItem(`active-lang-${problem.slug}`, language);

        if (judgeResult) {
            sessionStorage.setItem(
                `active-judge-result-${problem.slug}`,
                JSON.stringify(judgeResult)
            );
        } else {
            sessionStorage.removeItem(`active-judge-result-${problem.slug}`);
        }
    }, [code, language, judgeResult, problem.slug]);

    useEffect(() => {
        return () => {
            deactivateStompClient();
        };
    }, [deactivateStompClient]);

    const handleLanguageChange = useCallback(
        (nextLanguage: string) => {
            codeByLang.current[language] = code;

            setLanguage(nextLanguage);
            setCode(
                codeByLang.current[nextLanguage] ||
                getStarterCode(problem, nextLanguage)
            );
        },
        [code, language, problem]
    );

    const handleCodeChange = useCallback(
        (value: string | undefined) => {
            const nextCode = value ?? "";

            setCode(nextCode);
            codeByLang.current[language] = nextCode;
        },
        [language]
    );

    const handleReset = useCallback(() => {
        const starter = getStarterCode(problem, language);

        setCode(starter);
        codeByLang.current[language] = starter;
    }, [language, problem]);

    const handleHDragStart = useCallback(() => {
        isDraggingHorizontal.current = true;
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";

        const handleMove = (event: MouseEvent) => {
            if (!isDraggingHorizontal.current || !containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const percent = ((event.clientX - rect.left) / rect.width) * 100;

            setLeftWidth(clamp(percent, MIN_LEFT_WIDTH, MAX_LEFT_WIDTH));
        };

        const handleUp = () => {
            isDraggingHorizontal.current = false;
            document.body.style.cursor = "";
            document.body.style.userSelect = "";

            document.removeEventListener("mousemove", handleMove);
            document.removeEventListener("mouseup", handleUp);
        };

        document.addEventListener("mousemove", handleMove);
        document.addEventListener("mouseup", handleUp);
    }, []);

    const handleVDragStart = useCallback(() => {
        isDraggingVertical.current = true;
        document.body.style.cursor = "row-resize";
        document.body.style.userSelect = "none";

        const handleMove = (event: MouseEvent) => {
            if (!isDraggingVertical.current || !rightPanelRef.current) return;

            const rect = rightPanelRef.current.getBoundingClientRect();
            const percent = ((event.clientY - rect.top) / rect.height) * 100;

            setEditorHeight(clamp(percent, MIN_EDITOR_HEIGHT, MAX_EDITOR_HEIGHT));
        };

        const handleUp = () => {
            isDraggingVertical.current = false;
            document.body.style.cursor = "";
            document.body.style.userSelect = "";

            document.removeEventListener("mousemove", handleMove);
            document.removeEventListener("mouseup", handleUp);
        };

        document.addEventListener("mousemove", handleMove);
        document.addEventListener("mouseup", handleUp);
    }, []);

    const handleRun = useCallback(async () => {
        if (isRunning) return;

        const lessonSlug = problem.slug;
        setIsRunning(true);

        try {
            const response = await judgeApi.run({
                lessonSlug,
                language,
                code,
            });

            if (currentProblemSlugRef.current !== lessonSlug) return;

            setJudgeResult({
                verdict: response.verdict,
                results: response.results,
                totalTimeMs: response.performance.maxTimeMs,
                maxMemoryKb: response.performance.maxMemoryKb,
                compilationError: response.compilationError,
                passed: response.summary.passed,
                total: response.summary.total,
            });
        } catch (error) {
            console.error("Failed to run code:", error);
        } finally {
            if (currentProblemSlugRef.current === lessonSlug) {
                setIsRunning(false);
            }
        }
    }, [code, isRunning, language, problem.slug]);

    const updateTestCaseResult = useCallback(
        (event: Extract<SubmissionEvent, { type: "TEST_CASE" }>) => {
            setJudgeResult((prev) => {
                const nextResult = mapTestCase({
                    index: event.sortOrder,
                    status: event.status,
                    timeMs: event.timeMs,
                    memoryKb: event.memoryKb,
                    stdout: event.stdout,
                    stderr: event.stderr,
                });
                const currentResults = (prev?.results ?? [])
                    .filter((item) => item.index !== event.sortOrder)
                    .concat(nextResult)
                    .toSorted((a, b) => (a.index ?? 0) - (b.index ?? 0));

                const passedCount = currentResults.filter((item) => item.passed).length;
                const maxTimeMs = Math.max(
                    0,
                    ...currentResults.map((item) => item.executionTime ?? 0)
                );
                const maxMemoryKb = Math.max(
                    0,
                    ...currentResults.map((item) => item.memoryKb ?? 0)
                );

                return {
                    verdict: "PROCESSING",
                    results: currentResults,
                    totalTimeMs: maxTimeMs,
                    maxMemoryKb,
                    compilationError: null,
                    passed: passedCount,
                    total: prev?.total ?? 0,
                };
            });
        },
        []
    );

    const handleFinalResult = useCallback(
        async (event: Extract<SubmissionEvent, { type: "FINAL_RESULT" }>) => {
            const lessonSlug = problem.slug;

            if (
                currentProblemSlugRef.current !== lessonSlug ||
                activeSubmissionIdRef.current !== event.submissionId
            ) {
                return;
            }

            setJudgeResult((prev) => {
                return {
                    verdict: event.status,
                    results: prev?.results ?? [],
                    totalTimeMs: event.maxTimeMs,
                    maxMemoryKb: event.maxMemoryKb,
                    compilationError: event.compilationError ?? null,
                    passed: event.passed,
                    total: event.total,
                };
            });

            let submission: Submission = {
                id: event.submissionId,
                timestamp: new Date(),
                language: activeSubmissionContextRef.current.language,
                status: event.status,
                passedTestcases: event.passed,
                totalTestcases: event.total,
                executionTime: event.maxTimeMs,
                memoryUsed: event.maxMemoryKb,
                code: activeSubmissionContextRef.current.code,
            };

            try {
                const detail = await judgeApi.getSubmission(event.submissionId);
                submission = mapDetailToSubmission(detail);
                setJudgeResult(mapDetailToJudgeResult(detail));
            } catch (error) {
                console.warn("Failed to fetch final submission details:", error);
            }

            if (
                currentProblemSlugRef.current !== lessonSlug ||
                activeSubmissionIdRef.current !== event.submissionId
            ) {
                return;
            }

            setSubmissions((prev) => upsertSubmission(prev, submission));

            if (event.status === "ACCEPTED") {
                await markLessonCompleted(false);
            }

            sessionStorage.removeItem(getActiveSubmissionKey(lessonSlug));
            activeSubmissionIdRef.current = null;
            deactivateStompClient();
            setIsSubmitting(false);
        },
        [
            problem.slug,
            markLessonCompleted,
            deactivateStompClient,
        ]
    );

    const recoverSubmission = useCallback(
        async (submissionId: string): Promise<boolean> => {
            const lessonSlug = problem.slug;
            const detail = await judgeApi.getSubmission(submissionId);

            if (currentProblemSlugRef.current !== lessonSlug) {
                return true;
            }

            setJudgeResult(mapDetailToJudgeResult(detail));

            if (isSubmissionInProgress(detail.status)) {
                activeSubmissionIdRef.current = submissionId;
                activeSubmissionContextRef.current = {
                    language: detail.language,
                    code: detail.sourceCode,
                };
                setIsSubmitting(true);
                return false;
            }

            sessionStorage.removeItem(getActiveSubmissionKey(lessonSlug));
            activeSubmissionIdRef.current = null;
            setSubmissions((prev) =>
                upsertSubmission(prev, mapDetailToSubmission(detail))
            );

            if (detail.status === "ACCEPTED") {
                await markLessonCompleted(false);
            }

            deactivateStompClient();
            setIsSubmitting(false);
            return true;
        },
        [deactivateStompClient, markLessonCompleted, problem.slug]
    );

    const subscribeToSubmission = useCallback(
        (submissionId: string) => {
            deactivateStompClient();
            activeSubmissionIdRef.current = submissionId;

            const client = createStompClient();

            client.onConnect = () => {
                console.log("[WebSocket] Connected.");

                client.subscribe(`/topic/submissions/${submissionId}`, (message) => {
                    if (!message.body) return;

                    try {
                        const payload = JSON.parse(message.body) as SubmissionEvent;

                        if (
                            payload.submissionId !== submissionId ||
                            activeSubmissionIdRef.current !== submissionId
                        ) {
                            return;
                        }

                        if (payload.type === "TEST_CASE") {
                            updateTestCaseResult(payload);
                            return;
                        }

                        if (payload.type === "FINAL_RESULT") {
                            handleFinalResult(payload).catch(
                                (error) => {
                                    console.error(
                                        "Failed to handle final result:",
                                        error
                                    );
                                    setIsSubmitting(false);
                                }
                            );
                        }
                    } catch (error) {
                        console.error("Failed to process WebSocket payload:", error);
                    }
                });
            };

            client.onStompError = (frame) => {
                console.error("[WebSocket] STOMP error:", frame.headers["message"]);
                if (activeSubmissionIdRef.current !== submissionId) return;

                recoverSubmission(submissionId).catch((error) => {
                    console.error("Failed to recover submission:", error);
                });
            };

            client.onWebSocketError = (event) => {
                console.error("[WebSocket] Error:", event);
                if (activeSubmissionIdRef.current !== submissionId) return;

                recoverSubmission(submissionId).catch((error) => {
                    console.error("Failed to recover submission:", error);
                });
            };

            stompClientRef.current = client;
            client.activate();
        },
        [
            deactivateStompClient,
            handleFinalResult,
            recoverSubmission,
            updateTestCaseResult,
        ]
    );

    useEffect(() => {
        const submissionId = sessionStorage.getItem(
            getActiveSubmissionKey(problem.slug)
        );
        if (!submissionId) return;

        let isMounted = true;

        queueMicrotask(() => {
            if (!isMounted) return;

            recoverSubmission(submissionId)
                .then((isCompleted) => {
                    if (!isMounted) return;

                    if (!isCompleted) {
                        subscribeToSubmission(submissionId);
                    }
                })
                .catch((error) => {
                    console.warn("Failed to recover active submission:", error);
                });
        });

        return () => {
            isMounted = false;
        };
    }, [problem.slug, recoverSubmission, subscribeToSubmission]);

    const handleSubmit = useCallback(async () => {
        if (isSubmitting) return;

        const lessonSlug = problem.slug;
        setIsSubmitting(true);
        setJudgeResult(createPendingJudgeResult(0));
        activeSubmissionContextRef.current = { language, code };

        try {
            const response = await judgeApi.submit({
                lessonSlug,
                language,
                code,
            });

            if (currentProblemSlugRef.current !== lessonSlug) return;

            if (!isSubmissionInProgress(response.status)) {
                const detail = await judgeApi.getSubmission(response.id);

                if (currentProblemSlugRef.current !== lessonSlug) return;

                setJudgeResult(mapDetailToJudgeResult(detail));
                setSubmissions((prev) =>
                    upsertSubmission(prev, mapDetailToSubmission(detail))
                );
                if (detail.status === "ACCEPTED") {
                    await markLessonCompleted(false);
                }
                setIsSubmitting(false);
                return;
            }

            sessionStorage.setItem(
                getActiveSubmissionKey(lessonSlug),
                response.id
            );
            subscribeToSubmission(response.id);
        } catch (error) {
            console.error("Failed to submit code:", error);
            if (currentProblemSlugRef.current === lessonSlug) {
                setIsSubmitting(false);
            }
        }
    }, [
        code,
        isSubmitting,
        language,
        markLessonCompleted,
        problem.slug,
        subscribeToSubmission,
    ]);

    const desktopLeftPanel = useMemo(
        () => (
            <section
                className="hidden h-full min-w-[320px] flex-col overflow-hidden border-r border-border/50 bg-card/55 lg:flex"
                style={{ width: `${leftWidth}%` }}
            >
                <Tabs
                    value={leftTab}
                    onValueChange={(value) => setLeftTab(value as LeftTab)}
                    className="flex h-full min-h-0 flex-col"
                >
                    <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border/50 bg-background/90 px-3 backdrop-blur-xl">
                        <TabsList className="h-8 rounded-xl bg-muted/70 p-1">
                            <TabsTrigger
                                value="description"
                                className="h-6 rounded-lg px-2.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                <CodeIcon className="mr-1.5 size-3.5" />
                                Đề bài
                            </TabsTrigger>

                            <TabsTrigger
                                value="submissions"
                                className="h-6 rounded-lg px-2.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                <HistoryIcon className="mr-1.5 size-3.5" />
                                Lịch sử

                                {submitCount > 0 && (
                                    <Badge
                                        variant="secondary"
                                        className="ml-1.5 h-4 rounded-full px-1.5 text-[10px]"
                                    >
                                        {submitCount}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <button
                            type="button"
                            onClick={timer.toggle}
                            className={cn(
                                "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-xl border border-border/60 px-2.5 text-xs font-semibold transition-colors",
                                timer.isRunning
                                    ? "bg-primary/10 text-primary"
                                    : "bg-muted/50 text-muted-foreground hover:text-foreground"
                            )}
                            title={timer.isRunning ? "Pause timer" : "Resume timer"}
                        >
                            <TimerIcon className="size-3.5" />
                            <span className="font-mono tabular-nums">
                                {timer.formatted}
                            </span>
                        </button>
                    </header>

                    {isSolved && (
                        <div className="shrink-0 border-b border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                <CheckCircle2Icon className="size-4" />
                                Bài tập đã hoàn thành
                            </div>
                        </div>
                    )}

                    {latestSubmissionStatus && !isSolved && (
                        <div className="shrink-0 border-b border-border/50 bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
                            Lần nộp gần nhất:{" "}
                            <span className="font-semibold text-foreground">
                                {latestSubmissionStatus}
                            </span>
                        </div>
                    )}

                    <TabsContent
                        value="description"
                        className="mt-0 min-h-0 flex-1 overflow-hidden"
                    >
                        <ProblemDescription
                            problem={problem}
                            isSolved={isSolved}
                            revealedHints={revealedHints}
                            onRevealHint={revealHint}
                        />
                    </TabsContent>

                    <TabsContent
                        value="submissions"
                        className="mt-0 min-h-0 flex-1 overflow-hidden"
                    >
                        <SubmissionHistory submissions={submissions} />
                    </TabsContent>
                </Tabs>
            </section>
        ),
        [
            isSolved,
            latestSubmissionStatus,
            leftTab,
            leftWidth,
            problem,
            revealHint,
            revealedHints,
            submissions,
            submitCount,
            timer.formatted,
            timer.isRunning,
            timer.toggle,
        ]
    );

    return (
        <div
            ref={containerRef}
            className="flex h-full min-h-0 overflow-hidden bg-background"
        >
            {desktopLeftPanel}

            <div
                role="separator"
                aria-orientation="vertical"
                onMouseDown={handleHDragStart}
                className="group hidden w-2 shrink-0 cursor-col-resize items-center justify-center bg-border/30 transition-colors hover:bg-primary/20 active:bg-primary/30 lg:flex"
            >
                <div className="flex h-10 w-1 items-center justify-center rounded-full bg-background/80 shadow-sm">
                    <GripVerticalIcon className="size-3 text-muted-foreground group-hover:text-primary" />
                </div>
            </div>

            <section
                ref={rightPanelRef}
                className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#1e1e1e]"
            >
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:hidden">
                    <Tabs
                        value={leftTab}
                        onValueChange={(value) => setLeftTab(value as LeftTab)}
                        className="flex min-h-0 flex-1 flex-col"
                    >
                        <header className="flex h-11 shrink-0 items-center gap-2 border-b border-white/10 bg-[#1e1e1e] px-2">
                            <TabsList className="h-8 flex-1 rounded-xl bg-white/5 p-1">
                                <TabsTrigger
                                    value="description"
                                    className="h-6 flex-1 rounded-lg text-xs text-zinc-300 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                                >
                                Đề bài
                                </TabsTrigger>

                                <TabsTrigger
                                    value="submissions"
                                    className="h-6 flex-1 rounded-lg text-xs text-zinc-300 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                                >
                                Lịch sử

                                    {submitCount > 0 && (
                                        <span className="ml-1 rounded-full bg-white/10 px-1.5 text-[10px]">
                                            {submitCount}
                                        </span>
                                    )}
                                </TabsTrigger>
                            </TabsList>
                        </header>

                        <TabsContent
                            value="description"
                            className="mt-0 min-h-0 flex-1 overflow-hidden bg-background"
                        >
                            <ProblemDescription
                                problem={problem}
                                isSolved={isSolved}
                                revealedHints={revealedHints}
                                onRevealHint={revealHint}
                            />
                        </TabsContent>

                        <TabsContent
                            value="submissions"
                            className="mt-0 min-h-0 flex-1 overflow-hidden bg-background"
                        >
                            <SubmissionHistory submissions={submissions} />
                        </TabsContent>
                    </Tabs>
                </div>

                <div
                    className="hidden min-h-0 flex-col overflow-hidden lg:flex"
                    style={{ height: `${editorHeight}%` }}
                >
                    <CodeEditorPanel
                        language={language}
                        code={code}
                        onLanguageChange={handleLanguageChange}
                        onCodeChange={handleCodeChange}
                        onReset={handleReset}
                    />
                </div>

                <div
                    role="separator"
                    aria-orientation="horizontal"
                    onMouseDown={handleVDragStart}
                    className="group hidden h-2 shrink-0 cursor-row-resize items-center justify-center bg-white/5 transition-colors hover:bg-primary/25 active:bg-primary/35 lg:flex"
                >
                    <div className="flex h-1 w-10 items-center justify-center rounded-full bg-white/10">
                        <GripHorizontalIcon className="size-3 text-zinc-500 group-hover:text-primary" />
                    </div>
                </div>

                <div className="hidden min-h-0 flex-1 flex-col overflow-hidden lg:flex">
                    <OutputPanel
                        judgeResult={judgeResult}
                        isSolved={isSolved}
                        isRunning={isRunning}
                        isSubmitting={isSubmitting}
                        onRun={handleRun}
                        onSubmit={handleSubmit}
                    />
                </div>

                <div className="min-h-0 flex-1 flex-col overflow-hidden lg:hidden">
                    <CodeEditorPanel
                        language={language}
                        code={code}
                        onLanguageChange={handleLanguageChange}
                        onCodeChange={handleCodeChange}
                        onReset={handleReset}
                    />

                    <div className="h-[38%] min-h-[180px] border-t border-white/10">
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
            </section>
        </div>
    );
}

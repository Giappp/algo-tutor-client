"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
    AlertCircleIcon,
    CheckCircle2Icon,
    Clock3Icon,
    LightbulbIcon,
    MessageSquareIcon,
    PlayCircleIcon,
    RefreshCwIcon,
    RotateCcwIcon,
    SparklesIcon,
} from "lucide-react";

import { useVideoLesson } from "@/hooks";
import { LessonTypeIcon } from "@/components/roadmap/lesson-type-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const HEARTBEAT_SECONDS = 12;
const MAX_DELTA_SECONDS = 30;
const REFRESH_URL_BEFORE_EXPIRY_MS = 60_000;

function formatDuration(totalSeconds: number | undefined): string {
    const seconds = Math.max(0, Math.floor(totalSeconds ?? 0));
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes < 60) {
        return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}:${String(remainingMinutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function formatProgressUpdatedAt(updatedAt: string | null | undefined): string {
    if (!updatedAt) return "Sẵn sàng ghi nhớ tiến độ";

    const date = new Date(updatedAt);
    if (Number.isNaN(date.getTime())) return "Đã ghi nhận tiến độ";

    return `Cập nhật lúc ${date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
    })}`;
}

function VideoLessonSkeleton() {
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 lg:py-7">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="aspect-video w-full rounded-2xl" />
            <Skeleton className="h-36 rounded-2xl" />
        </div>
    );
}

function dispatchAITutorAsk(message: string) {
    window.dispatchEvent(new CustomEvent("ai-tutor-open"));
    window.dispatchEvent(
        new CustomEvent("ai-tutor-ask", {
            detail: {
                message,
                mode: "EXPLAIN",
            },
        })
    );
}

export function VideoContent({
    lessonSlug,
    onComplete,
}: {
    lessonSlug: string;
    onComplete?: () => void;
}) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const pendingDeltaRef = useRef(0);
    const lastTickRef = useRef<number>(0);
    const hasSeekedRef = useRef(false);
    const hasCompletedRef = useRef(false);
    const flushInFlightRef = useRef(false);
    const currentTimeRef = useRef(0);

    const {
        content,
        progress,
        error,
        isLoading,
        refreshContent,
        refreshProgress,
        updateProgress,
        updateProgressKeepalive,
    } = useVideoLesson(lessonSlug);

    const duration = content?.durationSeconds ?? progress?.durationSeconds ?? 0;
    const resumeSeconds = progress?.positionSeconds ?? 0;
    const backendWatchedPercentage = Math.min(100, Math.max(0, progress?.watchedPercentage ?? 0));
    const recordedProgress = progress?.completed ? 100 : backendWatchedPercentage;
    const roundedRecordedProgress = Math.round(recordedProgress);
    const progressUpdatedLabel = formatProgressUpdatedAt(progress?.updatedAt);

    const statusLabel = useMemo(() => {
        if (progress?.completed) return "Đã hoàn thành";
        if (progress?.status === "IN_PROGRESS") return "Đang học";
        return "Chưa bắt đầu";
    }, [progress?.completed, progress?.status]);

    useEffect(() => {
        hasSeekedRef.current = false;
        hasCompletedRef.current = false;
        currentTimeRef.current = 0;
        pendingDeltaRef.current = 0;
        lastTickRef.current = performance.now();
    }, [lessonSlug]);

    useEffect(() => {
        hasSeekedRef.current = false;
    }, [content?.playbackUrl]);

    useEffect(() => {
        if (progress?.completed && !hasCompletedRef.current) {
            hasCompletedRef.current = true;
            onComplete?.();
        }
    }, [onComplete, progress?.completed]);

    const captureWatchTime = useCallback(() => {
        const video = videoRef.current;
        const now = performance.now();
        const elapsed = Math.floor((now - lastTickRef.current) / 1000);
        lastTickRef.current = now;

        if (!video || elapsed <= 0) return;

        currentTimeRef.current = video.currentTime;

        const activelyWatching =
            !video.paused &&
            !video.ended &&
            video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA &&
            document.visibilityState === "visible";

        if (activelyWatching) {
            pendingDeltaRef.current += elapsed;
        }
    }, []);

    const flushProgress = useCallback(
        async (deltaOverride?: number, options?: { keepalive?: boolean }) => {
            const video = videoRef.current;
            const keepalive = options?.keepalive === true;
            if (!video || !content) return;
            if (flushInFlightRef.current && !keepalive) return;

            captureWatchTime();

            const hasDeltaOverride = deltaOverride !== undefined;
            const rawDelta = hasDeltaOverride ? deltaOverride : pendingDeltaRef.current;
            const delta = Math.min(Math.max(0, Math.floor(rawDelta)), MAX_DELTA_SECONDS);
            const remainder = Math.max(0, rawDelta - delta);
            const positionSeconds = Math.floor(video.currentTime);

            if (!hasDeltaOverride) {
                pendingDeltaRef.current = remainder;
            }

            if (keepalive) {
                updateProgressKeepalive({
                    positionSeconds,
                    watchedDeltaSeconds: delta,
                });
                return;
            }

            flushInFlightRef.current = true;

            try {
                const updated = await updateProgress({
                    positionSeconds,
                    watchedDeltaSeconds: delta,
                });

                if (updated?.completed && !hasCompletedRef.current) {
                    hasCompletedRef.current = true;
                    onComplete?.();
                }
            } catch {
                if (!hasDeltaOverride) {
                    pendingDeltaRef.current += delta;
                }
            } finally {
                flushInFlightRef.current = false;
            }
        },
        [captureWatchTime, content, onComplete, updateProgress, updateProgressKeepalive]
    );

    useEffect(() => {
        const tickId = window.setInterval(() => {
            captureWatchTime();
        }, 1000);

        const heartbeatId = window.setInterval(() => {
            void flushProgress();
        }, HEARTBEAT_SECONDS * 1000);

        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                void flushProgress();
            }
        };

        const handlePageHide = () => {
            void flushProgress(undefined, { keepalive: true });
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("pagehide", handlePageHide);
        window.addEventListener("beforeunload", handlePageHide);

        return () => {
            window.clearInterval(tickId);
            window.clearInterval(heartbeatId);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("pagehide", handlePageHide);
            window.removeEventListener("beforeunload", handlePageHide);
            void flushProgress();
        };
    }, [captureWatchTime, flushProgress]);

    const handleLoadedMetadata = () => {
        const video = videoRef.current;
        if (!video || hasSeekedRef.current) return;

        const shouldResume = !progress?.completed;
        const targetSeconds = currentTimeRef.current > 0
            ? currentTimeRef.current
            : shouldResume
                ? resumeSeconds
                : 0;
        const seekTo = Math.min(targetSeconds, video.duration || targetSeconds);
        if (seekTo > 0 && Number.isFinite(seekTo)) {
            video.currentTime = seekTo;
            currentTimeRef.current = seekTo;
        }
        hasSeekedRef.current = true;
    };

    const handleReplayFromStart = () => {
        const video = videoRef.current;
        if (!video) return;

        pendingDeltaRef.current = 0;
        currentTimeRef.current = 0;
        video.currentTime = 0;
        void video.play().catch(() => {
            // Native controls remain available when autoplay is blocked.
        });
    };

    const handleRefresh = async () => {
        await refreshContent();
        await refreshProgress();
    };

    useEffect(() => {
        if (!content?.expiresAt) return;

        const expiresAtMs = new Date(content.expiresAt).getTime();
        if (Number.isNaN(expiresAtMs)) return;

        const refreshInMs = Math.max(0, expiresAtMs - Date.now() - REFRESH_URL_BEFORE_EXPIRY_MS);
        const timeoutId = window.setTimeout(() => {
            void refreshContent();
        }, refreshInMs);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [content?.expiresAt, refreshContent]);

    if (isLoading) {
        return <VideoLessonSkeleton />;
    }

    if (error || !content || !progress) {
        return (
            <div className="flex h-full items-center justify-center px-4 py-16">
                <div className="flex max-w-md flex-col items-center gap-4 text-center">
                    <div className="flex size-14 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10 text-destructive">
                        <AlertCircleIcon className="size-7" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Chưa tải được video</h2>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            Có thể bài học chưa mở khóa hoặc video chưa sẵn sàng. Hãy thử lại sau ít phút.
                        </p>
                    </div>
                    <Button onClick={handleRefresh} className="gap-2">
                        <RefreshCwIcon className="size-4" />
                        Thử tải lại
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col overflow-y-auto bg-muted/[0.16]">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 lg:py-7">
                <header className="overflow-hidden rounded-2xl border border-border/60 bg-card/75 p-5 shadow-sm sm:p-6">
                    <div className="mb-4 flex flex-wrap items-center gap-2.5">
                        <LessonTypeIcon type="VIDEO" showLabel />

                        <div className="ml-0 flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground sm:ml-auto">
                            <Clock3Icon className="size-3.5" />
                            <span>{formatDuration(duration)}</span>
                        </div>
                    </div>

                    <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                        {content.title}
                    </h1>

                    {content.description && (
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                            {content.description}
                        </p>
                    )}
                </header>

                <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                    <div className="relative aspect-video bg-zinc-950">
                    <video
                        key={content.playbackUrl}
                        ref={videoRef}
                        src={content.playbackUrl}
                        className="h-full w-full bg-zinc-950"
                        controls
                        playsInline
                        preload="metadata"
                        onLoadedMetadata={handleLoadedMetadata}
                        onTimeUpdate={(event) => {
                            currentTimeRef.current = event.currentTarget.currentTime;
                        }}
                        onPause={() => void flushProgress()}
                        onSeeked={() => void flushProgress(0)}
                        onEnded={() => void flushProgress()}
                        onError={() => void refreshContent()}
                        aria-label={`Video bài học ${content.title}`}
                    >
                        Trình duyệt của bạn không hỗ trợ phát video.
                    </video>

                    {resumeSeconds > 0 && !progress.completed && (
                        <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-white/15 bg-black/55 px-3 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-md">
                            Tiếp tục từ {formatDuration(resumeSeconds)}
                        </div>
                    )}
                    </div>

                    <div className="border-t border-border/60 bg-background/75 px-4 py-4 sm:px-5">
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "h-6 rounded-md border-[var(--lesson-accent-border)] bg-[var(--lesson-accent-muted)] text-[var(--lesson-accent)]",
                                        progress.completed && "border-emerald-500/25 bg-emerald-500/10 text-emerald-600"
                                    )}
                                >
                                    {progress.completed ? (
                                        <CheckCircle2Icon className="size-3" />
                                    ) : (
                                        <PlayCircleIcon className="size-3" />
                                    )}
                                    {statusLabel}
                                </Badge>

                                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                                    <span>Đã ghi nhận {roundedRecordedProgress}%</span>
                                    <span className="size-1 rounded-full bg-muted-foreground/40" />
                                    <span>{progressUpdatedLabel}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Progress
                                    value={recordedProgress}
                                    className={cn(
                                        "h-2 bg-muted/80 [&_[data-slot=progress-indicator]]:bg-[var(--lesson-accent)]",
                                        progress.completed && "[&_[data-slot=progress-indicator]]:bg-emerald-500"
                                    )}
                                />
                                <p className="text-xs leading-5 text-muted-foreground">
                                    {progress.completed
                                        ? "Bạn đã hoàn thành bài học này. Video luôn sẵn sàng để xem lại từ đầu."
                                        : "Tiến độ này là phần hệ thống đã ghi nhận từ thời gian xem thực tế và sẽ được dùng để tiếp tục bài học lần sau."}
                                </p>
                            </div>

                            {progress.completed && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleReplayFromStart}
                                    className="w-fit gap-2 rounded-lg"
                                >
                                    <RotateCcwIcon className="size-4" />
                                    Xem lại từ đầu
                                </Button>
                            )}
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-[var(--lesson-accent-border)] bg-card/75 p-5 shadow-sm sm:p-6">
                    <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--lesson-accent)] text-primary-foreground shadow-sm">
                            <SparklesIcon className="size-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <h2 className="text-base font-bold text-foreground">
                                Cần AI Tutor hỗ trợ khi xem video?
                            </h2>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                Dùng các thao tác nhanh để tóm tắt ý chính, lấy ví dụ hoặc tự kiểm tra sau khi xem.
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2.5">
                        <button
                            type="button"
                            onClick={() =>
                                dispatchAITutorAsk(
                                    `Tôi đang học bài video "${content.title}". Hãy tóm tắt giúp tôi những ý chính cần nắm và trình bày ngắn gọn theo gạch đầu dòng.`
                                )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--lesson-accent)] px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:opacity-95 active:scale-95"
                        >
                            <SparklesIcon className="size-3.5" />
                            Tóm tắt ý chính
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                dispatchAITutorAsk(
                                    `Hãy lấy ví dụ trực quan, dễ hiểu liên quan đến bài video "${content.title}" để tôi ghi nhớ tốt hơn.`
                                )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background px-3.5 py-2 text-xs font-bold text-foreground transition-all hover:bg-muted active:scale-95"
                        >
                            <LightbulbIcon className="size-3.5 text-amber-500" />
                            Cho ví dụ
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                dispatchAITutorAsk(
                                    `Hãy kiểm tra nhanh kiến thức của tôi sau bài video "${content.title}" bằng 2-3 câu hỏi ngắn, kèm đáp án gợi ý ở cuối.`
                                )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background px-3.5 py-2 text-xs font-bold text-foreground transition-all hover:bg-muted active:scale-95"
                        >
                            <MessageSquareIcon className="size-3.5 text-primary" />
                            Đố vui ôn tập
                        </button>
                    </div>
                </section>

                <div className="h-10" />
            </div>
        </div>
    );
}

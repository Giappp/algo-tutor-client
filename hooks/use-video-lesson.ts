import { useCallback } from "react";
import useSWR from "swr";
import { videoLessonApi } from "@/api/video-lesson";
import type {
    VideoContent,
    VideoProgress,
    VideoProgressUpdate,
} from "@/lib/types/lesson";

type VideoLessonKey = readonly [string, string];

export function useVideoLesson(lessonSlug: string | null | undefined) {
    const contentKey: VideoLessonKey | null = lessonSlug ? ["video-content", lessonSlug] : null;
    const progressKey: VideoLessonKey | null = lessonSlug ? ["video-progress", lessonSlug] : null;

    const content = useSWR<VideoContent, Error, VideoLessonKey | null>(
        contentKey,
        ([, slug]) => videoLessonApi.getContent(slug),
        { revalidateOnFocus: false, shouldRetryOnError: false }
    );

    const progress = useSWR<VideoProgress, Error, VideoLessonKey | null>(
        progressKey,
        ([, slug]) => videoLessonApi.getProgress(slug),
        { revalidateOnFocus: false, shouldRetryOnError: false }
    );

    const mutateProgress = progress.mutate;

    const updateProgress = useCallback(async (payload: VideoProgressUpdate) => {
        if (!lessonSlug) return null;
        const updated = await videoLessonApi.updateProgress(lessonSlug, payload);
        await mutateProgress(updated, false);
        return updated;
    }, [lessonSlug, mutateProgress]);

    const updateProgressKeepalive = useCallback((payload: VideoProgressUpdate) => {
        if (!lessonSlug) return;
        videoLessonApi.updateProgressKeepalive(lessonSlug, payload);
    }, [lessonSlug]);

    return {
        content: content.data,
        progress: progress.data,
        error: content.error ?? progress.error,
        contentError: content.error,
        progressError: progress.error,
        isLoading: content.isLoading || progress.isLoading,
        isRefreshingUrl: content.isValidating,
        refreshContent: content.mutate,
        refreshProgress: progress.mutate,
        updateProgress,
        updateProgressKeepalive,
    };
}

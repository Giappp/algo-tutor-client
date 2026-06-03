import { useEffect, useRef } from "react";
import type { ProgressStatus } from "@/lib/types/roadmap";
import { roadmapApi } from "@/api/roadmap";

/**
 * Automatically marks a lesson as IN_PROGRESS when the page loads,
 * only if the current status is NOT_STARTED or not yet initialized (null/undefined).
 * Fire-and-forget: errors are silently ignored.
 */
export function useAutoMarkInProgress(
  roadmapSlug: string,
  lessonSlug: string,
  currentProgress: ProgressStatus | null | undefined,
  isReady: boolean = true
) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (!isReady || hasFired.current) return;
    
    // Only fire if the progress is NOT_STARTED or has not been created yet (null/undefined)
    const shouldStart = !currentProgress || currentProgress === "NOT_STARTED";
    if (!shouldStart) return;

    hasFired.current = true;

    // Fire-and-forget: don't await, don't show errors
    roadmapApi
      .startLesson(roadmapSlug, lessonSlug)
      .catch(() => {
        // Silently ignore - user can still view content
      });
  }, [roadmapSlug, lessonSlug, currentProgress, isReady]);
}


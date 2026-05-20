import { useEffect, useRef } from "react";
import type { ProgressStatus } from "@/lib/types/roadmap";
import { roadmapApi } from "@/api/roadmap";

/**
 * Automatically marks a lesson as IN_PROGRESS when the page loads,
 * only if the current status is NOT_STARTED.
 * Fire-and-forget: errors are silently ignored.
 */
export function useAutoMarkInProgress(
  roadmapSlug: string,
  lessonSlug: string,
  currentProgress: ProgressStatus | null | undefined
) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    if (currentProgress !== "NOT_STARTED") return;

    hasFired.current = true;

    // Fire-and-forget: don't await, don't show errors
    roadmapApi
      .updateLessonProgress(roadmapSlug, lessonSlug, "IN_PROGRESS")
      .catch(() => {
        // Silently ignore - user can still view content
      });
  }, [roadmapSlug, lessonSlug, currentProgress]);
}

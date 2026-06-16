/**
 * useLandingData — barrel re-export so consumers only import from @/hooks.
 * The actual implementation lives in use-landing-data.ts.
 */
export {useApiData, usePaginatedData} from "./use-api-data";
export {useScrollReveal} from "./use-scroll-reveal";
export {useRoadmapActions} from "./use-roadmap-actions";
export {useReducedMotion} from "./use-reduced-motion";
export {useEnrollments} from "./use-enrollments";
export {useRoadmaps} from "./use-roadmaps";
export {useRoadmapDetail} from "./use-roadmap-detail";
export {useLessonContent} from "./use-lesson-content";
export {useVideoLesson} from "./use-video-lesson";
export {useLessonProgress, useRoadmapProgress} from "./use-lesson-progress";
export {useAutoMarkInProgress} from "./use-auto-mark-progress";


# Implementation Plan: Continue Lesson

## Overview

Implement the "Continue Lesson" feature which enables learners to resume their learning from the Dashboard. The implementation covers: new TypeScript types, a user API module, SWR-based hooks for current lesson and auto-progress marking, refactoring the WelcomeSection component to use real data, and integrating the auto-mark logic into the lesson page.

## Tasks

- [x] 1. Define types and API layer
  - [x] 1.1 Create user types in `lib/types/user.ts`
    - Define `CurrentLessonResponse` interface with fields: `roadmapSlug`, `lessonSlug`, `lessonTitle`, `roadmapName`, `completionPercentage`
    - Define `EnrollmentListItem` interface with fields: `roadmapName`, `roadmapSlug`, `completionPercentage`, `nextLessonSlug`, `nextLessonTitle`
    - Export both interfaces from `lib/types/index.ts`
    - _Requirements: 2.2, 4.1_

  - [x] 1.2 Create user API module in `api/user.ts`
    - Implement `userApi.getCurrentLesson()` calling `GET /users/me/current-lesson`, returning `CurrentLessonResponse | null` (handle 204 as null)
    - Implement `userApi.getEnrollments()` calling `GET /users/me/enrollments`, returning `EnrollmentListItem[]`
    - Follow existing patterns from `api/roadmap.ts` using `apiClient` and `ApiResponse<T>` wrapper
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.1, 4.2, 4.3_

- [x] 2. Implement hooks
  - [x] 2.1 Create `useCurrentLesson` hook in `hooks/use-current-lesson.ts`
    - Use SWR with key `/users/me/current-lesson` and the existing `fetcher`
    - Configure: `revalidateOnFocus: false`, `shouldRetryOnError: false`, `errorRetryCount: 1`, `errorRetryInterval: 3000`, `loadingTimeout: 5000`
    - Return `{ currentLesson, isLoading, isError, retry }` matching the pattern in `hooks/use-user.ts`
    - _Requirements: 2.1, 3.3, 6.3, 6.4_

  - [x] 2.2 Create `useAutoMarkInProgress` hook in `hooks/use-auto-mark-progress.ts`
    - Accept params: `roadmapSlug`, `lessonSlug`, `currentProgress` (ProgressStatus | null | undefined)
    - Use `useEffect` + `useRef` to fire PATCH only once when `currentProgress === "NOT_STARTED"`
    - Call `roadmapApi.updateLessonProgress(roadmapSlug, lessonSlug, "IN_PROGRESS")` fire-and-forget
    - Silently catch errors — never block rendering or show error UI
    - Do NOT fire for `IN_PROGRESS`, `COMPLETED`, or `null` values
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 2.3 Write property test for auto-mark conditional logic
    - **Property 1: Progress update fires only for NOT_STARTED**
    - Generate arbitrary ProgressStatus values (NOT_STARTED, IN_PROGRESS, COMPLETED, null) and verify PATCH is called if and only if status equals "NOT_STARTED"
    - Use fast-check library with minimum 100 iterations
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.5**

- [x] 3. Checkpoint - Ensure hooks compile and tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Refactor WelcomeSection with real data
  - [x] 4.1 Update `components/dashboard/welcome-section.tsx` to use `useCurrentLesson`
    - Import and call `useCurrentLesson` hook
    - Show `<Skeleton>` loading state while API is loading
    - On success: display "Tiếp tục hành trình trong {roadmapName} — bạn đã hoàn thành {percentage}%" with CTA button linking to `/learn/{roadmapSlug}/{lessonSlug}`
    - On empty response (no current lesson): display "Bắt đầu hành trình học thuật toán ngay hôm nay" with CTA linking to `/roadmaps`
    - On error: display "Chào mừng bạn trở lại" fallback text
    - CTA button labeled "Tiếp tục học"
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 5.1, 5.2, 5.4, 5.5, 6.1, 6.2_

  - [ ]* 4.2 Write property test for welcome text formatting
    - **Property 3: Welcome text formatting with dynamic data**
    - Generate arbitrary non-empty roadmap names and integer percentages (0–100), verify the formatted subtitle contains both the exact name and percentage in the expected pattern
    - Use fast-check library with minimum 100 iterations
    - **Validates: Requirements 5.1**

  - [ ]* 4.3 Write unit tests for WelcomeSection rendering states
    - Test loading skeleton state
    - Test success state with lesson data (correct text, correct link href)
    - Test empty response fallback (no enrolled roadmaps message)
    - Test error fallback ("Chào mừng bạn trở lại")
    - Test retry behavior (SWR retries once after 3s)
    - _Requirements: 3.1, 3.3, 3.4, 3.5, 5.2, 6.1, 6.3, 6.4_

- [x] 5. Integrate auto-mark into lesson page
  - [x] 5.1 Add `useAutoMarkInProgress` to `app/learn/[roadmapSlug]/[lessonSlug]/page.tsx`
    - Import and call `useAutoMarkInProgress(roadmapSlug, lessonSlug, currentProgress)` after `currentProgress` is resolved from roadmap data
    - Ensure it does not block or delay lesson content rendering
    - Ensure the existing `onMarkComplete` flow and `useRoadmapActions` remain unchanged
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 5.2 Write unit tests for lesson page auto-mark integration
    - Verify PATCH is called when lesson progress is NOT_STARTED
    - Verify PATCH is NOT called when progress is IN_PROGRESS or COMPLETED
    - Verify lesson content renders regardless of PATCH success/failure
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 6. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The design uses TypeScript throughout — all implementations use `.ts`/`.tsx` files
- SWR handles retry logic (1 retry after 3s) via configuration, no custom retry code needed
- The `fetcher` from `api/fetchers.ts` already unwraps `ApiResponse<T>`, so hooks receive clean data

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1", "2.2"] },
    { "id": 3, "tasks": ["2.3", "4.1"] },
    { "id": 4, "tasks": ["4.2", "4.3", "5.1"] },
    { "id": 5, "tasks": ["5.2"] }
  ]
}
```

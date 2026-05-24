# Implementation Plan: Learn Page Design Improvements

## Overview

This plan implements comprehensive UI/UX improvements to the AlgoTutor Learn page, covering lesson-type color coding, a centralized motion system (Framer Motion), quiz transitions, verdict celebrations (canvas-confetti), staggered test case reveals, navigator collapse animation, animated border effects, accessibility fixes, quiz timer urgency, background atmosphere, and typography refinements. Each task builds incrementally on the previous, ending with full integration.

## Tasks

- [x] 1. Set up motion infrastructure and new dependencies
  - [x] 1.1 Install Framer Motion and canvas-confetti dependencies
    - Run `npm install framer-motion canvas-confetti` and `npm install -D @types/canvas-confetti`
    - Verify packages are added to `package.json`
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 1.2 Create `lib/motion.ts` with spring presets and animation variants
    - Export `springs` object with `snappy`, `gentle`, `bounce` transition configs
    - Export `slideVariants` (enter/center/exit with direction parameter)
    - Export `staggerContainer` and `staggerItem` variants (80ms stagger, 200ms delay)
    - Export `scalePop` variant for answer selection feedback
    - Export `fadeVariants` for sidebar collapse
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 1.3 Create `hooks/use-reduced-motion.ts` hook
    - Implement hook that reads `prefers-reduced-motion: reduce` media query
    - Return boolean, update reactively on system preference change
    - SSR-safe (default `false` on server)
    - _Requirements: 2.5, 3.5, 4.3, 5.4, 6.4_

  - [ ]* 1.4 Write property test for motion spring presets (Property 10: Slide Variant Directional Symmetry)
    - **Property 10: Slide Variant Directional Symmetry**
    - For any direction value `d`, verify enter x-offset and exit x-offset have opposite signs relative to `d`
    - **Validates: Requirement 9.2**

- [x] 2. Implement lesson-type color coding system
  - [x] 2.1 Create `lib/lesson-theme.ts` with theme token map
    - Define `LESSON_THEME_MAP` with THEORY (hue ~250), QUIZ (hue ~80), CODING (hue ~145) entries
    - Each entry contains `cssVars` object with `--lesson-accent`, `--lesson-accent-muted`, `--lesson-accent-border`, `--lesson-accent-glow`
    - Export `getLessonThemeVars(lessonType)` function
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 2.2 Create `components/learn/lesson-theme-provider.tsx`
    - Implement React context provider that injects CSS custom properties via inline style
    - Expose `useLessonTheme()` hook for programmatic access to accent config
    - Map `LessonType` → accent color tokens from `lib/lesson-theme.ts`
    - _Requirements: 1.1, 1.5, 1.6_

  - [x] 2.3 Add lesson-accent CSS variable fallbacks to `app/globals.css`
    - Add `--lesson-accent: var(--primary)` fallback in `:root` and `.dark` blocks
    - Add `--lesson-accent-muted`, `--lesson-accent-border`, `--lesson-accent-glow` fallbacks
    - _Requirements: 1.6_

  - [x] 2.4 Wrap lesson page with `LessonThemeProvider` in `app/learn/[roadmapSlug]/[lessonSlug]/page.tsx`
    - Import and wrap the content rendering with `<LessonThemeProvider lessonType={lessonType}>`
    - _Requirements: 1.1, 1.5_

  - [ ]* 2.5 Write property test for theme token completeness (Property 1)
    - **Property 1: Theme Token Completeness**
    - For any valid lesson type, `getLessonThemeVars` returns exactly 4 CSS variable entries with valid OKLCH strings
    - **Validates: Requirement 1.1**

- [~] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement quiz question transitions
  - [~] 4.1 Add AnimatePresence-based slide transitions to `components/learn/quiz/quiz-content.tsx`
    - Add `direction` state tracking (`+1` for next, `-1` for prev)
    - Wrap `QuestionCard` with `<AnimatePresence mode="wait">` and `<motion.div>` using `slideVariants`
    - Use `springs.snappy` transition
    - Respect `useReducedMotion()` — skip animations when active
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [~] 4.2 Add scale pop animation to answer selection in `components/learn/quiz/question-card.tsx`
    - Wrap option labels with `motion.div` using `scalePop` variant
    - Trigger `selected` variant on answer selection
    - Skip animation when reduced motion is active
    - _Requirements: 2.4, 2.5_

  - [ ]* 4.3 Write property test for quiz transition direction (Property 2)
    - **Property 2: Quiz Transition Direction Determinism**
    - For any navigation from index `i` to index `j` where `i ≠ j`, direction equals `sign(j - i)` and is non-zero
    - **Validates: Requirements 2.1, 2.2**

- [ ] 5. Implement verdict celebrations and confetti
  - [~] 5.1 Create `hooks/use-confetti.ts` hook
    - Lazy-load `canvas-confetti` via dynamic import on first trigger
    - Implement `triggerConfetti(options)` and `triggerCelebration()` (burst + side bursts sequence)
    - Respect `useReducedMotion()` — no-op when active
    - Silently catch import failures without throwing
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [~] 5.2 Integrate confetti in `components/learn/coding-content.tsx` on ACCEPTED verdict
    - Call `triggerCelebration()` when `response.status === "ACCEPTED"`
    - _Requirements: 3.1_

  - [~] 5.3 Integrate confetti in `components/learn/quiz/quiz-results-panel.tsx` on quiz pass
    - Call `triggerCelebration()` when `attemptResult.passed === true`
    - _Requirements: 3.2_

  - [ ]* 5.4 Write property test for reduced motion accessibility (Property 3)
    - **Property 3: Reduced Motion Accessibility**
    - When `prefers-reduced-motion` is `"reduce"`, no particle effects are triggered and animation durations are 0
    - **Validates: Requirements 2.5, 3.5, 4.3, 5.4, 6.4**

- [ ] 6. Implement staggered test case reveal
  - [~] 6.1 Add stagger animation to `components/learn/judge/judge-results-panel.tsx`
    - Wrap test case results list with `motion.div` using `staggerContainer` variant
    - Wrap each `TestCaseResult` with `motion.div` using `staggerItem` variant
    - 80ms stagger delay, 200ms initial delay
    - Skip stagger when reduced motion is active (show all immediately)
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 6.2 Write property test for stagger timing predictability (Property 7)
    - **Property 7: Stagger Timing Predictability**
    - For any N > 0 items, total animation duration equals `delayChildren + (N × staggerChildren) + itemAnimationDuration`
    - **Validates: Requirements 4.1, 4.2**

- [ ] 7. Implement navigator collapse animation
  - [~] 7.1 Refactor navigator collapse in `components/learn/learning-layout.tsx` with Framer Motion
    - Replace CSS `transition-all` with `motion.div` for width animation using `springs.snappy`
    - Implement content fade: on collapse, opacity fades to 0 in 100ms then width animates to 0
    - On expand: width animates to 288px first, then content fades in
    - Respect `useReducedMotion()` — instant collapse/expand when active
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 7.2 Write unit test for navigator collapse ordering (Property 5)
    - **Property 5: Navigator Collapse Ordering**
    - Verify content opacity reaches 0 before container width reaches 0 on collapse
    - Verify container width reaches target before content opacity reaches 1 on expand
    - **Validates: Requirements 5.1, 5.2**

- [~] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement animated border effect
  - [~] 9.1 Create `components/ui/animated-border.tsx`
    - Implement animated conic gradient border using CSS `@property` for angle animation
    - Accept `active`, `colors`, `speed`, `borderRadius`, `className` props
    - Use GPU-composited properties (transform, opacity) for performance
    - Show static gradient border when reduced motion is active
    - Render children without border animation when `active === false`
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [~] 9.2 Wrap `VerdictBanner` with `AnimatedBorder` in `components/learn/judge/judge-results-panel.tsx`
    - Set `active={result.verdict === "ACCEPTED"}`
    - Use emerald color palette for the gradient
    - _Requirements: 6.1, 6.2_

- [ ] 10. Implement accessibility fixes
  - [~] 10.1 Fix touch targets on `components/learn/quiz/quiz-progress-dots.tsx`
    - Increase dot button minimum size to 44×44px (use padding or min-w/min-h)
    - Add proper `aria-label` for each dot (e.g., "Question 3, answered")
    - Make dots keyboard-navigable with visible focus indicators
    - _Requirements: 7.1, 8.3_

  - [~] 10.2 Fix touch targets on navigator lesson buttons in `components/learn/roadmap-navigator.tsx`
    - Ensure each lesson button has minimum 44×44px touch target
    - Increase font weight and spacing on topic headers for visual hierarchy
    - _Requirements: 7.2, 12.3_

  - [~] 10.3 Fix touch targets on quiz navigation buttons in `components/learn/quiz/quiz-content.tsx`
    - Ensure Previous/Next buttons have minimum 44×44px touch target
    - _Requirements: 7.3_

  - [~] 10.4 Add aria-live regions for quiz timer and verdict announcements
    - Add `aria-live="assertive"` to timer element when urgency is "urgent"
    - Add `aria-live="polite"` region around `VerdictBanner` in `components/learn/judge/verdict-banner.tsx`
    - _Requirements: 8.1, 8.2_

  - [ ]* 10.5 Write property test for touch target minimum size (Property 6)
    - **Property 6: Touch Target Minimum Size**
    - For any interactive element (progress dots, navigator buttons, quiz nav buttons), computed touch target is at least 44×44px
    - **Validates: Requirements 7.1, 7.2, 7.3**

- [ ] 11. Implement quiz timer urgency indicator
  - [~] 11.1 Add `calculateQuizTimerUrgency` function and urgency styling to `components/learn/quiz/quiz-content.tsx`
    - Implement urgency calculation: normal (<30s/question), warning (30-60s/question), urgent (>60s/question)
    - Apply color classes: normal=muted, warning=amber, urgent=rose
    - Set `aria-live="assertive"` when urgency is "urgent"
    - _Requirements: 10.1, 10.2, 10.3, 8.1_

  - [ ]* 11.2 Write property test for timer urgency monotonicity (Property 8)
    - **Property 8: Timer Urgency Monotonicity**
    - For increasing elapsed time values, urgency level is monotonically non-decreasing (normal → warning → urgent)
    - Thresholds at `questionCount × 30` and `questionCount × 60` seconds
    - **Validates: Requirements 10.1, 10.2, 10.3**

- [~] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Implement background, atmosphere, and typography refinements
  - [x] 13.1 Add frosted-glass effect and noise texture to navigator and layout
    - Add `backdrop-blur-md` and semi-transparent background to navigator panel in `learning-layout.tsx`
    - Add subtle SVG noise texture overlay via CSS `background-image` in `globals.css`
    - Replace hard-stop border dividers with gradient-fading edges
    - _Requirements: 11.1, 11.2, 11.3_

  - [x] 13.2 Add animated progress indicators and typography refinements
    - Animate progress bar value changes with `springs.gentle` in `theory-content.tsx`
    - Ensure Geist Sans for body and Geist Mono for code across all lesson types
    - Animate the lesson content area progress bar smoothly
    - _Requirements: 12.1, 12.2_

  - [x] 13.3 Apply lesson-accent colors to navigator active states and AI tutor panel
    - Update navigator active lesson button to use `var(--lesson-accent-muted)` and `var(--lesson-accent-border)`
    - Add frosted-glass effect to AI tutor panel header
    - _Requirements: 1.1, 11.1_

- [ ] 14. Final integration and wiring
  - [~] 14.1 Wire all components together and verify integration
    - Ensure `LessonThemeProvider` wraps all content correctly
    - Verify confetti triggers on both ACCEPTED verdict and quiz pass
    - Verify animated border activates only on ACCEPTED
    - Verify stagger animation plays on judge results
    - Verify navigator collapse/expand uses spring physics
    - Verify quiz transitions use directional slides
    - Verify timer urgency colors update correctly
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 9.1, 10.1_

  - [ ]* 14.2 Write integration tests for end-to-end flows
    - Test quiz question transition renders correctly
    - Test confetti triggers on ACCEPTED verdict
    - Test navigator collapse preserves scroll position
    - Test lesson-type colors apply when navigating between lesson types
    - _Requirements: 1.1, 2.1, 3.1, 5.1_

- [~] 15. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Framer Motion is tree-shaken — only import `motion`, `AnimatePresence`, and `useReducedMotion`
- `canvas-confetti` is lazy-loaded on first celebration trigger (~8KB gzipped)
- All animations use GPU-composited properties (transform, opacity) for performance
- CSS custom properties for theming avoid React re-renders on theme change

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["1.4", "2.1"] },
    { "id": 3, "tasks": ["2.2", "2.3"] },
    { "id": 4, "tasks": ["2.4", "2.5"] },
    { "id": 5, "tasks": ["4.1", "5.1", "7.1", "9.1"] },
    { "id": 6, "tasks": ["4.2", "4.3", "5.2", "5.3", "5.4", "6.1", "7.2", "9.2"] },
    { "id": 7, "tasks": ["6.2", "10.1", "10.2", "10.3", "10.4", "11.1"] },
    { "id": 8, "tasks": ["10.5", "11.2"] },
    { "id": 9, "tasks": ["13.1", "13.2", "13.3"] },
    { "id": 10, "tasks": ["14.1", "14.2"] }
  ]
}
```

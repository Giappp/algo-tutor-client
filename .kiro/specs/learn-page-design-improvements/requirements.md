# Requirements Document

## Introduction

This document defines the requirements for comprehensive UI/UX improvements to the AlgoTutor Learn page section. The improvements span lesson-type color coding, motion and micro-interactions, spatial composition, background atmosphere, component refinements, accessibility fixes, and typography enhancements. The goal is to elevate the Learn page to a "Refined Developer Studio" aesthetic while maintaining accessibility and performance.

## Glossary

- **Learn_Page**: The section of AlgoTutor where users consume lessons, including theory reading, quiz taking, and coding problem solving
- **Lesson_Theme_Provider**: A React context provider that injects lesson-type-specific color tokens as CSS custom properties
- **Motion_System**: The centralized animation configuration module (`lib/motion.ts`) providing spring presets and animation variants
- **Confetti_Hook**: The `useConfetti` React hook that triggers canvas-based particle celebrations
- **Animated_Border**: A UI component that renders an animated gradient border effect around its children
- **Navigator**: The collapsible left sidebar (`RoadmapNavigator`) showing course structure and lesson list
- **Quiz_Content**: The component managing quiz question display, navigation, and submission
- **Coding_Content**: The component managing the code editor, problem description, and judge output
- **Verdict_Banner**: The component displaying code submission results (Accepted, Wrong Answer, etc.)
- **Progress_Dots**: The quiz navigation dots indicating answered/current/unanswered questions
- **Reduced_Motion**: The `prefers-reduced-motion: reduce` media query indicating user preference for minimal animation
- **Touch_Target**: The minimum interactive area size for pointer/touch interaction (44×44px per WCAG 2.5.5)
- **OKLCH**: The perceptually uniform color space used throughout the AlgoTutor design system
- **Stagger_Reveal**: An animation pattern where child elements appear sequentially with a fixed delay between each

## Requirements

### Requirement 1: Lesson-Type Color Coding System

**User Story:** As a learner, I want each lesson type to have a distinct color identity, so that I can quickly distinguish between Theory, Quiz, and Coding lessons visually.

#### Acceptance Criteria

1. THE Lesson_Theme_Provider SHALL inject CSS custom properties `--lesson-accent`, `--lesson-accent-muted`, `--lesson-accent-border`, and `--lesson-accent-glow` based on the current lesson type
2. WHEN the lesson type is THEORY, THE Lesson_Theme_Provider SHALL set `--lesson-accent` to an indigo/blue hue (OKLCH hue ~250)
3. WHEN the lesson type is QUIZ, THE Lesson_Theme_Provider SHALL set `--lesson-accent` to an amber/gold hue (OKLCH hue ~80)
4. WHEN the lesson type is CODING, THE Lesson_Theme_Provider SHALL set `--lesson-accent` to an emerald/green hue (OKLCH hue ~145)
5. THE Lesson_Theme_Provider SHALL expose a React context so child components can programmatically access the current accent configuration
6. IF `--lesson-accent` is referenced before the Lesson_Theme_Provider mounts, THEN THE Learn_Page SHALL fall back to `var(--primary)` via CSS variable fallback syntax

### Requirement 2: Quiz Question Transitions

**User Story:** As a learner taking a quiz, I want smooth animated transitions between questions, so that navigation feels fluid and I maintain spatial awareness of my progress.

#### Acceptance Criteria

1. WHEN a user navigates to the next question, THE Quiz_Content SHALL animate the current question out to the left and the new question in from the right
2. WHEN a user navigates to the previous question, THE Quiz_Content SHALL animate the current question out to the right and the new question in from the left
3. THE Quiz_Content SHALL display only one question at a time during transitions (exit completes before enter begins)
4. WHEN a user selects an answer option, THE Quiz_Content SHALL apply a brief scale animation (pop effect) to the selected option
5. WHILE Reduced_Motion is active, THE Quiz_Content SHALL skip slide and scale animations and display questions instantly

### Requirement 3: Verdict Celebrations

**User Story:** As a learner, I want a celebratory visual effect when I solve a coding problem or pass a quiz, so that I feel rewarded for my achievement.

#### Acceptance Criteria

1. WHEN a code submission receives an ACCEPTED verdict, THE Confetti_Hook SHALL trigger a confetti particle celebration
2. WHEN a quiz attempt result has `passed === true`, THE Confetti_Hook SHALL trigger a confetti particle celebration
3. THE Confetti_Hook SHALL lazy-load the canvas-confetti library on first trigger to avoid impacting initial page load
4. THE Confetti_Hook SHALL render confetti on a temporary canvas overlay that auto-removes after particles settle
5. WHILE Reduced_Motion is active, THE Confetti_Hook SHALL not trigger any particle animations
6. IF the canvas-confetti library fails to load, THEN THE Confetti_Hook SHALL silently degrade without throwing errors or disrupting the user experience

### Requirement 4: Staggered Test Case Reveal

**User Story:** As a learner reviewing code submission results, I want test cases to appear one by one with a staggered animation, so that I can process results progressively rather than being overwhelmed.

#### Acceptance Criteria

1. WHEN judge results are received, THE Coding_Content SHALL reveal test case results sequentially with an 80ms delay between each item
2. THE Coding_Content SHALL begin the stagger sequence after a 200ms initial delay from when results are rendered
3. WHILE Reduced_Motion is active, THE Coding_Content SHALL display all test case results immediately without stagger animation

### Requirement 5: Navigator Collapse Animation

**User Story:** As a learner, I want the sidebar navigator to collapse and expand with a smooth animation, so that the layout transition feels polished rather than jarring.

#### Acceptance Criteria

1. WHEN the user collapses the Navigator, THE Learn_Page SHALL fade out the Navigator content first (within 100ms), then animate the width to zero
2. WHEN the user expands the Navigator, THE Learn_Page SHALL animate the width to 288px first, then fade in the content
3. THE Learn_Page SHALL use spring physics for the width animation to create a natural, snappy feel
4. WHILE Reduced_Motion is active, THE Learn_Page SHALL collapse and expand the Navigator instantly without animation

### Requirement 6: Animated Border Effect

**User Story:** As a learner, I want a visually distinctive animated border on the verdict banner when my code is accepted, so that the success state is unmistakably highlighted.

#### Acceptance Criteria

1. WHEN the verdict is ACCEPTED, THE Animated_Border SHALL render an animated conic gradient border around the Verdict_Banner
2. WHILE the `active` prop is false, THE Animated_Border SHALL render its children without any border animation
3. THE Animated_Border SHALL use GPU-composited properties (transform, opacity) for animation performance
4. WHILE Reduced_Motion is active, THE Animated_Border SHALL display a static gradient border without animation

### Requirement 7: Accessibility — Touch Targets

**User Story:** As a learner using a touch device, I want all interactive elements to have adequate touch target sizes, so that I can interact with the interface without frustration.

#### Acceptance Criteria

1. THE Progress_Dots SHALL have a minimum computed touch target of 44×44px per interactive dot element
2. THE Navigator lesson buttons SHALL have a minimum computed touch target of 44×44px
3. THE Quiz_Content navigation buttons (Previous, Next) SHALL have a minimum computed touch target of 44×44px

### Requirement 8: Accessibility — Keyboard and Screen Reader Support

**User Story:** As a learner using assistive technology, I want quiz and coding interactions to be fully keyboard-accessible and announced by screen readers, so that I can use the platform without a mouse.

#### Acceptance Criteria

1. WHEN the quiz timer urgency reaches "urgent", THE Quiz_Content SHALL set `aria-live="assertive"` on the timer element to announce time pressure
2. WHEN a verdict is received after code submission, THE Verdict_Banner SHALL be announced to screen readers via an appropriate aria-live region
3. THE Progress_Dots SHALL be navigable via keyboard with clear focus indicators

### Requirement 9: Motion System Configuration

**User Story:** As a developer maintaining the Learn page, I want a centralized motion configuration module, so that animation timing and spring physics are consistent across all components.

#### Acceptance Criteria

1. THE Motion_System SHALL export spring presets (snappy, gentle, bounce) as reusable transition configurations
2. THE Motion_System SHALL export slide variants that accept a direction parameter to determine enter/exit direction
3. THE Motion_System SHALL export stagger container and item variants with configurable delay values
4. THE Motion_System SHALL export a scale pop variant for interactive selection feedback

### Requirement 10: Quiz Timer Urgency Indicator

**User Story:** As a learner taking a timed quiz, I want visual feedback when I am spending too long, so that I can manage my time effectively.

#### Acceptance Criteria

1. WHEN elapsed time is less than 30 seconds per question, THE Quiz_Content SHALL display the timer in a normal (muted) color
2. WHEN elapsed time is between 30 and 60 seconds per question, THE Quiz_Content SHALL display the timer in an amber/warning color
3. WHEN elapsed time exceeds 60 seconds per question, THE Quiz_Content SHALL display the timer in a rose/urgent color

### Requirement 11: Background and Atmosphere Enhancements

**User Story:** As a learner, I want subtle background textures and depth effects on the Learn page, so that the interface feels polished and immersive without being distracting.

#### Acceptance Criteria

1. THE Navigator SHALL have a subtle frosted-glass effect (backdrop-blur) on its background to create visual depth separation from the content area
2. THE Learn_Page SHALL apply a subtle noise texture overlay to background surfaces for visual richness
3. THE Learn_Page dividers SHALL use gradient fading at their edges rather than hard-stop borders

### Requirement 12: Typography and Spacing Refinements

**User Story:** As a learner reading theory content, I want refined typography with proper spacing and hierarchy, so that long-form content is comfortable to read.

#### Acceptance Criteria

1. THE Learn_Page SHALL use the Geist Sans font for body text and Geist Mono for code elements consistently across all lesson types
2. THE Learn_Page progress indicators SHALL animate smoothly when their value changes rather than jumping instantly
3. THE Navigator topic headers SHALL use increased font weight and spacing to create clear visual hierarchy between topics and lessons

import type { LessonType } from "@/lib/types/roadmap";

export const LESSON_THEME_MAP = {
  THEORY: {
    accent: "theory" as const,
    hue: 250,
    cssVars: {
      "--lesson-accent": "oklch(0.65 0.18 250)",
      "--lesson-accent-muted": "oklch(0.65 0.18 250 / 10%)",
      "--lesson-accent-border": "oklch(0.65 0.18 250 / 30%)",
      "--lesson-accent-glow": "oklch(0.65 0.18 250 / 20%)",
    },
  },
  QUIZ: {
    accent: "quiz" as const,
    hue: 80,
    cssVars: {
      "--lesson-accent": "oklch(0.75 0.16 80)",
      "--lesson-accent-muted": "oklch(0.75 0.16 80 / 10%)",
      "--lesson-accent-border": "oklch(0.75 0.16 80 / 30%)",
      "--lesson-accent-glow": "oklch(0.75 0.16 80 / 20%)",
    },
  },
  CODING: {
    accent: "coding" as const,
    hue: 145,
    cssVars: {
      "--lesson-accent": "oklch(0.72 0.18 145)",
      "--lesson-accent-muted": "oklch(0.72 0.18 145 / 10%)",
      "--lesson-accent-border": "oklch(0.72 0.18 145 / 30%)",
      "--lesson-accent-glow": "oklch(0.72 0.18 145 / 20%)",
    },
  },
} as const;

export type LessonThemeConfig =
  (typeof LESSON_THEME_MAP)[keyof typeof LESSON_THEME_MAP];

/**
 * Returns the CSS custom property map for a given lesson type.
 * Referentially stable for same input (pure function over a const map).
 */
export function getLessonThemeVars(
  lessonType: LessonType
): Record<string, string> {
  return LESSON_THEME_MAP[lessonType].cssVars;
}

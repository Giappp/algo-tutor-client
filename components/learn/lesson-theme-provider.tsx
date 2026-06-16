"use client";

import { createContext, useContext, useMemo } from "react";
import type { LessonType } from "@/lib/types/roadmap";
import { LESSON_THEME_MAP, getLessonThemeVars } from "@/lib/lesson-theme";

type LessonAccent = "theory" | "quiz" | "coding" | "video";

interface LessonThemeContextValue {
  accent: LessonAccent;
  colors: {
    primary: string;
    primaryMuted: string;
    primaryBorder: string;
  };
}

interface LessonThemeProviderProps {
  lessonType: LessonType;
  children: React.ReactNode;
}

const LessonThemeContext = createContext<LessonThemeContextValue | null>(null);

export function LessonThemeProvider({
  lessonType,
  children,
}: LessonThemeProviderProps) {
  const themeConfig = LESSON_THEME_MAP[lessonType];
  const cssVars = getLessonThemeVars(lessonType);

  const contextValue = useMemo<LessonThemeContextValue>(
    () => ({
      accent: themeConfig.accent,
      colors: {
        primary: "var(--lesson-accent)",
        primaryMuted: "var(--lesson-accent-muted)",
        primaryBorder: "var(--lesson-accent-border)",
      },
    }),
    [themeConfig.accent]
  );

  return (
    <LessonThemeContext.Provider value={contextValue}>
      <div style={cssVars as React.CSSProperties}>{children}</div>
    </LessonThemeContext.Provider>
  );
}

export function useLessonTheme(): LessonThemeContextValue {
  const context = useContext(LessonThemeContext);
  if (!context) {
    throw new Error(
      "useLessonTheme must be used within a LessonThemeProvider"
    );
  }
  return context;
}

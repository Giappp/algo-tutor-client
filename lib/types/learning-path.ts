import type { LessonType, Difficulty } from "./roadmap";

export type { LessonType, Difficulty };

export const DIFFICULTY_LEVELS = {
    EASY: "EASY",
    MEDIUM: "MEDIUM",
    HARD: "HARD",
} as const;
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[keyof typeof DIFFICULTY_LEVELS];

export interface LearningPath {
    name: string;
    slug: string;
    level: string;
    description: string;
    goal: string;
    thumbnailUrl: string;
    isPublished: boolean;
    isPremium: boolean;
    enrollmentCount: number;
    topicCount: number;
    lessonCount: number;
    topics?: Topic[];
}

export interface Topic {
    name: string;
    description: string;
    displayOrder: number;
    isLocked: boolean;
    lessons: Lesson[];
}

export interface Lesson {
    title: string;
    slug: string;
    type: LessonType;
    displayOrder: number;
    difficulty: Difficulty;
}

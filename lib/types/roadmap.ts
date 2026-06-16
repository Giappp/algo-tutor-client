export type Level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export type LessonType = "THEORY" | "QUIZ" | "CODING" | "VIDEO";

export type ProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type EnrollmentStatus = "ACTIVE" | "COMPLETED" | "DROPPED";

export interface LessonWithProgress {
    id: number;
    title: string;
    slug: string;
    type: LessonType;
    displayOrder: number;
    difficulty: Difficulty;
    progress?: ProgressStatus | null;
    status?: ProgressStatus | null;
    unlocked?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface TopicWithLessons {
    id: number;
    name: string;
    description: string;
    displayOrder: number;
    lessonCount: number;
    unlocked?: boolean;
    isLocked?: boolean;
    completed?: boolean;
    completedLessons?: number;
    totalLessons?: number;
    createdAt: string;
    updatedAt: string;
    lessons: LessonWithProgress[];
}

export interface RoadmapDetailResponse {
    id: number;
    name: string;
    slug: string;
    level: Level;
    description: string;
    goal: string;
    thumbnailUrl: string;
    isPublished: boolean;
    isPremium: boolean;
    enrollmentCount: number;
    topicCount: number;
    lessonCount: number;
    enrolled: boolean;
    createdAt: string;
    updatedAt: string;
    topics: TopicWithLessons[];
}

export interface RoadmapListItem {
    name: string;
    slug: string;
    level: string;
    thumbnailUrl: string;
    description: string;
    goal: string;
    isPremium: boolean;
    enrollmentCount: number;
    topicCount: number;
    lessonCount: number;
}

export interface LessonProgressUpdateRequest {
    status: ProgressStatus;
}

export interface LessonProgressUpdateResponse {
    lessonId: number;
    status: ProgressStatus;
    updatedAt: string;
}

export interface LessonProgressionDTO {
    lessonId: number;
    status: ProgressStatus;
    updatedAt: string;
}

export interface EnrollmentDetailResponse {
    id: string;
    userId: string;
    learningPathId: number;
    learningPathName: string;
    status: EnrollmentStatus;
    completedAt: string | null;
    createdAt: string;
    lessonProgressions: LessonProgressionDTO[];
}

export interface EnrollmentResponseDTO {
    id: string;
    userId: string;
    learningPathId: number;
    learningPathName: string;
    status: EnrollmentStatus;
    completedAt: string | null;
    enrolledAt: string;
}

export const LESSON_TYPE_COUNTS = {
    THEORY: { label: "theory", color: "text-blue-500/80" },
    QUIZ: { label: "quiz", color: "text-amber-500/80" },
    CODING: { label: "coding", color: "text-emerald-500/80" },
    VIDEO: { label: "video", color: "text-rose-500/80" },
} as const;

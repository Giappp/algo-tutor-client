export interface CurrentLessonResponse {
  roadmapSlug: string;
  lessonSlug: string;
  lessonTitle: string;
  roadmapName: string;
  completionPercentage: number; // 0-100 integer
}

export interface EnrollmentListItem {
  roadmapName: string;
  roadmapSlug: string;
  completionPercentage: number; // 0-100 integer
  nextLessonSlug: string | null;
  nextLessonTitle: string | null;
  thumbnailUrl: string | null;
}

export interface UserProfile {
  username: string;
  fullName?: string;
  avatarUrl?: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  title?: string;
  joinedDate?: string | Date;
  location?: string;
  streakCount: number;
  nextStreakGoal: number;
}


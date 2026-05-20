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
}

import { useApiData } from "./use-api-data";
import type { LessonType } from "@/lib/types/roadmap";

export function useLessonContent(lessonSlug: string | null | undefined, lessonType: LessonType | null | undefined) {
    const endpoint = lessonSlug && lessonType
        ? `/lessons/${lessonSlug}/${lessonType.toLowerCase()}`
        : null;

    const { data, error, isLoading, mutate } = useApiData<any>(
        endpoint,
        { revalidateOnFocus: false, shouldRetryOnError: false }
    );

    return {
        lessonData: data,
        error,
        isLoading,
        mutate,
    };
}

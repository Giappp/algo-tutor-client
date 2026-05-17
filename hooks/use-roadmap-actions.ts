import {useCallback, useState} from "react";
import {roadmapApi} from "@/api/roadmap";
import type {
    EnrollmentDetailResponse,
    LessonProgressUpdateResponse,
    ProgressStatus,
} from "@/lib/types/roadmap";

export function useRoadmapActions() {
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

    const enroll = useCallback(async (slug: string) => {
        setIsEnrolling(true);
        try {
            const result = await roadmapApi.enroll(slug);
            return result;
        } finally {
            setIsEnrolling(false);
        }
    }, []);

    const updateLessonProgress = useCallback(
        async (
            pathSlug: string,
            lessonSlug: string,
            status: ProgressStatus
        ): Promise<LessonProgressUpdateResponse> => {
            setIsUpdatingProgress(true);
            try {
                const result = await roadmapApi.updateLessonProgress(
                    pathSlug,
                    lessonSlug,
                    status
                );
                return result;
            } finally {
                setIsUpdatingProgress(false);
            }
        },
        []
    );

    const getEnrollment = useCallback(
        async (slug: string): Promise<EnrollmentDetailResponse> => {
            return roadmapApi.getEnrollment(slug);
        },
        []
    );

    return {
        enroll,
        updateLessonProgress,
        getEnrollment,
        isEnrolling,
        isUpdatingProgress,
    };
}

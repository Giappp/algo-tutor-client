import useSWR from "swr";
import {fetcher} from "@/api/fetchers";
import type {CurrentLessonResponse} from "@/lib/types/user";

export function useCurrentLesson() {
    const {data, error, isLoading, mutate} = useSWR<CurrentLessonResponse | null>(
        "/users/me/current-lesson",
        fetcher,
        {
            revalidateOnFocus: false,
            shouldRetryOnError: false,
            errorRetryCount: 1,
            errorRetryInterval: 3000,
            loadingTimeout: 5000,
        }
    );
    return {
        currentLesson: data,
        isLoading,
        isError: !!error,
        retry: mutate,
    };
}

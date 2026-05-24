import useSWR from "swr";
import { fetcher } from "@/api/fetchers";
import type { EnrollmentListItem } from "@/lib/types/user";

export function useEnrollments() {
    const { data, error, isLoading, mutate } = useSWR<EnrollmentListItem[] | null>(
        "/users/me/enrollments",
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
        enrollments: data ?? [],
        isLoading,
        isError: !!error,
        mutate,
    };
}

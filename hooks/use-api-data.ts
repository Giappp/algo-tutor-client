import useSWR, {SWRConfiguration} from "swr";
import {fetcher, fetcherWithParams} from "@/api/fetchers";
import {PageResponse} from "@/lib/types/api";

export function useApiData<T>(endpoint: string | null, config?: SWRConfiguration) {
    const {data, error, mutate, isLoading, isValidating} = useSWR<T>(
        endpoint,
        fetcher,
        config
    );

    return {
        data,
        error,
        isLoading,
        isValidating,
        mutate,
    };
}

interface PaginationParams {
    page: number;
    size: number;
}

export function usePaginatedData<T, P>(
    endpoint: string | null,
    params: PaginationParams & P,
    config?: SWRConfiguration
) {
    const key = endpoint ? [endpoint, params] : null;

    const {data, error, mutate, isLoading} = useSWR<PageResponse<T>>(
        key,
        ([url, queryParams]: [string, PaginationParams & P]) =>
            fetcherWithParams<PageResponse<T>>(url, queryParams),
        config
    );

    return {
        data: data?.data || [],
        pagination: {
            page: data?.currentPage || 0,
            size: data?.pageSize || 10,
            totalElements: data?.totalElements || 0,
            totalPages: data?.totalPages || 0,
        },
        error,
        isLoading,
        mutate,
    };
}
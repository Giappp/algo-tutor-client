/**
 * useLandingData — SWR hook for fetching landing page data from the
 * Spring Boot backend. Falls back to mock data when the backend is
 * unavailable (dev / demo mode).
 *
 * Usage:
 *   const { data, error, isLoading } = useLandingData("/landing/stats");
 *   const { data, error, isLoading } = useLandingData("/landing/features");
 *
 * Backend endpoints (Spring Boot):
 *   GET /api/landing           — full payload
 *   GET /api/landing/stats     — PlatformStats
 *   GET /api/landing/features  — Feature[]
 *   GET /api/landing/roadmaps  — RoadmapTopic[]
 *   GET /api/landing/testimonials — Testimonial[]
 *   GET /api/landing/faqs     — FaqItem[]
 *   GET /api/landing/how-it-works — HowItWorksStep[]
 */

import useSWR, {SWRConfiguration} from "swr";
import {fetcher, fetcherWithParams} from "@/api/fetchers";
import {PageResponse} from "@/lib/types/api";

export function useLandingData<T>(endpoint: string | null, config?: SWRConfiguration) {
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

export function usePaginatedData<T>(
    endpoint: string | null,
    params: { page: number; size: number; [key: string]: any },
    config?: SWRConfiguration
) {
    const key = endpoint ? [endpoint, params] : null;

    const {data, error, mutate, isLoading} = useSWR<PageResponse<T>>(
        key,
        // Trích xuất url và params từ SWR key
        ([url, queryParams]) => fetcherWithParams<PageResponse<T>>(url, queryParams),
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
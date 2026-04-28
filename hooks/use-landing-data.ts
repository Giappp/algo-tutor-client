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

import useSWR from "swr";
import {apiClient} from "@/api/api-client";

// Fetcher compatible with SWR — uses the axios instance
const fetcher = <T>(url: string): Promise<T> =>
    apiClient.get<T>(url).then((res) => res.data);

export function useLandingData<T>(endpoint: string) {
    return useSWR<T>(endpoint, fetcher, {
        // Revalidate every 5 minutes so stats stay reasonably fresh
        refreshInterval: 5 * 60 * 1000,
        // Don't retry on auth errors (landing data doesn't need auth)
        shouldRetryOnError: (err) => {
            const status = err.response?.status;
            return status !== 401 && status !== 403;
        },
        // Fallback to undefined while loading (not stale data)
        fallbackData: undefined as T | undefined,
    });
}

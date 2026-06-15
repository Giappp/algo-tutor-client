/**
 * Landing Page — entry point.
 *
 * Each section fetches its own data via SWR / Axios from the Spring Boot backend.
 * Spring Boot endpoints expected:
 *   GET /api/landing/stats
 *   GET /api/landing/features
 *   GET /api/landing/roadmaps
 *   GET /api/landing/testimonials
 *   GET /api/landing/faqs
 *   GET /api/landing/how-it-works
 *
 * Mock data for demo mode (when backend is offline): @/lib/mock/landing-data.ts
 * Axios client: @/lib/api-client.ts
 * SWR hook: @/hooks/use-landing-data.ts
 * Types: @/lib/types/landing.ts
 */

import type {Metadata} from "next";
import {LandingPageClient} from "@/components/landing/landing-page-client";

export const metadata: Metadata = {
    title: "AlgoTutor | Học thuật toán theo lộ trình cùng AI Tutor",
    description:
        "Học thuật toán có thứ tự qua lý thuyết, bài tập chấm tự động và AI Tutor gợi ý theo ngữ cảnh.",
};

export default function Home() {
    return <LandingPageClient/>;
}

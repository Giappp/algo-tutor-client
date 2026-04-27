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
 * Configure the backend base URL in .env.local:
 *   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
 *
 * Mock data for demo mode (when backend is offline): @/lib/mock/landing-data.ts
 * Axios client: @/lib/api-client.ts
 * SWR hook: @/hooks/use-landing-data.ts
 * Types: @/lib/types/landing.ts
 */

import { LandingPageClient } from "@/components/landing/landing-page-client";

export default function Home() {
  return <LandingPageClient />;
}

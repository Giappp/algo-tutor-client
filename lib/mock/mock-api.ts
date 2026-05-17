/**
 * Mock API responses for development without backend.
 * Returns mock data for known endpoints, null for unknown ones.
 */

import { MOCK_ROADMAP_LIST, MOCK_ROADMAP_DETAIL } from "./roadmap-data";
import { MOCK_THEORY_LESSONS } from "./theory-lessons";
import { MOCK_QUIZZES } from "./quiz-data";
import { MOCK_CODING_PROBLEMS } from "./coding-problems";
import type { RoadmapDetailResponse } from "@/lib/types/roadmap";

interface MockResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

function wrap<T>(data: T): MockResponse<T> {
    return { success: true, message: "OK", data };
}

/**
 * Attempts to match a URL to mock data.
 * Returns the mock response or null if no match.
 */
export function getMockResponse(method: string, url: string): unknown | null {
    // GET /roadmaps — list (paginated)
    if (method === "get" && url === "/roadmaps") {
        return {
            data: MOCK_ROADMAP_LIST,
            pageSize: 10,
            totalPages: 1,
            totalElements: MOCK_ROADMAP_LIST.length,
            currentPage: 0,
        };
    }

    // GET /roadmaps/:slug — detail
    const detailMatch = url.match(/^\/roadmaps\/([^/]+)$/);
    if (method === "get" && detailMatch) {
        const slug = detailMatch[1];
        const roadmap = MOCK_ROADMAP_DETAIL[slug];
        if (roadmap) {
            return wrap(roadmap);
        }
        return null;
    }

    // POST /roadmaps/:slug/enroll
    const enrollMatch = url.match(/^\/roadmaps\/([^/]+)\/enroll$/);
    if (method === "post" && enrollMatch) {
        return wrap({
            id: "mock-enrollment-" + Date.now(),
            userId: "mock-user-1",
            learningPathId: 1,
        });
    }

    // PATCH /roadmaps/:slug/lessons/:lessonSlug/progress
    const progressMatch = url.match(/^\/roadmaps\/([^/]+)\/lessons\/([^/]+)\/progress$/);
    if (method === "patch" && progressMatch) {
        return wrap({
            lessonId: 1,
            status: "COMPLETED",
            updatedAt: new Date().toISOString(),
        });
    }

    // GET /roadmaps/:slug/enrollment
    const enrollmentMatch = url.match(/^\/roadmaps\/([^/]+)\/enrollment$/);
    if (method === "get" && enrollmentMatch) {
        return wrap({
            id: "mock-enrollment-1",
            userId: "mock-user-1",
            learningPathId: 1,
            learningPathName: "DSA Fundamentals",
            status: "ACTIVE",
            completedAt: null,
            createdAt: "2024-01-15T00:00:00Z",
            lessonProgressions: [],
        });
    }

    // GET /lessons/:slug/theory
    const theoryMatch = url.match(/^\/lessons\/([^/]+)\/theory$/);
    if (method === "get" && theoryMatch) {
        const data = MOCK_THEORY_LESSONS[theoryMatch[1]];
        if (data) return wrap(data);
    }

    // GET /lessons/:slug/quiz
    const quizMatch = url.match(/^\/lessons\/([^/]+)\/quiz$/);
    if (method === "get" && quizMatch) {
        const data = MOCK_QUIZZES[quizMatch[1]];
        if (data) return wrap(data);
    }

    // GET /lessons/:slug/coding
    const codingMatch = url.match(/^\/lessons\/([^/]+)\/coding$/);
    if (method === "get" && codingMatch) {
        const data = MOCK_CODING_PROBLEMS[codingMatch[1]];
        if (data) return wrap(data);
    }

    return null;
}

/**
 * Updates local mock data when enrollment happens.
 */
export function mockEnroll(slug: string): void {
    const roadmap = MOCK_ROADMAP_DETAIL[slug];
    if (roadmap) {
        (roadmap as RoadmapDetailResponse).enrolled = true;
    }
}

/**
 * Updates local mock data when lesson progress changes.
 */
export function mockUpdateProgress(roadmapSlug: string, lessonSlug: string, status: string): void {
    const roadmap = MOCK_ROADMAP_DETAIL[roadmapSlug];
    if (!roadmap) return;

    for (const topic of roadmap.topics) {
        const lesson = topic.lessons.find((l) => l.slug === lessonSlug);
        if (lesson) {
            (lesson as { progress: string | null }).progress = status;
            break;
        }
    }
}

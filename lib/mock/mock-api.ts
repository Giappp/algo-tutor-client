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

function buildMockHeatmap(): Record<string, number> {
    const today = new Date();
    const data: Record<string, number> = {};

    for (let offset = 0; offset < 90; offset += 1) {
        const date = new Date(today);
        date.setDate(today.getDate() - offset);

        if (offset % 3 === 0 || offset % 11 === 0) {
            const dateKey = date.toISOString().slice(0, 10);
            data[dateKey] = offset % 11 === 0 ? 3 : 1;
        }
    }

    return data;
}

/**
 * Attempts to match a URL to mock data.
 * Returns the mock response or null if no match.
 */
export function getMockResponse(method: string, url: string): unknown | null {
    // GET /iam/me — current user
    if (method === "get" && url === "/iam/me") {
        return wrap({
            id: "mock-user-1",
            username: "codestar2026",
            email: "codestar@algotutor.vn",
            role: "USER",
            avatar: "",
            contributionScore: 1280,
            totalContributions: 36,
            currentStreak: 6,
            maxStreak: 14,
        });
    }

    // GET /leaderboard?limit=:limit — dashboard leaderboard
    const leaderboardMatch = url.match(/^\/leaderboard(?:\?limit=(\d+))?$/);
    if (method === "get" && leaderboardMatch) {
        const limit = Number(leaderboardMatch[1] ?? 5);

        return wrap({
            entries: [
                { userId: "mock-user-4", username: "nguyen.algos", rank: 1, xp: 4850, streak: 18 },
                { userId: "mock-user-2", username: "linh.codes", rank: 2, xp: 4320, streak: 11 },
                {
                    userId: "mock-user-1",
                    username: "codestar2026",
                    rank: 3,
                    xp: 1280,
                    streak: 6,
                    isCurrentUser: true,
                },
                { userId: "mock-user-3", username: "minh.dev", rank: 4, xp: 980, streak: 4 },
                { userId: "mock-user-5", username: "tram.dsa", rank: 5, xp: 750, streak: 2 },
            ].slice(0, limit),
            currentUserRank: 3,
        });
    }

    // GET /users/me/current-lesson
    if (method === "get" && url === "/users/me/current-lesson") {
        return wrap({
            roadmapSlug: "dsa-fundamentals",
            lessonSlug: "binary-search",
            lessonTitle: "Binary Search",
            roadmapName: "DSA Fundamentals",
            completionPercentage: 42,
        });
    }

    // GET /users/me/enrollments
    if (method === "get" && url === "/users/me/enrollments") {
        return wrap([
            {
                roadmapName: "DSA Fundamentals",
                roadmapSlug: "dsa-fundamentals",
                completionPercentage: 42,
                nextLessonSlug: "binary-search",
                nextLessonTitle: "Binary Search",
                thumbnailUrl: null,
            },
            {
                roadmapName: "Dynamic Programming",
                roadmapSlug: "dynamic-programming",
                completionPercentage: 12,
                nextLessonSlug: "intro-to-dp",
                nextLessonTitle: "Intro to DP",
                thumbnailUrl: null,
            },
        ]);
    }

    // GET /users/me/activity-heatmap?year=:year
    if (method === "get" && url.match(/^\/users\/me\/activity-heatmap(?:\?year=\d+)?$/)) {
        return wrap(buildMockHeatmap());
    }

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

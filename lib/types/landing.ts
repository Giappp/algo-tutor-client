import { Level } from "./roadmap";

export interface RoadmapTopic {
    name: string;
    slug: string;
    level: Level;
    thumbnailUrl: string;
    description: string;
    goal: string;
    topicCount: number;
    lessonCount: number;
    isPremium?: boolean;
}

export interface Testimonial {
    id: string;
    name: string;
    role: string;
    avatarInitials: string; // derived from user name; backend generates this
    avatarColorIndex: number; // picks gradient variant on client
    content: string;
    starRating: number; // 1–5
    createdAt?: string; // ISO date string
}


export interface PlatformStats {
    totalStudents: number;
    totalProblems: number;
    totalTopics: number;
    avgCompletionRate: number; // percentage 0–100
}

// --- Feature Card ---
// API ROUTE: GET /api/landing/features
// BACKEND STATUS: Static content from a CMS or config table.
//                 Could be editable via admin panel in production.

export interface Feature {
    id: string;
    title: string;
    description: string;
    iconKey: string; // Lucide icon name key
    colorToken: string; // CSS oklch token or HSL string
    bgToken: string; // CSS oklch token or HSLA string
}

// --- FAQ Item ---
// API ROUTE: GET /api/landing/faqs
// BACKEND STATUS: Could be static from CMS, or managed via admin panel.

export interface FaqItem {
    id: string;
    question: string;
    answer: string;
    order: number; // for sorting
}

// --- How It Works Step ---
// API ROUTE: GET /api/landing/how-it-works
// BACKEND STATUS: Static content — likely hardcoded or from a config table.

export interface HowItWorksStep {
    id: string;
    stepNumber: string; // "01", "02", "03"
    title: string;
    description: string;
    iconKey: string; // Lucide icon name key
}

// --- Landing Page Full Response ---
// API ROUTE: GET /api/landing
// Returns all dynamic content in one request (for SSR/SSG).

export interface LandingPageData {
    stats: PlatformStats;
    features: Feature[];
    testimonials: Testimonial[];
    faqs: FaqItem[];
    howItWorks: HowItWorksStep[];
}

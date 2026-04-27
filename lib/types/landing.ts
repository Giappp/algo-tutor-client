// ============================================================
// LANDING PAGE — CORE DATA TYPES
// These types define the data contracts for dynamic landing page
// content. Each one is marked with its API route and whether it
// needs backend integration.
// ============================================================

// --- Roadmap Topic ---
// API ROUTE: GET /api/landing/roadmaps
// BACKEND STATUS: Needs real DB query (roadmaps + problem counts table)
// NOTE: Counts come from aggregating problems per topic in the DB.
//       Difficulty breakdown requires a problems table with difficulty field.

export interface RoadmapTopic {
  id: string;
  name: string;
  iconKey: string; // Lucide icon name key — resolved on client via LucideIcons map
  problemCount: number;
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
  isLocked?: boolean; // for gated advanced topics
  description?: string;
}

// --- Testimonial ---
// API ROUTE: GET /api/landing/testimonials
// BACKEND STATUS: Needs real DB query (testimonials table, joined with users)
// NOTE: In production, avatarUrl and role come from the users table.
//       starRating may come from a ratings table or be static.

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

// --- Platform Stats ---
// API ROUTE: GET /api/landing/stats
// BACKEND STATUS: Needs real aggregation queries:
//   - totalStudents: COUNT(DISTINCT user_id) from user_problems
//   - totalProblems: COUNT(*) from problems WHERE active = true
//   - totalTopics: COUNT(*) from topics
//   - avgCompletionRate: AVG(completed_problems / total_problems) from user_progress

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
  roadmaps: RoadmapTopic[];
  testimonials: Testimonial[];
  faqs: FaqItem[];
  howItWorks: HowItWorksStep[];
}

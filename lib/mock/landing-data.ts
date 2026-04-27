import type {
  Feature,
  FaqItem,
  HowItWorksStep,
  LandingPageData,
  PlatformStats,
  RoadmapTopic,
  Testimonial,
} from "@/lib/types/landing";

// ============================================================
// MOCK DATA — mirrors what the backend API routes will return.
// Replace these with real DB queries when integrating.
// ============================================================

export const MOCK_STATS: PlatformStats = {
  totalStudents: 52_341,
  totalProblems: 1_247,
  totalTopics: 12,
  avgCompletionRate: 73,
};

export const MOCK_FEATURES: Feature[] = [
  {
    id: "feat-1",
    title: "Structured Roadmaps",
    description:
      "Topics are cleanly isolated — Arrays, Strings, Trees, Graphs, Dynamic Programming, and more — so you never get lost in concepts you haven't reached yet.",
    iconKey: "Map",
    colorToken: "[oklch(0.65_0.2_145)]",
    bgToken: "bg-[oklch(0.65_0.2_145)/0.1]",
  },
  {
    id: "feat-2",
    title: "Context-Aware AI Tutor",
    description:
      "Powered by LLMs and vector databases, the tutor analyzes your code and intent — then delivers targeted hints strictly within the current lesson scope.",
    iconKey: "BrainCircuit",
    colorToken: "text-primary",
    bgToken: "bg-primary/10",
  },
  {
    id: "feat-3",
    title: "Progressive Difficulty",
    description:
      "Problems scale from Easy to Medium to Hard. Milestones unlock advanced content, ensuring a rock-solid foundation before moving up.",
    iconKey: "TrendingUp",
    colorToken: "[oklch(0.7_0.18_85)]",
    bgToken: "bg-[oklch(0.7_0.18_85)/0.1]",
  },
  {
    id: "feat-4",
    title: "Theory + Practice",
    description:
      "Every topic starts with visual theory and pseudocode. Then quizzes, then coding — a multi-layer approach that locks in understanding.",
    iconKey: "BookOpen",
    colorToken: "[oklch(0.65_0.15_340)]",
    bgToken: "bg-[oklch(0.65_0.15_340)/0.1]",
  },
  {
    id: "feat-5",
    title: "Auto-Graded Exercises",
    description:
      "Submit your code and get instant, detailed feedback. No manual review needed — the platform handles grading across all difficulty tiers.",
    iconKey: "Layers",
    colorToken: "[oklch(0.6_0.18_180)]",
    bgToken: "bg-[oklch(0.6_0.18_180)/0.1]",
  },
  {
    id: "feat-6",
    title: "Knowledge Isolation",
    description:
      "Coding problems are scoped to the current topic only. No leaked advanced concepts — what you see is exactly what you need to solve.",
    iconKey: "GraduationCap",
    colorToken: "[oklch(0.7_0.18_250)]",
    bgToken: "bg-[oklch(0.7_0.18_250)/0.1]",
  },
];

export const MOCK_ROADMAPS: RoadmapTopic[] = [
  {
    id: "arrays-strings",
    name: "Arrays & Strings",
    iconKey: "Braces",
    problemCount: 142,
    difficultyBreakdown: { easy: 48, medium: 62, hard: 32 },
  },
  {
    id: "linked-lists",
    name: "Linked Lists",
    iconKey: "ListOrdered",
    problemCount: 68,
    difficultyBreakdown: { easy: 22, medium: 30, hard: 16 },
  },
  {
    id: "trees",
    name: "Trees",
    iconKey: "Network",
    problemCount: 96,
    difficultyBreakdown: { easy: 28, medium: 44, hard: 24 },
  },
  {
    id: "graphs",
    name: "Graphs",
    iconKey: "Network",
    problemCount: 84,
    difficultyBreakdown: { easy: 20, medium: 38, hard: 26 },
  },
  {
    id: "dynamic-programming",
    name: "Dynamic Programming",
    iconKey: "TrendingUp",
    problemCount: 120,
    difficultyBreakdown: { easy: 30, medium: 54, hard: 36 },
  },
  {
    id: "sorting-searching",
    name: "Sorting & Searching",
    iconKey: "Layers",
    problemCount: 78,
    difficultyBreakdown: { easy: 24, medium: 36, hard: 18 },
  },
  {
    id: "stacks-queues",
    name: "Stacks & Queues",
    iconKey: "Cpu",
    problemCount: 54,
    difficultyBreakdown: { easy: 18, medium: 24, hard: 12 },
  },
  {
    id: "hash-tables",
    name: "Hash Tables",
    iconKey: "Map",
    problemCount: 62,
    difficultyBreakdown: { easy: 22, medium: 28, hard: 12 },
  },
];

export const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: "testi-1",
    name: "Alex Chen",
    role: "CS Student, Stanford",
    avatarInitials: "AC",
    avatarColorIndex: 0,
    content:
      "The knowledge isolation is a game changer. I used to get overwhelmed seeing hard DP problems before I even understood arrays. AlgoTutor gates everything perfectly.",
    starRating: 5,
  },
  {
    id: "testi-2",
    name: "Priya Sharma",
    role: "Frontend Engineer, Meta",
    avatarInitials: "PS",
    avatarColorIndex: 1,
    content:
      "The AI tutor hint system is incredibly well-designed. It nudges you just enough without giving away the solution. I've improved more in 2 months than in a year of random LeetCode.",
    starRating: 5,
  },
  {
    id: "testi-3",
    name: "Jordan Lee",
    role: "Self-Taught Developer",
    avatarInitials: "JL",
    avatarColorIndex: 2,
    content:
      "Coming from a non-CS background, most platforms assumed too much prior knowledge. AlgoTutor's theory-first approach built my foundation from scratch. Highly recommend.",
    starRating: 5,
  },
  {
    id: "testi-4",
    name: "Samantha Wu",
    role: "Backend Engineer, Stripe",
    avatarInitials: "SW",
    avatarColorIndex: 3,
    content:
      "The structured roadmaps saved me so much time. I no longer have to wonder 'what should I practice next?' The path is laid out and every topic flows into the next naturally.",
    starRating: 5,
  },
];

export const MOCK_FAQS: FaqItem[] = [
  {
    id: "faq-1",
    question: "Do I need prior coding experience?",
    answer:
      "Not at all. Our Arrays & Strings roadmap starts from absolute zero. We assume no prior knowledge of algorithms — just basic programming syntax.",
    order: 1,
  },
  {
    id: "faq-2",
    question: "How does the AI tutor work?",
    answer:
      "The AI tutor analyzes your submitted code using a vector database and an LLM. It understands the current lesson context and provides hints that are scoped to what you've already learned — never spoiling advanced solutions.",
    order: 2,
  },
  {
    id: "faq-3",
    question: "Is AlgoTutor free?",
    answer:
      "Yes! The core learning experience — all roadmaps, theory lessons, and coding problems — is completely free. A premium tier adds advanced analytics, mentorship, and personalized study plans.",
    order: 3,
  },
  {
    id: "faq-4",
    question: "How are problems graded?",
    answer:
      "Every problem is auto-graded against a suite of test cases covering edge cases, performance, and correctness. You'll see detailed feedback for each failing test case.",
    order: 4,
  },
  {
    id: "faq-5",
    question: "Can I track my progress?",
    answer:
      "Absolutely. Your dashboard shows completion rates per topic, streaks, difficulty distribution, and hints consumed — giving you a clear picture of your strengths and areas to improve.",
    order: 5,
  },
];

export const MOCK_HOW_IT_WORKS: HowItWorksStep[] = [
  {
    id: "step-1",
    stepNumber: "01",
    title: "Learn the Theory",
    description:
      "Start with clear, visual explanations and pseudocode. Build mental models before writing a single line of code.",
    iconKey: "BookOpen",
  },
  {
    id: "step-2",
    stepNumber: "02",
    title: "Solve the Problem",
    description:
      "Tackle auto-graded coding exercises scoped strictly to the current topic. No spoilers, no advanced tricks.",
    iconKey: "Code2",
  },
  {
    id: "step-3",
    stepNumber: "03",
    title: "Get AI Hints",
    description:
      "Stuck? The AI tutor analyzes your code and gives contextual hints — nudging you forward without handing you the answer.",
    iconKey: "Lightbulb",
  },
];

// Combined response — mirrors the full API payload
export const MOCK_LANDING_DATA: LandingPageData = {
  stats: MOCK_STATS,
  features: MOCK_FEATURES,
  roadmaps: MOCK_ROADMAPS,
  testimonials: MOCK_TESTIMONIALS,
  faqs: MOCK_FAQS,
  howItWorks: MOCK_HOW_IT_WORKS,
};

import type {
    FaqItem,
    Feature,
    HowItWorksStep,
    LandingPageData,
    PlatformStats,
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
        title: "Lộ trình có thứ tự",
        description:
            "Mỗi chủ đề được sắp xếp theo nền tảng cần có, giúp bạn biết chính xác nên học gì tiếp theo.",
        iconKey: "Map",
        colorToken: "[oklch(0.65_0.2_145)]",
        bgToken: "bg-[oklch(0.65_0.2_145)/0.1]",
    },
    {
        id: "feat-2",
        title: "AI Tutor hiểu ngữ cảnh",
        description:
            "AI phân tích mã nguồn và bài học hiện tại để gợi ý đúng chỗ, không đưa sẵn đáp án.",
        iconKey: "BrainCircuit",
        colorToken: "text-primary",
        bgToken: "bg-primary/10",
    },
    {
        id: "feat-3",
        title: "Độ khó tăng dần",
        description:
            "Bài tập tăng dần từ dễ đến khó để bạn xây nền vững trước khi tiếp cận kỹ thuật nâng cao.",
        iconKey: "TrendingUp",
        colorToken: "[oklch(0.7_0.18_85)]",
        bgToken: "bg-[oklch(0.7_0.18_85)/0.1]",
    },
    {
        id: "feat-4",
        title: "Lý thuyết đi cùng thực hành",
        description:
            "Học mô hình tư duy và pseudocode trước, sau đó kiểm tra hiểu biết bằng quiz và bài code.",
        iconKey: "BookOpen",
        colorToken: "[oklch(0.65_0.15_340)]",
        bgToken: "bg-[oklch(0.65_0.15_340)/0.1]",
    },
    {
        id: "feat-5",
        title: "Chấm bài tự động",
        description:
            "Chạy code và nhận phản hồi theo từng test case để biết sai ở đâu và cần sửa điều gì.",
        iconKey: "Layers",
        colorToken: "[oklch(0.6_0.18_180)]",
        bgToken: "bg-[oklch(0.6_0.18_180)/0.1]",
    },
    {
        id: "feat-6",
        title: "Không ép dùng kiến thức chưa học",
        description:
            "Mỗi bài tập chỉ yêu cầu kiến thức đã xuất hiện trong lộ trình, tránh cảm giác bị bỏ lại phía sau.",
        iconKey: "GraduationCap",
        colorToken: "[oklch(0.7_0.18_250)]",
        bgToken: "bg-[oklch(0.7_0.18_250)/0.1]",
    },
];

export const MOCK_TESTIMONIALS: Testimonial[] = [
    {
        id: "testi-1",
        name: "Minh Anh",
        role: "Sinh viên Công nghệ thông tin",
        avatarInitials: "MA",
        avatarColorIndex: 0,
        content:
            "Trước đây mình luyện bài rất ngẫu nhiên. Lộ trình của AlgoTutor giúp mình biết phần nào cần học trước và vì sao.",
        starRating: 5,
    },
    {
        id: "testi-2",
        name: "Hoàng Nam",
        role: "Frontend Developer",
        avatarInitials: "HN",
        avatarColorIndex: 1,
        content:
            "AI Tutor không ném đáp án ra ngay. Những câu hỏi gợi mở giúp mình tự nhận ra lỗi và nhớ cách làm lâu hơn.",
        starRating: 5,
    },
    {
        id: "testi-3",
        name: "Thu Trang",
        role: "Lập trình viên tự học",
        avatarInitials: "TT",
        avatarColorIndex: 2,
        content:
            "Mình không học chuyên ngành máy tính nên phần lý thuyết đi trước bài code rất hữu ích. Mình không còn bị ngợp khi gặp bài mới.",
        starRating: 5,
    },
    {
        id: "testi-4",
        name: "Đức Long",
        role: "Backend Developer",
        avatarInitials: "ĐL",
        avatarColorIndex: 3,
        content:
            "Phản hồi theo từng test case giúp mình phân biệt lỗi thuật toán với lỗi cài đặt, tiết kiệm rất nhiều thời gian debug.",
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
            "Absolutely. Your (dashboard) shows completion rates per topic, streaks, difficulty distribution, and hints consumed — giving you a clear picture of your strengths and areas to improve.",
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
    testimonials: MOCK_TESTIMONIALS,
    faqs: MOCK_FAQS,
    howItWorks: MOCK_HOW_IT_WORKS,
};

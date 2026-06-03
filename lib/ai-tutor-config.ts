import type { ElementType } from "react";
import {
    BotIcon,
    CheckIcon,
    Code2Icon,
    LightbulbIcon,
    MessageSquareIcon,
    SparklesIcon,
    TrendingUpIcon,
    ZapIcon,
} from "lucide-react";
import type { LessonContext } from "@/lib/types/lesson";

export interface QuickAction {
    label: string;
    intent?: string;
    mode: string;
    message: string;
    icon?: ElementType;
}

export interface TutorMode {
    id: string;
    label: string;
    icon: ElementType;
    tooltip: string;
}

const DEFAULT_MODE_BY_LESSON_TYPE: Record<LessonContext["lessonType"], string> = {
    CODING: "HINT",
    QUIZ: "EXPLAIN",
    THEORY: "EXPLAIN",
};

const LESSON_TYPE_DESCRIPTIONS: Record<LessonContext["lessonType"], string> = {
    CODING: "thử thách lập trình",
    QUIZ: "bài tập trắc nghiệm",
    THEORY: "bài học lý thuyết",
};

const CODING_QUICK_ACTIONS: QuickAction[] = [
    {
        label: "Gợi ý hướng giải",
        mode: "HINT",
        message:
            "Tôi đang bị bí bài này. Hãy cho tôi một gợi ý về hướng tiếp cận tối ưu mà không cho code giải.",
        icon: SparklesIcon,
    },
    {
        label: "Giải thích đề bài",
        mode: "EXPLAIN",
        message: "Hãy giải thích chi tiết yêu cầu đề bài và phân tích các ví dụ một cách dễ hiểu.",
        icon: LightbulbIcon,
    },
    {
        label: "Hướng dẫn debug",
        mode: "DEBUG",
        message:
            "Mã nguồn hiện tại của tôi đang gặp lỗi hoặc chưa tối ưu. Hãy hướng dẫn tôi cách dò lỗi từng bước.",
        icon: Code2Icon,
    },
    {
        label: "Phân tích độ phức tạp",
        mode: "COMPLEXITY",
        message: "Độ phức tạp thời gian và không gian tốt nhất cho bài toán này là bao nhiêu?",
        icon: TrendingUpIcon,
    },
];

const THEORY_QUICK_ACTIONS: QuickAction[] = [
    {
        label: "Tóm tắt trọng tâm",
        mode: "EXPLAIN",
        message:
            "Tóm tắt giúp tôi những kiến thức cốt lõi và quan trọng nhất trong bài học lý thuyết này.",
        icon: LightbulbIcon,
    },
    {
        label: "Cho ví dụ trực quan",
        mode: "EXPLAIN",
        message:
            "Hãy cho tôi một ví dụ thực tế sinh động hoặc một hình ảnh ẩn dụ dễ hiểu để dễ ghi nhớ khái niệm này.",
        icon: ZapIcon,
    },
    {
        label: "Ứng dụng thực tế",
        mode: "EXPLAIN",
        message:
            "Trong thực tế dự án, cấu trúc dữ liệu hoặc giải thuật này thường được dùng để giải quyết bài toán gì?",
        icon: TrendingUpIcon,
    },
    {
        label: "Đố vui ôn tập",
        mode: "NEXT_STEP",
        message: "Hãy đặt cho tôi 2-3 câu hỏi ngắn để tự kiểm tra xem tôi đã hiểu bài học này chưa.",
        icon: MessageSquareIcon,
    },
];

const QUIZ_QUICK_ACTIONS: QuickAction[] = [
    {
        label: "Trọng tâm kiến thức",
        mode: "EXPLAIN",
        message:
            "Tóm tắt ngắn gọn các chủ điểm lý thuyết chính liên quan mật thiết đến bộ câu hỏi trắc nghiệm này.",
        icon: LightbulbIcon,
    },
    {
        label: "Mẹo tránh bẫy",
        mode: "EXPLAIN",
        message:
            "Chia sẻ một vài mẹo hoặc lưu ý quan trọng để tránh bị bẫy khi làm các câu hỏi thuộc chủ đề này.",
        icon: ZapIcon,
    },
    {
        label: "Ví dụ minh họa",
        mode: "EXPLAIN",
        message: "Cho tôi một ví dụ cụ thể liên quan đến các câu hỏi lý thuyết của bài này.",
        icon: TrendingUpIcon,
    },
    {
        label: "Luyện thêm",
        mode: "NEXT_STEP",
        message: "Hãy đặt thêm một câu hỏi trắc nghiệm phụ liên quan để tôi thử sức củng cố kiến thức.",
        icon: MessageSquareIcon,
    },
];

const CODING_MODES: TutorMode[] = [
    {
        id: "HINT",
        label: "Gợi ý",
        icon: SparklesIcon,
        tooltip: "Gợi ý hướng giải từng bước",
    },
    {
        id: "EXPLAIN",
        label: "Giải thích",
        icon: LightbulbIcon,
        tooltip: "Giải thích đề bài và lý thuyết",
    },
    {
        id: "DEBUG",
        label: "Debug",
        icon: BotIcon,
        tooltip: "Dò lỗi và gỡ lỗi trong mã nguồn",
    },
    {
        id: "REVIEW",
        label: "Review",
        icon: CheckIcon,
        tooltip: "Đánh giá cấu trúc và chất lượng code",
    },
    {
        id: "COMPLEXITY",
        label: "Độ phức tạp",
        icon: TrendingUpIcon,
        tooltip: "Phân tích độ phức tạp thuật toán",
    },
];

const LEARNING_MODES: TutorMode[] = [
    {
        id: "EXPLAIN",
        label: "Giải thích",
        icon: LightbulbIcon,
        tooltip: "Giải thích lý thuyết và ví dụ",
    },
    {
        id: "NEXT_STEP",
        label: "Định hướng",
        icon: ZapIcon,
        tooltip: "Gợi mở bước học tập tiếp theo",
    },
];

export function getDefaultTutorMode(lessonType: LessonContext["lessonType"]): string {
    return DEFAULT_MODE_BY_LESSON_TYPE[lessonType];
}

export function getQuickActions(lessonType: LessonContext["lessonType"]): QuickAction[] {
    if (lessonType === "CODING") return CODING_QUICK_ACTIONS;
    if (lessonType === "THEORY") return THEORY_QUICK_ACTIONS;
    return QUIZ_QUICK_ACTIONS;
}

export function getAvailableModes(lessonType: LessonContext["lessonType"]): TutorMode[] {
    return lessonType === "CODING" ? CODING_MODES : LEARNING_MODES;
}

export function buildFallbackIntroMessage(
    context: Pick<LessonContext, "lessonTitle" | "lessonType" | "roadmapName">
): string {
    const typeLabel = LESSON_TYPE_DESCRIPTIONS[context.lessonType] || "bài học";

    return `Xin chào! Tôi là **AI Tutor**, trợ lý học tập cá nhân của bạn trong bài học **${context.lessonTitle}**.

Chúng ta đang ở lộ trình **${context.roadmapName}**, cùng tìm hiểu một ${typeLabel}.

Tôi có thể hỗ trợ bạn:
- Giải thích các khái niệm trọng tâm
- Gợi ý hướng giải từng bước, không đưa full code ngay
- Hỗ trợ debug mã nguồn hiện tại
- Phân tích độ phức tạp thuật toán
- Định hướng bước học tiếp theo

Hãy chọn chế độ phù hợp hoặc dùng hành động nhanh bên dưới để bắt đầu.`;
}

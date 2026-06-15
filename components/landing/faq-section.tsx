"use client";

import type {FaqItem} from "@/lib/types/landing";

export const MOCK_FAQS: FaqItem[] = [
    {
        id: "faq-1",
        question: "Mình cần biết lập trình đến mức nào để bắt đầu?",
        answer:
            "Bạn chỉ cần nắm cú pháp cơ bản của một ngôn ngữ lập trình. Các lộ trình nhập môn sẽ xây nền giải thuật từ đầu.",
        order: 1,
    },
    {
        id: "faq-2",
        question: "AI Tutor có đưa luôn đáp án không?",
        answer:
            "Không. AI Tutor ưu tiên câu hỏi gợi mở và gợi ý theo từng mức, dựa trên code và phạm vi kiến thức của bài học hiện tại.",
        order: 2,
    },
    {
        id: "faq-3",
        question: "AlgoTutor có miễn phí không?",
        answer:
            "Các trải nghiệm học cốt lõi gồm lộ trình, lý thuyết và bài tập đều có thể bắt đầu miễn phí.",
        order: 3,
    },
    {
        id: "faq-4",
        question: "Bài code được chấm như thế nào?",
        answer:
            "Mỗi bài được chạy qua bộ test case kiểm tra tính đúng đắn và các trường hợp biên. Bạn sẽ thấy phản hồi chi tiết cho từng kết quả.",
        order: 4,
    },
    {
        id: "faq-5",
        question: "Tiến độ học có được lưu lại không?",
        answer:
            "Có. Trang học lưu bài đã hoàn thành, tiến độ từng lộ trình và bài học gần nhất để bạn tiếp tục đúng chỗ.",
        order: 5,
    },
];

export function FaqSection() {
    return (
        <section id="faq" className="bg-muted/10 py-24 lg:py-32">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12 reveal-up">
                    <p className="mb-3 text-sm font-medium text-primary">Câu hỏi thường gặp</p>
                    <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                        Những điều bạn nên biết trước khi bắt đầu.
                    </h2>
                </div>

                <div className="space-y-1 reveal-up">
                    {MOCK_FAQS.map((faq) => (
                        <div
                            key={faq.id}
                            className="border border-border/50 rounded-xl overflow-hidden bg-card hover:border-primary/20 transition-colors"
                        >
                            <details className="group">
                                <summary
                                    className="flex items-center justify-between cursor-pointer p-5 list-none select-none">
                                    <span className="font-medium text-sm pr-4">{faq.question}</span>
                                    <svg
                                        className="size-4 text-muted-foreground shrink-0 transition-transform duration-200 group-open:rotate-90"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                                    </svg>
                                </summary>
                                <div className="px-5 pb-5">
                                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                                </div>
                            </details>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

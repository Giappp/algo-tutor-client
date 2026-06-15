"use client";

import {getIcon} from "@/lib/lucide-icons";
import type {HowItWorksStep} from "@/lib/types/landing";

export const MOCK_HOW_IT_WORKS: HowItWorksStep[] = [
    {
        id: "step-1",
        stepNumber: "01",
        title: "Hiểu trước khi code",
        description:
            "Đọc giải thích trực quan và pseudocode để hình thành mô hình tư duy trước khi viết code.",
        iconKey: "BookOpen",
    },
    {
        id: "step-2",
        stepNumber: "02",
        title: "Tự giải và nhận phản hồi",
        description:
            "Làm bài đúng phạm vi kiến thức vừa học và xem kết quả chi tiết theo từng test case.",
        iconKey: "Code2",
    },
    {
        id: "step-3",
        stepNumber: "03",
        title: "Gỡ vướng cùng AI Tutor",
        description:
            "Khi bị kẹt, AI đọc code hiện tại và đặt câu hỏi gợi mở để bạn tự đi tiếp.",
        iconKey: "Lightbulb",
    },
];

export function HowItWorksSection() {
    // const {data: steps, isLoading} = useLandingData<HowItWorksStep[]>("/landing/how-it-works");

    return (
        <section id="how-it-works" className="py-24 lg:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-16 max-w-2xl reveal-up">
                    <p className="mb-3 text-sm font-medium text-primary">Cách AlgoTutor hoạt động</p>
                    <h2 className="mb-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                        Một nhịp học đơn giản để tiến bộ đều.
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Mỗi bài học đều đưa bạn qua ba bước, đủ hướng dẫn nhưng vẫn giữ phần tư duy quan trọng cho bạn.
                    </p>
                </div>

                <div className="relative">
                    <div
                        className="hidden lg:block absolute top-16 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-transparent via-border to-transparent"/>

                    <div className="grid gap-5 lg:grid-cols-3 lg:gap-8">
                        {MOCK_HOW_IT_WORKS.map((step, i) => {
                            const Icon = getIcon(step.iconKey);
                            return (
                                <div
                                    key={step.id}
                                    className="relative flex flex-col rounded-2xl border border-border/60 bg-card p-7 reveal-up"
                                    style={{transitionDelay: `${i * 120}ms`}}
                                >
                                    <div className="relative mb-8">
                                        <div
                                            className="size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                            <Icon className="size-7 text-primary"/>
                                        </div>
                                        <div
                                            className="absolute -top-2 -right-2 size-6 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold flex items-center justify-center">
                                            {step.stepNumber}
                                        </div>
                                    </div>
                                    <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
                                    <p className="max-w-xs leading-7 text-muted-foreground">{step.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

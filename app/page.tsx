import type {Metadata} from "next";
import {LandingPageClient} from "@/components/landing/landing-page-client";

export const metadata: Metadata = {
    title: "AlgoTutor | Học thuật toán theo lộ trình cùng AI Tutor",
    description:
        "Học thuật toán có thứ tự qua lý thuyết, bài tập chấm tự động và AI Tutor gợi ý theo ngữ cảnh.",
};

export default function Home() {
    return <LandingPageClient/>;
}

"use client";

import { ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CtaBanner() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-dotgrid opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/15 orb-primary rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 reveal-up">
        <div className="overflow-hidden rounded-3xl bg-foreground px-6 py-12 text-background shadow-2xl shadow-primary/10 sm:px-12 sm:py-16">
        <p className="mb-5 text-sm font-medium text-primary">Bắt đầu từ bài học phù hợp</p>
        <h2 className="mb-6 max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
          Đừng luyện thêm một bài ngẫu nhiên. Hãy xây nền tảng có thứ tự.
        </h2>
        <p className="mb-9 max-w-xl text-lg leading-8 text-background/65">
          Chọn một lộ trình, hoàn thành bài đầu tiên và để AlgoTutor giúp bạn giữ nhịp học.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="lg" className="h-12 gap-2 px-8 text-base" asChild>
            <Link href="/auth?tab=signup">
              Tạo tài khoản miễn phí
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <span className="flex items-center gap-2 text-sm text-background/60">
            <Lock className="size-4" />
            Không cần thẻ thanh toán
          </span>
        </div>
        </div>
      </div>
    </section>
  );
}

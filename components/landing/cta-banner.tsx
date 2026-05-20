"use client";

import { ArrowRight, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-dotgrid opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/15 orb-primary rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal-up">
        <Badge variant="secondary" className="mb-6 text-sm">
          Bắt đầu ngay
        </Badge>
        <h2 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
          Bài toán đầu tiên chỉ cách bạn
          <br />
          <span className="text-gradient">một cú click</span>
        </h2>
        <p className="text-muted-foreground text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
          Tham gia cùng hàng nghìn học viên đang chinh phục thuật toán một cách có hệ thống. Hoàn toàn miễn phí.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" className="gap-2 text-base px-8 h-12 glow-border">
            Bắt đầu hành trình
            <ArrowRight className="size-4" />
          </Button>
          <Button variant="outline" size="lg" className="gap-2 text-base px-8 h-12">
            <Lock className="size-4" />
            Miễn phí mãi mãi
          </Button>
        </div>
      </div>
    </section>
  );
}

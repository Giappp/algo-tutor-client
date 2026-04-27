"use client";

import { useLandingData } from "@/hooks";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { FaqItem } from "@/lib/types/landing";

export function FaqSection() {
  const { data: faqs, isLoading } = useLandingData<FaqItem[]>("/landing/faqs");
  const sorted = faqs ? [...faqs].sort((a, b) => a.order - b.order) : [];

  return (
    <section id="pricing" className="py-24 lg:py-32 bg-muted/10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 reveal-up">
          <Badge variant="secondary" className="text-xs mb-3">
            FAQ
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Common questions
          </h2>
        </div>

        <div className="space-y-1 reveal-up">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="border border-border/50 rounded-xl overflow-hidden bg-card"
                >
                  <div className="p-5 flex items-center justify-between">
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="size-4 rounded" />
                  </div>
                </div>
              ))
            : sorted.map((faq) => (
                <div
                  key={faq.id}
                  className="border border-border/50 rounded-xl overflow-hidden bg-card hover:border-primary/20 transition-colors"
                >
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer p-5 list-none select-none">
                      <span className="font-medium text-sm pr-4">{faq.question}</span>
                      <svg
                        className="size-4 text-muted-foreground shrink-0 transition-transform duration-200 group-open:rotate-90"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
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

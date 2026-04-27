"use client";

import { useLandingData } from "@/hooks";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { Testimonial } from "@/lib/types/landing";

const AVATAR_GRADIENTS = [
  "from-primary to-[oklch(0.65_0.15_340)]",
  "from-[oklch(0.7_0.18_85)] to-[oklch(0.65_0.15_340)]",
  "from-[oklch(0.6_0.18_180)] to-primary",
  "from-[oklch(0.65_0.15_340)] to-[oklch(0.7_0.18_250)]",
];

export function TestimonialsSection() {
  const { data: testimonials, isLoading } = useLandingData<Testimonial[]>("/landing/testimonials");

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 reveal-up">
          <Badge variant="secondary" className="text-xs mb-3">
            Testimonials
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Loved by learners everywhere
          </h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of students who&apos;ve transformed their algorithmic thinking.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border-border/50">
                  <CardContent className="p-5 space-y-4">
                    <Skeleton className="h-4 w-24" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            : testimonials?.map((t, i) => (
                <Card
                  key={t.id}
                  className="border-border/50 reveal-up hover:shadow-md transition-all duration-300"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <CardContent className="p-5 space-y-4">
                    {/* Stars */}
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.starRating }).map((_, j) => (
                        <svg key={j} className="size-3.5 text-[oklch(0.7_0.18_85)] fill-current" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>

                    <p className="text-sm text-foreground leading-relaxed">&quot;{t.content}&quot;</p>

                    <Separator />

                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "size-8 rounded-full bg-gradient-to-br flex items-center justify-center text-xs font-bold text-primary-foreground",
                          AVATAR_GRADIENTS[t.avatarColorIndex % AVATAR_GRADIENTS.length]
                        )}
                      >
                        {t.avatarInitials}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>
      </div>
    </section>
  );
}

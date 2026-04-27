"use client";

import { useLandingData } from "@/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getIcon } from "@/lib/lucide-icons";
import { Skeleton } from "@/components/ui/skeleton";
import type { Feature } from "@/lib/types/landing";
import { Badge } from "@/components/ui/badge";

export function FeaturesSection() {
  const { data: features, isLoading, error } = useLandingData<Feature[]>("/landing/features");

  return (
    <section id="features" className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4 reveal-up">
          <Badge variant="secondary" className="text-xs">
            Platform Features
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Everything you need to{" "}
            <span className="text-gradient">become a problem solver</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            A thoughtfully designed learning system that keeps you focused, challenged, and supported at every step.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border-border/50">
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="size-12 rounded-xl" />
                    <Skeleton className="h-5 w-32" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))
            : features?.map((feature, i) => {
                const Icon = getIcon(feature.iconKey);
                return (
                  <Card
                    key={feature.id}
                    className={cn(
                      "group border-border/50 bg-card hover:bg-muted/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-md reveal-up"
                    )}
                    style={{ transitionDelay: `${i * 80}ms` }}
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className={cn("size-12 rounded-xl flex items-center justify-center", feature.bgToken)}>
                        <Icon className={cn("size-6", feature.colorToken)} />
                      </div>
                      <h3 className="font-semibold text-lg">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
          {error && (
            <p className="col-span-full text-center text-muted-foreground text-sm">
              Failed to load features. Please try again later.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

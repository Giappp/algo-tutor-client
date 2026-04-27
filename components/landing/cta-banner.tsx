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
        <Badge variant="secondary" className="mb-6 text-xs">
          Start Today
        </Badge>
        <h2 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
          Your first problem is
          <br />
          <span className="text-gradient">one click away</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Join 50,000+ learners who are mastering algorithms the structured, intelligent way. No credit card required.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" className="gap-2 text-base px-8 h-12 glow-border">
            Begin Your Journey
            <ArrowRight className="size-4" />
          </Button>
          <Button variant="outline" size="lg" className="gap-2 text-base px-8 h-12">
            <Lock className="size-4" />
            Free Forever
          </Button>
        </div>
      </div>
    </section>
  );
}

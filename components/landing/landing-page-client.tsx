"use client";

/**
 * LandingPageClient — orchestrates all landing page sections.
 * Each section component independently fetches its own data via SWR.
 * No props needed — all data fetching is co-located with the components that use it.
 */

import { useScrollReveal } from "@/hooks";
import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { TickerBar } from "@/components/landing/ticker-bar";
import { FeaturesSection } from "@/components/landing/features-section";
import { RoadmapsSection } from "@/components/landing/roadmaps-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { CodeDemoSection } from "@/components/landing/code-demo-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { FaqSection } from "@/components/landing/faq-section";
import { CtaBanner } from "@/components/landing/cta-banner";
import { Footer } from "@/components/landing/footer";

export function LandingPageClient() {
  const sectionRef = useScrollReveal();

  return (
    <main ref={sectionRef} className="min-h-screen">
      <Navbar />
      <HeroSection />
      <TickerBar />
      <FeaturesSection />
      <RoadmapsSection />
      <HowItWorksSection />
      <CodeDemoSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaBanner />
      <Footer />
    </main>
  );
}

"use client";

import { Braces, MessageSquare, Rss, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  Product: ["Roadmaps", "Problems", "AI Tutor", "Progress", "Pricing"],
  Company: ["About", "Blog", "Careers", "Press"],
  Resources: ["Documentation", "Community", "Support", "Contact"],
  Legal: ["Privacy", "Terms", "Cookie Policy", "Security"],
};

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                <Braces className="size-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg tracking-tight">
                Algo<span className="text-primary">Tutor</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              The intelligent platform for mastering algorithms through structured roadmaps, hands-on practice, and context-aware AI guidance.
            </p>
            <div className="flex gap-3 pt-2">
              {[
                { Icon: Rss, label: "Blog" },
                { Icon: MessageSquare, label: "Community" },
                { Icon: Users, label: "Team" },
              ].map(({ Icon, label }) => (
                <Button
                  key={label}
                  variant="ghost"
                  size="icon-xs"
                  className="size-8"
                  aria-label={label}
                >
                  <Icon className="size-4 text-muted-foreground" />
                </Button>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group} className="space-y-3">
              <h4 className="text-sm font-semibold">{group}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>2026 AlgoTutor. All rights reserved.</p>
          <p>Built with care for aspiring engineers everywhere.</p>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { Braces } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const footerLinks = [
  {label: "Lộ trình", href: "/roadmaps"},
  {label: "Cách học", href: "#how-it-works"},
  {label: "AI Tutor", href: "#ai-tutor"},
  {label: "Hỏi đáp", href: "#faq"},
];

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/10 pb-8 pt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col justify-between gap-10 md:flex-row md:items-start">
          <div className="max-w-md space-y-4">
            <Link href="/" className="flex w-fit items-center gap-2">
              <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                <Braces className="size-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg tracking-tight">
                Algo<span className="text-primary">Tutor</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Học thuật toán có thứ tự qua lý thuyết, bài tập thực hành và trợ giảng AI hiểu ngữ cảnh.
            </p>
          </div>

          <nav aria-label="Điều hướng chân trang">
            <ul className="flex flex-wrap gap-x-6 gap-y-3">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <Separator className="mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 AlgoTutor. Bảo lưu mọi quyền.</p>
          <p>Được xây dựng cho người học muốn hiểu sâu hơn.</p>
        </div>
      </div>
    </footer>
  );
}

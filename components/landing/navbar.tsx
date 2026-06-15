"use client";

import {useEffect, useState} from "react";
import {Braces, Menu, X} from "lucide-react";
import {cn} from "@/lib/utils";
import {ThemeToggle} from "@/components/theme-toggle";
import CtaButton from "@/components/landing/cta-button";
import Link from "next/link";

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handler, {passive: true});
        return () => window.removeEventListener("scroll", handler);
    }, []);

    const navLinks = [
        {label: "Lộ trình", href: "#roadmaps"},
        {label: "Cách học", href: "#how-it-works"},
        {label: "AI Tutor", href: "#ai-tutor"},
        {label: "Hỏi đáp", href: "#faq"},
    ];

    return (
        <nav
            aria-label="Điều hướng chính"
            className={cn(
                "fixed inset-x-0 top-0 z-50 transition-all duration-300",
                scrolled
                    ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
                    : "bg-transparent"
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2 group" aria-label="AlgoTutor - Trang chủ">
                        <div
                            className="size-8 rounded-lg bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Braces className="size-4 text-primary-foreground"/>
                        </div>
                        <span className="font-bold text-lg tracking-tight">
                            Algo<span className="text-primary">Tutor</span>
                        </span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="hidden md:flex items-center gap-2">
                        <ThemeToggle/>
                        <CtaButton/>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 rounded-md hover:bg-muted"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? <X className="size-5"/> : <Menu className="size-5"/>}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="md:hidden py-4 border-t border-border/50 bg-background/95 backdrop-blur-xl">
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                                onClick={() => setMobileOpen(false)}
                            >
                                {link.label}
                            </a>
                        ))}
                        <div className="flex items-center gap-2 mt-4 px-3">
                            <ThemeToggle/>
                            <CtaButton/>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

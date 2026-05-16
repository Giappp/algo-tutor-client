"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface RevealOnScrollProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    direction?: "up" | "down" | "left" | "right" | "scale";
    once?: boolean;
}

export function RevealOnScroll({
    children,
    className,
    delay = 0,
    direction = "up",
    once = true,
}: RevealOnScrollProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    if (once) observer.unobserve(el);
                } else if (!once) {
                    setVisible(false);
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [once]);

    return (
        <div
            ref={ref}
            className={cn("transition-all duration-500 ease-out", className)}
            style={{
                transitionDelay: `${delay}ms`,
                opacity: visible ? 1 : 0,
                transform: getTransform(direction, visible),
            }}
        >
            {children}
        </div>
    );
}

function getTransform(direction: string, visible: boolean): string {
    if (visible) return "translateY(0) translateX(0) scale(1)";

    const transforms: Record<string, string> = {
        up: "translateY(20px)",
        down: "translateY(-20px)",
        left: "translateX(20px)",
        right: "translateX(-20px)",
        scale: "scale(0.92)",
    };
    return transforms[direction] ?? "translateY(20px)";
}

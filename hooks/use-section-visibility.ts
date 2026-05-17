"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Tracks how many sections within a container element have been scrolled into view.
 * Uses IntersectionObserver to detect when section elements enter the viewport.
 * Calls onComplete() when at least threshold (default 0.9) of sections have been visible.
 */
export function useSectionVisibility(
    containerRef: React.RefObject<HTMLElement | null>,
    sectionSelector: string = "h1, h2, h3, h4, p, pre, table, blockquote, ul, ol",
    threshold: number = 0.9,
    onComplete?: () => void
): {
    visibleSectionCount: number;
    totalSectionCount: number;
    percentVisible: number;
} {
    const [visibleSectionCount, setVisibleSectionCount] = useState(0);
    const [totalSectionCount, setTotalSectionCount] = useState(0);
    const completedRef = useRef(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const computePercent = useCallback((visible: number, total: number) => {
        if (total === 0) return 0;
        return visible / total;
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const sections = Array.from(
            container.querySelectorAll<HTMLElement>(sectionSelector)
        );
        setTotalSectionCount(sections.length);

        if (sections.length === 0) return;

        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        const observedSet = new Set<Element>();

        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        observedSet.add(entry.target);
                    }
                });
                setVisibleSectionCount(observedSet.size);

                const percent = computePercent(observedSet.size, sections.length);
                if (percent >= threshold && !completedRef.current) {
                    completedRef.current = true;
                    onComplete?.();
                }
            },
            {
                root: container,
                rootMargin: "0px 0px -10% 0px",
                threshold: 0,
            }
        );

        sections.forEach((section) => {
            observerRef.current?.observe(section);
        });

        return () => {
            observerRef.current?.disconnect();
        };
    }, [containerRef, sectionSelector, threshold, onComplete, computePercent]);

    return {
        visibleSectionCount,
        totalSectionCount,
        percentVisible: computePercent(visibleSectionCount, totalSectionCount),
    };
}

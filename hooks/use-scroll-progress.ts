"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Tracks how much of the content within a container element has been scrolled.
 * Returns a value from 0 to 1 representing the percentage scrolled.
 */
export function useScrollProgress(containerRef: React.RefObject<HTMLElement | null>): number {
    const [progress, setProgress] = useState(0);

    const handleScroll = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;

        const { scrollTop, scrollHeight, clientHeight } = el;
        const maxScroll = scrollHeight - clientHeight;

        if (maxScroll <= 0) {
            setProgress(1);
            return;
        }

        setProgress(Math.min(1, scrollTop / maxScroll));
    }, [containerRef]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        el.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => el.removeEventListener("scroll", handleScroll);
    }, [containerRef, handleScroll]);

    return progress;
}

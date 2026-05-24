"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseTimerOptions {
    /** If true, timer starts paused and must be started manually via `start()`. Default: false */
    startPaused?: boolean;
}

export function useTimer({ startPaused = false }: UseTimerOptions = {}) {
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(!startPaused);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning]);

    const start = useCallback(() => setIsRunning(true), []);
    const stop = useCallback(() => setIsRunning(false), []);
    const toggle = useCallback(() => setIsRunning((r) => !r), []);
    const reset = useCallback(() => {
        setSeconds(0);
        setIsRunning(!startPaused);
    }, [startPaused]);

    const fmt = (s: number) =>
        `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

    return { seconds, formatted: fmt(seconds), isRunning, start, stop, toggle, reset };
}

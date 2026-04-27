"use client";

import { useEffect, useRef } from "react";

/**
 * useScrollReveal — attaches an IntersectionObserver to a root element
 * and adds the `.visible` class to all `.reveal-up` descendants when
 * they enter the viewport. CSS handles the actual animation via the
 * `.reveal-up` / `.reveal-up.visible` transition.
 */
export function useScrollReveal() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.08 }
    );

    el.querySelectorAll<HTMLElement>(".reveal-up").forEach((t) => obs.observe(t));
    return () => obs.disconnect();
  }, []);

  return ref;
}

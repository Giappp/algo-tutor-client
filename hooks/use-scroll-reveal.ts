"use client";

import { useEffect, useRef } from "react";

const REVEAL_SELECTOR = ".reveal-up";

/**
 * useScrollReveal — attaches an IntersectionObserver to a root element
 * and adds the `.visible` class to `.reveal-up` descendants when they
 * enter the viewport. A MutationObserver also registers elements rendered
 * later by SWR or other async data sources.
 */
export function useScrollReveal() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const show = (element: Element) => {
      element.classList.add("visible");
    };

    const showAll = () => {
      root.querySelectorAll(REVEAL_SELECTOR).forEach(show);
    };

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      showAll();

      const fallbackObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (!(node instanceof Element)) return;
            if (node.matches(REVEAL_SELECTOR)) show(node);
            node.querySelectorAll(REVEAL_SELECTOR).forEach(show);
          });
        });
      });

      fallbackObserver.observe(root, {childList: true, subtree: true});
      return () => fallbackObserver.disconnect();
    }

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            show(entry.target);
            intersectionObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -5% 0px",
      }
    );

    const observe = (element: Element) => {
      if (element.matches(REVEAL_SELECTOR) && !element.classList.contains("visible")) {
        intersectionObserver.observe(element);
      }

      element.querySelectorAll(REVEAL_SELECTOR).forEach((child) => {
        if (!child.classList.contains("visible")) {
          intersectionObserver.observe(child);
        }
      });
    };

    observe(root);

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            observe(node);
          }
        });
      });
    });

    mutationObserver.observe(root, {childList: true, subtree: true});

    return () => {
      mutationObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, []);

  return ref;
}

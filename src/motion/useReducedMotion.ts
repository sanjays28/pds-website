"use client";

import { useLayoutEffect, useState } from "react";

/**
 * WMS §9.3 — "Reduced-Motion Mode (first-class)". Every animated component
 * reads this (or relies on the global CSS fallback in globals.css) instead
 * of skipping the check. SSR-safe: starts `false` and syncs on mount so it
 * never mismatches between server and client render.
 *
 * Uses useLayoutEffect (not useEffect) so that when a consumer's own
 * useLayoutEffect sets up GSAP, React has already flushed the corrected
 * value first (layout effects run bottom-up, and a state update inside one
 * forces a synchronous re-render before paint) — this avoids a frame of
 * GSAP hiding content that reduced-motion should have kept static.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useLayoutEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

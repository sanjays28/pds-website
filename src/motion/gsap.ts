"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Central GSAP setup. Import `gsap` from here (not directly from the
 * "gsap" package) so ScrollTrigger is registered exactly once, and so any
 * future shared config (e.g. a lag-smoothing tweak) lives in one place
 * instead of being repeated per component (WMS §9.4 performance rules).
 */
let registered = false;
export function ensureGsapRegistered() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export { gsap, ScrollTrigger };

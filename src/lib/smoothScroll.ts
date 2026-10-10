import type Lenis from "lenis";

/**
 * Tiny bridge so components can scroll programmatically without owning the
 * Lenis instance: SmoothScroll registers it, anything else calls scrollToY.
 * Falls back to native smooth scroll when Lenis isn't running (touch devices),
 * and jumps instantly under prefers-reduced-motion.
 */
let lenis: Lenis | null = null;

export function registerLenis(instance: Lenis | null) {
  lenis = instance;
}

export function scrollToY(y: number) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    window.scrollTo({ top: y, behavior: "auto" });
  } else if (lenis) {
    lenis.scrollTo(y, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 3) });
  } else {
    window.scrollTo({ top: y, behavior: "smooth" });
  }
}

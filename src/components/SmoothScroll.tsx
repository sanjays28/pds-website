"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { ensureGsapRegistered, gsap, ScrollTrigger } from "@/motion/gsap";
import { useReducedMotion } from "@/motion/useReducedMotion";

/**
 * Lenis smooth scroll — locked stack (WMS §14.1): "desktop, off under
 * reduced-motion". Also skipped on touch/coarse-pointer devices: Lenis's
 * momentum scroll fights native touch scrolling and isn't part of the
 * WMS's stated scope ("desktop" only) — flagged rather than guessed at
 * whether tablets should get it too.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (isCoarsePointer) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });

    ensureGsapRegistered();
    lenis.on("scroll", ScrollTrigger.update);
    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, [reduced]);

  return <>{children}</>;
}

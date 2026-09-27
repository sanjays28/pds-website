"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "@/motion/useReducedMotion";

/**
 * ScrollRail — WMS motion **M03** ("Route rail + rider marker: journey =
 * scroll"). Ported from proven-coming-soon.html's `.rail`/`.rail-fill`/
 * `.rail-rider`: a thin line fixed near the left edge that fills green
 * top-to-bottom as the whole page scrolls, with a rider icon riding down
 * it at the same percentage — a page-wide progress indicator in the
 * brand's own visual language.
 *
 * The registry's own fallback for M03 is "hidden on mobile; RM: hidden" —
 * followed exactly here, even though the reference file itself left the
 * rail running unconditionally under `prefers-reduced-motion` (its CSS
 * reduced-motion block never mentions `.rail`). The WMS motion table is
 * the tie-breaker over the reference implementation when the two
 * disagree, per how this build has treated the two documents throughout.
 * Mobile hiding is CSS-only (`@media (min-width:1024px)`), matching the
 * source — the scroll listener itself is cheap enough to leave running
 * underneath rather than JS-gating it by viewport width too.
 */
export function ScrollRail() {
  const fillRef = useRef<HTMLDivElement>(null);
  const riderRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (fillRef.current) fillRef.current.style.height = `${p * 100}%`;
      if (riderRef.current) riderRef.current.style.top = `${p * 100}%`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced]);

  if (reduced) return null;

  return (
    <div className="rail" aria-hidden="true">
      <div ref={fillRef} className="rail-fill" />
      <div ref={riderRef} className="rail-rider">
        <Image src="/rider.png" alt="" width={34} height={34} aria-hidden="true" />
      </div>
    </div>
  );
}

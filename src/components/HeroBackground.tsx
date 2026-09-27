"use client";

import { useEffect, useState } from "react";
import { EmeraldHorizonBackground } from "@designcodeio/threeui/components/EmeraldHorizonBackground";
import { useReducedMotion } from "@/motion/useReducedMotion";

/**
 * HeroBackground — the hero's atmospheric backdrop, replacing the old flat
 * CSS `.night-road` block with a real Three.js shader (ThreeUI's
 * "EmeraldHorizonBackground"): a glowing horizon line rising from the
 * bottom of the frame. It's already green-on-near-black out of the box —
 * no red/blue/violet demo palette to strip — and reads as atmosphere
 * (a distant glow, like a road's light pollution at night) rather than a
 * literal 3D object, matching the brief.
 *
 * Sits at the same z-index:0 layer the old night-road occupied, behind
 * `.hero-grid` (headline/rider/CTAs, z-index:1) — nothing about that
 * content changes.
 *
 * Gating (all per the brief):
 * - `prefers-reduced-motion`: renders nothing at all (JS-level, backed by
 *   a `display:none` CSS fallback in globals.css for the render before
 *   this hook's first effect flush — see useReducedMotion's own comment).
 * - Coarse pointer / narrow viewport ("mobile GPUs"): renders a static
 *   CSS gradient instead of mounting a WebGL context at all — zero GPU
 *   cost, not just a "lighter" shader.
 * - Tab visibility + off-screen pausing: NOT handled here — the shader
 *   component itself already checks `document.hidden` inside its RAF loop
 *   and pauses via an internal IntersectionObserver when the hero scrolls
 *   out of view. Re-implementing that here would be a redundant one-off.
 */
export function HeroBackground() {
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<"pending" | "full" | "static" | "off">("pending");

  useEffect(() => {
    if (reduced) {
      setMode("off");
      return;
    }
    const isSmallOrTouch = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    setMode(isSmallOrTouch ? "static" : "full");
  }, [reduced]);

  if (mode === "pending" || mode === "off") return null;

  return (
    <div className="hero-threeui" aria-hidden="true">
      {mode === "full" ? (
        <EmeraldHorizonBackground
          className="hero-threeui-canvas"
          speed={0.55}
          waveScale={0.8}
          variation={0.6}
          glow={0.5}
          vignette={1.15}
          hue={0}
        />
      ) : (
        <div className="hero-threeui-static" />
      )}
      <div className="hero-threeui-scrim" />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { PredictiveArcCanvas } from "@designcodeio/threeui/components/PredictiveArcCanvas";
import { useReducedMotion } from "@/motion/useReducedMotion";

/**
 * HeroBackground — the hero's atmospheric backdrop.
 *
 * Replaced EmeraldHorizonBackground with ThreeUI's PredictiveArcCanvas,
 * "data-pixel" variant ("Data Pixel Arc" — an emerald pixel horizon with
 * an organic breathing band), mounted with the exact configured usage:
 * `variant="data-pixel" mode="dark" speed={1} hue={0} saturation={1}
 * brightness={1}` — i.e. the component's own authored defaults, not a
 * custom retune. It's Canvas 2D underneath (confirmed by reading
 * node_modules/@designcodeio/threeui's actual renderer source — no
 * WebGL/Three.js in this variant at all, unlike EmeraldHorizonBackground),
 * so this is also lighter on the bundle than the previous effect.
 *
 * Sits at the same z-index:0 layer behind `.hero-grid` (headline/rider/
 * CTAs, z-index:1) — nothing about that content changes.
 *
 * Gating (unchanged from the EmeraldHorizonBackground integration; these
 * are integration-level decisions around the authored component, not a
 * modification of it):
 * - `prefers-reduced-motion`: renders nothing at all (JS-level, backed by
 *   the existing `.hero-threeui{display:none!important}` CSS fallback).
 * - Coarse pointer / narrow viewport: renders a static CSS gradient
 *   instead of mounting a canvas at all.
 * - Tab visibility + off-screen pausing: not reimplemented here — the
 *   component already checks `document.hidden` inside its RAF loop, adds
 *   its own `visibilitychange` listener as a second safety net, and pauses
 *   via an internal IntersectionObserver when the hero scrolls out of
 *   view (all confirmed by reading the actual shipped source).
 *
 * No custom CSS filter/recolor is layered on top this time (previously
 * there was a `!important` hue-rotate/saturate/brightness override) —
 * the exact configured props already control the canvas's own filter, and
 * the brief for this pass is to use that configuration as authored rather
 * than approximate/retune it.
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
        <PredictiveArcCanvas
          className="hero-threeui-canvas"
          variant="data-pixel"
          mode="dark"
          speed={1}
          hue={0}
          saturation={1}
          brightness={1}
        />
      ) : (
        <div className="hero-threeui-static" />
      )}
      <div className="hero-threeui-scrim" />
    </div>
  );
}

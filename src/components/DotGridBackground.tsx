"use client";

import { useEffect, useState } from "react";
import { DotMatrixBackground } from "@designcodeio/threeui/components/DotMatrixBackground";
import { useReducedMotion } from "@/motion/useReducedMotion";

/**
 * DotGridBackground — ThreeUI's StructureFlowCollection, "dot-matrix"
 * variant, imported directly via its own subpath (skipping the
 * StructureFlowCollection dispatcher entirely, since we only ever want
 * this one variant — smallest import graph, same convention as every
 * other ThreeUI piece in this build).
 *
 * A grid of dots whose radius pulses via a sine wave offset by grid
 * position (so the pulse ripples across the grid rather than blinking in
 * unison), with a radial depth-fade vignette and a faint pointer-driven
 * parallax drift.
 *
 * Retuned down from the authored defaults after a visual pass: at
 * gridScale 60 / radius 0.15 / opacity 0.35 it read as a dense, high-
 * contrast grid competing directly with the route timeline's text, not
 * atmosphere behind it. Fewer, smaller, dimmer dots (below), plus a flat
 * scrim wash (`.dot-grid-scrim`) since the timeline's stops zigzag across
 * the full width — unlike the hero, there's no single side to protect
 * with a directional gradient.
 *
 * Color: the shader hardcodes cyan; recolored to the brand green via the
 * component's own `hue` prop (a CSS hue-rotate under the hood). -89° is
 * an eyeballed/color-math approximation (cyan ~189° → brand green ~100°),
 * not an official mapping — nudge it if it doesn't read as green enough
 * once actually visible.
 *
 * Placement: behind the "How It Works" / RouteTimeline section, passed
 * through Section's `background` slot. That section has real body text
 * at each stop (unlike the FAQ/Contact gutter the laser blade sat in), so
 * this keeps the same readability guardrails used for the hero:
 * - prefers-reduced-motion: renders nothing (no internal handling in the
 *   component itself, unlike LaserCollection, so this is a from-scratch
 *   gate, same shape as HeroBackground's).
 * - Coarse pointer / narrow viewport: static CSS gradient instead of a
 *   WebGL context — this one wasn't asked to skip that guardrail the way
 *   the last placement question offered as an option, so it's kept.
 */
export function DotGridBackground() {
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
    <div className="dot-grid-bg" aria-hidden="true">
      {mode === "full" ? (
        <DotMatrixBackground
          className="dot-grid-canvas"
          speed={0.6}
          gridScale={34}
          mouseAmount={0.04}
          pulseSpeed={0.4}
          hue={-89}
          radius={0.08}
          opacity={0.14}
        />
      ) : (
        <div className="dot-grid-static" />
      )}
      <div className="dot-grid-scrim" />
    </div>
  );
}

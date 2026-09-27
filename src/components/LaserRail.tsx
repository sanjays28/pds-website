"use client";

import { LaserCollection } from "@designcodeio/threeui/components/LaserCollection";
import { useReducedMotion } from "@/motion/useReducedMotion";

/**
 * LaserRail — ThreeUI's LaserCollection, "atmospheric-blade" variant: a
 * raw-WebGL glowing beam (drifts slightly with pointer position) wrapped
 * in procedural vapor and a fainter "mirage" rail. Not one of the WMS's
 * original 20 registered motion IDs — nothing in that table describes a
 * pointer-reactive beam — so this is a new, unregistered addition rather
 * than a forced fit to an existing one; flag if it should get a formal
 * registry row once its placement is confirmed to stick.
 *
 * Placement: fills the empty right-hand gutter that opens up next to the
 * FAQ accordion (max-width 760px) and the contact form (max-width 720px)
 * once the page is wide enough for that gutter to actually read as a
 * column rather than a sliver — see .laser-rail's breakpoint in
 * globals.css. It's a decorative background layer (z-index below both
 * sections' own content), not a foreground element, so it never sits
 * over the accordion or the form.
 *
 * Mounted with the exact configured usage from the brief (all defaults):
 * variant="atmospheric-blade" speed={1} size={1} length={1} density={1}
 * opacity={1} hue={0} saturation={1} brightness={1}.
 *
 * Reduced motion: the component has its own internal handling (freezes
 * to one static, non-animated frame rather than unmounting), but this
 * project's house rule has been "fully hidden, not just static" for
 * every other effect (CursorTrail, ScrollRail, the hero background) —
 * kept consistent here by not rendering it at all under reduced motion,
 * overriding rather than trusting the component's own built-in fallback.
 */
export function LaserRail() {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <LaserCollection
      className="laser-rail"
      variant="atmospheric-blade"
      speed={1}
      size={1}
      length={1}
      density={1}
      opacity={1}
      hue={0}
      saturation={1}
      brightness={1}
    />
  );
}

/**
 * tokens.ts — single source of design tokens.
 * WMS §12.1 "Design Tokens". Tailwind's theme (globals.css `@theme inline`)
 * extends from these values so there is exactly one place that defines the
 * brand's color/radius/space/z-index scale.
 *
 * Do not hand-write hex values or magic z-indexes anywhere else in the app —
 * import from here (or the matching Tailwind utility class once wired).
 */
export const tokens = {
  color: {
    black: "#0D0D0D", // world
    panel: "#141414", // elevation 1
    panel2: "#181818", // elevation 2
    line: "#1F1F1F", // hairline borders
    line2: "#2A2A2A", // interactive borders
    green: "#6CC04A", // ignition — actions, live, progress
    green120: "#7DD65B", // hover brighten
    green80: "#57A03C", // pressed
    greenDim: "rgba(108,192,74,.14)", // fills/washes
    greenGlow: "rgba(108,192,74,.35)", // light effects
    white: "#FFFFFF",
    w70: "rgba(255,255,255,.70)",
    w40: "rgba(255,255,255,.40)",
    w20: "rgba(255,255,255,.18)",
    // Errors are WHITE-family text + motion + icon — no red anywhere in
    // marketing UI (WMS §12.1, reaffirmed in §8 CompareTable "triad law").
    danger: "#E8EDE6",
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    pill: "999px",
  },
  // 4px base scale (WMS §12.1)
  space: [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160, 224] as const,
  z: {
    bg: 0,
    skyline: 1,
    vignette: 2,
    grain: 3,
    content: 5,
    rail: 90,
    cta: 140,
    nav: 150,
    overlay: 200,
  },
} as const;

export type Tokens = typeof tokens;

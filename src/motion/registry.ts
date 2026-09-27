/**
 * Motion registry — WMS §9.2, "Animation Registry (canonical)".
 *
 * This is the single list of sanctioned animations. Every animated element
 * in this app should cite one of these IDs (via a code comment at minimum,
 * ideally a `data-motion="M07"` attribute) rather than inventing a one-off
 * transition. If a screen genuinely needs something not covered here, add a
 * new row to this table first — don't animate ad hoc.
 *
 * Components built so far and the IDs they implement:
 *   - Section      → M02 (heading unblur+slide), M07 (child stagger), M13 (streak wipe)
 *   - Button       → M17 (press/glow ripple)
 *   - Nav          → M16 (underline sweep), glass topbar show/hide per §11.3
 *   - Card         → M08 (hover tilt/tape/glow) — stagger-in handled by parent Section (M07)
 *   - RouteTimeline→ M09 (scrub fill)
 *   - Accordion    → M16-style underline/chevron only (micro, not separately registered)
 *   - ScrollStory  → M06 (pinned horizontal story, scroll = riding)
 *
 * IDs not yet implemented (M01, M03–M05, M10–M12, M14–M15, M18–M20) belong to
 * sections/components not built in this foundation pass (hero loader, gauge,
 * forms, page transitions, stats). They're listed here so the next build
 * phase wires them to this same registry instead of one-offs.
 */

export type MotionId =
  | "M01"
  | "M02"
  | "M03"
  | "M04"
  | "M05"
  | "M06"
  | "M07"
  | "M08"
  | "M09"
  | "M10"
  | "M11"
  | "M12"
  | "M13"
  | "M14"
  | "M15"
  | "M16"
  | "M17"
  | "M18"
  | "M19"
  | "M20";

export interface MotionSpec {
  id: MotionId;
  name: string;
  purpose: string;
  trigger: string;
  duration: string;
  ease: string;
  tech: string;
  reducedMotionFallback: string;
}

export const MOTION_REGISTRY: Record<MotionId, MotionSpec> = {
  M01: {
    id: "M01",
    name: "Ignition load (streaks→logo)",
    purpose: "Brand arrival",
    trigger: "first visit, home",
    duration: "2.4s skippable",
    ease: "timeline",
    tech: "GSAP",
    reducedMotionFallback: "none; static logo fade / RM: skip",
  },
  M02: {
    id: "M02",
    name: "Headline slide-up + unblur",
    purpose: "Focus metaphor",
    trigger: "enter viewport",
    duration: ".75s stagger .09",
    ease: "brake",
    tech: "GSAP (manual word-span split; SplitText is a paid plugin)",
    reducedMotionFallback: "opacity-in / RM: visible",
  },
  M03: {
    id: "M03",
    name: "Route rail + rider marker",
    purpose: "Journey = scroll",
    trigger: "scroll",
    duration: "linear",
    ease: "—",
    tech: "rAF",
    reducedMotionFallback: "hidden on mobile; RM: hidden",
  },
  M04: {
    id: "M04",
    name: "Speedometer sweep",
    purpose: "Progress telemetry",
    trigger: "enter viewport",
    duration: "1.7s",
    ease: "elastic (custom)",
    tech: "SVG attr transform (never CSS rotate)",
    reducedMotionFallback: "static position",
  },
  M05: {
    id: "M05",
    name: "Odometer digits",
    purpose: "Live data feel",
    trigger: "value change",
    duration: ".5s",
    ease: "brake",
    tech: "CSS translateY",
    reducedMotionFallback: "instant swap",
  },
  M06: {
    id: "M06",
    name: "Pinned horizontal story",
    purpose: "Scroll = riding",
    trigger: "scroll pin",
    duration: "260% scrub",
    ease: "none (scrub)",
    tech: "GSAP ScrollTrigger + Lenis",
    reducedMotionFallback: "mobile & RM: swipe-snap / stacked",
  },
  M07: {
    id: "M07",
    name: "Card convoy stagger",
    purpose: "Fleet metaphor",
    trigger: "enter viewport",
    duration: ".6s stagger .08",
    ease: "brake",
    tech: "GSAP/IntersectionObserver",
    reducedMotionFallback: "fade only",
  },
  M08: {
    id: "M08",
    name: "Card tilt + tape unroll + glow",
    purpose: "Reward, packaging motif",
    trigger: "hover",
    duration: ".25/.5s",
    ease: "brake",
    tech: "rAF transform / CSS",
    reducedMotionFallback: "none on touch",
  },
  M09: {
    id: "M09",
    name: "Route timeline fill + pin delivery",
    purpose: "Progress narrative",
    trigger: "scrub",
    duration: "—",
    ease: "none",
    tech: "ScrollTrigger + SVG dash",
    reducedMotionFallback: "60% static fill",
  },
  M10: {
    id: "M10",
    name: "Fuse input focus",
    purpose: "Precision feedback",
    trigger: "focus",
    duration: ".5s",
    ease: "brake",
    tech: "CSS scaleX",
    reducedMotionFallback: "border color only",
  },
  M11: {
    id: "M11",
    name: "Skid error shake",
    purpose: "Physical error language",
    trigger: "invalid submit",
    duration: ".3s",
    ease: "—",
    tech: "CSS keyframe",
    reducedMotionFallback: "color/icon only",
  },
  M12: {
    id: "M12",
    name: "Pass flip success",
    purpose: "Conversion peak",
    trigger: "valid submit",
    duration: ".8s",
    ease: "brake",
    tech: "CSS 3D + JS",
    reducedMotionFallback: "fade-in card",
  },
  M13: {
    id: "M13",
    name: "Streak section wipe",
    purpose: "Chapter transition",
    trigger: "section 50% cross",
    duration: ".5s",
    ease: "exit",
    tech: "GSAP",
    reducedMotionFallback: "none",
  },
  M14: {
    id: "M14",
    name: "Cursor comet",
    purpose: "Visitor = rider",
    trigger: "mousemove",
    duration: "continuous",
    ease: "—",
    tech: "canvas",
    reducedMotionFallback: "fine-pointer only; RM: off",
  },
  M15: {
    id: "M15",
    name: "Idle lone rider",
    purpose: "World is alive",
    trigger: "20s idle",
    duration: "4s",
    ease: "linear",
    tech: "beams system",
    reducedMotionFallback: "off",
  },
  M16: {
    id: "M16",
    name: "Nav underline sweep",
    purpose: "Wayfinding",
    trigger: "hover/active",
    duration: ".25s",
    ease: "brake",
    tech: "CSS",
    reducedMotionFallback: "color",
  },
  M17: {
    id: "M17",
    name: "Button press/glow ripple",
    purpose: "Confirmation",
    trigger: "press",
    duration: ".15/.4s",
    ease: "brake",
    tech: "CSS",
    reducedMotionFallback: "scale only",
  },
  M18: {
    id: "M18",
    name: "Page transition",
    purpose: "Continuity",
    trigger: "route change",
    duration: ".45s",
    ease: "exit+brake",
    tech: "Framer Motion (AnimatePresence) streak-wipe",
    reducedMotionFallback: "fade / RM: none",
  },
  M19: {
    id: "M19",
    name: "Lottie pillar icons",
    purpose: "Pillar personality",
    trigger: "hover/in-view",
    duration: "1.5s loop ≤2",
    ease: "—",
    tech: "lottie-react, lazy",
    reducedMotionFallback: "static SVG",
  },
  M20: {
    id: "M20",
    name: "Number count-up (stats)",
    purpose: "Telemetry",
    trigger: "enter viewport",
    duration: "1.2s",
    ease: "expo",
    tech: "rAF",
    reducedMotionFallback: "final value",
  },
};

export function getMotionSpec(id: MotionId): MotionSpec {
  return MOTION_REGISTRY[id];
}

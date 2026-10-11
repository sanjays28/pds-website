/**
 * heroFilm.ts — config + pure maths for the scroll-driven hero film.
 * Everything you are likely to tune by eye lives here: CUES (in FRAME
 * numbers — open the site with ?debug=1 to read the current frame live),
 * the scroll→frame mapping, and the draw layout.
 */

export const FRAME_COUNT = 279;
export const FRAME_W = 1280;
export const FRAME_H = 720;
export const frameSrc = (i: number) => `/frames/f_${String(i).padStart(4, "0")}.webp`;

/** Static still for prefers-reduced-motion: the powered-on bike. */
export const REDUCED_FRAME = 66;

export type CueId =
  | "intro"
  | "tech"
  | "safety"
  | "fleet-ops"
  | "documents-product"
  | "bags"
  | "riders-fleet"
  | "tagline";

export interface Cue {
  from: number;
  to: number;
  id: CueId;
}

/** Text cues, in frame numbers. Fade/slide in over CUE_FADE_FRAMES, out over the same. */
export const CUES: Cue[] = [
  { from: 1, to: 52, id: "intro" },
  // quiet stretch: three callouts on the idle bike, staggered by 12 frames
  { from: 56, to: 84, id: "tech" },
  { from: 68, to: 96, id: "safety" },
  { from: 80, to: 108, id: "fleet-ops" },
  { from: 110, to: 138, id: "documents-product" },
  { from: 164, to: 186, id: "bags" },
  { from: 213, to: 246, id: "riders-fleet" },
  { from: 262, to: 279, id: "tagline" },
];
export const CUE_FADE_FRAMES = 6;

/** Left "Our Services" manifest: visible window, and the frames each row is lit. */
export const MANIFEST_WINDOW = { from: 50, to: 258 };
export const MANIFEST = [
  { code: "B2B-01", name: "B2B Delivery Services", from: 108, to: 138 },
  { code: "ECOM-02", name: "E-Commerce Delivery", from: 108, to: 138 },
  { code: "QCOM-03", name: "Q-Commerce Delivery", from: 139, to: 163 },
  { code: "FOOD-04", name: "Food and Restaurant Delivery", from: 164, to: 186 },
  { code: "PHRM-05", name: "Pharmacy Delivery", from: 164, to: 186 },
  { code: "RETL-06", name: "Retail Delivery", from: 187, to: 199 },
  { code: "CORP-07", name: "Corporate Delivery", from: 200, to: 212 },
  { code: "RIDR-08", name: "Professional Rider Solutions", from: 213, to: 246 },
  { code: "FLET-09", name: "Fleet Management", from: 213, to: 246 },
] as const;

/** Floor route line: green fill draws across these frames; the pin lands at the end one. */
export const ROUTE = { from: 52, to: 262 };

/** Rail ticks, in frames; the rail fill tracks the same frame range. */
export const RAIL_TICKS = [
  { label: "Ignition", frame: 1 },
  { label: "Industries", frame: 120 },
  { label: "Fleet", frame: 225 },
  { label: "Delivered", frame: 279 },
] as const;

/** Scroll progress → frame: hold the first frame, scrub, hold the last. */
export const HOLD_START = 0.03;
export const HOLD_END = 0.93;
export const EASE_FACTOR = 0.14;

export function progressToFrame(p: number): number {
  const t = Math.min(1, Math.max(0, (p - HOLD_START) / (HOLD_END - HOLD_START)));
  return 1 + t * (FRAME_COUNT - 1);
}

/**
 * Where each floating object is, in frame-space (0–1), as [frame, fx, fy]
 * keyframes — the objects rise out of the box and settle, so a leader line
 * has to follow them rather than point at one fixed spot. Measured by eye;
 * nudge here if a dot drifts off its object.
 */
export type TrackKey = "documents" | "product" | "food" | "pharmacy" | "tracker" | "headlight" | "wheel";
export const TRACKS: Record<TrackKey, [frame: number, fx: number, fy: number][]> = {
  documents: [[110, 0.331, 0.25], [124, 0.334, 0.128], [138, 0.331, 0.128]],
  product: [[110, 0.37, 0.31], [124, 0.376, 0.262], [138, 0.374, 0.239]],
  food: [[164, 0.328, 0.225], [175, 0.324, 0.189], [186, 0.328, 0.275]],
  pharmacy: [[164, 0.388, 0.225], [175, 0.392, 0.194], [186, 0.38, 0.29]],
  // static parts of the idle bike (frames 56–108), read off the frames
  tracker: [[56, 0.534, 0.322]],
  headlight: [[56, 0.6375, 0.473]],
  wheel: [[56, 0.63, 0.78]],
};

export function trackAt(key: TrackKey, frame: number): { fx: number; fy: number } {
  const k = TRACKS[key];
  if (frame <= k[0][0]) return { fx: k[0][1], fy: k[0][2] };
  for (let i = 1; i < k.length; i++) {
    if (frame <= k[i][0]) {
      const t = (frame - k[i - 1][0]) / (k[i][0] - k[i - 1][0]);
      return { fx: k[i - 1][1] + (k[i][1] - k[i - 1][1]) * t, fy: k[i - 1][2] + (k[i][2] - k[i - 1][2]) * t };
    }
  }
  const l = k[k.length - 1];
  return { fx: l[1], fy: l[2] };
}

/**
 * Attached callouts. `ret` = reticle size in 1280×720 frame pixels (scaled with
 * the draw); `side` = which way the elbow leader leaves the reticle (desktop),
 * `dir` = whether it climbs or drops, `d` = length of the 45° segment in px,
 * `m` = the same for mobile (null = not shown there).
 */
export interface CalloutCfg {
  text: string;
  track: TrackKey;
  ret: [number, number];
  side: "left" | "right";
  dir?: "up" | "down";
  d?: number;
  /** Length of the horizontal segment (default 14; 0 = leader ends at the chip's edge). */
  L?: number;
  /** Which way the chip extends from the leader's end (default: same as `side`). */
  chip?: "left" | "right";
  m: { side: "left" | "right"; d: number } | null;
}
export const CALLOUTS: Partial<Record<CueId, CalloutCfg[]>> = {
  tech: [
    { text: "Technology-Supported Operations", track: "tracker", ret: [60, 60], side: "left", d: 100, m: null },
  ],
  safety: [
    { text: "Safety-Focused Approach", track: "headlight", ret: [80, 70], side: "right", d: 170, L: 0, chip: "left", m: null },
  ],
  "fleet-ops": [
    { text: "Reliable Fleet Operations", track: "wheel", ret: [120, 120], side: "left", dir: "down", d: 40, m: null },
  ],
  "documents-product": [
    { text: "B2B Delivery Services", track: "documents", ret: [150, 105], side: "right", d: 60, m: { side: "right", d: 56 } },
    { text: "E-Commerce Delivery", track: "product", ret: [85, 100], side: "right", d: 30, m: { side: "right", d: 40 } },
  ],
  bags: [
    { text: "Food and Restaurant Delivery", track: "food", ret: [92, 118], side: "right", d: 84, m: { side: "right", d: 84 } },
    { text: "Pharmacy Delivery", track: "pharmacy", ret: [96, 118], side: "right", d: 30, m: { side: "right", d: 40 } },
  ],
};

/** Frame edges aren't pure black (fog reaches them) — feather them into the film black. */
export const EDGE_FEATHER = { x: 0.14, y: 0.1 };

/* ---------- draw layout ---------- */

export const DESKTOP_SCALE = 0.84; // × cover scale: a smaller bike leaves room for the manifest
export const DESKTOP_SHIFT = 0.16; // ≥1024px: bike sits right of the manifest column. Below 1024px the mobile layout is used (portrait tablets too).
/** Mobile: the frame is drawn at vw * MOBILE_ZOOM / FRAME_W so the whole bike
 * fits the screen (true "cover" would crop the bike to its middle third). The
 * frame's (fx, fy) focus point is pinned to viewport (0.5, MOBILE_VIEW_Y). */
export const MOBILE_ZOOM = 1.8;
export const MOBILE_FOCUS = { fx: 0.47, fy: 0.55 };
export const MOBILE_VIEW_Y = 0.7;
/** Mobile decode cap (px wide): 279 full-size bitmaps would be ~1GB of memory. */
export const MOBILE_DECODE_WIDTH = 800;

export interface FrameLayout {
  vw: number;
  vh: number;
  scale: number;
  x: number;
  y: number;
  mobile: boolean;
}

export function frameLayout(vw: number, vh: number): FrameLayout {
  if (vw < 1024) {
    const scale = (vw * MOBILE_ZOOM) / FRAME_W;
    return {
      vw,
      vh,
      scale,
      x: vw * 0.5 - MOBILE_FOCUS.fx * FRAME_W * scale,
      y: vh * MOBILE_VIEW_Y - MOBILE_FOCUS.fy * FRAME_H * scale,
      mobile: true,
    };
  }
  const scale = Math.max(vw / FRAME_W, vh / FRAME_H) * DESKTOP_SCALE; // 0.84 × cover
  const shift = DESKTOP_SHIFT;
  return {
    vw,
    vh,
    scale,
    x: (vw - FRAME_W * scale) / 2 + vw * shift,
    y: vh - FRAME_H * scale, // anchored to the bottom
    mobile: false,
  };
}

/** Frame-space point → viewport px. */
export function framePoint(l: FrameLayout, fx: number, fy: number) {
  return { x: l.x + fx * FRAME_W * l.scale, y: l.y + fy * FRAME_H * l.scale };
}

/* ---------- easing ---------- */

/** cubic-bezier(0.16,1,0.3,1) — the brand's brake curve, as a function of t. */
export function easeBrake(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const x1 = 0.16, y1 = 1, x2 = 0.3, y2 = 1;
  const bez = (a: number, b: number, s: number) =>
    3 * a * (1 - s) * (1 - s) * s + 3 * b * (1 - s) * s * s + s * s * s;
  let s = t;
  for (let i = 0; i < 6; i++) {
    const dx = bez(x1, x2, s) - t;
    const d = 3 * x1 * (1 - s) * (1 - s) + 6 * (x2 - x1) * (1 - s) * s + 3 * (1 - x2) * s * s;
    if (Math.abs(dx) < 1e-5 || d === 0) break;
    s -= dx / d;
  }
  return bez(y1, y2, Math.min(1, Math.max(0, s)));
}

/* ---------- phone intro framing (<1024px, frames 1–52) ----------
   While the intro text is on screen the bike is fitted into the "stage" — the band between
   the caption block and the pill/scroll-cue space — instead of the standard mobile framing.
   From frame INTRO_BLEND.from to .to the framing eases back to the standard mobile layout, so
   scrolling past the intro never makes the bike jump. */
export const BIKE_BBOX = { x0: 0.245, y0: 0.215, x1: 0.725, y1: 0.945 }; // the bike itself, as frame fractions (frame 1)
export const INTRO_BLEND = { from: 46, to: 60 };
export const STAGE_CLEARANCE = 8; // px kept clear on every side of the bike inside the stage
export const STAGE_MASK = 0.12; // top/bottom share of the stage faded into the film black

export function introLayout(vw: number, vh: number, stageTop: number, stageBottom: number): FrameLayout {
  const bw = (BIKE_BBOX.x1 - BIKE_BBOX.x0) * FRAME_W;
  const bh = (BIKE_BBOX.y1 - BIKE_BBOX.y0) * FRAME_H;
  const availW = vw - 2 * STAGE_CLEARANCE;
  const availH = stageBottom - stageTop - 2 * STAGE_CLEARANCE;
  const scale = Math.max(0.05, Math.min(availW / bw, availH / bh));
  const cx = ((BIKE_BBOX.x0 + BIKE_BBOX.x1) / 2) * FRAME_W;
  const cy = ((BIKE_BBOX.y0 + BIKE_BBOX.y1) / 2) * FRAME_H;
  return { vw, vh, scale, x: vw / 2 - cx * scale, y: (stageTop + stageBottom) / 2 - cy * scale, mobile: true };
}

export function mixLayout(a: FrameLayout, b: FrameLayout, t: number): FrameLayout {
  const m = (p: number, q: number) => p + (q - p) * t;
  return { vw: b.vw, vh: b.vh, scale: m(a.scale, b.scale), x: m(a.x, b.x), y: m(a.y, b.y), mobile: true };
}

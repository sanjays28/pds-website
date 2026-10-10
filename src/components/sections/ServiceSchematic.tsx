"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { PinIcon } from "@/components/PinIcon";
import { MANIFEST } from "@/lib/heroFilm";
import { useReducedMotion } from "@/motion/useReducedMotion";

/**
 * ServiceSchematic — the Services section's visual: a small "route schematic"
 * card driven by the active service row.
 *
 *   services 1–7  a route from → to (7 distinct paths) that draws left to right,
 *                 a pin lit at the end, and a dot that travels the finished path
 *   service 8     six rider dots lighting one by one
 *   service 9     a line through three checkpoints, filling left to right
 *
 * Structure: ONE persistent container with three persistent layers (route,
 * rider, fleet). Switching never remounts anything; a small state machine
 * (idle → exiting → entering → idle) fades the stage out (200ms), swaps which
 * layer/route is shown, then plays that variant's entrance with the Web
 * Animations API so it can be cancelled cleanly. Only the latest requested
 * service is honoured: a request during `exiting` just retargets the pending
 * swap; one during `entering` cancels the entrance (animations, dot loop,
 * will-change) and jumps straight to the new service. Transitions use opacity
 * and transform only (plus stroke-dashoffset / colour for the artwork itself),
 * every layer is `position:absolute; inset:0`, so the card never changes size.
 *
 * Only labels from the PDS content are used. Everything is decorative
 * (aria-hidden) except a visually hidden aria-live description.
 *
 * Coordinates are in a 640×480 box (desktop 4/3). The mobile card is 16/10, which
 * shows the vertical slice y 40–440 of the same box (`compact`).
 */
const VB_W = 640;
const DESKTOP_BOX = { y0: 0, h: 480 };
const COMPACT_BOX = { y0: 40, h: 400 };
const LABEL_Y = 80; // labels sit in a band above every path (paths stay below y≈200)
const BRAKE = "cubic-bezier(0.16, 1, 0.3, 1)";
const EXIT_MS = 200;

interface Route {
  d: string;
  s: [number, number];
  e: [number, number];
  from: string;
  to: string;
}

/** Seven services, seven different shapes. Start x=96, end x=544. */
const ROUTES: Route[] = [
  { d: "M96 320 C200 320 230 230 330 230 C430 230 470 300 544 300", s: [96, 320], e: [544, 300], from: "Offices, stores, warehouses", to: "Branches, business locations" },
  { d: "M96 230 C230 230 250 370 360 370 C450 370 490 270 544 270", s: [96, 230], e: [544, 270], from: "Online stores, marketplaces", to: "Customer" },
  { d: "M96 300 C240 290 400 310 544 300", s: [96, 300], e: [544, 300], from: "Dark store", to: "Customer" },
  { d: "M96 330 C240 330 280 200 400 200 C470 200 500 250 544 250", s: [96, 330], e: [544, 250], from: "Restaurant, café, cloud kitchen", to: "Customer" },
  { d: "M96 200 C180 200 200 340 300 340 C400 340 380 220 480 220 C510 220 530 290 544 290", s: [96, 200], e: [544, 290], from: "Pharmacy", to: "Customer" },
  { d: "M96 320 C160 250 240 250 320 300 C400 350 480 350 544 270", s: [96, 320], e: [544, 270], from: "Retail store", to: "Customer or business location" },
  { d: "M96 250 C330 250 330 390 544 390", s: [96, 250], e: [544, 390], from: "Office", to: "Corporate client" },
];

const RIDER_LABELS = ["Trained", "Disciplined", "Customer-focused"];
const FLEET_LABELS = ["Motorcycle readiness", "Rider coordination", "Operational continuity"];

type Box = { y0: number; h: number };
const px = (x: number) => `${(x / VB_W) * 100}%`;
const py = (y: number, b: Box) => `${((y - b.y0) / b.h) * 100}%`;
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const GREEN = "#6cc04a";
const GREY = "#2a2a2a";
const DOT_ON = { backgroundColor: GREEN, borderColor: GREEN };

export function ServiceSchematic({ index, compact = false }: { index: number; compact?: boolean }) {
  const reduced = useReducedMotion();
  const box = compact ? COMPACT_BOX : DESKTOP_BOX;

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const routeLayer = useRef<HTMLDivElement>(null);
  const riderLayer = useRef<HTMLDivElement>(null);
  const fleetLayer = useRef<HTMLDivElement>(null);
  const drawRef = useRef<SVGPathElement>(null);
  const pinRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const lblStart = useRef<HTMLDivElement>(null);
  const lblEnd = useRef<HTMLDivElement>(null);

  const [shown, setShown] = useState(index);
  const [seen, setSeen] = useState(false);

  // ---- controller state (refs: never trigger renders) ----
  const latest = useRef(index);
  const shownRef = useRef(index);
  const phase = useRef<"idle" | "exiting" | "entering">("idle");
  const token = useRef(0); // bumps on every cancel/restart so stale callbacks do nothing
  const anims = useRef<Animation[]>([]);
  const exitAnim = useRef<Animation | null>(null);
  const raf = useRef(0);
  const inView = useRef(false);
  const swapPending = useRef(false);
  const started = useRef(false);

  const isRoute = shown < 7;
  const route = ROUTES[Math.min(shown, 6)];

  /* ---------- dot loop (one at a time, always cancellable) ---------- */
  const stopDot = () => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    if (dotRef.current) dotRef.current.style.opacity = "0";
  };
  const placeDot = (p: number) => {
    const path = drawRef.current;
    const dot = dotRef.current;
    if (!path || !dot) return;
    const pt = path.getPointAtLength(p * path.getTotalLength());
    dot.style.left = px(pt.x);
    dot.style.top = py(pt.y, box);
  };
  // 4s per trip (ease-in-out), 600ms pause at the end, repeat; starts after the draw.
  const startDot = (delay: number) => {
    stopDot();
    const my = token.current;
    const t0 = performance.now() + delay;
    const loop = (now: number) => {
      if (my !== token.current || !inView.current) {
        raf.current = 0; // paused: out of view / superseded (IO restarts it)
        return;
      }
      if (now >= t0) {
        const t = (now - t0) % 4600;
        placeDot(t < 4000 ? ease(t / 4000) : 1);
        if (dotRef.current) dotRef.current.style.opacity = "1";
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
  };

  /* ---------- cancel everything belonging to the old variant ---------- */
  const cancelEntrance = () => {
    token.current++;
    anims.current.forEach((a) => a.cancel());
    anims.current = [];
    stopDot();
    [routeLayer, riderLayer, fleetLayer].forEach((l) => l.current && (l.current.style.willChange = ""));
  };

  /* ---------- entrance for variant i (DOM already shows it) ---------- */
  const enter = (i: number) => {
    const my = ++token.current;
    phase.current = "entering";
    const list: Animation[] = [];
    const run = (el: Element | null, kf: Keyframe[], o: KeyframeAnimationOptions) => {
      if (!el) return;
      list.push(el.animate(kf, { fill: "both", easing: BRAKE, ...o }));
    };
    const layer = i < 7 ? routeLayer.current : i === 7 ? riderLayer.current : fleetLayer.current;
    if (layer) layer.style.willChange = "opacity, transform";

    if (i < 7) {
      run(drawRef.current, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 900, delay: 100 });
      const slide = [
        { opacity: 0, transform: "translateX(-8px)" },
        { opacity: 1, transform: "none" },
      ];
      run(lblStart.current, slide, { duration: 500, delay: 100 });
      run(lblEnd.current, slide, { duration: 500, delay: 500 }); // 400ms after the start label
      run(pinRef.current, [{ color: GREY }, { color: GREEN }], { duration: 300, delay: 1000, easing: "linear" });
      startDot(1100);
    } else if (i === 7) {
      riderLayer.current?.querySelectorAll(".sch-rdot").forEach((d, k, all) => {
        const last = k === all.length - 1;
        run(
          d,
          [
            { backgroundColor: "#0d0d0d", borderColor: "rgba(255,255,255,0.7)", boxShadow: "0 0 0 rgba(108,192,74,0)" },
            { ...DOT_ON, boxShadow: last ? "0 0 14px rgba(108,192,74,0.55)" : "0 0 0 rgba(108,192,74,0)" },
          ],
          { duration: 400, delay: 200 + k * 120 },
        );
      });
    } else {
      run(fleetLayer.current?.querySelector(".sch-ffill") ?? null, [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
        duration: 1800,
        delay: 150,
        easing: "linear",
      });
      fleetLayer.current?.querySelectorAll(".sch-fnode").forEach((n, k) => {
        run(n, [{ backgroundColor: "#0d0d0d", borderColor: "rgba(255,255,255,0.7)" }, DOT_ON], { duration: 300, delay: 150 + k * 900 });
      });
    }
    anims.current = list;

    Promise.all(list.map((a) => a.finished.catch(() => null))).then(() => {
      if (my !== token.current) return; // cancelled or superseded
      phase.current = "idle";
      if (layer) layer.style.willChange = ""; // nothing animating any more
    });
  };

  /* ---------- request handling: latest wins ---------- */
  const finishExit = () => {
    exitAnim.current?.cancel();
    exitAnim.current = null;
    if (latest.current === shownRef.current) enter(shownRef.current);
    else {
      swapPending.current = true;
      shownRef.current = latest.current;
      setShown(latest.current);
    }
  };
  const beginExit = () => {
    const stage = stageRef.current;
    if (!stage) return;
    phase.current = "exiting";
    const my = ++token.current;
    exitAnim.current = stage.animate([{ opacity: 1 }, { opacity: 0 }], { duration: EXIT_MS, easing: "linear", fill: "forwards" });
    exitAnim.current.finished
      .then(() => {
        if (my === token.current) finishExit();
      })
      .catch(() => null);
  };

  useEffect(() => {
    latest.current = index;
    if (index === shownRef.current && phase.current === "idle") return;
    if (!started.current || reduced) {
      // nothing visible yet (or reduced motion): swap instantly, no animation
      shownRef.current = index;
      setShown(index);
      return;
    }
    if (phase.current === "exiting") return; // the pending swap reads `latest`
    if (phase.current === "entering") {
      // cancel the entrance (animations, dot loop, will-change) and go straight to the latest
      cancelEntrance();
      phase.current = "idle";
      if (index === shownRef.current) {
        enter(index);
      } else {
        swapPending.current = true;
        shownRef.current = index;
        setShown(index);
      }
      return;
    }
    beginExit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, reduced]);

  // After React has rendered the swapped variant: drop the fade-out and play the entrance.
  useLayoutEffect(() => {
    if (!swapPending.current) return;
    swapPending.current = false;
    exitAnim.current?.cancel(); // opacity back to 1 — new content starts in its hidden base state
    exitAnim.current = null;
    if (started.current && !reduced) enter(shown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown]);

  // Visibility: first time on screen → play the entrance; the dot loop pauses off-screen.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      inView.current = e.isIntersecting;
      if (!e.isIntersecting) return;
      setSeen(true);
      if (!started.current) return;
      if (shownRef.current < 7 && !reduced && !raf.current && phase.current !== "exiting") startDot(0);
    });
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  useEffect(() => {
    if (!seen || started.current) return;
    started.current = true;
    if (!reduced) enter(shownRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen]);

  // Reduced motion: finished static state; dot parked at the middle of the route.
  useEffect(() => {
    if (!reduced || !isRoute) return;
    placeDot(0.5);
    if (dotRef.current) dotRef.current.style.opacity = "1";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, shown, isRoute]);

  // Cleanup on unmount: no rAF, no running animations.
  useEffect(
    () => () => {
      cancelEntrance();
      exitAnim.current?.cancel();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const row = MANIFEST[index];
  const description = isRoute ? `From ${route.from} to ${route.to}` : shown === 7 ? RIDER_LABELS.join(", ") : FLEET_LABELS.join(", ");

  return (
    <div ref={rootRef} className="sch" data-compact={compact || undefined} data-static={reduced || undefined}>
      <div className="sch-dots" aria-hidden="true" />
      <div ref={stageRef} className="sch-stage" aria-hidden="true">
        <div ref={routeLayer} className="sch-layer sch-route" data-on={isRoute || undefined}>
          <svg className="sch-svg" viewBox={`0 ${box.y0} ${VB_W} ${box.h}`} aria-hidden="true">
            <path className="sch-ahead" d={route.d} />
            <path ref={drawRef} className="sch-draw" d={route.d} pathLength={1} />
          </svg>
          <span className="sch-ring" style={{ left: px(route.s[0]), top: py(route.s[1], box) }} />
          <span ref={pinRef} className="sch-pin" style={{ left: px(route.e[0]), top: py(route.e[1], box) }}>
            <PinIcon />
          </span>
          <span ref={dotRef} className="sch-dot" />
          <div ref={lblStart} className="sch-lbl sch-lbl-start" style={{ top: py(LABEL_Y, box) }}>
            <span className="sch-cap">From</span>
            <span className="sch-txt">{route.from}</span>
          </div>
          <div ref={lblEnd} className="sch-lbl sch-lbl-end" style={{ top: py(LABEL_Y, box) }}>
            <span className="sch-cap">To</span>
            <span className="sch-txt">{route.to}</span>
          </div>
        </div>

        <div ref={riderLayer} className="sch-layer sch-rider" data-on={shown === 7 || undefined}>
          <div className="sch-rrow">
            <span className="sch-rline" />
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i} className="sch-rdot" />
            ))}
          </div>
          <div className="sch-rlabels">
            {RIDER_LABELS.map((l) => (
              <span key={l} className="sch-txt">
                {l}
              </span>
            ))}
          </div>
        </div>

        <div ref={fleetLayer} className="sch-layer sch-fleet" data-on={shown === 8 || undefined}>
          <div className="sch-fline">
            <span className="sch-ftrack" />
            <span className="sch-ffill" />
            {[0, 1, 2].map((i) => (
              <span key={i} className="sch-fnode" style={{ left: `${i * 50}%` }}>
                <span className="sch-txt sch-flabel">{FLEET_LABELS[i]}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="sch-vignette" aria-hidden="true" />
      <span className="hero-chip svc-chip" aria-hidden="true">
        <span className="svc-dot" />
        {row.code}
      </span>
      <p className="sr-only" aria-live="polite">
        {description}
      </p>
    </div>
  );
}

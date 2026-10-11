"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { PinIcon } from "@/components/PinIcon";
import DataRain, { type DataRainFocus, type DataRainPalette } from "@/components/ui/data-rain";
import { useReducedMotion } from "@/motion/useReducedMotion";

/**
 * Process — five steps along a route.
 *
 * ≥1024px: a 400vh wrapper with a sticky 100vh stage. Scroll progress p
 * (eased, `current += (target - current) * 0.14`, native scroll only) fills a
 * green line along an S-curved dashed track; a rider glyph rides the fill's
 * tip; each stop lights when the fill reaches it and its text block (above the
 * line for 1/3/5, below for 2/4) arrives, then settles to 0.65 once the next
 * step appears.
 *     p 0–0.08 hold at start (step 1 appears at 0.04)
 *     p 0.08–0.92 fill travels stop 1 → 5 (stops at .08/.29/.50/.71/.92)
 *     p 0.92–1 hold at the end (pin lit, all steps visible), then it unpins.
 * <1024px: no pin — a vertical list whose line fills step by step as each
 * enters the viewport. Reduced motion: no pin and no scroll mapping; the
 * finished state is shown statically (desktop layout in a normal-height
 * section on wide screens, the list on small ones).
 *
 * The steps are a real <ol> in both layouts; route, ticks and rider are
 * aria-hidden.
 */
const STEPS = [
  { title: "Understanding Your Requirements", body: "We assess your business model, delivery volume, service area, operating schedule, and specific requirements." },
  { title: "Creating the Right Solution", body: "Our team develops a delivery or rider solution aligned with your operational needs." },
  { title: "Rider and Fleet Deployment", body: "Trained riders and suitable motorcycles are assigned according to the agreed service requirements." },
  { title: "Delivery Execution", body: "Orders are collected, handled responsibly, and delivered to the intended destination." },
  { title: "Operational Support", body: "Our team supports ongoing coordination and works to maintain consistent delivery performance." },
] as const;

const HOLD_START = 0.08;
const HOLD_END = 0.92;
const APPEAR = [0.04, 0.29, 0.5, 0.71, 0.92]; // when each step's text arrives
const EASE = 0.14;
const NODE_PAD = 12; // route inset from the layer edges
const BLOCK_W = 220;
const TICK = 24;
const GAP = 8;
// PDS greens only — the "rider wake" streams behind the route (desktop, pinned container only).
const RAIN_PALETTE: DataRainPalette = { calm: "#2F7A20", mid: "#6CC04A", hot: "#BDF28A" };
const RAIN_COUNT = 900;

const pad = (n: number) => String(n).padStart(2, "0");
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

interface Stop {
  x: number;
  y: number;
  len: number;
}
interface Size {
  w: number;
  h: number;
}

function routeD(w: number, h: number) {
  const yc = h * 0.58;
  const A = Math.min(46, Math.max(24, h * 0.045));
  const x0 = NODE_PAD;
  const x5 = w - NODE_PAD;
  const s = (x5 - x0) / 4;
  const x = (k: number) => x0 + k * s;
  // flat → one soft bend up (between stops 2 and 3) → flat → one soft bend down (4 → 5)
  return `M${x(0)} ${yc} L${x(1)} ${yc} C${x(1) + s / 2} ${yc} ${x(2) - s / 2} ${yc - A} ${x(2)} ${yc - A} L${x(3)} ${yc - A} C${x(3) + s / 2} ${yc - A} ${x(4) - s / 2} ${yc + A * 0.4} ${x(4)} ${yc + A * 0.4}`;
}

export function Process() {
  const reduced = useReducedMotion();
  const [wide, setWide] = useState<boolean | null>(null); // null until measured (SSR → mobile tree)
  useLayoutEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    setWide(mql.matches);
    const on = (e: MediaQueryListEvent) => setWide(e.matches);
    mql.addEventListener("change", on);
    return () => mql.removeEventListener("change", on);
  }, []);

  const header = (
    <>
      <p className="eyebrow">Our Delivery Process</p>
      <h2 className="font-display proc-h2">
        Simple, <span className="accent">Structured</span> and Dependable
      </h2>
    </>
  );

  if (wide && !reduced) return <Pinned header={header} />;
  if (wide && reduced) return <Pinned header={header} still />;
  return <List header={header} reduced={reduced} />;
}

/* ============================ desktop: pinned route ============================ */

function Pinned({ header, still = false }: { header: React.ReactNode; still?: boolean }) {
  const wrapRef = useRef<HTMLElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const fillRef = useRef<SVGPathElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLElement | null)[]>([]);
  const tickRefs = useRef<(HTMLElement | null)[]>([]);
  const blockRefs = useRef<(HTMLLIElement | null)[]>([]);

  // rider wake: streams part around the rider marker. Updated imperatively (no re-render per frame).
  const rainRef = useRef<HTMLDivElement>(null);
  const riderFocus = useRef<DataRainFocus | null>({ x: 0, y: 0, active: false });
  const rainOff = useRef({ x: 0, y: 0 }); // route layer's offset inside the rain wrapper (cached)
  const inViewRef = useRef(false);
  const [rainOn, setRainOn] = useState(false);
  const updateRainOffset = () => {
    const l = layerRef.current;
    const r = rainRef.current;
    if (!l || !r) return;
    const a = l.getBoundingClientRect();
    const b = r.getBoundingClientRect();
    rainOff.current = { x: a.left - b.left, y: a.top - b.top };
  };

  const [size, setSize] = useState<Size | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [total, setTotal] = useState(0);
  const [samples, setSamples] = useState<{ x: number; y: number }[]>([]);
  const [tick, setTick] = useState(TICK);

  /* ---- geometry: layer size → path → stops (real path in the DOM measures them) ---- */
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    const read = () => {
      updateRainOffset();
      const w = Math.round(layer.clientWidth);
      const h = Math.round(layer.clientHeight);
      setSize((prev) => (prev && prev.w === w && prev.h === h ? prev : { w, h }));
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(layer);
    document.fonts?.ready.then(read);
    return () => ro.disconnect();
  }, []);

  const d = size ? routeD(size.w, size.h) : "";
  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path || !d) return;
    const len = path.getTotalLength();
    setTotal(len);
    setSamples(Array.from({ length: 121 }, (_, i) => path.getPointAtLength((i / 120) * len)).map((pt) => ({ x: pt.x, y: pt.y })));
    setStops(
      Array.from({ length: 5 }, (_, k) => {
        const pt = path.getPointAtLength((k / 4) * len);
        return { x: pt.x, y: pt.y, len: (k / 4) * len };
      }),
    );
  }, [d]);

  /* ---- block placement: anchored to its stop, but never on top of the line ----
     The default offset is `tick + GAP` from the stop. Where the path runs closer
     than that across the block's width (e.g. step 5, under which the curve
     descends), the block is moved clear of the path and its tick is lengthened. */
  const place = (k: number, t: number) => {
    const s = stops[k];
    const above = k % 2 === 0;
    const left = size ? Math.min(Math.max(s.x - BLOCK_W / 2, 0), size.w - BLOCK_W) : 0;
    const under = samples.filter((q) => q.x >= left - 8 && q.x <= left + BLOCK_W + 8);
    if (above) {
      const minY = Math.min(s.y, ...under.map((q) => q.y));
      const edge = Math.min(s.y - t - GAP, minY - 14); // block's bottom edge
      return { left, edge, tickTop: edge + GAP, tickH: s.y - (edge + GAP), lifted: edge < s.y - t - GAP - 0.5 };
    }
    const maxY = Math.max(s.y, ...under.map((q) => q.y));
    const edge = Math.max(s.y + t + GAP, maxY + 14); // block's top edge
    return { left, edge, tickTop: s.y, tickH: edge - GAP - s.y, lifted: edge > s.y + t + GAP + 0.5 };
  };

  /* ---- keep text clear of the header: shorten the ticks if a block would touch it ---- */
  useLayoutEffect(() => {
    const layer = layerRef.current;
    const head = headRef.current;
    if (!layer || !head || !stops.length || !size) return;
    const limit = head.getBoundingClientRect().bottom - layer.getBoundingClientRect().top + 14;
    let need = 0;
    [0, 2, 4].forEach((k) => {
      const el = blockRefs.current[k];
      if (!el) return;
      const pl = place(k, tick);
      if (pl.lifted) return; // already moved off the path; shortening ticks can't help it
      need = Math.max(need, limit - (pl.edge - el.offsetHeight));
    });
    const next = Math.round(Math.min(TICK, Math.max(8, tick - need)));
    if (next !== tick) setTick(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops, size, tick, samples]);

  /* ---- mount the rain only while the pinned container is within 20% of the viewport ---- */
  useEffect(() => {
    if (still) return;
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        inViewRef.current = e.isIntersecting;
        if (riderFocus.current) riderFocus.current.active = e.isIntersecting;
        setRainOn(e.isIntersecting);
      },
      { rootMargin: "20% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [still]);

  /* ---- scroll mapping + paint ---- */
  useEffect(() => {
    if (!stops.length || !total) return;
    const wrap = wrapRef.current;
    const path = pathRef.current;
    if (!wrap || !path) return;

    let top = 0;
    let height = 0;
    let vh = 0;
    let current = still ? 1 : -1; // -1: paint straight to the real target on first frame
    let raf = 0;
    const setAttr = (el: Element | null, name: string, val: string | null) => {
      if (!el) return;
      if (val === null) el.removeAttribute(name);
      else if (el.getAttribute(name) !== val) el.setAttribute(name, val);
    };

    const paint = (p: number) => {
      const f = clamp01((p - HOLD_START) / (HOLD_END - HOLD_START));
      const fillLen = f * total;
      if (fillRef.current) {
        fillRef.current.style.strokeDasharray = `${total}`;
        fillRef.current.style.strokeDashoffset = `${total - fillLen}`;
      }
      const pt = path.getPointAtLength(fillLen);
      const rf = riderFocus.current;
      if (rf) {
        rf.x = pt.x + rainOff.current.x;
        rf.y = pt.y + rainOff.current.y;
        rf.active = inViewRef.current;
      }
      const a = path.getPointAtLength(Math.max(0, fillLen - 4));
      const b = path.getPointAtLength(Math.min(total, fillLen + 4));
      const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
      if (markerRef.current) {
        markerRef.current.style.transform = `translate3d(${pt.x.toFixed(1)}px,${pt.y.toFixed(1)}px,0) rotate(${ang.toFixed(1)}deg)`;
      }
      let latest = -1;
      APPEAR.forEach((t, k) => {
        if (p >= t - 1e-6) latest = k;
      });
      stops.forEach((s, k) => {
        const reached = fillLen >= s.len - 0.5;
        setAttr(nodeRefs.current[k], "data-on", reached ? "true" : null);
        setAttr(tickRefs.current[k], "data-on", reached ? "true" : null);
        const state = still ? "current" : k > latest ? "hidden" : k === latest ? "current" : "past";
        setAttr(blockRefs.current[k], "data-state", state);
      });
    };

    if (still) {
      paint(1);
      if (markerRef.current) markerRef.current.style.opacity = "1";
      return;
    }

    const measure = () => {
      const r = wrap.getBoundingClientRect();
      top = r.top + window.scrollY;
      height = r.height;
      vh = window.innerHeight;
    };
    const target = () => clamp01((window.scrollY - top) / Math.max(1, height - vh));
    const tickFn = () => {
      raf = 0;
      const t = target();
      if (current < 0) current = t;
      current += (t - current) * EASE;
      if (Math.abs(t - current) < 0.0005) current = t;
      paint(current);
      if (current !== t) raf = requestAnimationFrame(tickFn);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tickFn);
    };
    measure();
    onScroll();
    const ro = new ResizeObserver(() => {
      measure();
      onScroll();
    });
    ro.observe(wrap);
    document.fonts?.ready.then(() => {
      measure();
      onScroll();
    });
    window.addEventListener("load", measure);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("load", measure);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
    };
  }, [stops, total, still]);

  return (
    <section ref={wrapRef} id="process" className="proc proc-d" data-still={still || undefined} data-spine-node="Process">
      <div className="proc-stick">
        <div ref={rainRef} className="process-rain" aria-hidden="true">
          {rainOn && !still && (
            <DataRain
              fullscreen={false}
              interactive={false}
              focusRef={riderFocus}
              count={RAIN_COUNT}
              flowSpeed={0.8}
              obstacleRadius={22}
              palette={RAIN_PALETTE}
            />
          )}
          <div className="process-rain-fade" />
        </div>
        <div className="proc-inner">
        <div ref={headRef} className="proc-head">
          {header}
        </div>

        <div ref={layerRef} className="proc-layer">
          {size && (
            <>
              <svg className="proc-svg" width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} aria-hidden="true">
                <path ref={pathRef} className="proc-track" d={d} />
                <path ref={fillRef} className="proc-fill" d={d} />
              </svg>
              {stops.map((s, k) => {
                const pl = place(k, tick);
                return (
                  <span key={`t${k}`} aria-hidden="true">
                    <span
                      ref={(el) => {
                        tickRefs.current[k] = el;
                      }}
                      className="proc-tick"
                      style={{ left: s.x, top: pl.tickTop, height: pl.tickH }}
                    />
                    {k === 4 ? (
                      <span
                        ref={(el) => {
                          nodeRefs.current[k] = el;
                        }}
                        className="proc-pin"
                        style={{ left: s.x, top: s.y }}
                      >
                        <PinIcon />
                      </span>
                    ) : (
                      <span
                        ref={(el) => {
                          nodeRefs.current[k] = el;
                        }}
                        className="proc-node"
                        style={{ left: s.x, top: s.y }}
                      />
                    )}
                  </span>
                );
              })}
              <div ref={markerRef} className="proc-marker" aria-hidden="true">
                <Image src="/rider.png" alt="" width={34} height={34} />
              </div>
              <ol className="proc-steps">
                {STEPS.map((st, k) => {
                  const above = k % 2 === 0;
                  const pl = stops[k] && size ? place(k, tick) : null;
                  return (
                    <li
                      key={st.title}
                      ref={(el) => {
                        blockRefs.current[k] = el;
                      }}
                      className="proc-block"
                      data-above={above || undefined}
                      data-state={still ? "current" : "hidden"}
                      style={
                        pl
                          ? above
                            ? { left: pl.left, bottom: size.h - pl.edge }
                            : { left: pl.left, top: pl.edge }
                          : { left: 0, top: 0, visibility: "hidden" }
                      }
                    >
                      <span className="proc-num">{pad(k + 1)}</span>
                      <h3 className="font-display proc-title">{st.title}</h3>
                      <p className="proc-desc">{st.body}</p>
                    </li>
                  );
                })}
              </ol>
            </>
          )}
        </div>
        </div>
      </div>
    </section>
  );
}

/* ====================== mobile / tablet: vertical list ====================== */

function List({ header, reduced }: { header: React.ReactNode; reduced: boolean }) {
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [seen, setSeen] = useState<boolean[]>(() => STEPS.map(() => false));

  useEffect(() => {
    if (reduced) {
      setSeen(STEPS.map(() => true));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const k = Number((e.target as HTMLElement).dataset.k);
          io.unobserve(e.target);
          // steps entering together stagger by 80ms
          window.setTimeout(() => setSeen((prev) => prev.map((v, i) => (i === k ? true : v))), (k % 3) * 80);
        });
      },
      { threshold: 0.5 },
    );
    itemRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [reduced]);

  return (
    <section id="process" className="section proc proc-m" data-spine-node="Process">
      <div className="wrap">
        {header}
        <ol className="proc-list">
          {STEPS.map((st, k) => (
            <li
              key={st.title}
              ref={(el) => {
                itemRefs.current[k] = el;
              }}
              data-k={k}
              className="proc-m-item"
              data-in={seen[k] || undefined}
              data-last={k === STEPS.length - 1 || undefined}
            >
              <span className="proc-m-seg" data-on={seen[k + 1] || undefined} aria-hidden="true" />
              {k === STEPS.length - 1 ? (
                <span className="proc-m-pin" data-on={seen[k] || undefined} aria-hidden="true">
                  <PinIcon />
                </span>
              ) : (
                <span className="proc-m-node" data-on={seen[k] || undefined} aria-hidden="true" />
              )}
              <div className="proc-m-text">
                <span className="proc-num">{pad(k + 1)}</span>
                <h3 className="font-display proc-title">{st.title}</h3>
                <p className="proc-desc">{st.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

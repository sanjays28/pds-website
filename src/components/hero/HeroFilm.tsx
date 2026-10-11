"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { HeroManifest } from "@/components/hero/HeroManifest";
import { PinIcon } from "@/components/PinIcon";
import { useReducedMotion } from "@/motion/useReducedMotion";
import { scrollToY } from "@/lib/smoothScroll";
import { CONTACT_ID } from "@/lib/contact";
import {
  CALLOUTS,
  CUES,
  CUE_FADE_FRAMES,
  EASE_FACTOR,
  EDGE_FEATHER,
  FRAME_COUNT,
  FRAME_H,
  FRAME_W,
  MANIFEST,
  MANIFEST_WINDOW,
  MOBILE_DECODE_WIDTH,
  RAIL_TICKS,
  REDUCED_FRAME,
  ROUTE,
  easeBrake,
  frameLayout,
  frameSrc,
  progressToFrame,
  trackAt,
  type CalloutCfg,
  type Cue,
  type FrameLayout,
  type TrackKey,
} from "@/lib/heroFilm";

/**
 * HeroFilm — scroll-driven cinematic hero. A 700vh section holds a sticky
 * 100vh stage; scroll progress is mapped to one of 279 pre-rendered frames
 * drawn on a <canvas>. All text is real DOM overlaid on the stage and is
 * cued by *frame number* (see CUES in src/lib/heroFilm.ts), so what you
 * read is always in sync with what you see.
 *
 * Sticky (not a GSAP pin): no pin-spacer, no layout jump, and Lenis keeps
 * driving scroll underneath untouched.
 */

const FILM_BLACK = "#070707"; // keep in sync with --color-film-black

export interface HeroFilmProps {
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  /** Plain-list fallback for prefers-reduced-motion. */
  services: string[];
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const SUB = "Safe, efficient, and professional B2B delivery services designed to keep your business moving.";

function Headline() {
  return (
    <h1 data-item className="font-display film-h1">
      Reliable Last-Mile Delivery Solutions Across the <span className="accent">UAE</span>
    </h1>
  );
}

/** Both buttons — used on the last screen only (the intro uses one button + a text link). */
function Ctas({ primaryCta, secondaryCta }: Pick<HeroFilmProps, "primaryCta" | "secondaryCta">) {
  return (
    <div data-item className="film-ctas">
      <Button href={primaryCta.href} variant="primary" data-cta="hero-end-primary">
        {primaryCta.label}
      </Button>
      <Button href={secondaryCta.href} variant="ghost" data-cta="hero-end-secondary">
        {secondaryCta.label}
      </Button>
    </div>
  );
}

/** Start of the film's first story moment (≈ frame 52), as a share of the scrub distance. */
const STORY_START = 0.195;

/**
 * One attached callout: a corner-bracket reticle around the object, a short
 * elbow leader (one 45° segment, one horizontal) and a chip at the end of it.
 * Everything inside `.hc-pos` is laid out relative to the object's anchor
 * point; the engine only moves `.hc-pos` each frame (objects drift as they
 * rise out of the box), so the geometry here is static per layout.
 */
function Callout({ cfg, cue, lay }: { cfg: CalloutCfg; cue: Cue; lay: FrameLayout }) {
  const m = lay.mobile ? cfg.m : null;
  if (lay.mobile && !m) return null;
  const side = m ? m.side : cfg.side;
  const D = m ? m.d : (cfg.d ?? 30);
  const L = lay.mobile ? 0 : (cfg.L ?? 14);
  const hw = (cfg.ret[0] * lay.scale) / 2;
  const hh = (cfg.ret[1] * lay.scale) / 2;
  const sx = side === "left" ? -1 : 1;
  const sy = cfg.dir === "down" ? 1 : -1;
  const start = { x: sx * hw, y: sy * hh };
  const mid = { x: start.x + sx * D, y: start.y + sy * D };
  // Chips are single-line, so they are wide. On mobile the chip is parked with
  // its right edge near the viewport's right side, above the object, and the
  // leader just meets its underside.
  const pm = trackAt(cfg.track, (cue.from + cue.to) / 2);
  const px = lay.x + pm.fx * FRAME_W * lay.scale;
  const end = lay.mobile ? { x: lay.vw - 48 - px, y: mid.y } : { x: mid.x + sx * L, y: mid.y };
  const align = lay.mobile ? "left" : (cfg.chip ?? side);

  const arm = 10;
  const corner = (a: number, b: number) =>
    `M${a * hw} ${b * hh - b * arm}L${a * hw} ${b * hh}L${a * hw - a * arm} ${b * hh}`;
  const reticle = [corner(-1, -1), corner(1, -1), corner(-1, 1), corner(1, 1)].join("");

  return (
    <div data-item className="hc">
      <div className="hc-pos" data-track={cfg.track}>
        <svg className="hc-svg" width="1" height="1" aria-hidden="true">
          <path className="hc-ret" d={reticle} />
          <path
            className="hc-leader"
            d={`M${start.x} ${start.y}L${mid.x} ${mid.y}${!lay.mobile && L > 0 ? `L${end.x} ${end.y}` : ""}`}
          />
          <circle className="hc-dot" cx={start.x} cy={start.y} r={3} />
        </svg>
        <span
          className="hero-chip hc-chip"
          style={{
            left: end.x,
            top: end.y,
            transform: align === "left" ? "translate(-100%,-50%)" : "translate(0,-50%)",
          }}
        >
          {cfg.text}
        </span>
      </div>
    </div>
  );
}

export function HeroFilm({ primaryCta, secondaryCta, services }: HeroFilmProps) {
  const reduced = useReducedMotion();
  const [layout, setLayout] = useState<FrameLayout | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cueRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const railFillRef = useRef<HTMLDivElement>(null);
  const tickRefs = useRef<(HTMLLIElement | null)[]>([]);
  const debugRef = useRef<HTMLPreElement>(null);
  const manifestRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<HTMLDivElement>(null);
  const routeFillRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const [debug, setDebug] = useState(false);

  const seeHowItWorks = () => {
    const section = sectionRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    scrollToY(top + STORY_START * (section.offsetHeight - window.innerHeight));
  };

  useEffect(() => {
    setDebug(new URLSearchParams(window.location.search).get("debug") === "1");
  }, []);

  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!section || !stage || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let dead = false;
    let visible = true;
    let raf = 0;
    let dirty = true;
    let lay: FrameLayout = frameLayout(stage.clientWidth, stage.clientHeight);
    let dpr = 1;

    const frames: (ImageBitmap | undefined)[] = new Array(FRAME_COUNT + 1);
    let loaded = 0;
    let lastDrawn = -1;

    let current = 1;
    let target = 1;
    let progress = 0;
    const t0 = performance.now();

    // Test hook: automated checks can pin the film to a frame with
    // window.__heroSetFrame(n) (call with no argument to hand scroll back).
    let hooked: number | undefined;

    /* ---------- sizing ---------- */
    const resize = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (!w || !h) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      lay = frameLayout(w, h);
      setLayout(lay);
      lastDrawn = -1;
      dirty = true;
    };

    /* ---------- drawing ---------- */
    // Fade any frame edge that sits inside the viewport into the film black,
    // so the frame never reads as a rectangle.
    const edge = (x0: number, y0: number, x1: number, y1: number, rx: number, ry: number, rw: number, rh: number) => {
      const g = ctx.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, FILM_BLACK);
      g.addColorStop(1, "rgba(7,7,7,0)");
      ctx.fillStyle = g;
      ctx.fillRect(rx, ry, rw, rh);
    };
    const feather = (x: number, y: number, w: number, h: number) => {
      const fw = w * EDGE_FEATHER.x;
      const fh = h * EDGE_FEATHER.y;
      if (x > 0) edge(x, 0, x + fw, 0, x, y, fw, h);
      if (x + w < lay.vw) edge(x + w, 0, x + w - fw, 0, x + w - fw, y, fw, h);
      if (y > 0.5) edge(0, y, 0, y + fh, x, y, w, fh);
      if (y + h < lay.vh - 0.5) edge(0, y + h, 0, y + h - fh, x, y + h - fh, w, fh);
    };
    const draw = (idx: number) => {
      let f = idx;
      while (f >= 1 && !frames[f]) f--; // nearest loaded earlier frame
      if (f < 1) return false;
      if (f === lastDrawn) return true;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = FILM_BLACK;
      ctx.fillRect(0, 0, lay.vw, lay.vh);
      const dw = FRAME_W * lay.scale;
      const dh = FRAME_H * lay.scale;
      ctx.drawImage(frames[f]!, lay.x, lay.y, dw, dh);
      feather(lay.x, lay.y, dw, dh);
      lastDrawn = f;
      return true;
    };

    /* ---------- text cues ---------- */
    const itemCache = new Map<string, HTMLElement[]>();
    const cueItems = (id: string) => {
      let items = itemCache.get(id);
      const el = cueRefs.current[id];
      if (!items || (items.length === 0 && el)) {
        items = el ? Array.from(el.querySelectorAll<HTMLElement>("[data-item]")) : [];
        itemCache.set(id, items);
      }
      return items;
    };
    const activeIds: string[] = [];
    const updateCues = (cur: number, now: number) => {
      activeIds.length = 0;
      for (const cue of CUES) {
        const el = cueRefs.current[cue.id];
        if (!el) continue;
        const items = cueItems(cue.id);
        let any = false;
        items.forEach((it, k) => {
          const delay = k * 1.1;
          // The intro has no "in" scroll range (frame 1 is where the page
          // starts) so it plays a short time-based entrance on load instead.
          // On phones/tablets the intro is visible from first paint (CSS, no JS needed) and plays a
          // CSS-only entrance on its column, so there is no hide-then-reveal flash when JS hydrates.
          const tin =
            cue.from === 1
              ? lay.mobile
                ? 1
                : clamp01((now - t0 - 150 - k * 90) / 900)
              : clamp01((cur - cue.from - delay) / CUE_FADE_FRAMES);
          const tout = cue.to === FRAME_COUNT ? 1 : clamp01((cue.to - cur) / CUE_FADE_FRAMES);
          const ein = easeBrake(tin);
          const eout = easeBrake(tout);
          const o = ein * eout;
          const x = (1 - ein) * -28 + (1 - eout) * 28;
          it.style.opacity = o.toFixed(3);
          it.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
          if (o > 0.01) any = true;
        });
        if (any) {
          activeIds.push(cue.id);
          // Callouts follow their objects as they rise out of the box.
          el.querySelectorAll<HTMLElement>(".hc-pos").forEach((n) => {
            const p = trackAt(n.dataset.track as TrackKey, cur);
            n.style.transform = `translate3d(${(lay.x + p.fx * FRAME_W * lay.scale).toFixed(1)}px,${(lay.y + p.fy * FRAME_H * lay.scale).toFixed(1)}px,0)`;
          });
        }
        if (any !== (el.dataset.active === "true")) {
          if (any) el.dataset.active = "true";
          else delete el.dataset.active;
        }
      }
    };

    /* ---------- manifest, dock, route, dots ---------- */
    const setOn = (el: Element | null | undefined, on: boolean) => {
      if (!el) return;
      if (on !== (el.getAttribute("data-on") === "true")) {
        if (on) el.setAttribute("data-on", "true");
        else el.removeAttribute("data-on");
      }
    };
    const rowEls = (root: HTMLElement | null) => (root ? Array.from(root.querySelectorAll("[data-row]")) : []);
    let rows: Element[] = [];
    let dockRows: Element[] = [];
    const updateManifest = (cur: number) => {
      if (!rows.length) rows = rowEls(manifestRef.current);
      if (!dockRows.length) dockRows = rowEls(dockRef.current);
      const tin = easeBrake(clamp01((cur - MANIFEST_WINDOW.from) / CUE_FADE_FRAMES));
      const tout = easeBrake(clamp01((MANIFEST_WINDOW.to - cur) / CUE_FADE_FRAMES));
      const o = tin * tout;
      const x = (1 - tin) * -28 + (1 - tout) * 28;
      for (const el of [manifestRef.current?.firstElementChild, dockRef.current] as (HTMLElement | null | undefined)[]) {
        if (!el) continue;
        el.style.opacity = o.toFixed(3);
        el.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
      }
      MANIFEST.forEach((row, i) => {
        const on = cur >= row.from - 0.5 && cur <= row.to + 0.5;
        setOn(rows[i], on);
        setOn(dockRows[i], on);
      });
    };
    const updateAmbient = (cur: number, p: number) => {
      if (dotsRef.current) dotsRef.current.style.transform = `translate3d(0,${(-p * 140).toFixed(1)}px,0)`;
      const route = routeRef.current;
      if (route) {
        route.style.opacity = easeBrake(clamp01((cur - MANIFEST_WINDOW.from) / CUE_FADE_FRAMES)).toFixed(3);
        if (routeFillRef.current) {
          const f = clamp01((cur - ROUTE.from) / (ROUTE.to - ROUTE.from));
          routeFillRef.current.style.transform = `scaleX(${f.toFixed(4)})`;
        }
        setOn(pinRef.current, cur >= ROUTE.to - 0.5);
      }
    };

    /* ---------- mobile pill: shown mid-film only ---------- */
    let contactInView = false;
    const updatePill = (cur: number, p: number) => {
      // Hidden at the start, once the tagline's own CTAs arrive (frame 258+),
      // and whenever the contact section is on screen.
      setOn(pillRef.current, visible && p >= 0.15 && p <= 0.93 && cur < 258 && !contactInView);
    };

    /* ---------- rail + debug ---------- */
    let lastRail = -1;
    const updateRail = (cur: number) => {
      const f = (cur - 1) / (FRAME_COUNT - 1);
      if (Math.abs(f - lastRail) < 0.0005) return;
      lastRail = f;
      if (railFillRef.current) railFillRef.current.style.height = `${(f * 100).toFixed(2)}%`;
      RAIL_TICKS.forEach((t, i) => setOn(tickRefs.current[i], cur >= t.frame - 0.5));
    };

    /* ---------- loop ---------- */
    const tick = () => {
      raf = 0;
      if (dead || !visible) return;
      const rect = section.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      progress = span > 0 ? clamp01(-rect.top / span) : 0;
      target = hooked !== undefined ? Math.min(FRAME_COUNT, Math.max(1, hooked)) : progressToFrame(progress);

      const prev = current;
      current += (target - current) * EASE_FACTOR;
      if (Math.abs(target - current) < 0.01) current = target;

      const idx = Math.round(current);
      if (draw(idx) && !canvas.dataset.ready) {
        canvas.dataset.ready = "true";
        stage.dataset.ready = "true"; // hides the poster
      }
      updateCues(current, performance.now());
      updateManifest(current);
      updateAmbient(current, (current - 1) / (FRAME_COUNT - 1));
      updateRail(current);
      updatePill(current, progress);

      if (debugRef.current) {
        debugRef.current.textContent =
          `progress ${progress.toFixed(3)}\n` +
          `target   ${target.toFixed(1)}\n` +
          `current  ${current.toFixed(1)} (draw ${lastDrawn})\n` +
          `loaded   ${loaded}/${FRAME_COUNT}\n` +
          `cues     ${activeIds.join(", ") || "-"}`;
      }

      const intro = performance.now() - t0 < 1500;
      if (current !== prev || intro || dirty || hooked !== undefined) {
        dirty = false;
        raf = requestAnimationFrame(tick);
      }
    };
    const wake = () => {
      if (!raf && visible && !dead) raf = requestAnimationFrame(tick);
    };

    /* ---------- loading ---------- */
    const decodeOpts: ImageBitmapOptions | undefined =
      lay.mobile ? { resizeWidth: MOBILE_DECODE_WIDTH, resizeQuality: "high" } : undefined;
    const load = async (i: number) => {
      if (frames[i] || dead) return;
      try {
        const blob = await (await fetch(frameSrc(i))).blob();
        const bmp = await createImageBitmap(blob, decodeOpts as ImageBitmapOptions);
        if (dead) {
          bmp.close();
          return;
        }
        frames[i] = bmp;
        loaded++;
        dirty = true;
        wake();
      } catch {
        /* a missing frame just falls back to the nearest earlier one */
      }
    };
    const idle = (fn: () => void) => {
      if ("requestIdleCallback" in window) window.requestIdleCallback(fn, { timeout: 300 });
      else setTimeout(fn, 60);
    };
    const loadAll = async () => {
      // Frame 1 alone first, so nothing competes with it for bandwidth; then 2–24 together.
      await load(1);
      await Promise.all(Array.from({ length: 23 }, (_, k) => load(k + 2)));
      let next = 25;
      const step = () => {
        if (dead || next > FRAME_COUNT) return;
        const batch = Array.from({ length: 8 }, (_, k) => next + k).filter((n) => n <= FRAME_COUNT);
        next += 8;
        idle(() => {
          Promise.all(batch.map(load)).then(step);
        });
      };
      step();
    };

    /* ---------- wiring ---------- */
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      wake();
    });
    ro.observe(stage);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) setOn(pillRef.current, false);
      if (visible) {
        dirty = true;
        wake();
      }
    });
    io.observe(section);
    const contactEl = document.getElementById(CONTACT_ID);
    const contactIo = contactEl
      ? new IntersectionObserver(([entry]) => {
          contactInView = entry.isIntersecting;
          if (contactInView) setOn(pillRef.current, false);
        })
      : null;
    if (contactEl) contactIo?.observe(contactEl);
    window.addEventListener("scroll", wake, { passive: true });
    (window as unknown as { __heroSetFrame?: (n?: number) => void }).__heroSetFrame = (n) => {
      hooked = n;
      dirty = true;
      wake();
    };
    loadAll();
    wake();

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      contactIo?.disconnect();
      window.removeEventListener("scroll", wake);
      delete (window as unknown as { __heroSetFrame?: unknown }).__heroSetFrame;
      frames.forEach((b) => b?.close());
    };
  }, [reduced]);

  const cueRef = (id: string) => (el: HTMLDivElement | null) => {
    cueRefs.current[id] = el;
  };
  const ctaProps = { primaryCta, secondaryCta };
  const calloutCue = (id: Cue["id"]) => {
    const cue = CUES.find((c) => c.id === id)!;
    return (
      <div ref={cueRef(id)} className="film-cue" data-id={id}>
        {layout && CALLOUTS[id]?.map((cfg) => <Callout key={cfg.text} cfg={cfg} cue={cue} lay={layout} />)}
      </div>
    );
  };

  /* ---------- reduced motion: static still + plain content ---------- */
  if (reduced) {
    return (
      <section id="hero" className="film-static" aria-label="Introduction">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="film-static-img"
          src={frameSrc(REDUCED_FRAME)}
          alt="A black delivery motorcycle with a green-lit box, powered on"
          width={FRAME_W}
          height={FRAME_H}
        />
        <div className="film-static-body">
          <span className="hero-chip film-chip">
            <span className="pulse-dot" aria-hidden="true" />
            Now operating across the UAE
          </span>
          <h1 className="font-display film-h1">
            Reliable Last-Mile Delivery Solutions Across the <span className="accent">UAE</span>
          </h1>
          <p className="hero-sub">{SUB}</p>
          <div className="film-ctas">
            <Button href={primaryCta.href} variant="primary" data-cta="hero-intro">
              {primaryCta.label}
            </Button>
            <Button href={secondaryCta.href} variant="ghost" data-cta="hero-end-secondary">
              {secondaryCta.label}
            </Button>
          </div>
          <ul className="tag-list film-static-list">
            {services.map((s) => (
              <li key={s} className="tag">
                {s}
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} id="hero" className="film-hero" aria-label="Introduction">
      <div ref={stageRef} className="film-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="film-poster" src={frameSrc(1)} alt="" fetchPriority="high" decoding="async" />
        <canvas ref={canvasRef} className="film-canvas" aria-hidden="true" />

        {/* ambient layer — decorative, never interactive */}
        <div className="film-dots-mask" aria-hidden="true">
          <div ref={dotsRef} className="film-dots" />
        </div>
        <div className="film-vignette" aria-hidden="true" />
        <div className="film-fade" aria-hidden="true" />
        <div ref={routeRef} className="film-route" aria-hidden="true">
          <div className="film-route-track" />
          <div ref={routeFillRef} className="film-route-fill" />
          <div ref={pinRef} className="film-route-pin">
            <span className="film-route-ring" />
            <PinIcon />
          </div>
        </div>

        <div className="film-text">
          <div ref={cueRef("intro")} className="film-cue" data-id="intro" data-active="true">
            <div className="film-col">
              <span data-item className="hero-chip film-chip">
                <span className="pulse-dot" aria-hidden="true" />
                Now operating across the UAE
              </span>
              <Headline />
              <p data-item className="hero-sub">
                {SUB}
              </p>
              <div data-item className="film-ctas film-ctas-intro">
                <Button href={primaryCta.href} variant="primary" data-cta="hero-intro">
                  {primaryCta.label}
                </Button>
                <button type="button" className="film-link" data-cta="hero-scroll-link" onClick={seeHowItWorks}>
                  See how it works
                  <svg className="film-link-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
                    <path d="M12 5v14M6 13l6 6 6-6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {calloutCue("tech")}
          {calloutCue("safety")}
          {calloutCue("fleet-ops")}
          {calloutCue("documents-product")}
          {calloutCue("bags")}

          <HeroManifest manifestRef={manifestRef} dockRef={dockRef} ridersRef={cueRef("riders-fleet")} />

          <div ref={cueRef("tagline")} className="film-cue" data-id="tagline">
            <div className="film-col film-col-wide">
              <p data-item className="font-display film-tagline">
                Proven Reliability.
              </p>
              <p data-item className="font-display film-tagline">
                <span className="accent">Delivered.</span>
              </p>
              <Ctas {...ctaProps} />
            </div>
          </div>
        </div>

        <div className="film-rail" aria-hidden="true">
          <div className="film-rail-track">
            <div ref={railFillRef} className="rail-fill" />
          </div>
          <ol className="film-rail-ticks">
            {RAIL_TICKS.map((t, i) => (
              <li
                key={t.label}
                ref={(el) => {
                  tickRefs.current[i] = el;
                }}
                style={{ top: `${((t.frame - 1) / (FRAME_COUNT - 1)) * 100}%` }}
              >
                <span className="film-tick-label">{t.label}</span>
                <span className="film-tick-dot" />
              </li>
            ))}
          </ol>
        </div>

        {/* <768px only: persistent CTA while the film plays (see updatePill) */}
        <div ref={pillRef} className="film-pill">
          <Button href={primaryCta.href} variant="primary" data-cta="mobile-pill">
            {primaryCta.label}
          </Button>
        </div>

        {debug && <pre ref={debugRef} className="film-debug" aria-hidden="true" />}
      </div>
    </section>
  );
}

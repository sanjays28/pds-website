"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "@/motion/useReducedMotion";
import { useInViewOnce } from "@/lib/useInViewOnce";

/**
 * AboutIntro — three parts in one section (id="about"):
 *  1. the promise statement, revealed word by word as you scroll. ≥1024px it
 *     is pinned (200vh wrapper, sticky 100vh stage); below that it is a normal
 *     block whose reveal follows its position in the viewport. Reduced motion:
 *     no pin, every word revealed.
 *  2. three supporting paragraphs
 *  3. "Who We Are"
 *
 * The statement is a normal paragraph: the full sentence is real text for
 * assistive tech (visually hidden), and the per-word spans are aria-hidden so
 * it is exposed exactly once.
 */
const STATEMENT =
  "At Proven Delivery Services, we understand that every delivery is more than the movement of a package - it is a promise made by a business to its customer.";
const WORDS = STATEMENT.split(" ");
const KEY_WORD = "promise";

const SUPPORT = [
  "Our goal is to help businesses across the UAE build dependable and efficient delivery operations without the complexity of managing riders and fleets independently.",
  "By combining skilled delivery professionals, structured fleet operations, technology-enabled coordination, and a strong safety culture, we provide flexible last-mile delivery solutions that support both daily operations and long-term business growth.",
  "We approach every delivery with professionalism, accountability, and care. From pickup to final handover, our team works to maintain service quality while protecting the reputation of the businesses we represent.",
];

const HOLD_START = 0.08;
const REVEAL_END = 0.7; // fully lit by p=0.70, then held until the section unpins
const SNAP = 0.002; // eased value snaps to the target inside this distance
const PINNED_GAP_MAX = 96; // statement → paragraph row, desktop
const EASE = 0.14;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function AboutIntro() {
  const reduced = useReducedMotion();
  const [wide, setWide] = useState(false);
  useLayoutEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    setWide(mql.matches);
    const on = (e: MediaQueryListEvent) => setWide(e.matches);
    mql.addEventListener("change", on);
    return () => mql.removeEventListener("change", on);
  }, []);

  const pinned = wide && !reduced;
  const wrapRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef<HTMLDivElement>(null);
  const stmtRef = useRef<HTMLParagraphElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  /* ---- scroll-scrubbed reveal (eased; native scroll only) ---- */
  useEffect(() => {
    const words = wordRefs.current;
    const wrapEl = wrapRef.current;
    const paint = (r: number) => {
      const count = Math.ceil(r * WORDS.length - 1e-9);
      words.forEach((w, i) => {
        if (!w) return;
        const on = i < count;
        if (on !== (w.dataset.on === "true")) {
          if (on) w.dataset.on = "true";
          else delete w.dataset.on;
        }
      });
    };
    if (reduced) {
      paint(1);
      return;
    }

    let top = 0;
    let height = 0;
    let vh = 0;
    let current = -1;
    let raf = 0;

    const measure = () => {
      vh = window.innerHeight;
      if (pinned) {
        const wrap = wrapRef.current;
        const stick = stickRef.current;
        const stmt = stmtRef.current;
        if (wrap && stick && stmt) {
          // The stage centres its content in 100vh, which leaves a big empty tail below the
          // statement once unpinned. Pull the next block up so statement → paragraph row is
          // at most PINNED_GAP_MAX (the stage's own internal spacing is untouched).
          const tail = stick.getBoundingClientRect().bottom - stmt.getBoundingClientRect().bottom;
          wrap.style.marginBottom = `${-Math.max(0, Math.round(tail - PINNED_GAP_MAX))}px`;
          const r = wrap.getBoundingClientRect();
          top = r.top + window.scrollY;
          height = r.height;
        }
      }
    };
    // pinned: p across the wrapper, reveal over 0.10–0.85; unpinned: the statement's
    // top crossing 80% of the viewport → its bottom reaching 40%
    const target = () => {
      if (pinned) {
        const p = clamp01((window.scrollY - top) / Math.max(1, height - vh));
        return clamp01((p - HOLD_START) / (REVEAL_END - HOLD_START));
      }
      const r = stmtRef.current?.getBoundingClientRect();
      if (!r) return 0;
      // starts when the top reaches 80% of the viewport, completes when the bottom reaches 55%
      return clamp01((0.8 * vh - r.top) / (0.25 * vh + r.height));
    };
    const tick = () => {
      raf = 0;
      const t = target();
      if (current < 0) current = t;
      current += (t - current) * EASE;
      if (Math.abs(t - current) < SNAP) current = t;
      paint(current);
      if (current !== t) raf = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    measure();
    onScroll();
    const ro = new ResizeObserver(() => {
      measure();
      onScroll();
    });
    if (wrapRef.current) ro.observe(wrapRef.current);
    if (stickRef.current) ro.observe(stickRef.current);
    document.fonts?.ready.then(() => {
      measure();
      onScroll();
    });
    window.addEventListener("load", measure);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      if (wrapEl) wrapEl.style.marginBottom = "";
      ro.disconnect();
      window.removeEventListener("load", measure);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pinned, reduced]);

  const [supportRef, supportIn] = useInViewOnce<HTMLDivElement>(0.25);
  const [whoRef, whoIn] = useInViewOnce<HTMLDivElement>(0.25);

  return (
    <section id="about" className="about" data-spine-node="About">
      <div ref={wrapRef} className={pinned ? "ab-pin h-[200vh]!" : "ab-flow pb-14! lg:pb-24!"}>
        <div ref={stickRef} className="ab-stick">
          <div className="ab-inner">
            <p className="eyebrow">About Us</p>
            <h2 className="font-display ab-h2">
              Delivering <span className="accent">Reliability</span> at Every Mile
            </h2>
            <p ref={stmtRef} className="ab-statement">
              <span className="sr-only">{STATEMENT}</span>
              <span aria-hidden="true">
                {WORDS.map((w, i) => (
                  <span key={i}>
                    <span
                      ref={(el) => {
                        wordRefs.current[i] = el;
                      }}
                      className="ab-w"
                      data-key={w === KEY_WORD || undefined}
                    >
                      {w}
                    </span>
                    {i < WORDS.length - 1 ? " " : ""}
                  </span>
                ))}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="ab-rest">
        <div ref={supportRef} className="ab-support" data-in={supportIn || undefined}>
          {SUPPORT.map((t, i) => (
            <p key={i} className="ab-col rv" style={{ "--d": `${i * 80}ms` } as CSSProperties}>
              {t}
            </p>
          ))}
        </div>

        <div ref={whoRef} className="ab-who mt-[72px]! pb-4!" data-in={whoIn || undefined}>
          <p className="eyebrow rv" style={{ "--d": "0ms" } as CSSProperties}>
            Who We Are
          </p>
          <div className="ab-who-grid">
            <p className="ab-who-lead rv" style={{ "--d": "80ms" } as CSSProperties}>
              Proven Delivery Services (PDS) is a UAE-based last-mile logistics company providing reliable, safe, and efficient delivery solutions for businesses and individual customers.
            </p>
            <div className="ab-who-body rv" style={{ "--d": "160ms" } as CSSProperties}>
              <p>
                We support our clients with trained delivery riders, professional fleet management, well-maintained motorcycles, disciplined operational processes, and customer-focused service.
              </p>
              <p>
                Whether you operate an E-commerce platform, restaurant, retail store, pharmacy, Q-commerce, or corporate business, PDS helps you simplify delivery operations and ensure every shipment reaches its destination safely and on time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

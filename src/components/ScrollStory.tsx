"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import Image from "next/image";
import { ensureGsapRegistered, gsap } from "@/motion/gsap";
import { useReducedMotion } from "@/motion/useReducedMotion";
import { cn } from "@/lib/utils";

export interface StoryBeat {
  icon: ReactNode;
  /** Plain text; use `accent` for the part that should render in brand green. */
  text: string;
  accent?: string;
}

export interface ScrollStoryProps {
  id: string;
  /** Small corner label, e.g. "Our Story" — mirrors the coming-soon build's "03 · THE ROAD". */
  label: string;
  beats: StoryBeat[];
  className?: string;
}

/**
 * ScrollStory — WMS motion registry **M06** ("Pinned horizontal story:
 * scroll = riding"), built for the first time here. Ported from
 * proven-coming-soon.html's `#story` section (its "03 · THE ROAD" block)
 * mechanic-for-mechanic, generalized to any number of beats and restyled
 * onto this project's tokens instead of that file's inline custom
 * properties (same brand palette either way, so nothing actually looks
 * different — just no hardcoded hex left over from the reference file).
 *
 * Desktop: pins the section for 260% of scroll distance while a
 * full-width track slides horizontally — vertical scroll input drives
 * horizontal movement, with a rider marker travelling a road line at the
 * same pace (velocity also drives a stretching "trail" streak behind it)
 * and the current beat staying full-opacity while its neighbors dim.
 *
 * Mobile: the whole pin/scrub mechanic is skipped in favor of a native
 * horizontal scroll-snap carousel with dot indicators and a brief
 * "flash" pull-light on each swipe — exactly the coming-soon build's own
 * fallback, not a new one invented for this component.
 *
 * Reduced motion: beats stack as a plain vertical list — no pin, no
 * horizontal scroll, no rider. Matches WMS §9.3.
 */
export function ScrollStory({ id, label, beats, className }: ScrollStoryProps) {
  const reduced = useReducedMotion();
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const riderBoxRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);

  // ---- Desktop: pin + horizontal scrub (mirrors the reference file's
  // ScrollTrigger block almost verbatim, generalized for beats.length). ----
  useLayoutEffect(() => {
    if (reduced) return;
    const isCoarseOrNarrow = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    if (isCoarseOrNarrow) return;
    if (!pinRef.current || !trackRef.current) return;
    ensureGsapRegistered();

    const panels = panelRefs.current.filter((p): p is HTMLDivElement => Boolean(p));
    const n = beats.length;

    const ctx = gsap.context(() => {
      gsap.to(trackRef.current, {
        x: `${-(n - 1) * 100}vw`,
        ease: "none",
        scrollTrigger: {
          trigger: pinRef.current,
          start: "top top",
          end: "+=260%",
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          onUpdate(self) {
            const vw = window.innerWidth;
            const x = 0.06 * vw + self.progress * (0.78 * vw);
            const v = Math.min(Math.abs(self.getVelocity()) / 1400, 2.4);
            if (riderBoxRef.current) riderBoxRef.current.style.transform = `translateX(${x}px)`;
            if (trailRef.current) {
              trailRef.current.style.transform = `translateY(-50%) scaleX(${1 + v * 1.6})`;
              trailRef.current.style.opacity = String(0.25 + v * 0.35);
            }
            const active = Math.min(n - 1, Math.floor(self.progress * n));
            panels.forEach((p, i) => {
              const off = Math.abs(i - active);
              gsap.to(p, { scale: off ? 0.9 : 1, opacity: off ? 0.38 : 1, duration: 0.35, overwrite: true });
            });
          },
        },
      });
    }, pinRef);

    return () => ctx.revert();
  }, [reduced, beats.length]);

  // ---- Mobile: native scroll-snap carousel with dots + flash pulse
  // (mirrors the reference file's initMobileStory almost verbatim). ----
  useEffect(() => {
    if (reduced) return;
    const isCoarseOrNarrow = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    if (!isCoarseOrNarrow) return;
    const track = trackRef.current;
    const dotsWrap = dotsRef.current;
    const panels = panelRefs.current.filter((p): p is HTMLDivElement => Boolean(p));
    if (!track || !panels.length || !dotsWrap) return;

    dotsWrap.innerHTML = "";
    const dots: HTMLButtonElement[] = panels.map((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `Story panel ${i + 1}`);
      b.addEventListener("click", () => {
        panels[i].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      });
      dotsWrap.appendChild(b);
      return b;
    });

    let active = -1;
    let flashLock = false;
    function setActive(i: number) {
      if (i === active) return;
      const changed = active !== -1;
      active = i;
      panels.forEach((p, idx) => p.classList.toggle("is-active", idx === i));
      dots.forEach((d, idx) => d.setAttribute("aria-current", idx === i ? "true" : "false"));
      if (numRef.current) numRef.current.textContent = `${label} · ${i + 1}/${panels.length}`;
      if (changed && flashRef.current && !flashLock) {
        flashLock = true;
        const flash = flashRef.current;
        flash.classList.remove("fire");
        void flash.offsetWidth;
        flash.classList.add("fire");
        window.setTimeout(() => {
          flash.classList.remove("fire");
          flashLock = false;
        }, 560);
      }
    }

    function nearestPanel() {
      if (!track) return 0;
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      panels.forEach((p, i) => {
        const c = p.offsetLeft + p.offsetWidth / 2;
        const d = Math.abs(c - mid);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      return best;
    }

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setActive(nearestPanel());
        ticking = false;
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    setActive(0);

    return () => {
      track.removeEventListener("scroll", onScroll);
      dotsWrap.innerHTML = "";
    };
  }, [reduced, beats.length, label]);

  if (reduced) {
    return (
      <section id={id} className={cn("scroll-story scroll-story-static", className)} aria-label={label}>
        <div className="wrap">
          {beats.map((beat, i) => (
            <div key={i} className="story-panel story-panel-static">
              <span className="story-icon">{beat.icon}</span>
              <h3>
                {beat.text}
                {beat.accent && <span className="s-accent"> {beat.accent}</span>}
              </h3>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id={id} className={cn("scroll-story", className)} aria-label={label}>
      <div ref={pinRef} className="story-pin">
        <div ref={numRef} className="story-num" aria-hidden="true">
          {label}
        </div>
        <div ref={flashRef} className="story-flash" aria-hidden="true" />
        <div ref={trackRef} className="story-track">
          {beats.map((beat, i) => (
            <div
              key={i}
              ref={(el) => {
                panelRefs.current[i] = el;
              }}
              className="story-panel"
            >
              <span className="story-icon">{beat.icon}</span>
              <h3>
                {beat.text}
                {beat.accent && <span className="s-accent"> {beat.accent}</span>}
              </h3>
            </div>
          ))}
        </div>
        <div ref={dotsRef} className="story-dots" aria-label={`${label} panels`} />
        <div className="story-road" aria-hidden="true" />
        <div ref={riderBoxRef} className="story-rider-box">
          <div ref={trailRef} className="story-trail" aria-hidden="true" />
          <Image
            className="story-rider"
            src="/rider.png"
            alt=""
            aria-hidden="true"
            width={110}
            height={110}
          />
        </div>
      </div>
    </section>
  );
}

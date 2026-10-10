"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { PinIcon } from "@/components/PinIcon";
import { useReducedMotion } from "@/motion/useReducedMotion";

/**
 * RouteSpine — continues the hero's floor route down the page: a thin line on
 * the left edge that fills as you scroll, lights a node at each section that
 * carries `data-spine-node="<label>"`, and ends in the same map pin the hero
 * route ends with (at #contact). Decorative: aria-hidden, no pointer events.
 *
 * The wrapper starts where the hero ends, so the line is empty until the film
 * is over — its tip is pinned to 60% of the viewport height, so it only starts
 * drawing once the wrapper's top reaches that point. Motion is one passive
 * scroll listener → rAF, easing `current += (target - current) * 0.14` like
 * the hero; the rider icon from the old page rail rides the tip. The rAF loop reads no layout (wrapper top/height and node offsets
 * are cached, refreshed by ResizeObserver / fonts / load).
 *
 * Below 1024px the spine is hidden entirely: sections are padded 20px there,
 * so a line 16px from the edge would sit against the text.
 */
const EASE = 0.14;
const TIP_AT = 0.6; // tip sits at 60% of viewport height

interface SpineNode {
  label: string;
  y: number;
  pin: boolean;
}

export function RouteSpine({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [nodes, setNodes] = useState<SpineNode[]>([]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    let top = 0;
    let height = 0;
    let vh = 0;
    let ys: number[] = [];
    let pins: boolean[] = [];
    let current = 0;
    let raf = 0;
    let first = true;
    let maxScroll = 0;

    // At the very bottom of the page the line completes, even when the footer is
    // shorter than the tip's offset from the viewport bottom.
    const target = () =>
      window.scrollY >= maxScroll - 2 ? height : Math.min(height, Math.max(0, window.scrollY + vh * TIP_AT - top));
    const setOn = (el: HTMLElement | null, on: boolean) => {
      if (!el) return;
      if (on !== (el.dataset.on === "true")) {
        if (on) el.dataset.on = "true";
        else delete el.dataset.on;
      }
    };
    const paint = () => {
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${height ? (current / height).toFixed(4) : 0})`;
      if (tipRef.current) {
        tipRef.current.style.transform = `translate3d(0,${current.toFixed(1)}px,0)`;
        tipRef.current.style.opacity = current > 1 && current < height - 1 ? "1" : "0";
      }
      ys.forEach((y, i) => setOn(nodeRefs.current[i], current >= y));
    };
    const paintReduced = () => {
      if (fillRef.current) fillRef.current.style.transform = "scaleY(1)";
      if (tipRef.current) tipRef.current.style.opacity = "0";
      ys.forEach((_, i) => setOn(nodeRefs.current[i], pins[i]));
    };
    const tick = () => {
      raf = 0;
      const t = target();
      current += (t - current) * EASE;
      if (Math.abs(t - current) < 0.3) current = t;
      paint();
      if (current !== t) raf = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const measure = () => {
      const r = wrap.getBoundingClientRect();
      top = r.top + window.scrollY;
      height = r.height;
      vh = window.innerHeight;
      maxScroll = document.documentElement.scrollHeight - vh;
      const list: SpineNode[] = Array.from(wrap.querySelectorAll<HTMLElement>("[data-spine-node]")).map((el) => ({
        label: el.dataset.spineNode ?? "",
        y: Math.round(el.getBoundingClientRect().top + window.scrollY - top),
        pin: el.id === "contact",
      }));
      ys = list.map((n) => n.y);
      pins = list.map((n) => n.pin);
      setNodes((prev) => (JSON.stringify(prev) === JSON.stringify(list) ? prev : list));
      if (reduced) {
        paintReduced();
        return;
      }
      if (first) {
        current = target(); // loading mid-page: don't tween from 0
        first = false;
      }
      onScroll();
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    document.fonts?.ready.then(measure);
    window.addEventListener("load", measure);
    window.addEventListener("resize", measure);
    if (!reduced) window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("load", measure);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduced]);

  // Node elements exist only after the first measure → light them once rendered.
  useEffect(() => {
    if (reduced) {
      nodes.forEach((n, i) => {
        const el = nodeRefs.current[i];
        if (el && n.pin) el.dataset.on = "true";
      });
    } else {
      window.dispatchEvent(new Event("scroll")); // runs the spine's own scroll → rAF paint
    }
  }, [nodes, reduced]);

  return (
    <div ref={wrapRef} className="spine-wrap">
      {children}
      <div className="spine" aria-hidden="true">
        <div className="spine-track" />
        <div ref={fillRef} className="spine-fill" />
        <div ref={tipRef} className="spine-tip">
          <Image src="/rider.png" alt="" width={34} height={34} aria-hidden="true" />
        </div>
        {nodes.map((n, i) => (
          <div
            key={n.label}
            ref={(el) => {
              nodeRefs.current[i] = el;
            }}
            className="spine-node"
            style={{ top: n.y }}
          >
            {n.pin ? (
              <span className="spine-pin">
                <PinIcon />
              </span>
            ) : (
              <span className="spine-dot" />
            )}
            <span className="spine-label">{n.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

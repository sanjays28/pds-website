"use client";

import { useEffect, useRef, useState } from "react";
import AnimatedBackground from "@/components/ui/animated-background";
import { useReducedMotion } from "@/motion/useReducedMotion";

/**
 * WhyPds — eight reasons as a plain ordered list. On first view (≥35% of the
 * grid) the items arrive in reading order: each lamp lights, its title goes
 * white, the item slides in, and the header counter ticks up. It plays once and
 * then everything stays still. Reduced motion: all lit, counter at 08 / 08.
 *
 * Hover (fine pointer only): a shared wash slides between reasons. Touch does
 * not stick a highlight. Semantics: <ol>/<li> with real headings; lamps and
 * counter are aria-hidden.
 */
const ITEMS = [
  { title: "Trained Delivery Riders", body: "Our riders are selected and trained to provide safe, professional, and customer-focused delivery service." },
  { title: "Reliable Fleet Operations", body: "We maintain organized fleet processes and road-ready motorcycles to support consistent daily operations." },
  { title: "Safety-Focused Approach", body: "Safety remains a key priority across rider management, fleet maintenance, shipment handling, and delivery execution." },
  { title: "Flexible Business Solutions", body: "Our services can be tailored to match your industry, delivery requirements, business size, and operational volume." },
  { title: "B2B Expertise", body: "We support deliveries between businesses as well as direct deliveries to individual customers." },
  { title: "Professional Brand Representation", body: "Our riders understand that they represent your business during the final customer interaction." },
  { title: "Customer-Focused Service", body: "We work closely with clients to understand their requirements and provide solutions that support their business goals." },
  { title: "Technology-Supported Operations", body: "We use technology and organized processes to improve coordination, visibility, communication, and overall delivery efficiency." },
] as const;

const pad = (n: number) => String(n).padStart(2, "0");
const START_DELAY = 200;

const HOVER_SPRING = { type: "spring" as const, bounce: 0.2, duration: 0.6 };

export function WhyPds() {
  const gridRef = useRef<HTMLOListElement>(null);
  const [lit, setLit] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLit(ITEMS.length); // everything lit, no motion
      return;
    }
    const timers: number[] = [];
    const io = new IntersectionObserver(
      ([e]) => {
        // "≥35% in view": of the grid, or of the viewport when the grid is taller than that
        // (a single-column phone layout never shows 35% of the whole list at once)
        const need = Math.min(0.35 * e.boundingClientRect.height, 0.35 * window.innerHeight);
        if (!e.isIntersecting || e.intersectionRect.height < need) return;
        io.disconnect(); // plays once, never replays
        const stagger = window.matchMedia("(min-width: 1024px)").matches ? 140 : 100;
        ITEMS.forEach((_, k) => timers.push(window.setTimeout(() => setLit(k + 1), START_DELAY + k * stagger)));
      },
      { threshold: Array.from({ length: 21 }, (_, k) => k / 20) },
    );
    io.observe(grid);
    return () => {
      io.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  return (
    <section
      id="why-pds"
      className="section why"
      data-spine-node="Why PDS"
    >
      <div className="wrap">
        <div className="why-head">
          <div>
            <p className="eyebrow">Why Choose PDS?</p>
            <h2 className="font-display why-h2">
              A Delivery Partner You Can <span className="accent">Depend</span> On
            </h2>
          </div>
          <p className="why-count" aria-hidden="true">
            <span className="why-count-now">{pad(lit)}</span> / {pad(ITEMS.length)}
          </p>
        </div>

        <ol ref={gridRef} className="why-grid">
          <AnimatedBackground
            className="why-hover"
            enableHover
            transition={reduced ? { duration: 0 } : HOVER_SPRING}
          >
            {ITEMS.map((item, i) => (
              <li key={item.title} data-id={item.title} className="why-item" data-lit={i < lit || undefined}>
                <div className="why-meta" aria-hidden="true">
                  <span className="why-lamp" />
                  <span className="why-num">{pad(i + 1)}</span>
                </div>
                <h3 className="font-display why-name">{item.title}</h3>
                <p className="why-body">{item.body}</p>
              </li>
            ))}
          </AnimatedBackground>
        </ol>
      </div>
    </section>
  );
}

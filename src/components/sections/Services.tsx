"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { MANIFEST } from "@/lib/heroFilm";
import { useReducedMotion } from "@/motion/useReducedMotion";
import { ServiceSchematic } from "@/components/sections/ServiceSchematic";

/**
 * Services — a "service board": nine rows (callsign + name) where the active
 * row expands to its description, beside a sticky route schematic
 * (ServiceSchematic). Codes and names come from the hero's MANIFEST so the two
 * never drift; the descriptions live here, in the same order.
 *
 * Desktop ≥1024px: board (7) + sticky schematic (5). Below that: an accordion
 * with the schematic shown inside the open row, above the description.
 */
const SERVICES = [
  {
    body: "Reliable business-to-business delivery solutions for the movement of documents, products, supplies, and commercial shipments between offices, stores, warehouses, branches, and business locations. Our B2B services help companies maintain smooth and efficient daily operations.",
  },
  {
    body: "Scalable last-mile support for online stores, marketplaces, and e-commerce businesses. Our delivery solutions help online retailers manage growing order volumes while maintaining reliable service and customer satisfaction.",
  },
  {
    body: "Responsive delivery support for dark stores and quick-commerce operations where coordination, accuracy, and operational speed are essential.",
  },
  {
    body: "Dependable rider and delivery support for restaurants, cafés, cloud kitchens, and food-service businesses. Our trained riders follow disciplined delivery procedures to help orders reach customers safely and efficiently.",
  },
  {
    body: "Professional delivery solutions for pharmacies and healthcare-related retailers, with a focus on responsible handling, customer care, and dependable service.",
  },
  {
    body: "Flexible delivery support for retail stores and brands that need products transported directly to customers or between business locations.",
  },
  {
    body: "Organized delivery services for offices and corporate clients requiring the secure and dependable movement of documents, packages, and essential business items.",
  },
  {
    body: "Access trained, disciplined, and customer-focused delivery riders without the complexity of independently recruiting and managing a delivery workforce. Our rider solutions can be adapted to the client's operational requirements and delivery volumes.",
  },
  {
    body: "Structured fleet support designed to maintain delivery efficiency, motorcycle readiness, rider coordination, and operational continuity. We focus on organized fleet processes and well-maintained motorcycles to reduce unnecessary delays and support dependable delivery performance.",
  },
] as const;

export function Services() {
  const [active, setActive] = useState(0);
  const [entered, setEntered] = useState(false);
  const [hint, setHint] = useState<"show" | "fading" | "gone">("show");
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const boardRef = useRef<HTMLUListElement>(null);
  const timer = useRef(0);
  const lastScroll = useRef(0);
  const demoDone = useRef(false); // the auto demo runs at most once per page load; never persisted
  const stopDemo = useRef<() => void>(() => {});

  // Activation comes ONLY from direct actions (click/tap, Enter/Space, arrow keys).
  // Hover never changes state (it is CSS-only): rows moving under a resting
  // cursor while the page scrolls used to fire hover → expand → shift → hover.
  // Requests are debounced 120ms so rapid clicks / arrow presses resolve to the
  // last one, and nothing observer- or scroll-driven ever calls this.
  const requestSelect = (i: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setActive(i), 120);
  };
  const dismissHint = () => {
    if (hint !== "show") return;
    if (reduced) {
      setHint("gone");
      return;
    }
    setHint("fading");
    window.setTimeout(() => setHint("gone"), 300);
  };
  const onClick = (i: number) => {
    stopDemo.current();
    // a click landing mid-scroll (e.g. a tap that stops momentum) is not a selection
    if (performance.now() - lastScroll.current < 100) return;
    dismissHint();
    requestSelect(i);
  };

  useEffect(() => {
    const onScroll = () => {
      lastScroll.current = performance.now();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer.current);
    };
  }, []);

  // One-time auto demo (fine pointers only, never with reduced motion): once the
  // section is ≥40% in view and nothing has been touched, step B2B → ECOM → QCOM
  // → B2B, 3s each, through the same debounced request as a click. Any click,
  // tap, key, focus in the list, pointer movement over the list, or the section
  // leaving the viewport ends it for good and leaves whichever row is active.
  // Scrolling itself neither starts nor stops it (only the viewport rule above).
  useEffect(() => {
    const sec = sectionRef.current;
    const ul = boardRef.current;
    if (!sec || !ul) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine || reduced) return;

    const timers: number[] = [];
    let started = false;
    const stop = () => {
      demoDone.current = true;
      timers.forEach((t) => window.clearTimeout(t));
      timers.length = 0;
      sec.removeEventListener("pointerdown", stop, true);
      document.removeEventListener("keydown", stop);
      ul.removeEventListener("focusin", stop);
      ul.removeEventListener("pointermove", stop);
    };
    stopDemo.current = stop;
    sec.addEventListener("pointerdown", stop, true);
    document.addEventListener("keydown", stop);
    ul.addEventListener("focusin", stop);
    ul.addEventListener("pointermove", stop);

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) {
          if (started) stop(); // leaving the viewport ends a running demo for good
          return;
        }
        if (demoDone.current || e.intersectionRatio < 0.4) return;
        started = true;
        demoDone.current = true; // at most once; stop() also marks it
        [1, 2, 0].forEach((row, k) => timers.push(window.setTimeout(() => requestSelect(row), 3000 * (k + 1))));
      },
      { threshold: [0, 0.4] },
    );
    io.observe(sec);
    return () => {
      io.disconnect();
      stop();
    };
  }, [reduced]);

  // Reserve the list's tallest-state height (tallest open row + the other eight
  // collapsed) so switching rows never changes the section's height. Measured
  // from content (scrollHeight works while collapsed), re-measured on width
  // changes and when fonts load — never on height, which this itself sets.
  useEffect(() => {
    const ul = boardRef.current;
    if (!ul) return;
    const measure = () => {
      const heads = Array.from(ul.querySelectorAll<HTMLElement>(".svc-head"));
      const inners = Array.from(ul.querySelectorAll<HTMLElement>(".svc-desc-inner"));
      if (!heads.length) return;
      const collapsed = heads.reduce((sum, h) => sum + h.offsetHeight + 1, 0); // +1: row divider
      const tallest = Math.max(...inners.map((n) => n.scrollHeight));
      ul.style.minHeight = `${Math.ceil(collapsed + tallest + 8)}px`; // +8: slack for sub-pixel rounding of the measured pieces
    };
    let lastW = 0;
    const ro = new ResizeObserver(([e]) => {
      if (Math.round(e.contentRect.width) === lastW) return;
      lastW = Math.round(e.contentRect.width);
      measure();
    });
    ro.observe(ul);
    measure();
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, []);

  // Entrance: rows stagger in once, when the section is actually in view.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setEntered(true);
        io.disconnect();
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const next = (i + (e.key === "ArrowDown" ? 1 : -1) + SERVICES.length) % SERVICES.length;
    rowRefs.current[next]?.focus(); // focus only moves; activation is the debounced request
    stopDemo.current();
    dismissHint();
    requestSelect(next);
  };

  return (
    <section
      id="services"
      ref={sectionRef}
      className="section svc"
      data-spine-node="Services"
      data-in={entered || undefined}
    >
      <div className="wrap">
        <p className="eyebrow">Our Services</p>
        <h2 className="font-display svc-title">
          Complete <span className="accent">Last-Mile</span> Delivery Solutions
        </h2>
        <p className="text-w70 svc-sub">
          PDS provides flexible delivery and fleet solutions designed for businesses of different sizes and industries.
        </p>

        <div className="svc-hint-wrap">
          {hint !== "gone" && (
            <p className="svc-hint" data-fading={hint === "fading" || undefined}>
              <span className="svc-hint-dot" aria-hidden="true" />
              Select a service
            </p>
          )}
        </div>

        <div className="svc-grid">
          <ul ref={boardRef} className="svc-board">
            {MANIFEST.map((row, i) => {
              const on = i === active;
              return (
                <li key={row.code} className="svc-row" data-on={on || undefined} style={{ "--i": i } as React.CSSProperties}>
                  <button
                    type="button"
                    ref={(el) => {
                      rowRefs.current[i] = el;
                    }}
                    className="svc-head"
                    aria-expanded={on}
                    aria-controls={`svc-desc-${i}`}
                    id={`svc-head-${i}`}
                    onClick={() => onClick(i)}
                    onKeyDown={(e) => onKeyDown(e, i)}
                  >
                    <span className="svc-code">{row.code}</span>
                    <span className="font-display svc-name">{row.name}</span>
                    <svg className="svc-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </button>
                  <div id={`svc-desc-${i}`} role="region" aria-labelledby={`svc-head-${i}`} className="svc-desc">
                    <div className="svc-desc-inner">
                      {/* mobile (<1024px): the schematic sits inside the open row */}
                      <div className="svc-row-sch">{on && <ServiceSchematic index={i} compact />}</div>
                      <p>{SERVICES[i].body}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="svc-panel">
            <ServiceSchematic index={active} />
          </div>
        </div>
      </div>
    </section>
  );
}

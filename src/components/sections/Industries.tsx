"use client";

import type { CSSProperties } from "react";
import { useInViewOnce } from "@/lib/useInViewOnce";

/**
 * Industries — an intro line, ten non-interactive pills (a plain <ul>), and a
 * closing line. On first view (25%) the pills slide in from the left in DOM
 * order, 50ms apart, each flashing a green border that settles back to #2A2A2A.
 * Plays once. No hover, no links, no buttons.
 */
const PILLS = [
  "E-commerce platforms",
  "Restaurants and cafés",
  "Cloud kitchens",
  "Q-commerce",
  "Retail businesses",
  "Pharmacies",
  "Grocery and convenience stores",
  "Corporate offices",
  "Online marketplaces",
  "Small and medium-sized businesses",
] as const;

const PILL_START = 100; // ms after the intro begins
const PILL_STEP = 50;

export function Industries() {
  const [ref, seen] = useInViewOnce<HTMLDivElement>(0.25);
  const closingDelay = PILL_START + PILLS.length * PILL_STEP + 100;

  return (
    <section id="industries" className="section ind">
      <div className="wrap">
        <div ref={ref} data-in={seen || undefined}>
          <p className="eyebrow">Industries We Serve</p>
          <p className="ind-intro rv-fade" style={{ "--d": "0ms" } as CSSProperties}>
            Proven Delivery Services supports clients across a wide range of industries, including:
          </p>
          <ul className="ind-pills">
            {PILLS.map((label, i) => (
              <li key={label} className="ind-pill rv" style={{ "--d": `${PILL_START + i * PILL_STEP}ms` } as CSSProperties}>
                {label}
              </li>
            ))}
          </ul>
          <p className="ind-closing rv-fade" style={{ "--d": `${closingDelay}ms` } as CSSProperties}>
            Our solutions can be adapted to suit different order volumes, delivery models, operating requirements, and customer expectations.
          </p>
        </div>
      </div>
    </section>
  );
}

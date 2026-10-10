"use client";

import type { CSSProperties } from "react";
import { useInViewOnce } from "@/lib/useInViewOnce";

/**
 * AboutPurpose — Mission & Vision, then the six Core Values. No spine node
 * (the About node belongs to AboutIntro). Entrances play once.
 */
const VALUES = [
  { name: "Reliability", body: "We work to complete every delivery accurately, responsibly, and within the expected timeframe." },
  { name: "Safety", body: "The safety of our riders, customers, shipments, and other road users remains central to our operations." },
  { name: "Professionalism", body: "Our riders and operational teams represent every client with discipline, respect, and a service-focused attitude." },
  { name: "Accountability", body: "We take ownership of every delivery and maintain clear responsibility throughout the process." },
  { name: "Efficiency", body: "We use organized processes, capable teams, and technology-supported operations to improve delivery performance." },
  { name: "Customer Focus", body: "We adapt our services to meet the operational requirements of each client and help them deliver a better customer experience." },
] as const;

export function AboutPurpose() {
  const [mvRef, mvIn] = useInViewOnce<HTMLDivElement>(0.25);
  const [valRef, valIn] = useInViewOnce<HTMLDivElement>(0.25);

  return (
    <section className="section ab-purpose pt-0!" aria-label="Our purpose and values">
      <div className="wrap">
        <div ref={mvRef} className="ab-mv pt-16! pb-14!" data-in={mvIn || undefined}>
          <div className="ab-mv-item rv" style={{ "--d": "0ms" } as CSSProperties}>
            <p className="eyebrow">Our Mission</p>
            <p className="ab-mv-text">
              To provide safe, reliable, and efficient last-mile delivery solutions that help businesses simplify their logistics operations, improve customer satisfaction, and grow with confidence.
            </p>
          </div>
          <span className="ab-mv-rule" aria-hidden="true" />
          <div className="ab-mv-item rv" style={{ "--d": "150ms" } as CSSProperties}>
            <p className="eyebrow">Our Vision</p>
            <p className="ab-mv-text">
              To become one of the Middle East most trusted last-mile delivery partners, recognized for operational excellence, professional riders, reliable fleet management, and consistent service quality.
            </p>
          </div>
        </div>

        <div ref={valRef} className="ab-values mt-6!" data-in={valIn || undefined}>
          <p className="eyebrow">Our Core Values</p>
          <ul className="ab-val-grid">
            {VALUES.map((v, i) => (
              <li key={v.name} className="ab-val rv" style={{ "--d": `${i * 70}ms` } as CSSProperties}>
                <span className="ab-vline" aria-hidden="true" />
                <h3 className="font-display ab-vname">{v.name}</h3>
                <p className="ab-vbody">{v.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

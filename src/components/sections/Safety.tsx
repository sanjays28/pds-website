"use client";

import type { CSSProperties } from "react";
import { useInViewOnce } from "@/lib/useInViewOnce";

/**
 * Safety — the safety block (5/12 + 7/12) and, below it, the commitment to
 * clients: a hairline rule whose green fill draws left to right, an eyebrow, a
 * statement and a supporting paragraph. Each part reveals once when it enters
 * view.
 */
export function Safety() {
  const [topRef, topIn] = useInViewOnce<HTMLDivElement>(0.25);
  const [clientsRef, clientsIn] = useInViewOnce<HTMLDivElement>(0.25);

  return (
    <section id="safety" className="section saf" data-spine-node="Safety">
      <div className="wrap">
        <div ref={topRef} className="saf-grid" data-in={topIn || undefined}>
          <div className="saf-left rv" style={{ "--d": "0ms" } as CSSProperties}>
            <p className="eyebrow">Our Commitment to Safety</p>
            <h2 className="font-display saf-h2">
              <span className="accent">Safety</span> Is Part of Every Delivery
            </h2>
          </div>
          <div className="saf-right">
            <p className="saf-lead rv" style={{ "--d": "120ms" } as CSSProperties}>
              At PDS, safety is not treated as an additional feature - it is an essential part of our operations.
            </p>
            <p className="saf-body rv" style={{ "--d": "240ms" } as CSSProperties}>
              We promote responsible riding, professional conduct, proper shipment handling, and regular motorcycle maintenance. Our safety-focused approach helps protect riders, customers, shipments, and the reputation of every client we serve.
            </p>
          </div>
        </div>

        <div ref={clientsRef} className="saf-clients" data-in={clientsIn || undefined}>
          <div className="saf-rule" aria-hidden="true">
            <span className="saf-rule-fill" />
          </div>
          <p className="eyebrow saf-clients-eyebrow">Our Commitment to Clients</p>
          <p className="saf-statement rv" style={{ "--d": "0ms" } as CSSProperties}>
            Your delivery operations directly influence how customers experience your brand. That is why we approach every assignment with accountability, professionalism, and attention to detail.
          </p>
          <p className="saf-clients-body rv" style={{ "--d": "120ms" } as CSSProperties}>
            By partnering with Proven Delivery Services, businesses gain a dependable last-mile delivery team committed to supporting operational efficiency, customer satisfaction, and sustainable growth.
          </p>
        </div>
      </div>
    </section>
  );
}

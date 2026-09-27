"use client";

import { useLayoutEffect, useRef } from "react";
import { ensureGsapRegistered, gsap } from "@/motion/gsap";
import { useReducedMotion } from "@/motion/useReducedMotion";
import { cn } from "@/lib/utils";

export interface RouteStop {
  title: string;
  body: string;
  status?: "done" | "now" | "upcoming";
}

export interface RouteTimelineProps {
  stops: RouteStop[];
  className?: string;
}

/**
 * RouteTimeline — WMS §8 contract: "roadmap/how-it-works · props:
 * stops[{title,body,status}] · scrub fill M09 · mobile: left-rail rows ·
 * a11y: <ol> semantics". Used for the Process section (5 steps).
 *
 * Reduced motion: the registry's own fallback for M09 is "60% static
 * fill" (not 0%) — a stopped-progress line reads as "in progress", which
 * is closer to the real content than either 0% or 100% would be.
 */
export function RouteTimeline({ stops, className }: RouteTimelineProps) {
  const wrapRef = useRef<HTMLOListElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return;
    if (!wrapRef.current || !fillRef.current) return;
    ensureGsapRegistered();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        fillRef.current,
        { height: "0%" },
        {
          height: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: wrapRef.current,
            start: "top 70%",
            end: "bottom 60%",
            scrub: 0.4,
          },
        },
      );
    }, wrapRef);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <ol ref={wrapRef} className={cn("route-wrap", className)}>
      <div className="route-line" aria-hidden="true">
        <div
          ref={fillRef}
          className="route-fill"
          style={reduced ? { height: "60%" } : undefined}
        />
      </div>
      {stops.map((stop, i) => (
        <li key={i} className={cn("stop", stop.status && `stop-${stop.status}`)}>
          <span className="pin" aria-hidden="true" />
          <div className="stop-body">
            <span className="chip">Step {i + 1}</span>
            <h5>{stop.title}</h5>
            <p>{stop.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

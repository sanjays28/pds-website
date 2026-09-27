"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { ensureGsapRegistered, gsap } from "@/motion/gsap";
import { useReducedMotion } from "@/motion/useReducedMotion";
import { SplitWords } from "@/components/SplitWords";
import { cn } from "@/lib/utils";

export interface SectionProps {
  /** Anchor id — the nav's anchor links point at these (e.g. "services"). */
  id: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  /** Direct children of this wrapper get the M07 stagger. Set false for
   * sections that manage their own internal reveal (e.g. RouteTimeline). */
  staggerChildren?: boolean;
  /** M13 streak wipe on 50% cross. Off for sections that already have a
   * dominant motion of their own (e.g. a pinned story). */
  wipe?: boolean;
}

/**
 * The reusable section wrapper — implements the WMS §11.2 "Standard Section
 * Timeline" contract in one place so every section reuses the same three
 * registry entries instead of a bespoke reveal:
 *
 *   enter 60% viewport:
 *     eyebrow fade-up                  (generic reveal, same easing as M02/M07)
 *     H2 words up+unblur               (M02)
 *     children stagger .08             (M07)
 *   cross 50%: streak wipe fires once  (M13)
 *
 * Reduced motion: GSAP never runs; everything renders in its final,
 * fully-visible state from first paint (WMS §9.3).
 */
export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className,
  staggerChildren = true,
  wipe = true,
}: SectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const staggerRef = useRef<HTMLDivElement>(null);
  const wipeRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return; // static end-state only — no ScrollTrigger instances created
    if (!sectionRef.current) return;
    ensureGsapRegistered();

    const ctx = gsap.context(() => {
      const words = titleRef.current
        ? titleRef.current.querySelectorAll<HTMLElement>(".split-word")
        : [];
      const staggerItems = staggerRef.current
        ? Array.from(staggerRef.current.children)
        : [];

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
          once: true,
        },
      });

      if (eyebrowRef.current) {
        tl.fromTo(
          eyebrowRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
          0,
        );
      }
      if (words.length) {
        tl.fromTo(
          words,
          { yPercent: 110, opacity: 0, filter: "blur(6px)" },
          {
            yPercent: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.75,
            stagger: 0.09,
            ease: "cubic-bezier(0.16,1,0.3,1)",
          },
          0.08,
        );
      }
      if (subtitleRef.current) {
        tl.fromTo(
          subtitleRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "cubic-bezier(0.16,1,0.3,1)" },
          0.15,
        );
      }
      if (staggerChildren && staggerItems.length) {
        tl.fromTo(
          staggerItems,
          { opacity: 0, y: 42 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: "cubic-bezier(0.16,1,0.3,1)",
          },
          0.2,
        );
      }

      if (wipe && wipeRef.current) {
        gsap.fromTo(
          wipeRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.5,
            ease: "cubic-bezier(0.7,0,0.84,0)",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "center 50%",
              once: true,
            },
          },
        );
      }
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [reduced, wipe, staggerChildren]);

  return (
    <section id={id} ref={sectionRef} className={cn("section", className)}>
      <div className="wrap">
        {eyebrow && (
          <p ref={eyebrowRef} className="eyebrow" data-reveal={reduced || undefined}>
            {eyebrow}
          </p>
        )}
        {title && (
          <h2 ref={titleRef} className="font-display" data-reveal={reduced || undefined}>
            <SplitWords text={title} />
          </h2>
        )}
        {subtitle && (
          <p
            ref={subtitleRef}
            className="text-w70"
            style={{ marginTop: 16 }}
            data-reveal={reduced || undefined}
          >
            {subtitle}
          </p>
        )}
        <div ref={staggerRef} data-reveal={reduced || undefined}>
          {children}
        </div>
      </div>
      {wipe && <span ref={wipeRef} className="streak-wipe" aria-hidden="true" />}
    </section>
  );
}

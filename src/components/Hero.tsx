"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { ensureGsapRegistered, gsap } from "@/motion/gsap";
import { useReducedMotion } from "@/motion/useReducedMotion";
import { SplitWords } from "@/components/SplitWords";
import { Button } from "@/components/Button";
import { HeroBackground } from "@/components/HeroBackground";

export interface HeroProps {
  chip?: string;
  title: string;
  /** Last word(s) of the title rendered in the brand accent color. */
  accentWord?: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
}

/**
 * Hero — the only section that animates on mount rather than on scroll
 * (it's already in view at first paint). Reuses M02 (headline unblur+slide)
 * for the h1, then a mount-only sequence for chip/sub/ctas, ending with a
 * one-time "ignite" flourish on the primary CTA — the coming-soon build's
 * `ignite-dim → ignite` pattern, condensed since there's no loader/countdown
 * gating it here.
 */
export function Hero({ chip, title, accentWord, subtitle, primaryCta, secondaryCta }: HeroProps) {
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const chipRef = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctasRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return;
    ensureGsapRegistered();

    const ctx = gsap.context(() => {
      const words = h1Ref.current?.querySelectorAll<HTMLElement>(".split-word") ?? [];
      const tl = gsap.timeline({ delay: 0.1 });

      if (chipRef.current) {
        tl.fromTo(chipRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: "cubic-bezier(0.16,1,0.3,1)" }, 0);
      }
      if (words.length) {
        tl.fromTo(
          words,
          { yPercent: 110, opacity: 0, filter: "blur(6px)" },
          { yPercent: 0, opacity: 1, filter: "blur(0px)", duration: 0.75, stagger: 0.09, ease: "cubic-bezier(0.16,1,0.3,1)" },
          0.15,
        );
      }
      if (subRef.current) {
        tl.fromTo(subRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: "cubic-bezier(0.16,1,0.3,1)" }, 0.5);
      }
      if (ctasRef.current) {
        tl.fromTo(ctasRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: "cubic-bezier(0.16,1,0.3,1)" }, 0.65);
      }
      tl.call(
        () => ctasRef.current?.querySelector("#hero-primary-cta")?.classList.add("cta-ignite"),
        undefined,
        0.75,
      );
    });

    return () => ctx.revert();
  }, [reduced]);

  const titleWords = accentWord ? title.replace(accentWord, "").trim() : title;

  return (
    <section id="home" className="hero" aria-label="Introduction">
      <HeroBackground />
      <div className="hero-grid">
        <div>
          {chip && (
            <span ref={chipRef} className="hero-chip" data-reveal={reduced || undefined}>
              <span className="pulse-dot" aria-hidden="true" />
              {chip}
            </span>
          )}
          <h1 ref={h1Ref} className="font-display">
            <SplitWords text={titleWords} />
            {accentWord && (
              <>
                {" "}
                <span className="split-word-wrap">
                  <span className="split-word accent">{accentWord}</span>
                </span>
              </>
            )}
          </h1>
          <p ref={subRef} className="hero-sub" data-reveal={reduced || undefined}>
            {subtitle}
          </p>
          <div ref={ctasRef} className="hero-ctas" data-reveal={reduced || undefined}>
            <Button
              id="hero-primary-cta"
              href={primaryCta.href}
              variant="primary"
              className={reduced ? "cta-ignite" : undefined}
            >
              {primaryCta.label}
            </Button>
            <Button href={secondaryCta.href} variant="ghost">
              {secondaryCta.label}
            </Button>
          </div>
        </div>
        <Image
          className="hero-rider"
          src="/rider.png"
          alt="A Proven Delivery Services rider at speed"
          width={420}
          height={420}
          priority
        />
      </div>
      <div className="scroll-hint" aria-hidden="true">
        Scroll
      </div>
    </section>
  );
}

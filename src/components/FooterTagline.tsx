"use client";

import { useInViewOnce } from "@/lib/useInViewOnce";

/** Footer tagline band — decorative (a plain <p>, not a heading); fades/slides in once. */
export function FooterTagline() {
  const [ref, seen] = useInViewOnce<HTMLParagraphElement>(0.25);
  return (
    <p ref={ref} className="ft-tagline" data-in={seen || undefined}>
      Proven Reliability.
      <br />
      <span className="accent">Delivered.</span>
    </p>
  );
}

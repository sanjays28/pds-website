import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Card — WMS §8 PillarCard/ServiceCard, merged into one component since the
 * two only differ by an optional link (ServiceCard is "whole-card link with
 * inner focus ring"; PillarCard's "linked" variant is the same idea).
 *
 * Entrance stagger (M07) is owned by the parent <Section>, which staggers
 * its direct children — a grid of <Card> is exactly that. This component
 * only owns its own hover state (M08: tilt + tape unroll + glow), which
 * `Section` doesn't and shouldn't know about.
 */
export interface CardProps {
  icon?: ReactNode;
  title: string;
  body: string;
  /** Shown top-right per the coming-soon pillar cards (e.g. "01"). Optional. */
  index?: string;
  href?: string;
  className?: string;
}

export function Card({ icon, title, body, index, href, className }: CardProps) {
  const content = (
    <>
      <span className="card-tape" aria-hidden="true" />
      {index && <span className="card-num">{index}</span>}
      {icon && <span className="card-icon">{icon}</span>}
      <h3 className="card-title">{title}</h3>
      <p className="card-body">{body}</p>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn("card card-linked", className)}>
        {content}
      </Link>
    );
  }

  return (
    <article className={cn("card", className)}>
      {content}
    </article>
  );
}

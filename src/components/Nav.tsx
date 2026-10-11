"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";

export interface NavLink {
  label: string;
  href: string; // in-page anchor, e.g. "#services"
}

export interface NavProps {
  logoSrc: string;
  logoAlt: string;
  links: NavLink[];
  ctaLabel: string;
  ctaHref: string;
  /** Label for the desktop nav pill only (the mobile menu keeps `ctaLabel`). */
  desktopCtaLabel?: string;
}

/**
 * Fixed anchor nav — the coming-soon build's topbar (glass-on-scroll),
 * generalized to accept data instead of hardcoded links since no section
 * content exists yet (Prompt 1 builds the shell only).
 *
 * Always visible: transparent over the hero film, switching to the glass
 * treatment (WMS §12.4, navbar is the sole sanctioned use) after 80px of
 * scroll — replaces the old "appear past 75vh" slide-in now that the hero
 * is a full-bleed film the nav has to sit on;
 * link underline sweep on hover/active is M16.
 *
 * FLAG: WMS §8 Navbar contract calls for a "mobile-sheet" with a full focus
 * trap. What's built here is a basic slide-down panel with Escape-to-close
 * and backdrop-click-to-close — a real focus trap (cycling Tab within the
 * sheet) is deferred until the nav has real content to trap focus around;
 * revisit before launch per the WMS §17 accessibility gate.
 */
export function Nav({ logoSrc, logoAlt, links, ctaLabel, ctaHref, desktopCtaLabel }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  // Nav pill is outlined over the hero film, solid green once the film ends.
  const [solidCta, setSolidCta] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 80);
      const hero = document.getElementById("hero");
      if (!hero) {
        setSolidCta(true);
        return;
      }
      const r = hero.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const progress = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 1;
      setSolidCta(progress >= 0.93 || r.bottom <= 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Lock page scroll while the menu is open (the sheet is a full-screen overlay).
  useEffect(() => {
    if (!mobileOpen) return;
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className={cn("topbar", (scrolled || mobileOpen) && "topbar-glass")}>
        <a href="#hero" className="topbar-mark" aria-label="Proven Delivery Services — home">
          <Image src={logoSrc} alt={logoAlt} width={140} height={40} priority={false} />
        </a>

        <nav className="topbar-links" aria-label="Primary">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="nav-link">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="topbar-cta">
          <Button href={ctaHref} variant="compact" className={cn(!solidCta && "btn-compact-outline")} data-cta="nav">
            {desktopCtaLabel ?? ctaLabel}
          </Button>
        </div>

        <button
          type="button"
          className="topbar-burger"
          aria-expanded={mobileOpen}
          aria-controls="mobile-sheet"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <div
        id="mobile-sheet"
        ref={sheetRef}
        className={cn("mobile-sheet", mobileOpen && "mobile-sheet-open")}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!mobileOpen}
      >
        <nav aria-label="Mobile primary">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="mobile-nav-link"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <Button href={ctaHref} variant="primary" className="mobile-sheet-cta" data-cta="nav">
          {ctaLabel}
        </Button>
      </div>
    </>
  );
}

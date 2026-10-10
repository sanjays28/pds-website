"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { scrollToY } from "@/lib/smoothScroll";
import { CONTACT_HREF, CONTACT_ID } from "@/lib/contact";

/**
 * Faq — seven questions in the same row pattern as Services. One row is open
 * at a time (the first on load); rows open only on click/tap/Enter/Space, and
 * ArrowUp/ArrowDown move focus between them. The answer opens with a
 * grid-template-rows 0fr → 1fr transition (never pixel height) plus a fade.
 *
 * FAQ_ITEMS is the single source of truth: the visible list and the FAQPage
 * JSON-LD below are both built from it, so they cannot disagree.
 */
const FAQ_ITEMS = [
  {
    q: "What types of delivery services does PDS provide?",
    a: "PDS provides B2B and B2C last-mile delivery solutions, including support for e-commerce businesses, restaurants, retailers, Q-commerce, pharmacies, corporate clients, and other commercial operations.",
  },
  {
    q: "Does PDS provide trained delivery riders?",
    a: "Yes. We provide trained and professional delivery riders who can support different industries and operational requirements.",
  },
  {
    q: "Does PDS manage delivery motorcycles?",
    a: "Yes. Our services are supported by professional fleet management and well-maintained motorcycles to help ensure reliable daily operations.",
  },
  {
    q: "Can your delivery solutions be customized?",
    a: "Yes. We can tailor our delivery and rider solutions based on your business type, delivery volume, operating model, and service requirements.",
  },
  {
    q: "Do you support both businesses and individual customers?",
    a: "Yes. PDS provides both business-to-business and business-to-consumer delivery solutions.",
  },
  {
    q: "Which industries do you serve?",
    a: "We serve E-commerce businesses, restaurants, cafés, cloud kitchens, Q-commerce, retailers, pharmacies, corporate clients, and other businesses requiring dependable last-mile delivery support.",
  },
  {
    q: "How can I request a delivery solution?",
    a: "Contact our team with your business requirements. We will review your needs and recommend a suitable delivery, rider, or fleet solution.",
  },
] as const;

const pad = (n: number) => String(n).padStart(2, "0");

const JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((it) => ({
    "@type": "Question",
    name: it.q,
    acceptedAnswer: { "@type": "Answer", text: it.a },
  })),
}).replace(/</g, "\\u003c");

export function Faq() {
  const [open, setOpen] = useState(0);
  const [entered, setEntered] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Entrance, once, when 25% of the list is in view.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setEntered(true);
        io.disconnect();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const next = (i + (e.key === "ArrowDown" ? 1 : -1) + FAQ_ITEMS.length) % FAQ_ITEMS.length;
    rowRefs.current[next]?.focus(); // focus only; activation is click / Enter / Space
  };

  return (
    <section
      id="faq"
      className="section faq"
      data-spine-node="FAQ"
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON_LD }} />
      <div className="wrap">
        <p className="eyebrow">Frequently Asked Questions</p>

        <ul ref={listRef} className="faq-list" data-in={entered || undefined}>
          {FAQ_ITEMS.map((it, i) => {
            const on = i === open;
            return (
              <li key={it.q} className="faq-row" data-on={on || undefined} style={{ "--i": i } as React.CSSProperties}>
                <button
                  type="button"
                  ref={(el) => {
                    rowRefs.current[i] = el;
                  }}
                  id={`faq-q-${i}`}
                  className="faq-head"
                  aria-expanded={on}
                  aria-controls={`faq-a-${i}`}
                  onClick={() => setOpen(i)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                >
                  <span className="faq-num">{pad(i + 1)}</span>
                  <span className="font-display faq-q">{it.q}</span>
                  <svg className="faq-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
                <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="faq-desc" inert={!on}>
                  <div className="faq-desc-inner">
                    <p>{it.a}</p>
                    {i === FAQ_ITEMS.length - 1 && (
                      <a
                        href={CONTACT_HREF}
                        className="faq-link"
                        data-cta="faq-contact"
                        onClick={(e) => {
                          const target = document.getElementById(CONTACT_ID);
                          if (!target) return;
                          e.preventDefault(); // the delegated trackCta listener still sees this click
                          scrollToY(target.getBoundingClientRect().top + window.scrollY);
                        }}
                      >
                        Contact Our Team
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

# PDS Website — Claude Code Build Guide

Sep 27, 2026

## Overview

**Updated scope: one single, long scrolling landing page** — not the WMS's 10-route site. Same brand, same motion, same content, all condensed into one modern page with anchor sections, the way the coming-soon build already works, just with the real business built in instead of a countdown.

This doc still leans on two things you provided:

1. **The Website Master Specification (WMS)** — stays the source of truth for *design system and motion*: tokens, fonts, animation IDs, component contracts. A single page doesn't change any of that.
2. **The client's .docx content** — becomes the section-by-section copy for the one page, instead of being split across routes.

Going single-page actually resolves the static-vs-dynamic tension from before: with no Coverage map, no blog, no multi-step Quote wizard needing a CRM, a plain contact form is the only thing that talks to a server. Point that one form at a third-party endpoint (Formspree, Getform, Web3Forms) and the whole site is genuinely static — `output: 'export'`, no API routes, deployable anywhere.

**How to use this doc.** Save `PDS_Website_Master_Specification.md`, `proven-coming-soon.html` and the content appendix below (as `content.md`) in the repo, then paste the two prompts in order into Claude Code, reviewing between them.

## Design system — already locked (WMS §9, §12)

Don't re-derive this; it's decided. Keep `PDS_Website_Master_Specification.md` in the repo and have Claude Code read it before every prompt below — the WMS itself requires each prompt to open by naming it as the source of truth (§23). The essentials, so you can sanity-check output at a glance:

```markdown
# Locked decisions (full detail lives in the WMS)
Stack       Next.js 15 App Router, React 19, TS strict, Tailwind v4 + shadcn/ui (§14.1)
Motion      GSAP+ScrollTrigger (scroll-driven), Framer Motion (mount/route),
            Lenis (smooth scroll, desktop, off under reduced-motion) (§14.1)
CMS/forms   Sanity CMS, react-hook-form + zod, HubSpot CRM, Resend email (§14.1)
Hosting     Vercel, SSG by default, ISR for Coverage/Insights (§14.3)

Color       black #0D0D0D · panel #141414 / #181818 · line #1F1F1F / #2A2A2A
            green #6CC04A (hover #7DD65B, pressed #57A03C), one accent only
            white / w70 / w40 / w20 — no red anywhere; errors are white-family
            text + motion + icon, never a red state (§12.1)
Type        Display face = Archivo Expanded Black Italic (NOT Montserrat) for
            H1–H3: 900 italic, uppercase, tight tracking. Montserrat stays for
            everything else (body, labels, data). This is the detail most
            tempting to "simplify" back to one font — don't; it's what makes
            the type read as designed rather than templated (§12.3)
Motion law  brake ease cubic-bezier(.16,1,.3,1) on entry, transform + opacity
            only, 20 canonical animation IDs M01–M20 in a registry (§9.1–§9.2)
            — every animation Claude Code adds should cite one of these IDs or
            propose a new registry row, never an ad hoc one-off animation
Theme       dark only, no light mode (§12.5)
3D          default answer is NO — only a coverage network map, and only from
            Phase 2 (§10.1); don't let Claude Code add a 3D hero on its own
```

The existing `proven-coming-soon.html` is explicitly named the **motion/brand reference implementation** in the WMS's own document control note — wherever a prompt below says "per the coming-soon build," that file is the ground truth for exactly how something should move.

## Page structure — one page, section by section

All of the WMS's content pillars and all of the client's docx copy, condensed into one scroll, in this order. Nav becomes in-page anchor links (max 6, per the WMS's ≤5-link rule + one CTA).

| # | Section | Content (from content.md below) |
| --- | --- | --- |
| 1 | Nav (fixed, anchor links) | Home · Services · Process · Why Us · FAQ · Contact + persistent "Request a Delivery Solution" pill |
| 2 | Hero | "Reliable Last-Mile Delivery Solutions Across the UAE" + sub-line + dual CTA (Request a Delivery Solution / Contact Our Team) |
| 3 | Proof strip | 4 of the 8 "Why Choose PDS" points, as the existing card component |
| 4 | Who We Are / About | Who We Are + Mission + Vision, condensed to a two-column block |
| 5 | Services | All 9 service lines as a card grid (B2B, E-Commerce, Food & Restaurant, Q-Commerce, Pharmacy, Retail, Corporate, Rider Solutions, Fleet Management) — no need to force these into the WMS's 3-line model now that it's one page; industries served can sit as tags under the grid |
| 6 | Our Process | The 5-step route/timeline component, verbatim from the docx |
| 7 | Why Choose PDS (full) | All 8 points, if not already spent in the proof strip — or merge sections 3 and 7 into one if that reads as repetition |
| 8 | Safety & Commitment | Safety philosophy + commitment to clients, shorter block, no separate page needed |
| 9 | FAQ | The 7 Q&As from the docx, accordion component |
| 10 | Contact / CTA | "Let's Move Your Business Forward" + the contact form + Contact PDS Today / Request a Business Proposal |
| 11 | Footer | Footer description + taglines + socials, per the coming-soon build |

This is close to what `proven-coming-soon.html` already is structurally — the difference is every section now has real business content instead of a countdown, and the nav/CTA point at a real contact form instead of an email-capture.

## Workflow — 4 phases for a single page

1. **Foundation + components.** Next.js scaffold, `tokens.ts`, fonts, the shared components (nav, buttons, cards, section wrapper, scroll-reveal, accordion, timeline) — no page content. → **Prompt 1**.
2. **Build every section.** All 11 sections from the Page Structure table above, in order, using content.md. → **Prompt 2**.
3. **Contact form + polish.** Wire the one form to Formspree/Getform (or a Next.js API route if you'd rather keep it in-house), then a motion/responsive/reduced-motion pass. → **Prompt 3**.
4. **SEO + export + deploy.** Metadata, JSON-LD, `next build` with `output:'export'`, deploy. → **Prompt 3** (bundled — it's a short pass on one page, not worth its own message).

Between each prompt, run `npm run dev` and actually look at the page before continuing — that's what keeps eleven sections of content from drifting off the design system.

## Prompt 1 — Foundation + components

Before pasting: put `PDS_Website_Master_Specification.md`, `proven-coming-soon.html` and `content.md` (the appendix below) in the project root.

```text
Using the attached Proven Delivery Service Website Master Specification (WMS)
for design tokens, motion IDs, and component contracts — not inventing
alternatives — scaffold a single-page Next.js site. Treat
proven-coming-soon.html as the motion/brand reference implementation the WMS
names it as; this build is that page's structure, filled with real content,
as one long scroll instead of a countdown.

1. Initialize Next.js 15 (App Router is fine even for one route), React,
   TypeScript, Tailwind, configured for static export (output:'export') from
   the start — there is no server-rendered content in this build.
2. Create tokens.ts per WMS §12.1 (colors, radius, space scale). Wire
   Tailwind's theme to extend from it.
3. Load fonts via next/font: the display face (Archivo Expanded Black
   Italic, or flag the closest license-available match) for headlines,
   Montserrat for body/labels, per §12.3.
4. Build the shared pieces once, reused down the page: Button (primary/
   ghost, per §8), fixed anchor-nav with the blurred-on-scroll glass
   treatment (the coming-soon topbar), the reusable section wrapper with
   scroll-reveal (motion M02/M07/M13 from §9.2 — register in a small
   motion registry, don't hand-roll one-off animations), Card, Accordion,
   and the route/timeline component (for the Process section).
5. Implement prefers-reduced-motion as a global fallback per §9.3 from day
   one — every component needs a static end-state.

Build NO section content yet. Flag any WMS ambiguity as a code comment
rather than guessing.
```

## Prompts 2–3 — Build the page, then wire it up

```text
PROMPT 2 — Build every section
Using the WMS for tokens/motion/component contracts and content.md for copy,
build the full single-page site in this order (matches proven-coming-soon.html's
rhythm, real content instead of the countdown):

1. Hero — headline from content.md's Home section, sub-line, dual CTA
   (primary: Request a Delivery Solution, ghost: Contact Our Team), reuse
   the coming-soon page's hero motion (headline slide-up+unblur, CTA ignite).
2. Proof strip — 4 of the 8 "Why Choose PDS" points as cards (motion M07
   stagger-in).
3. Who We Are / Mission / Vision — two-column block, condensed.
4. Services — all 9 service lines as a card grid, industries served as tags
   underneath.
5. Our Process — the 5 steps as the route/timeline component, scroll-fill
   animation (per the coming-soon build's timeline pattern).
6. Why Choose PDS (full 8, or merge with the proof strip if it repeats).
7. Safety & Commitment — shorter block, no heavy motion needed.
8. FAQ — accordion, one open at a time.
9. Contact/CTA — headline + the contact form (build the UI now; wire
   submission in Prompt 3) + footer with the docx's footer description and
   taglines.

Every section uses the shared Section wrapper and scroll-reveal from Prompt
1 — no new one-off motion. Flag any content gaps (nothing in content.md for
a slot) rather than inventing copy.

PROMPT 3 — Contact form, SEO, export
1. Wire the contact form to [Formspree/Getform/Web3Forms — pick one] via a
   plain client-side POST; keep it a real <form> that also works with JS
   disabled. Add the skid-shake error state and a success state per the
   coming-soon build's form patterns (motion M10/M11 equivalents). If you'd
   rather keep this in-house instead of a third party, say so and I'll swap
   this step for a Next.js API route + drop static export.
2. Add page metadata + OG tags + Organization and FAQPage JSON-LD (the FAQ
   accordion content) per WMS §16.
3. Full responsive pass (mobile nav, stacked sections, sticky mobile CTA per
   the coming-soon build) and a prefers-reduced-motion walkthrough.
4. Set output:'export' in next.config, run `next build`, verify the static
   bundle renders correctly served from a plain file host.
```

## Content appendix — save this as `content.md`

The client's copy, organized by the route it fills. This is what the prompts above point Claude Code at — real sentences, not placeholders.

```markdown
# PDS content.md

## Home
H1 direction: Reliable Last-Mile Delivery Solutions Across the UAE
Sub: Safe, efficient, and professional B2B delivery services designed to
keep your business moving.
Intro: From trained delivery riders to efficient fleet operations, Proven
Delivery Services provides dependable last-mile logistics solutions
tailored to the needs of modern businesses.
Primary CTA: Request a Delivery Solution · Secondary CTA: Contact Our Team
Tagline (primary): Proven Reliability. Delivered.
Tagline alternates: Delivering Trust at Every Mile · Reliable Riders,
Efficient Deliveries · Your Trusted Last-Mile Delivery Partner · Every
Delivery, Professionally Handled · Moving Businesses Forward · Safe.
Reliable. Proven. · The Last Mile, Delivered Better.

## About — Who We Are
Proven Delivery Services (PDS) is a UAE-based last-mile logistics company
providing reliable, safe, and efficient delivery solutions for businesses
and individual customers. We support our clients with trained delivery
riders, professional fleet management, well-maintained motorcycles,
disciplined operational processes, and customer-focused service. Whether
you operate an e-commerce platform, restaurant, retail store, pharmacy,
Q-commerce, or corporate business, PDS helps you simplify delivery
operations and ensure every shipment reaches its destination safely and on
time.

## About — Our Story
At Proven Delivery Services, we understand that every delivery is more
than the movement of a package — it is a promise made by a business to its
customer. Our goal is to help businesses across the UAE build dependable
and efficient delivery operations without the complexity of managing
riders and fleets independently. By combining skilled delivery
professionals, structured fleet operations, technology-enabled
coordination, and a strong safety culture, we provide flexible last-mile
delivery solutions that support both daily operations and long-term
business growth. We approach every delivery with professionalism,
accountability, and care.

## About — Mission / Vision
Mission: To provide safe, reliable, and efficient last-mile delivery
solutions that help businesses simplify their logistics operations,
improve customer satisfaction, and grow with confidence.
Vision: To become one of the Middle East's most trusted last-mile delivery
partners, recognized for operational excellence, professional riders,
reliable fleet management, and consistent service quality.

## About — Core Values
Reliability: complete every delivery accurately, responsibly, within the
expected timeframe. Safety: central to operations — riders, customers,
shipments, other road users. Professionalism: discipline, respect, a
service-focused attitude. Accountability: clear ownership throughout the
process. Efficiency: organized processes, capable teams, technology-
supported operations. Customer Focus: services adapted to each client's
operational requirements.

## About — Safety & Commitment to Clients
At PDS, safety is not an additional feature — it is essential to every
delivery: responsible riding, professional conduct, proper shipment
handling, regular motorcycle maintenance. Commitment to clients: delivery
operations directly influence how customers experience a brand, so every
assignment is approached with accountability, professionalism, and
attention to detail.

## Services — per industry (fold into the 3 WMS service lines, see Sitemap)
B2B Delivery: business-to-business movement of documents, products,
supplies, and commercial shipments between offices, stores, warehouses,
branches. E-Commerce Delivery: scalable last-mile support for online
stores and marketplaces managing growing order volumes. Food & Restaurant
Delivery: dependable rider support for restaurants, cafes, cloud kitchens;
disciplined delivery procedures. Q-Commerce Delivery: responsive support
for dark stores/quick-commerce where speed and accuracy are essential.
Pharmacy Delivery: responsible handling, customer care, dependable service
for pharmacies and healthcare retailers. Retail Delivery: flexible support
for retail stores/brands, direct-to-customer or inter-branch. Corporate
Delivery: secure, dependable movement of documents/packages for offices.
Professional Rider Solutions: trained, disciplined, customer-focused
riders without the complexity of independently recruiting a delivery
workforce, adaptable to volume. Fleet Management: structured fleet
support — motorcycle readiness, rider coordination, operational
continuity.

## Industries served
E-commerce platforms · Restaurants and cafes · Cloud kitchens · Q-commerce
· Retail businesses · Pharmacies · Grocery and convenience stores ·
Corporate offices · Online marketplaces · Small and medium-sized
businesses.

## Why Choose PDS (pick 4 for the Home pillars, use all 8 on /services)
Trained Delivery Riders · Reliable Fleet Operations · Safety-Focused
Approach · Flexible Business Solutions · B2B Expertise · Professional Brand
Representation · Customer-Focused Service · Technology-Supported
Operations.

## How It Works (maps 1:1 to /how-it-works)
1. Understanding Your Requirements — assess business model, delivery
volume, service area, operating schedule.
2. Creating the Right Solution — develop a delivery/rider solution aligned
to operational needs.
3. Rider and Fleet Deployment — trained riders and suitable motorcycles
assigned per agreed requirements.
4. Delivery Execution — orders collected, handled responsibly, delivered.
5. Operational Support — ongoing coordination, consistent performance.

## FAQ (for the /services FAQ accordion)
Q: What types of delivery services does PDS provide? A: B2B and B2C
last-mile solutions across e-commerce, restaurants, retail, Q-commerce,
pharmacies, corporate clients.
Q: Does PDS provide trained delivery riders? A: Yes, trained and
professional riders across industries.
Q: Does PDS manage delivery motorcycles? A: Yes, professional fleet
management and well-maintained motorcycles.
Q: Can your delivery solutions be customized? A: Yes, tailored to business
type, volume, operating model.
Q: Do you support both businesses and individual customers? A: Yes, B2B
and B2C.
Q: Which industries do you serve? A: E-commerce, restaurants, cafes, cloud
kitchens, Q-commerce, retailers, pharmacies, corporate clients.
Q: How can I request a delivery solution? A: Contact the team with your
requirements for a tailored recommendation.

## Contact / Quote
H1 direction: Let's Move Your Business Forward
Body: Looking for a reliable delivery partner in the UAE? Whether you need
trained delivery riders, dependable last-mile delivery support, or
professionally managed fleet operations, Proven Delivery Services is ready
to support your business.
Primary CTA: Contact PDS Today · Secondary CTA: Request a Business
Proposal

## Footer
Proven Delivery Services is a UAE-based last-mile logistics company
providing reliable B2B and B2C delivery services, professional rider
solutions, and efficient fleet management for businesses across multiple
industries.
```

## Launch checklist

- [ ] Lighthouse mobile: Performance ≥95, Accessibility 100, SEO 100
- [ ] LCP ≤ 2.0s, CLS ≤ 0.05, INP ≤ 200ms
- [ ] Full page walkthrough with `prefers-reduced-motion: reduce` forced on — still comprehensible
- [ ] Keyboard-only pass: skip link, anchor nav, the contact form, no traps
- [ ] Contact form tested end-to-end — success state, error/retry state, and the no-JS fallback
- [ ] All 9 service lines and all 7 FAQs present and matching content.md exactly
- [ ] Metadata + OG tags + JSON-LD valid (schema validator run)
- [ ] Fonts: display-face license confirmed (Archivo Expanded or the agreed substitute)
- [ ] `next build` with `output:'export'` succeeds and the static bundle deploys clean
- [ ] Domain connected, coming-soon page retired/redirected

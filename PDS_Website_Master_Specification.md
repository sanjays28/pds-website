# WEBSITE MASTER SPECIFICATION (WMS)
## Proven Delivery Service — by ServHub

| | |
|---|---|
| **Document** | Website Master Specification v1.0 |
| **Project** | provendelivery.com — full marketing & lead-generation website |
| **Client** | Proven Delivery Service (PDS), a ServHub company |
| **Business model** | B2B rider-fleet-as-a-service: businesses hire PDS to supply trained, uniformed, tracked delivery riders. Secondary funnel: rider recruitment. **There is no consumer app.** |
| **Status** | Living document — Part 1 complete |
| **Stack (locked)** | Next.js 15 · React · TypeScript · Tailwind CSS · GSAP · Three.js/R3F (where justified) · Framer Motion · Lenis · Lottie · Rive · shadcn/ui · Vercel |
| **Directive** | Any future AI session, designer, or developer instructed to build a page, component, or animation MUST treat this document as the single source of truth. |

### Document Map & Status

| # | Section | Part | Status |
|---|---|---|---|
| 1 | Executive Summary | 1 | ✅ Complete |
| 2 | Brand Strategy | 1 | ✅ Complete |
| 3 | Competitor Analysis | 1 | ✅ Complete |
| 4 | User Research & Personas | 2 | ⬜ Pending |
| 5 | Information Architecture | 2 | ⬜ Pending |
| 6 | User Flows | 2 | ⬜ Pending |
| 7 | Complete Page Inventory | 4 | ⬜ Pending |
| 8 | Component Library | 5 | ⬜ Pending |
| 9 | Motion Bible | 3 | ⬜ Pending |
| 10 | Three.js Opportunities | 3 | ⬜ Pending |
| 11 | GSAP Timelines | 3 | ⬜ Pending |
| 12 | Design System | 3 | ⬜ Pending |
| 13 | Content Strategy | 4 | ⬜ Pending |
| 14 | Technical Architecture | 6 | ⬜ Pending |
| 15 | API Architecture | 6 | ⬜ Pending |
| 16 | SEO Strategy | 6 | ⬜ Pending |
| 17 | Accessibility | 6 | ⬜ Pending |
| 18 | Performance Budget | 6 | ⬜ Pending |
| 19 | Analytics | 6 | ⬜ Pending |
| 20 | Security | 6 | ⬜ Pending |
| 21 | QA Strategy | 7 | ⬜ Pending |
| 22 | Development Roadmap | 7 | ⬜ Pending |
| 23 | AI Prompt Library | 7 | ⬜ Pending |

---
---

# SECTION 1 — EXECUTIVE SUMMARY

## 1.1 Project Vision

Build the definitive digital presence for Proven Delivery Service: a website that makes a logistics buyer feel the same confidence a race engineer feels looking at a well-tuned machine. The site must *prove* the brand promise — Fast. Reliable. Proven. — through its own behavior: fast to load, precise in motion, dependable in function. The website is the company's first delivery; it must arrive on time and intact.

**Rationale.** PDS sells operational trust to businesses. In B2B logistics, the website is inspected the way a warehouse is inspected — buyers infer operational quality from digital quality. A slow, generic site contradicts the product. Therefore performance, precision, and motorsport-grade polish are not aesthetic preferences; they are the sales argument.

## 1.2 Mission

Convert delivery-dependent businesses into pilot partners by communicating, within 30 seconds of arrival, exactly three things: **what PDS does** (supplies trained rider fleets as a service), **why it's safer than alternatives** (accountability: tracking, uniforms, training, SLAs), and **what to do next** (request a fleet quote). Simultaneously, recruit quality riders through a parallel funnel that never dilutes the B2B message.

## 1.3 Business Goals

| # | Goal | Description | Priority |
|---|---|---|---|
| BG-1 | Partner lead generation | Qualified B2B inquiries (fleet quotes, pilot requests) as the site's primary conversion | P0 |
| BG-2 | Rider recruitment | Steady applicant pipeline to scale fleet supply with demand | P0 |
| BG-3 | Category credibility | Position PDS as the *professional* alternative to gig marketplaces before launch scale exists | P1 |
| BG-4 | Sales enablement | Site pages double as sales-call artifacts (services, SLAs, coverage) the team can send to prospects | P1 |
| BG-5 | SEO foundation | Own "delivery riders for business," "last-mile fleet outsourcing" and city-level variants within 12 months | P2 |
| BG-6 | Brand asset | An Awwwards-caliber experience that earns press, backlinks, and inbound attention disproportionate to company size | P2 |

## 1.4 Brand Goals

1. Every screen must be attributable to the PDS brand kit within one second (black world, green energy, forward-leaning type, rider/speedometer motifs).
2. Motion must express *controlled speed* — never chaos, never floatiness. The brand is a professional rider, not a stunt rider.
3. The speedometer hidden in the wordmark's "O" is the brand's signature device; the site should deploy it as a recurring functional element (progress, loading, telemetry), not decoration.
4. The dual audience (business buyers / riders) shares one brand but gets two voices: buyers hear *accountability*; riders hear *respect and pride*.

## 1.5 User Goals

| Audience | Primary goal on site | Secondary goals |
|---|---|---|
| **Operations / logistics manager** (buyer) | Understand the service model and get a quote fast | Verify coverage area, SLAs, pricing logic, proof of professionalism |
| **Founder / e-commerce owner** (buyer) | Judge whether PDS can scale with them | Compare vs. gig platforms, see onboarding effort, talk to a human |
| **Prospective rider** | Apply in under 3 minutes from a phone | Understand pay, gear, training, schedule respect |
| **Press / partners / investors** | Grasp the company story quickly | Find brand assets and contact |

## 1.6 Success Metrics & KPIs

| KPI | Target (90 days post-launch) | Measurement |
|---|---|---|
| Partner inquiry conversion rate | ≥ 3.0% of unique visitors on buyer pages | Analytics funnel (Section 19) |
| Rider application completion rate | ≥ 55% of application starts | Form funnel events |
| Lighthouse (mobile, all core pages) | ≥ 95 Performance / 100 A11y / 100 SEO | CI check per deploy (Section 18/21) |
| LCP / CLS / INP | ≤ 2.0s / ≤ 0.05 / ≤ 200ms at p75 | CrUX + Vercel Analytics |
| Organic impressions for money keywords | Top-20 rankings on 5 target terms | Search Console |
| Qualified-lead rate (sales-accepted) | ≥ 40% of inquiries | CRM feedback loop |
| Bounce rate, buyer landing pages | ≤ 45% | Analytics |
| Time-to-quote-form (median) | ≤ 90s from landing | Custom event timing |

## 1.7 Long-Term Roadmap (Website)

| Phase | Scope | Trigger |
|---|---|---|
| **0 — Ignition** (live) | Coming-soon experience (already built): countdown, partner/rider capture | Pre-launch |
| **1 — Launch** | Full marketing site: Home, Services, Coverage, Riders, About, Contact/Quote, legal | Launch day |
| **2 — Proof** | Case studies, testimonials, live network stats ("parcels delivered" telemetry), blog/insights | First 5 partners live |
| **3 — Scale** | City landing pages (programmatic SEO), partner portal login (SLA reports, invoices), rider portal | 3+ cities, recurring clients |
| **4 — Platform** | Instant quote calculator with live pricing, API docs for enterprise integrations | Product maturity |

**Rationale.** Phasing prevents the classic pre-launch trap: building portal features before there are users. Phases 0–1 sell; Phase 2 proves; Phases 3–4 compound. The architecture (Section 14) must anticipate Phases 3–4 (auth-ready, CMS-driven, i18n-capable) without building them prematurely.

---

# SECTION 2 — BRAND STRATEGY

## 2.1 Brand Personality

Five-dimension profile (each 1–10, with the behavioral implication for the website):

| Dimension | Score | Web implication |
|---|---|---|
| **Competence** | 10 | Zero jank tolerance. Numbers, SLAs, and telemetry-style UI elements. Errors handled gracefully. |
| **Excitement** | 8 | Motorsport energy: speed streaks, ignition moments, kinetic type — always resolved with control. |
| **Ruggedness** | 6 | Matte textures, gear/helmet imagery, road vernacular. Never grunge or distressed. |
| **Sophistication** | 7 | Premium restraint: one accent color, generous space, cinematic pacing. |
| **Sincerity** | 7 | Plain-spoken promises with consequences ("If it moves with us, we answer for it"). No logistics jargon walls. |

**Archetype:** *The Professional Racer* — a hybrid of Hero (delivers under pressure) and Ruler (systems, standards, accountability). Not the Outlaw (gig-economy chaos) and not the Everyman (commodity courier).

## 2.2 Visual Language

Derived directly from the brand kit and its mockups (billboards, packaging, rider gear, stationery):

- **The world is black.** `#0D0D0D` fields dominate ≥80% of any viewport. Elevation is achieved with near-black layers (`#141414`, `#181818`) and *light*, never gray gradients or heavy shadows.
- **Green is ignition.** `#6CC04A` is reserved for energy: CTAs, progress, live states, streaks, the speedometer needle, one emphasized word per headline. Rule of thumb: if a viewport is more than ~10% green, it is off-brand.
- **White is the voice.** All reading content is white with opacity steps (100/70/40%) for hierarchy.
- **Motifs (use functionally, not decoratively):** speed streaks (motion, transitions, dividers), the speedometer (progress, loading, stats), the rider mark (brand presence, wayfinding, success states), map pins & routes (coverage, timelines), green packing tape (card/section accents, from the packaging system), halftone dot fades (texture, from packaging), night-city silhouettes (depth backgrounds).
- **Forward lean.** The italic wordmark establishes a rightward vector; compositions, entrances, and streaks should travel left→right. The brand only moves forward.

## 2.3 Tone of Voice

**Voice formula:** *Racing-team radio meets operations manual* — short, declarative, confident, concrete. Tagline cadence ("Fast. Reliable. Proven.") is the rhythmic signature: sequences of three, hard stops.

| Principle | Do | Don't |
|---|---|---|
| Declarative | "We supply the fleet. You keep the customer." | "We aim to provide comprehensive delivery solutions." |
| Concrete | "Uniformed riders. Live tracking. One invoice." | "End-to-end synergistic logistics ecosystems." |
| Accountable | "If it moves with us, we answer for it." | "We are not liable for…" (in marketing copy) |
| Respectful to riders | "Routes that respect your time." | "Hustle harder. Earn more." (gig-speak) |
| Three-beat rhythm | "Trained. Tracked. On time." | Long comma-chained sentences |

**Voice by audience:** Buyers = accountability and control ("your routes," "your SLA," "your dashboard"). Riders = pride and fairness ("real gear," "fair pay," "ride with the best"). Same brand, different pronouns and stakes.

## 2.4 Messaging Architecture

- **Category claim:** Rider fleets as a service.
- **Primary value proposition (buyers):** *Put Proven riders on your routes — trained, uniformed, tracked, and accountable, without building a fleet yourself.*
- **Primary value proposition (riders):** *Ride with the best — fair pay, real gear, real training, schedules that respect your time.*
- **Proof pillars (from kit, reframed B2B):** Real-Time Tracking (your ops team sees everything) · Secure Deliveries (sealed, verified, intact) · 24/7 Support (a human answers) · Nationwide Coverage (one partner, every region).
- **Taglines:** "Fast. Reliable. Proven." (signature) · "Delivering Excellence, Every Mile. On Time. Every Time." (long-form) — deploy verbatim; never paraphrase them into mush.
- **Message hierarchy per page:** 1 category claim → 1 value prop → max 4 proof pillars → 1 CTA. Never more.

## 2.5 Color Psychology

| Color | Hex | Kit meaning | Psychological function on site |
|---|---|---|---|
| Primary Green | `#6CC04A` | Growth, Energy, Trust | "Go" signal: motion, live status, action. Green = the system is running. Its scarcity makes every CTA feel like a lit ignition switch. |
| Deep Black | `#0D0D0D` | Strength, Elegance, Professionalism | The night road: focus, premium calm, makes green luminous. Signals confidence (consumer couriers fear dark UIs; PDS doesn't). |
| White | `#FFFFFF` | Clarity, Simplicity, Balance | Legibility and honesty; opacity as hierarchy avoids introducing grays that would muddy the triad. |

**Extended functional tokens** (defined fully in Section 12): success = Primary Green; warning/error must NOT introduce red/amber arbitrarily — errors use white text + shake/skid motion + icon, destructive confirmations may use a desaturated signal tone specified in the design system, keeping the triad pure in marketing surfaces.

## 2.6 Typography

- **Display (headlines, numerals):** the custom bold-italic wordmark style; web substitute locked in Section 12 (extended-width grotesque, weight 800–900, italic, uppercase, tight tracking, line-height ≤1.0). The lean is mandatory — upright display type is off-brand.
- **Utility (labels, taglines, nav, data):** Montserrat Medium/SemiBold, uppercase, +10–14% letter-spacing — the kit's tagline treatment. This is the "precision instrument" register: telemetry, chips, table headers.
- **Body:** Montserrat Regular 16–18px, sentence case, line-height 1.6, white 70%.
- **Numerals:** tabular figures everywhere data lives (counters, SLAs, pricing) — jittering numbers read as unreliable.

## 2.7 Photography Direction

- **Subjects:** riders in PDS gear (helmets, green-piped jackets), fleets staged like race grids, packages with green tape, night-city routes, ops rooms with tracking screens.
- **Grade:** low-key, high contrast, deep blacks, controlled green practical light (headlights, screens, signage). Cool shadows, no lifestyle warmth filters.
- **Composition:** forward motion left→right; shallow depth on gear details; motion blur only on backgrounds, subject tack-sharp (controlled speed).
- **Never:** stock smiling-courier-at-door clichés, daylight suburbia, visible competitor liveries, unbranded helmets.

## 2.8 Illustration & Iconography

- **Illustration:** flat, geometric, single-weight — extensions of the rider mark's vocabulary (streaks, pins, routes, gauges). Used for diagrams (how it works, coverage) where photography can't yet exist pre-scale. No 3D clay mascots, no gradient blobs.
- **Iconography:** 1.6px stroke, rounded caps, 24px grid, white default / green active. Canon set: radar-ping (tracking), shield-check (security), headset (support), route-map (coverage), helmet (riders), package-pin (delivery), gauge (performance), tape-roll (packaging). All icons must look like they belong on a dashboard, not a greeting card.

## 2.9 Motion Personality

**"Drafting and braking."** Everything enters fast and settles with a firm, short brake. Signature easing `cubic-bezier(0.16,1,0.3,1)`; durations 240–600ms; travel direction left→right; horizontal motion blur only; springs allowed once per view (the needle). Full grammar in Section 9 (Motion Bible). Motion must always *mean* something: arrival, progress, confirmation, or attention — never ambience for its own sake, except the single sanctioned ambient system (night-highway beams).

## 2.10 Interaction Philosophy

1. **The interface is telemetry.** Prefer gauges, counters, route-lines and status chips over abstract widgets — users should feel they're reading a live operation.
2. **One green thing per decision.** Each view has exactly one primary action; it is green; nothing competes with it.
3. **Feedback within 100ms**, resolution within 400ms; every async action has a designed pending state (needle sweep / streak) and a designed success state (never a bare toast for key conversions — the Grid Pass standard).
4. **Respect the throttle.** Scroll-driven storytelling may steer pace but never trap the user: pinned sections ≤300vh, always skippable, never hijack on mobile.
5. **Trust is recoverable.** Errors explain and offer the next step in brand voice; forms never lose user input.

## 2.11 Target Emotional Journey

| Stage | Visitor feels | Triggered by |
|---|---|---|
| Arrival (0–3s) | "This is serious speed." | Instant load, ignition motion, black/green world |
| Orientation (3–15s) | "I get exactly what they do." | Category claim + value prop above the fold |
| Exploration | "These people run a tight operation." | Telemetry UI, precise motion, concrete proof pillars |
| Consideration | "This is safer than my alternatives." | SLAs, accountability copy, coverage, (later) case studies |
| Conversion | "I'm joining something at the start." | Founding-partner framing, Grid/Partner Pass moment |
| Post-conversion | "They already feel dependable." | Instant confirmation, clear next step, fast follow-up promise |

---

# SECTION 3 — COMPETITOR ANALYSIS

> **Note:** No competitor URLs were supplied. This section analyzes the four competitor **archetypes** PDS displaces, based on the common patterns of their category leaders. When actual competitor names/URLs are provided, duplicate the matrix below per competitor; the strategic conclusions will hold.

## 3.1 Competitive Set

| Archetype | Who they are | How they pitch |
|---|---|---|
| **A — Gig marketplace** | On-demand courier platforms with crowdsourced freelance riders | "Instant delivery, book in seconds," app-first, price-led |
| **B — National courier incumbent** | Established parcel networks (B2B contracts, depots) | "Scale, coverage, heritage," corporate, rate-card-led |
| **C — Regional 3PL / fleet outsourcer** | Local logistics firms renting vans/riders with contracts | "We handle your logistics," relationship/sales-led, weak digital |
| **D — In-house fleet (status quo)** | The prospect hiring riders themselves | Not a website — the default PDS must argue against |

## 3.2 Comparison Matrix

| Criterion | A · Gig marketplace | B · Incumbent | C · Regional 3PL | **PDS opportunity** |
|---|---|---|---|---|
| **UX** | Slick consumer app; B2B buried in menus | Dense corporate portals, legacy IA | Template sites, broken mobile | One focused B2B narrative; quote in ≤3 clicks |
| **Performance** | Good on app, mediocre web | Heavy, slow enterprise pages | Poor (page builders) | 95+ Lighthouse as a stated, felt differentiator |
| **SEO** | Dominates consumer terms | Dominates brand + freight terms | Near-zero | Own the *fleet-as-a-service* long tail they all ignore |
| **Interactions/motion** | Generic app-store gloss | None | None | Category has zero craft — motorsport motion is uncontested space |
| **Content** | Price calculators, city pages | PDF rate cards, jargon | Thin "about us" copy | Concrete SLAs, plain language, proof pillars |
| **Conversion** | Self-serve booking | RFQ forms into the void ("we'll get back to you") | Phone numbers only | Designed quote flow + instant confirmation + fast SLA on response |
| **Trust signals** | Ratings, but rider churn shows | Heritage logos, certifications | Local references | Uniforms, training, accountability — *the anti-gig* trust story |
| **Rider proposition** | "Be your own boss" (churn-heavy) | Employment, but faceless | Informal | Pride + fairness + gear: recruit the riders gig platforms burn out |
| **Key weakness to exploit** | No accountability: anonymous riders, no uniforms, no SLA ownership | Slow, rigid, minimum volumes, impersonal | Invisible online, can't scale | — |

## 3.3 Strategic Openings

1. **Accountability gap (vs A).** Gig platforms structurally cannot promise *who* shows up. PDS's whole story — trained, uniformed, tracked, one team — attacks this. Website expression: rider gear photography, training/certification content, SLA language, "your dedicated fleet" framing.
2. **Speed-of-engagement gap (vs B).** Incumbents make buyers wait for account managers. Website expression: transparent "how it works in 5 steps," pilot-program offer, response-time promise on the quote form ("a human replies within one business day"), later an instant estimate calculator (Phase 4).
3. **Digital-craft gap (vs everyone).** Nobody in this category has an award-grade website. A cinematic, high-performing site generates outsized credibility and inbound links (BG-6) precisely because it is unexpected here.
4. **The real competitor is D (in-house).** Much copy must answer "why not just hire my own riders?" — recruitment cost, training burden, absenteeism risk, fleet management overhead vs. one invoice. This argument deserves its own page section (Services → "Build vs. Proven" comparison) and will guide the content strategy (Section 13).
5. **Rider-side moat.** Winning riders wins supply. A genuinely respectful careers experience (mobile-first 3-minute application, pay/gear transparency) is both a funnel and a brand proof that buyers will notice.

## 3.4 Positioning Statement

> For businesses that live and die by delivery, **Proven** supplies dedicated rider fleets — trained, uniformed, tracked, and accountable — unlike gig marketplaces that send strangers or incumbents that send rate cards. **Fast. Reliable. Proven.**

---
---

*End of Part 1. Next: **Part 2 — Section 4 (User Research & Personas), Section 5 (Information Architecture with Mermaid sitemap), Section 6 (User Flows).***

# Proven Delivery Services — Website

Single-page Next.js 15 (App Router, static export) site for Proven Delivery
Services (PDS). Built against `PDS_Website_Master_Specification (1).md`
(design tokens, motion registry, component contracts) with
`proven-coming-soon.html` as the motion/brand reference implementation.

## Status

**Foundation phase only** (Prompt 1 of the build guide): project scaffold,
design tokens, fonts, and shared components (Nav, Button, Section,
Card, Accordion, RouteTimeline). No real section content yet — see
[`PDS Website — Claude Code Build Guide (1).md`](<PDS Website — Claude Code Build Guide (1).md>)
for the full phase plan and `content.md` for the copy that Prompt 2 wires in.
`src/app/page.tsx` currently renders a labeled component-preview harness,
not the real page.

## Scripts

```bash
npm run dev     # http://localhost:3000 — uses Turbopack (see note below)
npm run build   # next build + static export to out/
npm run lint
```

## Stack

- Next.js 15 (App Router), React 19, TypeScript strict, Tailwind CSS v4
- GSAP + ScrollTrigger (scroll-driven motion), Lenis (desktop smooth scroll)
- `output: 'export'` — no server, no API routes; deploys to any static host

## Key files

- `src/lib/tokens.ts` — design tokens (WMS §12.1), mirrored as CSS custom
  properties in `src/app/globals.css`'s `@theme inline` block
- `src/lib/fonts.ts` — `next/font/google` setup; see the code comment there
  for the Archivo Expanded Black Italic license-match flag (WMS §12.3)
- `src/motion/registry.ts` — the canonical M01–M20 animation registry
  (WMS §9.2); components cite an ID rather than inventing one-off motion
- `src/components/Section.tsx` — the reusable section wrapper implementing
  the WMS §11.2 Standard Section Timeline (M02 heading, M07 child stagger,
  M13 streak wipe), with a static end-state under `prefers-reduced-motion`

## Notes / flags

- **Dev server uses `next dev --turbopack`.** Plain webpack `next dev` on
  the Next 15.5.26 + Tailwind v4 versions resolved by this project's
  registry fails to run globals.css through PostCSS at all (500 on every
  route). `next build` (webpack) is unaffected — only the dev server needed
  the flag. Revisit if a later Next/Tailwind patch fixes this upstream.
- **A cold `.next` directory has occasionally thrown a one-off
  `PageNotFoundError: /_document` on the very first `next build`** after
  wiping `.next`; re-running `npm run build` immediately succeeds. Root
  cause not isolated — flagging in case CI ever hits it on a fresh checkout.
- **Shell environment sets `NODE_ENV=production` globally** on this
  machine, which makes plain `npm install` silently skip devDependencies
  (no error, no warning — just an incomplete install). Use
  `npm install --include=dev` if dependencies ever look inexplicably
  missing after an install.

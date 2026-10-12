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

## Contact form

The form posts to `public/send-enquiry.php`, a single PHP file (PHP 7.4+, no Composer). Next copies
`public/` into the build, so `npm run build` produces `out/send-enquiry.php`.

**Hosting.** The site is a static export, but the form needs PHP: upload the contents of `out/` to
PHP hosting (the web root of `proven-delivery.com`). A host without PHP cannot send the form.

**Where to change addresses.** At the top of `public/send-enquiry.php`:
`RECIPIENT` (who receives enquiries) and `SENDER_ADDRESS` / `SENDER_NAME` (the From address; it must be
an address on the site's own domain). `ALLOWED_HOSTS` lists the hosts accepted in the Origin/Referer header.
The recipient address is never shown on the page.

**Front-end endpoint.** `src/lib/submitEnquiry.ts` posts to `NEXT_PUBLIC_ENQUIRY_ENDPOINT`, default
`/send-enquiry.php` (see `.env.example`). It is optional.

**Local development.** `npm run dev` does not call PHP: with no endpoint set it logs the payload and simulates
success after 800ms. Real mail can only be tested on the hosting.

**Test the live endpoint** (`elapsed_ms` must be 3000 or more, or the server pretends it worked and sends nothing):

```bash
curl -i -X POST https://proven-delivery.com/send-enquiry.php \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -H "Origin: https://proven-delivery.com" \
  -d '{"name":"Test Person","company":"","email":"test@example.com","phone":"+971 50 000 0000","service":"Fleet Management","message":"This is a test enquiry from curl.","enquiry_type":"contact","botcheck":"","elapsed_ms":5000,"page":"/"}'
# expected: HTTP 200 {"ok":true}, and an email at RECIPIENT
```

Other responses: 422 validation errors, 429 more than 5 accepted submissions per IP per hour, 403 bad
Origin/Referer, 413 body over 20 KB, 405 not POST, 500 `mail()` failed (see the host's PHP error log).

**Deliverability (SPF and DKIM).** Mail sent as `no-reply@proven-delivery.com` should pass SPF and DKIM for that
domain or it may land in spam. Check the DNS: `dig +short TXT proven-delivery.com` should show an
`v=spf1 ...` record that includes the hosting's mail servers; DKIM is a TXT record at
`<selector>._domainkey.proven-delivery.com` (the host's control panel usually creates it). Send a test to a
Gmail address and use "Show original" to confirm SPF: PASS and DKIM: PASS.

**If `mail()` is unreliable.** Switch to SMTP with PHPMailer: upload PHPMailer's `src/` next to the script,
set `SEND_MODE = 'smtp'` and fill in the commented "SMTP via PHPMailer" block in `send_message()`.

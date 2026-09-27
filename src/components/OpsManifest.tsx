import { TagList } from "@/components/TagList";

export interface OpsService {
  code: string;
  title: string;
  body: string;
}

/**
 * OpsManifest — the "Services" section reimagined as a dispatch console
 * rather than a card grid. Instead of borrowing a generic marketing
 * pattern (bento box, feature grid), it borrows its visual grammar from
 * the thing PDS actually sells: live fleet tracking and dispatch. Rows,
 * not cards; a pulsing status dot per row (reusing `.pulse-dot`, already
 * built for the hero chip); a tabular-monospace callsign code per service
 * (finally using the WMS's own reserved-but-unused "Data/telemetry:
 * tabular-nums mandatory" typography role); industries served as a
 * "COVERAGE" manifest footer instead of a floating tag cloud.
 *
 * Split into three pieces (`OpsStatusBar`, `OpsRow`, `OpsCoverage`)
 * rather than one wrapper so the rows can be passed as Section's direct
 * children — same convention as the Card grid it replaces — letting
 * Section's existing M07 stagger cascade the rows in one at a time
 * (a dispatch-board feel) instead of fading the whole block in at once.
 *
 * Deliberately NOT included: any fabricated "live" number (e.g. a
 * ticking "N deliveries routed today" counter). content.md has no real
 * figure for that, and inventing one to sell the console aesthetic would
 * be a fake metric on a real company's site — the live-console feel stays
 * purely atmospheric (pulsing dot, status language), never a specific
 * unverified claim.
 *
 * Accessibility: every row's title+body is always visible in the DOM —
 * hover/focus only intensifies the row (brighter dot, lit background),
 * it never gates content behind a hover-only reveal (touch/keyboard users
 * get the same information as mouse users, unconditionally).
 *
 * Motion: no new animation primitive. Rows stagger via Section's existing
 * M07, and the section's default M13 streak-wipe already serves as this
 * section's "power-on" flourish — no separate scanline was built, reusing
 * what already exists instead.
 */
export function OpsStatusBar() {
  return (
    <div className="ops-status-bar">
      <span className="pulse-dot" aria-hidden="true" />
      <span>System Status — Operational</span>
    </div>
  );
}

export function OpsRow({ code, title, body }: OpsService) {
  return (
    <div className="ops-row">
      <span className="pulse-dot ops-row-dot" aria-hidden="true" />
      <span className="ops-code">{code}</span>
      <div className="ops-row-body">
        <h3 className="ops-title">{title}</h3>
        <p className="ops-desc">{body}</p>
      </div>
    </div>
  );
}

export function OpsCoverage({ items }: { items: string[] }) {
  return (
    <div className="ops-coverage">
      <span className="ops-coverage-label">Coverage</span>
      <TagList items={items} />
    </div>
  );
}

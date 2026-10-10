import type { RefObject } from "react";
import { MANIFEST } from "@/lib/heroFilm";

/**
 * HeroManifest — the hero's "Our Services" console. Same visual language as
 * the Services section's OpsManifest (panel, hairline rows, callsign chip,
 * channel bar) but driven by the film: the engine in HeroFilm.tsx fades the
 * panel in/out and lights the row(s) whose frame range is on screen (via the
 * `data-on` attribute on each `[data-row]`).
 *
 * Desktop (≥1024px): the full 9-row list at the left, with the riders sentence
 * flowing under it. Below that: a "dock" showing only the active row(s), so
 * the list never competes with the bike.
 */
export function HeroManifest({
  manifestRef,
  dockRef,
  ridersRef,
}: {
  manifestRef: RefObject<HTMLDivElement | null>;
  dockRef: RefObject<HTMLDivElement | null>;
  /** Ref callback for the riders sentence's cue element (driven by the engine). */
  ridersRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <>
      <div ref={manifestRef} className="hm" aria-label="Our services">
        <div className="hm-panel">
          <p className="eyebrow hm-eyebrow">Our Services</p>
          <ul className="hm-rows">
            {MANIFEST.map((row) => (
              <li key={row.code} data-row className="hm-row">
                <span className="ops-code">{row.code}</span>
                <span className="hm-name">{row.name}</span>
                <span className="hm-bar" aria-hidden="true" />
              </li>
            ))}
          </ul>
        </div>

        {/* Same column flow as the panel (16px below it), so it can never overlap. */}
        <div ref={ridersRef} className="film-cue hm-riders" data-id="riders-fleet">
          <p data-item className="hero-sub film-riders-line">
            Trained riders. Well-maintained motorcycles. Disciplined operations.
          </p>
        </div>
      </div>

      <div ref={dockRef} className="hm-dock" aria-hidden="true">
        {MANIFEST.map((row) => (
          <div key={row.code} data-row className="hm-row hm-dock-row">
            <span className="ops-code">{row.code}</span>
            <span className="hm-name">{row.name}</span>
            <span className="hm-bar" />
          </div>
        ))}
      </div>
    </>
  );
}

import { Archivo, Montserrat } from "next/font/google";

/**
 * Display face — WMS §12.3: "Archivo Expanded Black Italic".
 *
 * FLAG (WMS ambiguity, not guessed): Google Fonts does not publish a
 * separate static family called "Archivo Expanded" — the expanded width
 * only exists as a `wdth` variation axis (62%–125%) on the variable
 * "Archivo" family, alongside `wght` (100–900) and an italic style. There is
 * no license-available family that is literally named "Archivo Expanded".
 * Closest available match, per the WMS's own fallback clause ("or the
 * closest open match"): variable Archivo, italic style, `wdth` pinned to its
 * max (125, i.e. as expanded as the family goes) via `font-variation-settings`,
 * `font-weight: 900`. If the brand's own custom cut of Archivo Expanded is
 * supplied later, swap the `@font-face` in here — call sites (`font-display`
 * class) do not need to change.
 */
export const displayFont = Archivo({
  subsets: ["latin"],
  style: ["italic"],
  weight: "variable",
  axes: ["wdth"],
  display: "swap",
  variable: "--font-display",
});

/** Body/label/data face — WMS §12.3. */
export const bodyFont = Montserrat({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-body",
});

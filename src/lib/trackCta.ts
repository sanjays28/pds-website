/**
 * CTA click tracking — no analytics library, no personal data. Every CTA
 * carries data-cta="<placement>"; one delegated listener pushes
 * { event: "cta_click", placement } to window.dataLayer (if a tag manager
 * has defined it) and logs it in development.
 */
declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function initCtaTracking(): () => void {
  const onClick = (e: MouseEvent) => {
    const el = (e.target as Element | null)?.closest<HTMLElement>("[data-cta]");
    const placement = el?.dataset.cta;
    if (!placement) return;
    window.dataLayer?.push({ event: "cta_click", placement });
    if (process.env.NODE_ENV === "development") console.debug("cta_click", placement);
  };
  document.addEventListener("click", onClick);
  return () => document.removeEventListener("click", onClick);
}

import { FooterTagline } from "@/components/FooterTagline";
import { Logo } from "@/components/Logo";

/**
 * Footer — rendered once, after <main>, so it sits outside the route spine's
 * wrapper (the spine's line and last pin end above it). A server component, so
 * the copyright year is computed at build time.
 *
 * Links come from the same list the nav uses (labels + targets), so they can't
 * drift. The third column is intentionally empty until the client supplies
 * real contact details — nothing is invented here.
 */
export interface FooterLink {
  label: string;
  href: string;
}

export function Footer({ links }: { links: FooterLink[] }) {
  return (
    <footer className="site-footer">
      <div className="ft-inner">
        <FooterTagline />

        <div className="ft-cols">
          <div className="ft-brand">
            <Logo />
            <p className="ft-desc">
              Proven Delivery Services is a UAE-based last-mile logistics company providing reliable B2B and B2C delivery services, professional rider solutions, and efficient fleet management for businesses across multiple industries.
            </p>
          </div>

          <nav aria-label="Footer" className="ft-nav">
            <p className="ft-label">Navigate</p>
            <ul>
              {links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="ft-link">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Third column: the client's contact details (phone, email, address, social links)
              will go here once supplied. Left empty on purpose — do not invent any. */}
          <div className="ft-contact" />
        </div>

        <div className="ft-bar">
          <p>© {new Date().getFullYear()} Proven Delivery Services. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

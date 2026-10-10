import { Nav } from "@/components/Nav";
import { HeroFilm } from "@/components/hero/HeroFilm";
import { Section } from "@/components/Section";
import { AboutIntro } from "@/components/sections/AboutIntro";
import { AboutPurpose } from "@/components/sections/AboutPurpose";
import { Services } from "@/components/sections/Services";
import { WhyPds } from "@/components/sections/WhyPds";
import { Process } from "@/components/sections/Process";
import { Faq } from "@/components/sections/Faq";
import { CONTACT_HREF, CONTACT_ID } from "@/lib/contact";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { CursorTrail } from "@/components/CursorTrail";
import { RouteSpine } from "@/components/RouteSpine";

/**
 * The full single-page build (Prompt 2) — content sourced verbatim from
 * content.md, structure from the WMS Page Structure table. Every section
 * uses the shared Section wrapper (§11.2 timeline) or RouteTimeline/
 * Accordion from Prompt 1; nothing here hand-rolls its own motion.
 *
 * FLAG (scope): content.md's About block also includes "Core Values" —
 * the build guide's Page Structure table scopes the About section to
 * "Who We Are + Mission + Vision" only, so Core Values stays unused here.
 * "Our Story" (previously also unused for the same reason) now drives the
 * #our-story ScrollStory section below, split into 3 short beats — its
 * own closing sentence ("professionalism, accountability, and care")
 * conveniently already reads as a 3-word closing beat verbatim.
 *
 * FLAG (merge): the guide allows merging the "Proof strip" (4 of 8 Why-
 * Choose-PDS points) into the full "Why Choose PDS" section "if that reads
 * as repetition" — it does (content.md gives no distinct copy for a 4-item
 * subset vs. the full 8), so this build has one Why Choose PDS section
 * with all 8, positioned where the full version sits in the nav order,
 * rather than showing the same eight labels twice.
 */

const NAV_LINKS = [
  { label: "Home", href: "#hero" },
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Why Us", href: "#why-pds" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: CONTACT_HREF },
];

const PRIMARY_TAGLINE = "Proven Reliability. Delivered.";

// "code" is a stylistic callsign abbreviation of the service's own real
// title (for the Live Ops Manifest treatment — see OpsManifest.tsx) — not
// a fabricated stat or claim, purely a label.
const SERVICES = [
  {
    code: "B2B–01",
    title: "B2B Delivery",
    body: "Business-to-business movement of documents, products, supplies, and commercial shipments between offices, stores, warehouses, and branches.",
  },
  {
    code: "ECOM–02",
    title: "E-Commerce Delivery",
    body: "Scalable last-mile support for online stores and marketplaces managing growing order volumes.",
  },
  {
    code: "FOOD–03",
    title: "Food & Restaurant Delivery",
    body: "Dependable rider support for restaurants, cafes, and cloud kitchens, with disciplined delivery procedures.",
  },
  {
    code: "QCOM–04",
    title: "Q-Commerce Delivery",
    body: "Responsive support for dark stores and quick-commerce, where speed and accuracy are essential.",
  },
  {
    code: "PHRM–05",
    title: "Pharmacy Delivery",
    body: "Responsible handling, customer care, and dependable service for pharmacies and healthcare retailers.",
  },
  {
    code: "RTL–06",
    title: "Retail Delivery",
    body: "Flexible support for retail stores and brands, direct-to-customer or inter-branch.",
  },
  {
    code: "CORP–07",
    title: "Corporate Delivery",
    body: "Secure, dependable movement of documents and packages for offices.",
  },
  {
    code: "RIDR–08",
    title: "Professional Rider Solutions",
    body: "Trained, disciplined, customer-focused riders — without the complexity of independently recruiting a delivery workforce, adaptable to volume.",
  },
  {
    code: "FLT–09",
    title: "Fleet Management",
    body: "Structured fleet support: motorcycle readiness, rider coordination, and operational continuity.",
  },
];

// Industries list: no longer shown (the Services section no longer carries a coverage
// list) — kept here so the client's copy isn't lost if a section wants it again.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const INDUSTRIES = [
  "E-commerce platforms",
  "Restaurants and cafes",
  "Cloud kitchens",
  "Q-commerce",
  "Retail businesses",
  "Pharmacies",
  "Grocery and convenience stores",
  "Corporate offices",
  "Online marketplaces",
  "Small and medium-sized businesses",
];

export default function Home() {
  return (
    <>
      <CursorTrail />

      <Nav
        logoSrc="/pds-logo-white.png"
        logoAlt="Proven Delivery Services"
        links={NAV_LINKS}
        ctaLabel="Request a Delivery Solution"
        desktopCtaLabel="Contact Our Team"
        ctaHref={CONTACT_HREF}
      />

      <main id="main">
        <HeroFilm
          primaryCta={{ label: "Request a Delivery Solution", href: CONTACT_HREF }}
          secondaryCta={{ label: "Contact Our Team", href: CONTACT_HREF }}
          services={SERVICES.map((service) => service.title)}
        />

        <RouteSpine>
        <AboutIntro />
        <AboutPurpose />


        <Services />

        <WhyPds />

        <Process />

        <Section id="safety" eyebrow="Our Standards" title="Safety & Commitment to Clients">
          <div className="two-col">
            <div>
              <h3>Safety</h3>
              <p>
                At PDS, safety is not an additional feature — it is essential to
                every delivery: responsible riding, professional conduct,
                proper shipment handling, and regular motorcycle maintenance.
              </p>
            </div>
            <div>
              <h3>Commitment to Clients</h3>
              <p>
                Delivery operations directly influence how customers experience
                a brand, so every assignment is approached with
                accountability, professionalism, and attention to detail.
              </p>
            </div>
          </div>
        </Section>

        <Faq />

        <Section
          id={CONTACT_ID}
          spineNode="Contact"
          eyebrow="Get Started"
          title="Let's Move Your Business Forward"
          wipe={false}
          className="section-narrow"
        >
          <p className="text-w70" style={{ maxWidth: "62ch" }}>
            Looking for a reliable delivery partner in the UAE? Whether you
            need trained delivery riders, dependable last-mile delivery
            support, or professionally managed fleet operations, Proven
            Delivery Services is ready to support your business.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 28 }}>
            <Button href={CONTACT_HREF} variant="primary">
              Contact PDS Today
            </Button>
            <Button href={CONTACT_HREF} variant="ghost">
              Request a Business Proposal
            </Button>
          </div>
          <div id="contact-form" style={{ scrollMarginTop: 120 }}>
            <ContactForm />
          </div>
        </Section>
        </RouteSpine>
      </main>

      <Footer
        description="Proven Delivery Services is a UAE-based last-mile logistics company providing reliable B2B and B2C delivery services, professional rider solutions, and efficient fleet management for businesses across multiple industries."
        tagline={PRIMARY_TAGLINE}
      />
    </>
  );
}

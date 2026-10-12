import { Nav } from "@/components/Nav";
import { HeroFilm } from "@/components/hero/HeroFilm";
import { AboutIntro } from "@/components/sections/AboutIntro";
import { AboutPurpose } from "@/components/sections/AboutPurpose";
import { Services } from "@/components/sections/Services";
import { WhyPds } from "@/components/sections/WhyPds";
import { Process } from "@/components/sections/Process";
import { Faq } from "@/components/sections/Faq";
import { Contact } from "@/components/sections/Contact";
import { Industries } from "@/components/sections/Industries";
import { Safety } from "@/components/sections/Safety";
import { CONTACT_HREF } from "@/lib/contact";
import { Footer } from "@/components/Footer";
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

        <Industries />

        <Process />

        <Safety />

        <Faq />

        <Contact />
        </RouteSpine>
      </main>

      <Footer links={NAV_LINKS} />
    </>
  );
}

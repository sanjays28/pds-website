import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { Card } from "@/components/Card";
import { TagList } from "@/components/TagList";
import { RouteTimeline } from "@/components/RouteTimeline";
import { Accordion } from "@/components/Accordion";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";

/**
 * The full single-page build (Prompt 2) — content sourced verbatim from
 * content.md, structure from the WMS Page Structure table. Every section
 * uses the shared Section wrapper (§11.2 timeline) or RouteTimeline/
 * Accordion from Prompt 1; nothing here hand-rolls its own motion.
 *
 * FLAG (scope, not a gap): content.md's About block also includes "Our
 * Story" and "Core Values" — the build guide's Page Structure table scopes
 * the About section to "Who We Are + Mission + Vision" only, so those two
 * are left unused here rather than bolted on unasked. Say if they should
 * get a slot.
 *
 * FLAG (merge): the guide allows merging the "Proof strip" (4 of 8 Why-
 * Choose-PDS points) into the full "Why Choose PDS" section "if that reads
 * as repetition" — it does (content.md gives no distinct copy for a 4-item
 * subset vs. the full 8), so this build has one Why Choose PDS section
 * with all 8, positioned where the full version sits in the nav order,
 * rather than showing the same eight labels twice.
 */

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Why Us", href: "#why-us" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

const PRIMARY_TAGLINE = "Proven Reliability. Delivered.";

const SERVICES = [
  {
    title: "B2B Delivery",
    body: "Business-to-business movement of documents, products, supplies, and commercial shipments between offices, stores, warehouses, and branches.",
  },
  {
    title: "E-Commerce Delivery",
    body: "Scalable last-mile support for online stores and marketplaces managing growing order volumes.",
  },
  {
    title: "Food & Restaurant Delivery",
    body: "Dependable rider support for restaurants, cafes, and cloud kitchens, with disciplined delivery procedures.",
  },
  {
    title: "Q-Commerce Delivery",
    body: "Responsive support for dark stores and quick-commerce, where speed and accuracy are essential.",
  },
  {
    title: "Pharmacy Delivery",
    body: "Responsible handling, customer care, and dependable service for pharmacies and healthcare retailers.",
  },
  {
    title: "Retail Delivery",
    body: "Flexible support for retail stores and brands, direct-to-customer or inter-branch.",
  },
  {
    title: "Corporate Delivery",
    body: "Secure, dependable movement of documents and packages for offices.",
  },
  {
    title: "Professional Rider Solutions",
    body: "Trained, disciplined, customer-focused riders — without the complexity of independently recruiting a delivery workforce, adaptable to volume.",
  },
  {
    title: "Fleet Management",
    body: "Structured fleet support: motorcycle readiness, rider coordination, and operational continuity.",
  },
];

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

const PROCESS_STEPS = [
  {
    title: "Understanding Your Requirements",
    body: "We assess your business model, delivery volume, service area, and operating schedule.",
  },
  {
    title: "Creating the Right Solution",
    body: "We develop a delivery or rider solution aligned to your operational needs.",
  },
  {
    title: "Rider and Fleet Deployment",
    body: "Trained riders and suitable motorcycles are assigned per your agreed requirements.",
  },
  {
    title: "Delivery Execution",
    body: "Orders are collected, handled responsibly, and delivered.",
  },
  {
    title: "Operational Support",
    body: "Ongoing coordination keeps performance consistent.",
  },
];

const WHY_CHOOSE_PDS = [
  "Trained Delivery Riders",
  "Reliable Fleet Operations",
  "Safety-Focused Approach",
  "Flexible Business Solutions",
  "B2B Expertise",
  "Professional Brand Representation",
  "Customer-Focused Service",
  "Technology-Supported Operations",
];

const FAQS = [
  {
    question: "What types of delivery services does PDS provide?",
    answer:
      "B2B and B2C last-mile solutions across e-commerce, restaurants, retail, Q-commerce, pharmacies, and corporate clients.",
  },
  {
    question: "Does PDS provide trained delivery riders?",
    answer: "Yes — trained and professional riders across industries.",
  },
  {
    question: "Does PDS manage delivery motorcycles?",
    answer: "Yes — professional fleet management and well-maintained motorcycles.",
  },
  {
    question: "Can your delivery solutions be customized?",
    answer: "Yes — tailored to business type, volume, and operating model.",
  },
  {
    question: "Do you support both businesses and individual customers?",
    answer: "Yes — both B2B and B2C.",
  },
  {
    question: "Which industries do you serve?",
    answer: "E-commerce, restaurants, cafes, cloud kitchens, Q-commerce, retailers, pharmacies, and corporate clients.",
  },
  {
    question: "How can I request a delivery solution?",
    answer: "Contact the team with your requirements for a tailored recommendation.",
  },
];

export default function Home() {
  return (
    <>
      <Nav
        logoSrc="/pds-logo-white.png"
        logoAlt="Proven Delivery Services"
        links={NAV_LINKS}
        ctaLabel="Request a Delivery Solution"
        ctaHref="#contact"
      />

      <main id="main">
        <Hero
          chip="Delivering Trust at Every Mile"
          title="Safe. Reliable. Proven."
          accentWord="Proven."
          subtitle="Safe, efficient, and professional B2B delivery services designed to keep your business moving."
          primaryCta={{ label: "Request a Delivery Solution", href: "#contact" }}
          secondaryCta={{ label: "Contact Our Team", href: "#contact" }}
        />

        <Section
          id="about"
          eyebrow="Who We Are"
          title="Who We Are"
          subtitle="From trained delivery riders to efficient fleet operations, Proven Delivery Services provides dependable last-mile logistics solutions tailored to the needs of modern businesses."
        >
          <div className="two-col">
            <div>
              <p>
                Proven Delivery Services (PDS) is a UAE-based last-mile logistics
                company providing reliable, safe, and efficient delivery
                solutions for businesses and individual customers. We support
                our clients with trained delivery riders, professional fleet
                management, well-maintained motorcycles, disciplined
                operational processes, and customer-focused service. Whether
                you operate an e-commerce platform, restaurant, retail store,
                pharmacy, Q-commerce, or corporate business, PDS helps you
                simplify delivery operations and ensure every shipment reaches
                its destination safely and on time.
              </p>
            </div>
            <div>
              <h3>Mission</h3>
              <p>
                To provide safe, reliable, and efficient last-mile delivery
                solutions that help businesses simplify their logistics
                operations, improve customer satisfaction, and grow with
                confidence.
              </p>
              <h3>Vision</h3>
              <p>
                To become one of the Middle East&apos;s most trusted last-mile
                delivery partners, recognized for operational excellence,
                professional riders, reliable fleet management, and consistent
                service quality.
              </p>
            </div>
          </div>
        </Section>

        <Section id="services" eyebrow="What We Do" title="Services" contentClassName="card-grid" extra={<TagList items={INDUSTRIES} className="services-tags" />}>
          {SERVICES.map((service) => (
            <Card key={service.title} title={service.title} body={service.body} />
          ))}
        </Section>

        <Section id="process" eyebrow="How It Works" title="Our Process" staggerChildren={false}>
          <RouteTimeline stops={PROCESS_STEPS} />
        </Section>

        <Section id="why-us" eyebrow="The Difference" title="Why Choose PDS">
          <TagList items={WHY_CHOOSE_PDS} />
        </Section>

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

        <Section id="faq" eyebrow="Questions" title="FAQ">
          <Accordion items={FAQS} />
        </Section>

        <Section id="contact" eyebrow="Get Started" title="Let's Move Your Business Forward" wipe={false}>
          <p className="text-w70" style={{ maxWidth: "62ch" }}>
            Looking for a reliable delivery partner in the UAE? Whether you
            need trained delivery riders, dependable last-mile delivery
            support, or professionally managed fleet operations, Proven
            Delivery Services is ready to support your business.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 28 }}>
            <Button href="#contact-form" variant="primary">
              Contact PDS Today
            </Button>
            <Button href="#contact-form" variant="ghost">
              Request a Business Proposal
            </Button>
          </div>
          <div id="contact-form" style={{ scrollMarginTop: 120 }}>
            <ContactForm />
          </div>
        </Section>
      </main>

      <Footer
        description="Proven Delivery Services is a UAE-based last-mile logistics company providing reliable B2B and B2C delivery services, professional rider solutions, and efficient fleet management for businesses across multiple industries."
        tagline={PRIMARY_TAGLINE}
      />
    </>
  );
}

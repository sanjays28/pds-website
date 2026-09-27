import { Nav } from "@/components/Nav";
import { Section } from "@/components/Section";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Accordion } from "@/components/Accordion";
import { RouteTimeline } from "@/components/RouteTimeline";

/**
 * FOUNDATION PREVIEW — NOT the real page.
 *
 * Prompt 1 ("Build NO section content yet") only asks for shared
 * components; this file exists purely so `npm run dev` shows something
 * and every component/motion path is visually checkable before Prompt 2
 * replaces this with the real 11-section single-page build from
 * content.md. Copy below is placeholder lorem-style filler, not client
 * content — do not carry any of these strings into the real build.
 */
const previewLinks = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Why Us", href: "#why-us" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export default function Home() {
  return (
    <>
      <Nav
        logoSrc="/pds-logo-white.png"
        logoAlt="Proven Delivery Services"
        links={previewLinks}
        ctaLabel="Request a Quote"
        ctaHref="#contact"
      />

      <main id="main">
        <Section
          id="home"
          eyebrow="Foundation Preview"
          title="Component Scaffold Placeholder Headline"
          subtitle="This subtitle and the cards below are placeholder copy for verifying motion and layout only — real content lands in Prompt 2."
        >
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 8 }}>
            <Button href="#services" variant="primary">
              Primary action
            </Button>
            <Button href="#faq" variant="ghost">
              Ghost action
            </Button>
          </div>
        </Section>

        <Section
          id="services"
          eyebrow="Card Grid Check"
          title="Placeholder Card Grid"
          className=""
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 18,
              marginTop: 8,
            }}
          >
            <Card index="01" title="Placeholder One" body="Lorem ipsum dolor sit amet, placeholder card body copy for layout checking." />
            <Card index="02" title="Placeholder Two" body="Lorem ipsum dolor sit amet, placeholder card body copy for layout checking." />
            <Card index="03" title="Placeholder Three" body="Lorem ipsum dolor sit amet, placeholder card body copy for layout checking." />
            <Card index="04" title="Placeholder Four" body="Lorem ipsum dolor sit amet, placeholder card body copy for layout checking." />
          </div>
        </Section>

        <Section id="process" eyebrow="Timeline Check" title="Placeholder Process Steps" staggerChildren={false}>
          <RouteTimeline
            stops={[
              { title: "Placeholder Step One", body: "Lorem ipsum placeholder body.", status: "done" },
              { title: "Placeholder Step Two", body: "Lorem ipsum placeholder body.", status: "done" },
              { title: "Placeholder Step Three", body: "Lorem ipsum placeholder body.", status: "now" },
              { title: "Placeholder Step Four", body: "Lorem ipsum placeholder body.", status: "upcoming" },
              { title: "Placeholder Step Five", body: "Lorem ipsum placeholder body.", status: "upcoming" },
            ]}
          />
        </Section>

        <Section id="faq" eyebrow="Accordion Check" title="Placeholder FAQ">
          <Accordion
            items={[
              { question: "Placeholder question one?", answer: "Placeholder answer one." },
              { question: "Placeholder question two?", answer: "Placeholder answer two." },
              { question: "Placeholder question three?", answer: "Placeholder answer three." },
            ]}
          />
        </Section>

        <Section id="contact" eyebrow="Foundation Check" title="Placeholder Contact" wipe={false}>
          <p className="text-w70">
            If you can see staggered cards, a slide-up/unblur heading, a
            scroll-filled timeline, a working accordion, and a glass nav that
            appears after scrolling — the foundation is wired correctly.
          </p>
        </Section>
      </main>
    </>
  );
}

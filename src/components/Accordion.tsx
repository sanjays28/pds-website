"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

export interface AccordionItem {
  question: string;
  answer: string;
}

export interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

/**
 * Accordion — WMS §8 FAQAccordion: "one open at a time · schema FAQPage
 * emitted". The JSON-LD FAQPage emission belongs to Prompt 3 (SEO pass,
 * WMS §16) once real FAQ content exists — not built here.
 */
export function Accordion({ items, className }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const baseId = useId();

  return (
    <div className={cn("accordion", className)}>
      {items.map((item, i) => {
        const open = openIndex === i;
        const buttonId = `${baseId}-trigger-${i}`;
        const panelId = `${baseId}-panel-${i}`;
        return (
          <div key={i} className="accordion-item">
            <h3 className="accordion-heading">
              <button
                id={buttonId}
                type="button"
                className="accordion-trigger"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : i)}
              >
                <span>{item.question}</span>
                <span className="accordion-chevron" aria-hidden="true" />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cn("accordion-panel", open && "accordion-panel-open")}
              hidden={!open}
            >
              <p>{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

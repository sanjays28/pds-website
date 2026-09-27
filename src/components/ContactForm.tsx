"use client";

import { useState } from "react";

/**
 * ContactForm — UI shell only. Prompt 2 scope is "build the UI now; wire
 * submission in Prompt 3" (Formspree/Getform/Web3Forms or an API route —
 * not decided yet). `onSubmit` here just prevents a real navigation so the
 * form is inspectable in dev; it does not send anything anywhere.
 *
 * FLAG (content gap): content.md gives this section's headline, body, and
 * two CTA labels ("Contact PDS Today" / "Request a Business Proposal") but
 * no field list, no phone number, and no email address. The fields below
 * (name, company, email, phone, message) are a reasonable minimal B2B lead
 * form, not sourced from content.md — replace with the client's actual
 * required fields before launch. The two CTA labels are rendered as the
 * quick-action buttons above the form (per the same dual-CTA pattern as
 * Home), not as the form's own submit label, since nothing in content.md
 * ties either specific label to "the button that submits this form".
 */
export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    // No endpoint wired yet (Prompt 3). Simulate so the UI states are
    // reviewable now instead of silently doing nothing.
    window.setTimeout(() => setStatus("success"), 600);
  }

  if (status === "success") {
    return (
      <div className="form-success" role="status">
        <p>Thanks — your message is in. Our team will get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="cf-name">Full name</label>
        <input id="cf-name" name="name" type="text" required autoComplete="name" />
      </div>
      <div className="field">
        <label htmlFor="cf-company">Company</label>
        <input id="cf-company" name="company" type="text" autoComplete="organization" />
      </div>
      <div className="field">
        <label htmlFor="cf-email">Email</label>
        <input id="cf-email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="field">
        <label htmlFor="cf-phone">Phone</label>
        <input id="cf-phone" name="phone" type="tel" autoComplete="tel" />
      </div>
      <div className="field field-wide">
        <label htmlFor="cf-message">How can we help?</label>
        <textarea id="cf-message" name="message" rows={4} required />
      </div>
      <button type="submit" className="btn btn-primary" aria-busy={status === "submitting"}>
        <span className="btn-label">{status === "submitting" ? "Sending…" : "Send Message"}</span>
        <span className="arrow" aria-hidden="true">→</span>
      </button>
      <p className="form-note">This form isn&apos;t wired to send anywhere yet — submission endpoint lands in the next build pass.</p>
    </form>
  );
}

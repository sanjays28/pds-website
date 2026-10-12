"use client";

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { Button } from "@/components/Button";
import { PinIcon } from "@/components/PinIcon";
import { CONTACT_ID } from "@/lib/contact";
import { submitEnquiry, type EnquiryType } from "@/lib/submitEnquiry";
import { useInViewOnce } from "@/lib/useInViewOnce";

/**
 * Contact — copy on the left, the enquiry form on the right (stacked on phones).
 * Validation is custom (noValidate): inline messages under each field, shown on blur and on
 * submit, linked with aria-describedby; the first invalid field is focused on submit.
 * The server side is public/send-enquiry.php; the only client↔server code is lib/submitEnquiry.ts.
 */
// The nine service names, in the order the brief lists them (must match SERVICES in public/send-enquiry.php).
const SERVICES = [
  "B2B Delivery Services",
  "E-Commerce Delivery",
  "Food and Restaurant Delivery",
  "Q-Commerce Delivery",
  "Pharmacy Delivery",
  "Retail Delivery",
  "Corporate Delivery",
  "Professional Rider Solutions",
  "Fleet Management",
];

type FieldName = "name" | "company" | "email" | "phone" | "message";
type Values = Record<FieldName | "service", string>;
type Errors = Partial<Record<FieldName, string>>;
type Status = "idle" | "sending" | "success" | "error";

const EMPTY: Values = { name: "", company: "", email: "", phone: "", service: "", message: "" };

function validate(name: FieldName, raw: string): string | undefined {
  const v = raw.trim();
  switch (name) {
    case "name":
      if (!v) return "Please enter your name.";
      if (v.length > 100) return "Please use 100 characters or fewer.";
      return;
    case "company":
      if (v.length > 120) return "Please use 120 characters or fewer.";
      return;
    case "email":
      if (!v) return "Please enter your email address.";
      if (v.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Please enter a valid email address.";
      return;
    case "phone":
      if (v.length > 30 || !/^[0-9 +\-()]*$/.test(v)) return "Use digits, spaces and + - ( ) only.";
      return;
    case "message":
      if (!v) return "Please tell us a little about your needs.";
      if (v.length < 10) return "Please write at least 10 characters.";
      if (v.length > 3000) return "Please use 3000 characters or fewer.";
      return;
  }
}

const FIELD_ORDER: FieldName[] = ["name", "company", "email", "phone", "message"];

export function Contact() {
  const [intent, setIntent] = useState<EnquiryType>("contact");
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [ref, seen] = useInViewOnce<HTMLDivElement>(0.25);

  const shownAt = useRef(0);
  const refs = useRef<Partial<Record<FieldName, HTMLInputElement | HTMLTextAreaElement | null>>>({});
  const botRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [holdH, setHoldH] = useState(0); // keeps the form's height while sending / after success: no layout jump

  useEffect(() => {
    shownAt.current = performance.now(); // "first rendered" — the server and client both require ≥3s after this
  }, []);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  const setField = (name: keyof Values, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    // once a message is showing, re-check as the person fixes it
    if (name !== "service" && errors[name as FieldName] !== undefined) {
      setErrors((e) => ({ ...e, [name]: validate(name as FieldName, value) }));
    }
  };
  const onBlur = (name: FieldName) => setErrors((e) => ({ ...e, [name]: validate(name, values[name]) }));

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sendingRef.current || status === "sending") return;
    const next: Errors = {};
    for (const f of FIELD_ORDER) {
      const msg = validate(f, values[f]);
      if (msg) next[f] = msg;
    }
    setErrors(next);
    const firstBad = FIELD_ORDER.find((f) => next[f]);
    if (firstBad) {
      refs.current[firstBad]?.focus();
      return;
    }
    sendingRef.current = true;
    if (wrapRef.current) setHoldH(Math.round(wrapRef.current.getBoundingClientRect().height));
    setStatus("sending");
    const res = await submitEnquiry(
      {
        name: values.name.trim(),
        company: values.company.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        service: values.service,
        message: values.message.trim(),
        enquiry_type: intent,
        botcheck: botRef.current?.checked ? "1" : "",
      },
      shownAt.current,
    );
    sendingRef.current = false;
    if (res.ok) {
      setStatus("success");
      // analytics: no personal data
      window.dataLayer?.push({ event: "generate_lead", placement: "contact-form", enquiry_type: intent, service: values.service });
      window.dispatchEvent(new CustomEvent("pds:enquiry-sent")); // the spine's pin pulses once
    } else {
      setStatus("error");
    }
  };

  const field = (name: FieldName) => ({
    id: `ct-${name}`,
    name,
    value: values[name],
    "aria-invalid": errors[name] ? (true as const) : undefined,
    "aria-describedby": errors[name] ? `ct-${name}-err` : undefined,
    onChange: (e: { target: { value: string } }) => setField(name, e.target.value),
    onBlur: () => onBlur(name),
    ref: (el: HTMLInputElement | HTMLTextAreaElement | null) => {
      refs.current[name] = el;
    },
  });
  const err = (name: FieldName) =>
    errors[name] ? (
      <p id={`ct-${name}-err`} className="ct-err">
        {errors[name]}
      </p>
    ) : null;

  const submitLabel = intent === "contact" ? "Contact PDS Today" : "Request a Business Proposal";
  const done = status === "success";

  return (
    <section id={CONTACT_ID} className="section ct" data-spine-node="Contact">
      <div className="wrap">
        <div ref={ref} className="ct-grid" data-in={seen || undefined}>
          <div className="ct-copy rv" style={{ "--d": "0ms" } as CSSProperties}>
            <p className="eyebrow" data-spine-y>
              Contact Us
            </p>
            <h2 className="font-display ct-h2">
              Let’s Move Your Business <span className="accent">Forward</span>
            </h2>
            <p className="ct-lead">Looking for a reliable delivery partner in the UAE?</p>
            <p className="ct-p">
              Whether you need trained delivery riders, dependable last-mile delivery support, or professionally managed fleet operations, Proven Delivery Services is ready to support your business.
            </p>
            <p className="ct-p">Speak with our team today to discuss a delivery solution tailored to your operational needs.</p>
            {/* Client contact details (phone, address, social links) go here once supplied.
                Intentionally empty: do not invent any, and never display the recipient email. */}
            <div className="ct-details" />
          </div>

          <div ref={wrapRef} className="ct-formwrap rv" style={{ "--d": "100ms", minHeight: holdH || undefined } as CSSProperties}>
            <form className="ct-form" onSubmit={onSubmit} noValidate data-hidden={done || undefined} inert={done}>
              <fieldset className="ct-intent">
                <legend className="sr-only">Enquiry type</legend>
                {(
                  [
                    ["contact", "Contact PDS Today"],
                    ["proposal", "Request a Business Proposal"],
                  ] as const
                ).map(([val, label]) => (
                  <span key={val} className="ct-radio">
                    <input type="radio" id={`ct-intent-${val}`} name="enquiry_type" value={val} checked={intent === val} onChange={() => setIntent(val)} />
                    <label htmlFor={`ct-intent-${val}`}>{label}</label>
                  </span>
                ))}
              </fieldset>

              <div className="ct-row">
                <div className="ct-field">
                  <label htmlFor="ct-name">Name</label>
                  <input type="text" autoComplete="name" required {...field("name")} />
                  {err("name")}
                </div>
                <div className="ct-field">
                  <label htmlFor="ct-company">Company</label>
                  <input type="text" autoComplete="organization" {...field("company")} />
                  {err("company")}
                </div>
              </div>

              <div className="ct-row">
                <div className="ct-field">
                  <label htmlFor="ct-email">Email</label>
                  <input type="email" autoComplete="email" required {...field("email")} />
                  {err("email")}
                </div>
                <div className="ct-field">
                  <label htmlFor="ct-phone">Phone</label>
                  <input type="tel" inputMode="tel" autoComplete="tel" {...field("phone")} />
                  {err("phone")}
                </div>
              </div>

              <div className="ct-field">
                <label htmlFor="ct-service">Service</label>
                <div className="ct-select">
                  <select id="ct-service" name="service" value={values.service} onChange={(e) => setField("service", e.target.value)}>
                    <option value="">Select a service</option>
                    {SERVICES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </div>

              <div className="ct-field">
                <label htmlFor="ct-message">Message</label>
                <textarea rows={4} required minLength={10} {...field("message")} />
                {err("message")}
              </div>

              {/* honeypot: never filled by people; hidden from view, assistive tech and the tab order */}
              <div className="ct-hp" aria-hidden="true">
                <input ref={botRef} type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" />
              </div>

              {status === "error" && (
                <p className="ct-fail" role="status">
                  Something went wrong. Please try again.
                </p>
              )}

              <div className="ct-submit">
                <Button type="submit" variant="primary" data-cta="contact-form" disabled={status === "sending"} aria-busy={status === "sending" || undefined}>
                  {submitLabel}
                </Button>
                {status === "sending" && <span className="ct-progress" aria-hidden="true" />}
              </div>
            </form>

            <div ref={successRef} className="ct-success" tabIndex={-1} aria-live="polite" data-show={done || undefined}>
              {done && (
                <>
                  <span className="ct-success-pin" aria-hidden="true">
                    <PinIcon />
                  </span>
                  <p>Thank you. We will review your needs and recommend a suitable delivery, rider, or fleet solution.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

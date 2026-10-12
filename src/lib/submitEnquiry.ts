/**
 * submitEnquiry — the only place the front end talks to the server.
 *
 * POSTs JSON to NEXT_PUBLIC_ENQUIRY_ENDPOINT (default "/send-enquiry.php", same origin).
 * Success means: response.ok AND the JSON body has `ok: true`. Anything else (network failure,
 * non-JSON, ok:false, 429, …) is an error.
 *
 * - `npm run dev` without NEXT_PUBLIC_ENQUIRY_ENDPOINT: nothing is sent; the payload is logged and
 *   success is returned after 800ms, so the UI can be tested without PHP.
 * - Submitted < 3s after the form first rendered: treated as success without calling the endpoint
 *   (a bot tell; the server enforces the same rule).
 * - No form data is stored in the browser.
 */
export type EnquiryType = "contact" | "proposal";

export interface EnquiryFields {
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  enquiry_type: EnquiryType;
  botcheck: string;
}

export interface EnquiryPayload extends EnquiryFields {
  elapsed_ms: number;
  page: string;
}

export type EnquiryResult = { ok: true } | { ok: false };

const MIN_ELAPSED_MS = 3000;
const ENDPOINT = process.env.NEXT_PUBLIC_ENQUIRY_ENDPOINT || "/send-enquiry.php";

export async function submitEnquiry(fields: EnquiryFields, formShownAt: number): Promise<EnquiryResult> {
  const elapsed = Math.round(performance.now() - formShownAt);
  const payload: EnquiryPayload = { ...fields, elapsed_ms: elapsed, page: window.location.pathname };

  if (elapsed < MIN_ELAPSED_MS) return { ok: true };

  if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_ENQUIRY_ENDPOINT) {
    console.info("[enquiry] dev simulation — not sent:", payload);
    await new Promise((r) => setTimeout(r, 800));
    return { ok: true };
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (!res.ok) return { ok: false };
    const data: unknown = await res.json();
    return data && typeof data === "object" && (data as { ok?: unknown }).ok === true ? { ok: true } : { ok: false };
  } catch {
    return { ok: false };
  }
}

"use client";

import { useEffect } from "react";
import { initCtaTracking } from "@/lib/trackCta";

/** Mounts the single delegated CTA click listener (see src/lib/trackCta.ts). */
export function CtaTracker() {
  useEffect(() => initCtaTracking(), []);
  return null;
}

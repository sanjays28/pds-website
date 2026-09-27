import type { Metadata } from "next";
import { displayFont, bodyFont } from "@/lib/fonts";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";

export const metadata: Metadata = {
  title: "Proven Delivery Services — Last-Mile Delivery Solutions, UAE",
  description:
    "Safe, efficient, and professional B2B last-mile delivery services across the UAE.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}

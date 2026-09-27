import path from "node:path";
import type { NextConfig } from "next";

// Static export from day one (WMS: single page, no server-rendered content,
// no API routes, no CMS/CRM wiring). Deploys to any static host.
const nextConfig: NextConfig = {
  output: "export",
  images: {
    // next/image optimization requires a server; static export has none.
    unoptimized: true,
  },
  trailingSlash: true,
  // An unrelated package-lock.json in this machine's home directory made
  // Next.js guess the wrong workspace root; pin it to this project.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages configuration
  // This enables compatibility with both local development and Cloudflare deployment
};

export default nextConfig;

// Initialize OpenNext Cloudflare adapter for local development
// This enables Cloudflare bindings to work during `npm run dev`
// In production builds, this function has no effect
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();

import type { NextConfig } from "next";

// Canonical host the app is meant to live on. Override via env so swapping the
// custom domain later (e.g. `praxis.ptts.co.id`) is a one-line change.
const CANONICAL_HOST = process.env.NEXT_PUBLIC_CANONICAL_HOST ?? "ptts-praxis.vercel.app";

// Legacy hosts that should permanent-redirect to CANONICAL_HOST. Vercel still
// resolves the previous auto-subdomain even after a project rename — this rule
// makes sure visitors and old bookmarks land on the new URL.
const LEGACY_HOSTS = ["dummvinci-calc.vercel.app"];

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
  },
  experimental: {
    optimizeCss: true,
  },
  async redirects() {
    return LEGACY_HOSTS.map(host => ({
      source: "/:path*",
      has: [{ type: "host", value: host }],
      destination: `https://${CANONICAL_HOST}/:path*`,
      permanent: true,
    }));
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },

};

export default nextConfig;

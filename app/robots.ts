// app/robots.ts — served at /robots.txt.
// /game* and /work-order are handled via meta noindex + sitemap exclusion,
// NOT robots disallow — a disallow would block crawling so the noindex
// directive on those pages is never seen.
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

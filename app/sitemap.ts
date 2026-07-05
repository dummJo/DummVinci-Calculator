// app/sitemap.ts — served at /sitemap.xml, generated from the SEO registry.
// No lastModified: a build-time date would churn the sitemap on every deploy
// without reflecting real content changes.
import type { MetadataRoute } from "next";
import { SEO, SITE_URL, type SeoEntry } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return (Object.values(SEO) as SeoEntry[])
    .filter((e) => !e.noindex)
    .map((e) => ({
      url: e.path === "/" ? SITE_URL : `${SITE_URL}${e.path}`,
      changeFrequency: "monthly" as const,
      priority: e.priority ?? 0.7,
    }));
}

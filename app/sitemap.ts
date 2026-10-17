import type { MetadataRoute } from "next";
import { CURRICULA } from "@/content/curriculum";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const pages: MetadataRoute.Sitemap = ["", "/bookmarks", "/progress", "/revision"].map((path) => ({ url: new URL(path, base).toString() }));
  for (const technology of CURRICULA) {
    pages.push({ url: new URL(`/curriculum/${technology.id}`, base).toString() });
    for (const chapter of technology.chapters) {
      pages.push({ url: new URL(`/curriculum/${technology.id}/${chapter.id}`, base).toString() });
    }
  }
  return pages;
}
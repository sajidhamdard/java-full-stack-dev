import type { MetadataRoute } from "next";
import { CURRICULA } from "@/content/curriculum";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
  const basePath = base.pathname.replace(/\/+$/, "");
  const pageUrl = (path: string) => new URL(`${basePath}${path || "/"}${path && !path.endsWith("/") ? "/" : ""}`, base.origin).toString();
  const pages: MetadataRoute.Sitemap = ["", "/bookmarks", "/progress", "/revision"].map((path) => ({ url: pageUrl(path) }));
  for (const technology of CURRICULA) {
    pages.push({ url: pageUrl(`/curriculum/${technology.id}`) });
    for (const chapter of technology.chapters) {
      pages.push({ url: pageUrl(`/curriculum/${technology.id}/${chapter.id}`) });
    }
  }
  return pages;
}
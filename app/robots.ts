import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
  const basePath = base.pathname.replace(/\/+$/, "");
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL(`${basePath}/sitemap.xml`, base.origin).toString(),
  };
}
import Hub from "@/app/components/hub";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Bookmarks", description: "Return to your saved Java full-stack lessons.", alternates: { canonical: "/bookmarks" } };

export default function BookmarksPage() {
  return <Hub initialView="bookmarks" />;
}

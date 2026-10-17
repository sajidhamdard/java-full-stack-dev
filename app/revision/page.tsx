import Hub from "@/app/components/hub";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Quick Revision", description: "Review chapter takeaways and interview questions across the curriculum.", alternates: { canonical: "/revision" } };

export default function RevisionPage() {
  return <Hub initialView="revision" />;
}

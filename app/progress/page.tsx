import Hub from "@/app/components/hub";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Learning Progress", description: "Review lesson and chapter completion across your learning path.", alternates: { canonical: "/progress" } };

export default function ProgressPage() {
  return <Hub initialView="progress" />;
}

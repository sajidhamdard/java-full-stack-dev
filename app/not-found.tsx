import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return <main className="not-found"><span className="eyebrow">404 / NOT IN THIS EDITION</span><h1>This page isn't in the field guide.</h1><p>The address may have changed, or the chapter hasn't been added yet.</p><Link href="/"><ArrowLeft size={15} /> Return to the roadmap</Link></main>;
}
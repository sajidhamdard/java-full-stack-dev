import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Fullstack Fieldnotes | Java Developer Roadmap",
    template: "%s | Fullstack Fieldnotes",
  },
  description:
    "A structured, chapter-by-chapter learning path for Java full-stack developers, from first principles to production systems and interviews.",
  openGraph: {
    title: "Fullstack Fieldnotes",
    description: "A practical curriculum for becoming a Java full-stack developer.",
    type: "website",
    siteName: "Fullstack Fieldnotes",
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
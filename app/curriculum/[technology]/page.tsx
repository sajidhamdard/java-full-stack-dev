import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Hub from "@/app/components/hub";
import { CURRICULA, TECHNOLOGY_BY_ID } from "@/content/curriculum";

export function generateStaticParams() {
  return CURRICULA.map((technology) => ({ technology: technology.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ technology: string }> }): Promise<Metadata> {
  const { technology: id } = await params;
  const technology = TECHNOLOGY_BY_ID.get(id);
  if (!technology) return {};
  return {
    title: technology.title,
    description: technology.description,
    alternates: { canonical: `/curriculum/${technology.id}` },
    openGraph: { title: `${technology.title} Curriculum`, description: technology.description },
  };
}

export default async function TechnologyPage({ params }: { params: Promise<{ technology: string }> }) {
  const { technology: id } = await params;
  const technology = TECHNOLOGY_BY_ID.get(id);
  if (!technology) notFound();
  return <Hub initialTechnologyId={technology.id} />;
}
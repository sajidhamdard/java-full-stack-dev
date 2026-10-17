import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Hub from "@/app/components/hub";
import { CURRICULA, TECHNOLOGY_BY_ID } from "@/content/curriculum";

export function generateStaticParams() {
  return CURRICULA.flatMap((technology) => technology.chapters.map((chapter) => ({ technology: technology.id, chapter: chapter.id })));
}

export async function generateMetadata({ params }: { params: Promise<{ technology: string; chapter: string }> }): Promise<Metadata> {
  const { technology: technologyId, chapter: chapterId } = await params;
  const technology = TECHNOLOGY_BY_ID.get(technologyId);
  const chapter = technology?.chapters.find((item) => item.id === chapterId);
  if (!technology || !chapter) return {};
  return {
    title: `${technology.title}: Chapter ${chapter.number} - ${chapter.title}`,
    description: chapter.description,
    alternates: { canonical: `/curriculum/${technology.id}/${chapter.id}` },
    openGraph: { title: `${chapter.title} | ${technology.title}`, description: chapter.description },
  };
}

export default async function ChapterPage({ params }: { params: Promise<{ technology: string; chapter: string }> }) {
  const { technology: technologyId, chapter: chapterId } = await params;
  const technology = TECHNOLOGY_BY_ID.get(technologyId);
  const chapter = technology?.chapters.find((item) => item.id === chapterId);
  if (!technology || !chapter) notFound();
  return <Hub initialTechnologyId={technology.id} initialChapterId={chapter.id} />;
}
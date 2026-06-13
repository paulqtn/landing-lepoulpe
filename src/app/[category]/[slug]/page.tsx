import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingTemplate } from "@/components/landing/LandingTemplate";
import { getLanding, landings } from "@/lib/landings";
import { site } from "@/lib/site";

type Params = { category: string; slug: string };

// Only the keyword pages defined in the registry exist — everything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return landings.map((l) => ({ category: l.category, slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const landing = getLanding(category, slug);
  if (!landing) return {};

  const path = `/${category}/${slug}`;
  return {
    title: landing.meta.title,
    description: landing.meta.description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url: site.url + path,
      siteName: site.legalName,
      title: landing.meta.title,
      description: landing.meta.description,
    },
  };
}

export default async function LandingPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { category, slug } = await params;
  const landing = getLanding(category, slug);
  if (!landing) notFound();

  return <LandingTemplate landing={landing} />;
}

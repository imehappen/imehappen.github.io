import type { Metadata } from "next";
import { getWorks, formatPrice } from "@/lib/works-data";
import { WorksGrid } from "@/components/works-grid";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Work",
  description: "Portfolio catalog — web systems, branding, and conversion engineering projects.",
};

export default async function WorksPage() {
  const works = await getWorks();
  const categories = ["All", ...Array.from(new Set(works.map((w) => w.category)))];

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 sm:px-8">
      <Reveal>
      <header className="mb-12 max-w-2xl">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="text-fg">The</span>{" "}
          <span className="heading-accent-clip">Work</span>
        </h1>
        <p className="mt-3 text-fg-muted">
          Browse the catalog — every project is a shipped outcome. Click any card for the full spec sheet.
        </p>
      </header>
      </Reveal>

      <Reveal>
      <WorksGrid
        works={works.map((w) => ({
          id: w.id,
          slug: w.slug,
          title: w.title,
          category: w.category,
          summary: w.summary,
          priceFrom: w.priceFrom,
          deliveryWeeks: w.deliveryWeeks,
          image: w.media[0]?.src ?? "/images/templatemo-amber-folio-01.jpg",
          imageAlt: w.media[0]?.alt ?? w.title,
          hasVideo: w.media.some((m) => m.kind === "video"),
        }))}
        categories={categories}
      />
      </Reveal>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getWorks, formatPrice } from "@/lib/works-data";

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
      <header className="mb-12 max-w-2xl">
        <h1 className="font-display text-4xl font-bold tracking-tight text-fg sm:text-5xl">The Work</h1>
        <p className="mt-3 text-fg-muted">
          Browse the catalog — every project is a shipped outcome. Click any card for the full spec sheet.
        </p>
      </header>

      {/* Category chips (visual quick-filter; full filtering client-side comes with DB activation) */}
      <div className="mb-10 flex flex-wrap gap-2.5" role="list" aria-label="Categories">
        {categories.map((cat) => (
          <span
            key={cat}
            role="listitem"
            className={`rounded-full border px-4 py-2 text-sm font-medium ${
              cat === "All"
                ? "border-accent bg-accent-soft text-accent"
                : "border-border text-fg-muted"
            }`}
            title="Filtering activates with the database"
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Product grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {works.map((work) => (
          <Link
            key={work.id}
            href={`/works/${work.slug}`}
            className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-border-strong hover:shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={work.media[0]?.src ?? "/images/templatemo-amber-folio-01.jpg"}
                alt={work.media[0]?.alt ?? work.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute left-4 top-4 rounded-full bg-bg/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent backdrop-blur">
                {work.category}
              </span>
              {work.media.some((m) => m.kind === "video") && (
                <span className="absolute right-4 top-4 rounded-full bg-bg/80 px-2.5 py-1 text-xs text-fg backdrop-blur">
                  ▶ Video
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h2 className="font-display text-lg font-bold text-fg group-hover:text-accent">{work.title}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-fg-muted">{work.summary}</p>
              <div className="mt-auto flex items-center justify-between pt-4">
                <span className="text-sm font-semibold text-accent">{formatPrice(work.priceFrom)}</span>
                <span className="text-xs uppercase tracking-wider text-fg-faint">
                  {work.deliveryWeeks ? `${work.deliveryWeeks} wk delivery` : "Custom timeline"}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

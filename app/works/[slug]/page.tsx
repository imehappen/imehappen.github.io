import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getWorks, getWorkBySlug, formatPrice } from "@/lib/works-data";
import { WorkGallery } from "@/components/work-gallery";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);
  if (!work) return { title: "Not found" };
  return { title: work.title, description: work.summary };
}

export default async function WorkDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);
  if (!work) notFound();

  const all = await getWorks();
  const related = all.filter((w) => w.slug !== work.slug && w.category === work.category).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 sm:px-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-fg-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="cursor-pointer hover:text-accent">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/works" className="cursor-pointer hover:text-accent">
              Work
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-fg">
            {work.title}
          </li>
        </ol>
      </nav>

      {/* Amazon-style two-column layout: gallery left, buy-box right */}
      <div className="grid gap-10 lg:grid-cols-2">
        <WorkGallery media={work.media} title={work.title} />

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">{work.category}</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">{work.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {work.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-border px-3 py-1 text-xs text-fg-muted">
                {tag}
              </span>
            ))}
          </div>

          <p className="mt-6 text-3xl font-bold text-fg">
            <span className="align-top text-base font-medium text-fg-muted">From </span>
            {work.priceFrom != null ? `$${work.priceFrom.toLocaleString("en-US")}` : "Custom"}
          </p>
          <p className="mt-1 text-sm text-fg-muted">
            {work.deliveryWeeks
              ? `Typical delivery: ${work.deliveryWeeks} week${work.deliveryWeeks > 1 ? "s" : ""}`
              : "Timeline scoped per project"}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={`/order?work=${work.slug}`}
              className="cursor-pointer rounded-lg bg-accent px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-on-accent transition-all duration-medium hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-[0_12px_35px_rgba(237,44,39,0.4)]"
            >
              Order This Service
            </Link>
            <a
              href="mailto:imehappen@gmail.com"
              className="cursor-pointer rounded-lg border border-border-strong px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-fg transition-all duration-fast hover:border-accent hover:bg-accent-soft hover:text-accent"
            >
              Ask a Question
            </a>
          </div>

          {/* Spec table, like a product listing */}
          <dl className="mt-10 divide-y divide-border rounded-2xl border border-border bg-card">
            {[
              ["Category", work.category],
              ["Starting price", formatPrice(work.priceFrom)],
              ["Delivery", work.deliveryWeeks ? `${work.deliveryWeeks} weeks` : "Scoped per project"],
              ["Stack", work.tags.join(", ") || "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-wrap justify-between gap-2 px-5 py-4">
                <dt className="text-sm text-fg-muted">{label}</dt>
                <dd className="text-sm font-medium text-fg">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Description */}
      <section className="mt-16 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-bold text-fg">About this project</h2>
          <p className="mt-4 leading-relaxed text-fg-muted">{work.description}</p>
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-fg">What&apos;s included</h2>
          <ul className="mt-4 space-y-3">
            {work.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-fg-muted">
                <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 fill-accent" aria-hidden="true">
                  <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl font-bold text-fg">Related work</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((rel) => (
              <Link
                key={rel.id}
                href={`/works/${rel.slug}`}
                className="group lift-card cursor-pointer overflow-hidden rounded-2xl border border-border bg-card hover:-translate-y-1.5 hover:border-border-strong"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={rel.media[0]?.src ?? "/images/templatemo-amber-folio-01.jpg"}
                    alt={rel.media[0]?.alt ?? rel.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="lift-zoom object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-base font-bold text-fg group-hover:text-accent">{rel.title}</h3>
                  <p className="mt-1 text-sm text-fg-muted">{formatPrice(rel.priceFrom)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

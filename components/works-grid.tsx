"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/pricing";

export interface WorkCard {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  priceFrom?: number;
  deliveryWeeks?: number;
  image: string;
  imageAlt: string;
  hasVideo: boolean;
}

export function WorksGrid({
  works,
  categories,
}: {
  works: WorkCard[];
  categories: string[];
}) {
  const [active, setActive] = useState("All");
  const [inputVal, setInputVal] = useState("");
  const [query, setQuery] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Debounce: update the actual query 300ms after the user stops typing
  const onInput = (val: string) => {
    setInputVal(val);
    clearTimeout(timerRef.current ?? undefined);
    timerRef.current = setTimeout(() => setQuery(val), 300);
  };
  useEffect(() => () => clearTimeout(timerRef.current ?? undefined), []);

  const filtered = useMemo(() => {
    let result = active === "All" ? works : works.filter((w) => w.category === active);
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.category.toLowerCase().includes(q) ||
          w.summary.toLowerCase().includes(q)
      );
    }
    return result;
  }, [works, active, query]);

  return (
    <>
      {/* Search + count */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative max-w-md flex-1">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-faint"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.2-5.2m0 0A7.5 7.5 0 105.8 5.8a7.5 7.5 0 0010 10z" />
          </svg>
          <input
            type="search"
            data-global-search
            value={inputVal}
            onChange={(e) => onInput(e.target.value)}
            placeholder="Search work by title, category, or description…"
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-20 text-sm text-fg placeholder:text-fg-faint transition-colors focus:border-accent focus:outline-none"
          />
          <span className="search-kbd absolute right-3 top-1/2 -translate-y-1/2">
            ⌘K
          </span>
        </div>
        <span className="whitespace-nowrap text-sm text-fg-muted">
          {filtered.length === works.length
            ? `${works.length} project${works.length !== 1 ? "s" : ""}`
            : `${filtered.length} of ${works.length} project${works.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {/* Category filter tabs — functional client-side filtering */}
      <div className="mb-10 flex flex-wrap gap-2.5" role="tablist" aria-label="Filter work by category">
        {categories.map((cat) => {
          const selected = cat === active;
          const count = cat === "All" ? works.length : works.filter((w) => w.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(cat)}
              className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-all duration-fast ${
                selected
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border text-fg-muted hover:border-border-strong hover:text-fg"
              }`}
            >
              {cat}
              <span className={`ml-2 text-xs ${selected ? "text-accent" : "text-fg-faint"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Product grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
        {filtered.map((work) => (
          <Link
            key={work.id}
            href={`/works/${work.slug}`}
            className="group lift-card flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card hover:-translate-y-0.5 hover:border-border-strong"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={work.image}
                alt={work.imageAlt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="lift-zoom object-cover"
              />
              <span className="absolute left-4 top-4 rounded-full bg-bg/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent backdrop-blur">
                {work.category}
              </span>
              {work.hasVideo && (
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

      {filtered.length === 0 && (
        <p className="rounded-2xl border border-border bg-card p-8 text-center text-fg-muted">
          {query.trim() ? <>No work matches &ldquo;{query}&rdquo;.</> : "Nothing here yet."}
        </p>
      )}
    </>
  );
}

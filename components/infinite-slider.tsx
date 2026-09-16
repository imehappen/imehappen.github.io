"use client";

/**
 * InfiniteSlider — seamless, full-width marquee of portfolio images.
 * Replaces the old 3D coverflow from the static site.
 *
 * How it works: the track renders the image list TWICE and animates
 * translateX from 0 to -50% on an infinite loop, producing a gapless wrap.
 * Hover pauses; reduced-motion renders a static scrollable strip instead.
 */

import Image from "next/image";

export interface InfiniteSlide {
  src: string;
  alt: string;
}

export function InfiniteSlider({ items }: { items: InfiniteSlide[] }) {
  if (items.length === 0) return null;

  // Duplicate the list for the seamless wrap
  const track = [...items, ...items];

  return (
    <section
      aria-label="Work showcase strip"
      className="marquee-section w-full overflow-hidden border-y border-border bg-surface py-6"
    >
      <div className="marquee-track flex w-max items-center gap-5 px-5">
        {track.map((item, i) => (
          <figure
            key={`${item.src}-${i}`}
            aria-hidden={i >= items.length}
            className="relative h-52 w-72 shrink-0 overflow-hidden rounded-xl border border-border sm:h-64 sm:w-96"
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="384px"
              className="object-cover transition-transform duration-500 hover:scale-[1.03]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" />
          </figure>
        ))}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes marquee {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
            .marquee-track {
              animation: marquee 45s linear infinite;
            }
            .marquee-section:hover .marquee-track {
              animation-play-state: paused;
            }
            @media (prefers-reduced-motion: reduce) {
              .marquee-track { animation: none; overflow-x: auto; }
            }
          `,
        }}
      />
    </section>
  );
}

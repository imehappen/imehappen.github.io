"use client";

/**
 * HeroSlider — the "new infinite slider" that replaces the old static hero.
 *
 * Layout contract (per request):
 *  - Large screens (lg+): 50% image / 50% text. Text holds an eyebrow, a main
 *    headline, a smaller subtitle, and CTA button(s). Direction alternates
 *    (image-left, image-right) for rhythm.
 *  - Small screens: stacked VERTICALLY — image on top, text below.
 *  - Full-width (edge-to-edge), auto-advances every 6s, pauses on hover/focus
 *    and when the tab is hidden. Respects prefers-reduced-motion.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { HomeSlide } from "@/lib/home-slides";

const AUTOPLAY_MS = 6000;

export function HeroSlider({ slides }: { slides: HomeSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const count = slides.length;

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (paused || count <= 1) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    timer.current = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, count]);

  return (
    <section
      id="home"
      aria-roledescription="carousel"
      aria-label="Featured highlights"
      className="relative w-full overflow-hidden pt-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        className="flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: `translateX(-${index * 100}%)` }}
        aria-live="polite"
      >
        {slides.map((slide, i) => {
          const imageLeft = i % 2 === 0;
          return (
            <div
              key={slide.title}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={i !== index}
              className="grid min-h-[calc(100svh-4rem)] w-full shrink-0 grid-cols-1 lg:min-h-[calc(100vh-4rem)] lg:grid-cols-2"
            >
              {/* Image half — top on mobile, left/right on desktop */}
              <div
                className={`relative order-1 min-h-[38vh] w-full overflow-hidden sm:min-h-[46vh] lg:order-${imageLeft ? "1" : "2"} lg:min-h-full`}
              >
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-bg/40" />
              </div>

              {/* Text half — bottom on mobile, left/right on desktop */}
              <div
                className={`order-2 flex w-full flex-col justify-center px-6 py-10 sm:px-10 lg:order-${imageLeft ? "2" : "1"} lg:px-16 xl:px-24`}
              >
                <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-border-strong bg-card px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  {slide.eyebrow}
                </p>
                <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-fg sm:text-5xl xl:text-6xl">
                  {slide.title}
                </h1>
                <p className="mt-5 max-w-xl text-base text-fg-muted sm:text-lg">{slide.subtitle}</p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href={slide.ctaHref}
                    className="cursor-pointer rounded-lg bg-accent px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-on-accent transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-[0_12px_35px_rgba(237,44,39,0.4)]"
                  >
                    {slide.ctaLabel}
                  </Link>
                  {slide.secondaryLabel && slide.secondaryHref && (
                    <Link
                      href={slide.secondaryHref}
                      className="cursor-pointer rounded-lg border border-border-strong px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-fg transition-all duration-200 hover:border-accent hover:bg-accent-soft hover:text-accent"
                    >
                      {slide.secondaryLabel}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2.5">
        {slides.map((s, i) => (
          <button
            key={s.title}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            onClick={() => go(i)}
            className={`h-2.5 cursor-pointer rounded-full transition-all duration-300 ${
              i === index ? "w-8 bg-accent" : "w-2.5 bg-fg/25 hover:bg-fg/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

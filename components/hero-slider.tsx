"use client";

/**
 * HeroSlider — 1:1 port of lmgonzalves/momentum-slider "Portfolio Carousel".
 *
 * Four synchronized sliders sharing one drag gesture:
 *   .pc-numbers  huge index watermark   (synced, non-interactive)
 *   .pc-images   the draggable track    (interactive, throws with velocity)
 *   .pc-titles   vertical title column  (synced, reversed)
 *   .pc-links    vertical CTA column    (synced)
 *
 * Autoplays every AUTOPLAY_MS (paused while hovered/focused/dragged, when the
 * tab is hidden or the hero is off-screen; disabled under reduced motion).
 * No prev/next buttons. Drag momentum + pagination lines.
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import MomentumSlider from "@/lib/momentum-slider";
import type { HomeSlide } from "@/lib/home-slides";

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export interface HeroSliderOptions {
  /** ms per slide; 0 disables auto-advance. */
  autoplayMs?: number;
  /** Pause auto-advance while the pointer is over the image track. */
  pauseOnHover?: boolean;
  /** Extra height on ≥1024px screens, in percent (0–60). */
  heightBoost?: number;
  /** Skip autoplay when the OS prefers reduced motion. */
  respectReducedMotion?: boolean;
}

export function HeroSlider({
  slides,
  autoplayMs = 5000,
  pauseOnHover = false,
  heightBoost = 30,
  respectReducedMotion = true,
}: { slides: HomeSlide[] } & HeroSliderOptions) {
  const count = slides.length;

  const numbersRef = useRef<HTMLDivElement | null>(null);
  const titlesRef = useRef<HTMLDivElement | null>(null);
  const linksRef = useRef<HTMLDivElement | null>(null);
  const imagesRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const engines = useRef<MomentumSlider[]>([]);
  const imagesSlider = useRef<MomentumSlider | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const numbersEl = numbersRef.current;
    const titlesEl = titlesRef.current;
    const linksEl = linksRef.current;
    const imagesEl = imagesRef.current;
    if (count === 0 || !numbersEl || !titlesEl || !linksEl || !imagesEl) return;

    const loop = 1;

    // ── Numbers (huge watermark, synced, non-interactive) ───────────
    const numbers = new MomentumSlider({
      el: numbersEl,
      cssClass: "pc--numbers",
      vertical: false,
      interactive: false,
      loop,
      style: {
        transform: [{ scale: [0.4, 1] }],
        opacity: [0, 1],
      },
    });

    // ── Titles (vertical, reversed — next title enters from top) ────
    const titles = new MomentumSlider({
      el: titlesEl,
      cssClass: "pc--titles",
      vertical: true,
      reverse: true,
      interactive: false,
      loop,
      style: { opacity: [0, 1] },
    });

    // ── Links (vertical CTA column) ────────────────────────────────
    const links = new MomentumSlider({
      el: linksEl,
      cssClass: "pc--links",
      vertical: true,
      interactive: false,
      loop,
    });

    // ── Images (the driver — interactive, throws with velocity) ─────
    const images = new MomentumSlider({
      el: imagesEl,
      cssClass: "pc--images",
      vertical: false,
      interactive: true,
      loop,
      // Sync the three companion sliders
      sync: [numbers, titles, links],
      // Auto-advance. Pause element = the whole stage so keyboard focus on a
      // CTA/pagination pauses it; hover-pause is scoped to the image track
      // (the stage fills the viewport, so the cursor is almost always on it).
      autoplay: count > 1 ? autoplayMs : 0,
      pauseEl: stageRef.current,
      hoverEl: imagesEl,
      pauseOnHover,
      respectReducedMotion,
      // Per-slide image zoom: 1.5 → 1 as slide enters center
      style: {
        ".ms-slide__image": {
          transform: [{ scale: [1.5, 1] }],
        },
      },
      change: (index) => {
        setActiveIndex((prev) => (prev === index ? prev : index));
      },
    });

    engines.current = [images, numbers, titles, links];
    imagesSlider.current = images;
    setActiveIndex(images.getCurrentIndex());

    // Re-measure on resize
    const observer = new ResizeObserver(() => {
      engines.current.forEach((engine) => engine.refresh());
    });
    observer.observe(imagesEl);

    return () => {
      observer.disconnect();
      engines.current.forEach((engine) => engine.destroy());
      engines.current = [];
      imagesSlider.current = null;
    };
  }, [count, autoplayMs, pauseOnHover, respectReducedMotion]);

  if (count === 0) return null;

  const active = slides[activeIndex] ?? slides[0];
  // Drives `--pc-slide-h` on large screens (see globals.css): 1 = original, 1.3 = +30%.
  const heroStyle = { "--pc-boost": String(1 + Math.min(60, Math.max(0, heightBoost)) / 100) } as CSSProperties;

  return (
    <section
      id="home"
      aria-roledescription="carousel"
      aria-label="Featured highlights"
      className="hero-carousel"
      style={heroStyle}
    >
      <h1 className="sr-only">{active?.title}</h1>

      <div ref={stageRef} className="pc-stage">
        <div className="sliders-container">
          {/* Huge index watermark — synced to the image track */}
          <div ref={numbersRef} className="ms-container pc-numbers" aria-hidden="true">
            <ul className="ms-track">
              {slides.map((_, i) => (
                <li className="ms-slide" key={`num-${i}`}>
                  <span>{pad(i + 1)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* The interactive momentum track */}
          <div ref={imagesRef} className="ms-container pc-images">
            <ul className="ms-track">
              {slides.map((slide, i) => (
                <li className="ms-slide" key={`img-${i}`}>
                  <div className="ms-slide__image-container">
                    <div
                      className="ms-slide__image"
                      style={{ backgroundImage: `url("${slide.image}")` }}
                      role="img"
                      aria-label={slide.alt}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Titles — vertical, reversed (next title enters from the top) */}
          <div ref={titlesRef} className="ms-container pc-titles">
            <ul className="ms-track">
              {slides.map((slide, i) => (
                <li className="ms-slide" key={`title-${i}`}>
                  <h2>{slide.title}</h2>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA links — vertical column below titles */}
          <div ref={linksRef} className="ms-container pc-links">
            <ul className="ms-track">
              {slides.map((slide, i) => (
                <li className="ms-slide" key={`link-${i}`}>
                  <div className="pc-links__row">
                    <Link
                      href={slide.ctaHref}
                      className="pc-cta"
                    >
                      {slide.ctaLabel}
                    </Link>
                    {slide.secondaryLabel && slide.secondaryHref && (
                      <Link
                        href={slide.secondaryHref}
                        className="pc-cta pc-cta--ghost"
                      >
                        {slide.secondaryLabel}
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Line pagination — matches reference exactly */}
        <div className="pc-pagination" role="group" aria-label="Choose slide">
          {slides.map((slide, i) => (
            <button
              key={`page-${i}`}
              type="button"
              className="pc-pagination__btn"
              aria-label={`Go to slide ${i + 1}: ${slide.title}`}
              aria-current={i === activeIndex ? "true" : undefined}
              onClick={() => imagesSlider.current?.select(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

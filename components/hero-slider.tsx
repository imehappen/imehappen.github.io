"use client";

/**
 * HeroSlider — Portfolio-Carousel hero.
 *
 * A thin React wrapper around the momentum-slider engine
 * (lib/momentum-slider.js). Structure mirrors lmgonzalves/momentum-slider's
 * "Portfolio Carousel": four interleaved sliders sharing one drag gesture —
 *
 *   .pc-numbers  huge index watermark   (synced, non-interactive)
 *   .pc-images   the draggable track    (interactive, throws with velocity)
 *   .pc-titles   vertical title column  (synced, reversed)
 *   .pc-links    vertical CTA column    (synced)
 *
 * Motion contract ("all the momentums"): the image track follows the pointer
 * 1:1 with rubber-band past the edges; the last ~100ms of movement becomes the
 * release velocity; on release it eases out (easeOutQuad over ~500ms) to the
 * nearest slide while every companion slider rides along proportionally.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import MomentumSlider from "@/lib/momentum-slider";
import type { HomeSlide } from "@/lib/home-slides";

const SNAP_MS = 500;

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function HeroSlider({ slides }: { slides: HomeSlide[] }) {
  const count = slides.length;

  const numbersRef = useRef<HTMLDivElement | null>(null);
  const titlesRef = useRef<HTMLDivElement | null>(null);
  const linksRef = useRef<HTMLDivElement | null>(null);
  const descRef = useRef<HTMLDivElement | null>(null);
  const imagesRef = useRef<HTMLDivElement | null>(null);
  const prevEl = useRef<HTMLButtonElement | null>(null);
  const nextEl = useRef<HTMLButtonElement | null>(null);
  const engines = useRef<MomentumSlider[]>([]);
  const imagesSlider = useRef<MomentumSlider | null>(null);
  const autoplayTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const numbersEl = numbersRef.current;
    const titlesEl = titlesRef.current;
    const linksEl = linksRef.current;
    const descEl = descRef.current;
    const imagesEl = imagesRef.current;
    if (count === 0 || !numbersEl || !titlesEl || !linksEl || !descEl || !imagesEl) return;

    const duration = reduceMotion ? 0 : SNAP_MS;
    const loop = 0;

    const numbers = new MomentumSlider({
      el: numbersEl,
      cssClass: "pc--numbers",
      vertical: false,
      interactive: false,
      loop,
      animDuration: duration,
      style: { transform: [{ scale: [0.4, 1] }], opacity: [0, 1] },
    });

    const titles = new MomentumSlider({
      el: titlesEl,
      cssClass: "pc--titles",
      vertical: true,
      reverse: true,
      interactive: false,
      loop,
      animDuration: duration,
      style: { opacity: [0, 1] },
    });

    const links = new MomentumSlider({
      el: linksEl,
      cssClass: "pc--links",
      vertical: true,
      interactive: false,
      loop,
      animDuration: duration,
    });

    const desc = new MomentumSlider({
      el: descEl,
      cssClass: "pc--desc",
      vertical: true,
      interactive: false,
      loop,
      animDuration: duration,
      style: { opacity: [0, 1] },
    });

    const images = new MomentumSlider({
      el: imagesEl,
      cssClass: "pc--images",
      vertical: false,
      interactive: true,
      loop,
      animDuration: duration,
      sync: [numbers, titles, links, desc],
      style: { ".ms-slide__image": { transform: [{ scale: [1.5, 1] }] } },
      change: (index) => setActiveIndex((prev) => (prev === index ? prev : index)),
      prevEl: prevEl.current,
      nextEl: nextEl.current,
    });

    engines.current = [images, numbers, titles, links, desc];
    imagesSlider.current = images;
    setActiveIndex(images.getCurrentIndex());

    // Autoplay — advance every 5s when not reduced motion
    if (!reduceMotion) {
      autoplayTimer.current = setInterval(() => {
        imagesSlider.current?.next();
      }, 5000);
    }

    const observer = new ResizeObserver(() => {
      engines.current.forEach((engine) => engine.refresh());
    });
    observer.observe(imagesEl);

    return () => {
      observer.disconnect();
      engines.current.forEach((engine) => engine.destroy());
      engines.current = [];
      imagesSlider.current = null;
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);
      autoplayTimer.current = null;
    };
  }, [count, reduceMotion]);

  if (count === 0) return null;

  const active = slides[activeIndex] ?? slides[0];

  return (
    <section
      id="home"
      aria-roledescription="carousel"
      aria-label="Featured highlights"
      className="hero-carousel"
    >
      <h1 className="sr-only">{active?.title}</h1>

      <div className="pc-stage"
         onMouseEnter={() => autoplayTimer.current && clearInterval(autoplayTimer.current)}
         onMouseLeave={() => {
           if (!reduceMotion && !autoplayTimer.current) {
             autoplayTimer.current = setInterval(() => imagesSlider.current?.next(), 5000);
           }
         }}>
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

          {/* Eyebrow — static label above titles (original portfolio-carousel has no eyebrow slider) */}
          <p className="pc-eyebrow" aria-hidden="true">
            {slides[0]?.eyebrow}
          </p>

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
                <li className="ms-slide" key={`link-${i}`} aria-hidden={i !== activeIndex}>
                  <div className="pc-links__row">
                    <Link
                      href={slide.ctaHref}
                      tabIndex={i === activeIndex ? 0 : -1}
                      className="pc-cta"
                    >
                      {slide.ctaLabel}
                    </Link>
                    {slide.secondaryLabel && slide.secondaryHref && (
                      <Link
                        href={slide.secondaryHref}
                        tabIndex={i === activeIndex ? 0 : -1}
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

          {/* Description — vertical synced column below links */}
          <div ref={descRef} className="ms-container pc-desc">
            <ul className="ms-track">
              {slides.map((slide, i) => (
                <li className="ms-slide" key={`desc-${i}`}>
                  <p>{slide.subtitle}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Line pagination */}
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

        {/* Prev/Next navigation arrows */}
        <button
          ref={prevEl}
          type="button"
          className="pc-nav pc-nav--prev slider-nav-btn"
          aria-label="Previous slide"
          aria-hidden={count <= 1}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          ref={nextEl}
          type="button"
          className="pc-nav pc-nav--next slider-nav-btn"
          aria-label="Next slide"
          aria-hidden={count <= 1}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </section>
  );
}

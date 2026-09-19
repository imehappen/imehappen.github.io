"use client";

/**
 * TrustedTicker — "Trusted by" logo strip on MomentumSlider.
 *
 * Drag with momentum, snap to nearest logo. Multiple logos visible at once.
 * Same physics engine as the hero slider (lmgonzalves/momentum-slider port).
 *
 * Infinite: the engine clones `loop` slides at each end and wraps the track
 * position, so `loop` must be >= the number of logos visible at once. We
 * render the logos repeated until the strip is wider than any viewport and
 * set loop to that rendered count.
 */

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import MomentumSlider from "@/lib/momentum-slider";

export interface TrustedLogoItem {
  id: string;
  name: string;
  image: string;
  url?: string;
}

/** Minimum rendered logos per loop segment (~200px each => > 3800px). */
const MIN_RENDERED = 20;

export interface StripOptions {
  /** Auto-scroll speed in px/s; 0 = no automatic movement. */
  speed?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  draggable?: boolean;
  respectReducedMotion?: boolean;
}

export function TrustedTicker({
  logos,
  label = "Trusted by",
  speed = 40,
  direction = "left",
  pauseOnHover = true,
  draggable = true,
  respectReducedMotion = true,
}: {
  logos: TrustedLogoItem[];
  label?: string;
} & StripOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engine = useRef<MomentumSlider | null>(null);

  const rendered = useMemo(() => {
    if (logos.length === 0) return [];
    const repeat = Math.ceil(MIN_RENDERED / logos.length);
    return Array.from({ length: repeat }, () => logos).flat();
  }, [logos]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || rendered.length === 0) return;

    const slider = new MomentumSlider({
      el: container,
      cssClass: "ms-ticker",
      vertical: false,
      interactive: draggable,
      loop: rendered.length,
      // Continuous drift (px/s); pauses on hover/drag, off-screen, hidden tab.
      // Negative speed = drift to the right.
      autoScroll: direction === "right" ? -speed : speed,
      pauseOnHover,
      respectReducedMotion,
    });

    engine.current = slider;

    const observer = new ResizeObserver(() => slider.refresh());
    observer.observe(container);

    return () => {
      observer.disconnect();
      slider.destroy();
      engine.current = null;
    };
    // Only the count matters: a new array identity with the same length must
    // not tear down the engine (which would snap the strip back to slide 0).
  }, [rendered.length, speed, direction, pauseOnHover, draggable, respectReducedMotion]);

  if (rendered.length === 0) return null;

  return (
    <section
      aria-label="Trusted by"
      className={`ticker-section${draggable ? "" : " strip--static"}`}
    >
      <div className="ticker-label-wrap">
        <p className="ticker-label">{label}</p>
      </div>

      <div ref={containerRef} className="ms-container ticker-container">
        <ul className="ms-track">
          {rendered.map((logo, i) => (
            <li className="ms-slide" key={`${logo.id}-${i}`}>
              <div className="ticker-card">
                {logo.url ? (
                  <a
                    href={logo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={logo.name}
                    className="block"
                  >
                    <Image
                      src={logo.image}
                      alt={logo.name}
                      fill
                      sizes="144px"
                      className="object-contain object-center grayscale opacity-50 transition-all duration-fast hover:grayscale-0 hover:opacity-100"
                    />
                  </a>
                ) : (
                  <Image
                    src={logo.image}
                    alt={logo.name}
                    fill
                    sizes="144px"
                    className="object-contain object-center grayscale opacity-50 transition-all duration-fast hover:grayscale-0 hover:opacity-100"
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

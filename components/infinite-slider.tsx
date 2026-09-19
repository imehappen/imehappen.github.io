"use client";

/**
 * InfiniteSlider — full-width work strip on MomentumSlider.
 *
 * Drag with momentum, snap to nearest slide. Multiple slides visible at once.
 * Same physics engine as the hero slider (lmgonzalves/momentum-slider port).
 *
 * Infinite: the engine clones `loop` slides at each end and wraps the track
 * position, so `loop` must be >= the number of slides visible at once. We
 * render the items repeated until the strip is wider than any viewport and
 * set loop to that rendered count.
 */

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import MomentumSlider from "@/lib/momentum-slider";
import type { StripOptions } from "@/components/trusted-ticker";

export interface InfiniteSlide {
  src: string;
  alt: string;
}

/** Minimum rendered cards per loop segment (~16rem + gap each => > 3800px). */
const MIN_RENDERED = 14;

export function InfiniteSlider({
  items,
  speed = 45,
  direction = "left",
  pauseOnHover = true,
  draggable = true,
  respectReducedMotion = true,
}: { items: InfiniteSlide[] } & StripOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engine = useRef<MomentumSlider | null>(null);

  const rendered = useMemo(() => {
    if (items.length === 0) return [];
    const repeat = Math.ceil(MIN_RENDERED / items.length);
    return Array.from({ length: repeat }, () => items).flat();
  }, [items]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || rendered.length === 0) return;

    const slider = new MomentumSlider({
      el: container,
      cssClass: "ms-marquee",
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
      aria-label="Work showcase strip"
      className={`marquee-section${draggable ? "" : " strip--static"}`}
    >
      <div ref={containerRef} className="ms-container marquee-container">
        <ul className="ms-track">
          {rendered.map((item, i) => (
            <li className="ms-slide" key={`${item.src}-${i}`}>
              <div className="marquee-card">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 30vw"
                  className="object-cover"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

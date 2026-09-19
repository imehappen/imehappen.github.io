"use client";

/**
 * Reveal — scroll-entrance wrapper.
 *
 * Children fade up (24px rise, expo-out) the first time they enter the
 * viewport, then stay visible. `delay` staggers siblings (e.g. grid cards:
 * delay={i % 3 * 70} creates a left→right cascade).
 *
 * - Server and client both render the hidden state → no hydration mismatch.
 * - Reduced motion: revealed immediately, no transition.
 * - No-JS: layout.tsx ships a <noscript> style that force-shows .reveal.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced motion is only honoured when Admin → Site Settings → Motion says
    // so (layout.tsx sets data-motion on <html>).
    if (
      document.documentElement.dataset.motion === "respect" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        }
      },
      // Reveal just before the element is fully on screen; slight negative
      // bottom margin so tall elements don't wait for their bottom edge.
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

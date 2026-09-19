"use client";

/**
 * SplitHeading / TypedHeading / TwoToneHeading
 *
 * Headline color treatment used across the site: the first part of the text
 * renders in the foreground color, the rest is clipped to a red gradient
 * (background-clip: text). The split happens at the first ": " / " — " /
 * " - " marker; without a marker, longer headlines split roughly in half.
 *
 * TypedHeading additionally types the accent part with typed.js on the
 * client (skipped for prefers-reduced-motion).
 */

import { useEffect, useRef } from "react";
import Typed from "typed.js";

export function splitHeadline(title: string): { main: string; accent: string | null } {
  const markers = [": ", " — ", " – ", " - "];
  for (const marker of markers) {
    const idx = title.indexOf(marker);
    if (idx > 0 && idx + marker.length < title.length) {
      return {
        main: title.slice(0, idx).trim(),
        accent: title.slice(idx).trim(), // keeps the ": …" / "— …" punctuation
      };
    }
  }
  const words = title.trim().split(/\s+/);
  if (words.length >= 3) {
    const cut = Math.ceil(words.length / 2);
    return { main: words.slice(0, cut).join(" "), accent: words.slice(cut).join(" ") };
  }
  return { main: title, accent: null };
}

function Parts({ text, type, active }: { text: string; type: boolean; active: boolean }) {
  const accentRef = useRef<HTMLSpanElement>(null);
  // First activation waits out the hero-copy entrance (240ms delay + 0.9s run)
  // so the typewriter never reflows text inside a still-transforming element.
  const firstActivationRef = useRef(true);

  // Types (and re-types) whenever the element becomes active — e.g. when its
  // hero slide enters. Inactive elements show the full text statically.
  useEffect(() => {
    if (!type || !active) return;
    const el = accentRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const text = el.dataset.text ?? "";
    let typed: Typed | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = () => {
      typed = new Typed(el, {
        strings: [text],
        typeSpeed: 38,
        showCursor: true,
        cursorChar: "▍",
        autoInsertCss: false, // cursor styling lives in globals.css
        smartBackspace: false,
        loop: false,
      });
    };
    if (firstActivationRef.current) {
      firstActivationRef.current = false;
      timer = setTimeout(start, 1250);
    } else {
      start();
    }
    return () => {
      if (timer) clearTimeout(timer);
      typed?.destroy();
    };
  }, [type, active, text]);

  const { main, accent } = splitHeadline(text);

  return (
    <>
      <span className="text-fg">{main}</span>
      {accent ? (
        <>
          {" "}
          <span
            ref={type && active ? accentRef : undefined}
            data-text={accent}
            className="heading-accent-clip heading-type"
          >
            {type && active ? "\u00A0" : accent}
          </span>
        </>
      ) : null}
    </>
  );
}

/**
 * Two-tone heading; the accent part is typed on the client (typewriter).
 * Pass `active` to (re)type when e.g. its carousel slide becomes visible.
 */
export function TypedHeading({
  text,
  className,
  typewriter = true,
  active = true,
}: {
  text: string;
  className?: string;
  typewriter?: boolean;
  active?: boolean;
}) {
  return (
    <span className={className}>
      <Parts text={text} type={typewriter} active={active} />
    </span>
  );
}

/** Two-tone heading without the typewriter (section headings). */
export function TwoToneHeading({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const { main, accent } = splitHeadline(text);
  return (
    <span className={className}>
      <span className="text-fg">{main}</span>
      {accent ? (
        <>
          {" "}
          <span className="heading-accent-clip">{accent}</span>
        </>
      ) : null}
    </span>
  );
}

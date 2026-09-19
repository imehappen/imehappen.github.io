"use client";

import { useState } from "react";
import Image from "next/image";
import type { WorkMediaSeed } from "@/lib/works-data";

/**
 * Amazon-style product gallery: large main viewport + thumbnail rail.
 * Supports both images and videos (per user request: showcase works in
 * video AND image sliders).
 */
export function WorkGallery({ media, title }: { media: WorkMediaSeed[]; title: string }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = media[activeIdx] ?? null;

  if (!active) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-border bg-card text-fg-faint">
        No media
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main viewport */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-card">
        {active.kind === "video" ? (
          <video
            key={active.src}
            src={active.src}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
            aria-label={`${title} — video ${activeIdx + 1}`}
          />
        ) : (
          <Image
            key={active.src}
            src={active.src}
            alt={active.alt || title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        )}
      </div>

      {/* Thumbnail rail */}
      {media.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1" role="tablist" aria-label={`${title} media`}>
          {media.map((m, i) => (
            <button
              key={`${m.src}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === activeIdx}
              aria-label={`Show ${m.kind} ${i + 1}: ${m.alt || title}`}
              onClick={() => setActiveIdx(i)}
              className={`relative h-20 w-28 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-fast ${
                i === activeIdx ? "border-accent" : "border-border opacity-60 hover:opacity-100"
              }`}
            >
              {m.kind === "video" ? (
                <span className="flex h-full w-full items-center justify-center bg-elevated text-fg">
                  <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true">
                    <path d="M8 5V19L19 12L8 5Z" />
                  </svg>
                </span>
              ) : (
                <Image src={m.src} alt="" fill sizes="112px" className="object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

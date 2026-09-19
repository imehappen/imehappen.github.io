import { isMongoConfigured } from "@/lib/mongodb";

export interface MarqueeSlide {
  src: string;
  alt: string;
}

/**
 * Infinite work-showcase strip ("marquee").
 *
 * - Admin-defined slides live in the MarqueeSlide collection and win.
 * - Otherwise the strip derives from published works (first media image).
 * - Demo mode: derived from the bundled seed works.
 */
export async function getMarqueeSlides(): Promise<MarqueeSlide[]> {
  if (!isMongoConfigured()) return [];

  try {
    const { MarqueeSlide } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();
    const docs = await MarqueeSlide.find({ published: true }).sort({ order: 1, createdAt: 1 }).lean();
    return docs.map((d) => ({ src: d.src, alt: d.alt }));
  } catch (err) {
    console.error("[marquee] falling back to works:", err);
    return [];
  }
}

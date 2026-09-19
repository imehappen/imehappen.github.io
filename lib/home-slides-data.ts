import { homeSlides, type HomeSlide } from "@/lib/home-slides";
import { isMongoConfigured } from "@/lib/mongodb";

/**
 * Reads hero slides. DB-backed via the HomeSlide collection (editable in
 * /admin/hero); falls back to the bundled demo data in `lib/home-slides.ts`.
 */
export async function getHomeSlides(): Promise<HomeSlide[]> {
  if (!isMongoConfigured()) return homeSlides;

  try {
    const { HomeSlide } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();
    const docs = await HomeSlide.find({ published: true })
      .sort({ order: 1, createdAt: 1 })
      .lean();
    if (docs.length === 0) return homeSlides;
    return docs.map((d) => ({
      image: d.image,
      alt: d.alt,
      eyebrow: d.eyebrow,
      title: d.title,
      subtitle: d.subtitle,
      ctaLabel: d.ctaLabel,
      ctaHref: d.ctaHref,
      secondaryLabel: d.secondaryLabel || undefined,
      secondaryHref: d.secondaryHref || undefined,
    }));
  } catch (err) {
    console.error("[home-slides] falling back to seed data:", err);
    return homeSlides;
  }
}

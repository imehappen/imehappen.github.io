import { homeSlides, type HomeSlide } from "@/lib/home-slides";
import { isMongoConfigured } from "@/lib/mongodb";

/**
 * Reads hero slides. DB-backed later (a HomeSlide collection); today the demo
 * data in `lib/home-slides.ts` is the single source of truth.
 */
export async function getHomeSlides(): Promise<HomeSlide[]> {
  if (!isMongoConfigured()) return homeSlides;

  try {
    // Future: read from a HomeSlide collection once content moves into Mongo.
    return homeSlides;
  } catch (err) {
    console.error("[home-slides] falling back to seed data:", err);
    return homeSlides;
  }
}

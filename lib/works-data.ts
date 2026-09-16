import { seedWorks } from "@/lib/seed-data";
import { isMongoConfigured } from "@/lib/mongodb";

export interface WorkMediaSeed {
  src: string;
  kind: "image" | "video";
  alt: string;
}

export interface WorkSeed {
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  features: string[];
  tags: string[];
  media: WorkMediaSeed[];
  priceFrom?: number;
  deliveryWeeks?: number;
  featured: boolean;
  published: boolean;
}

/** A shape the UI can consume regardless of whether it came from Mongo or seed data. */
export type WorkView = WorkSeed & { id: string };

export function workToView(doc: WorkSeed & { _id?: unknown }): WorkView {
  const { _id, ...rest } = doc as WorkSeed & { _id?: { toString(): string } };
  return {
    ...rest,
    id: _id ? String(_id) : rest.slug,
  };
}

/**
 * Reads all published works. When MongoDB is configured it queries the Work
 * collection; otherwise it serves the bundled demo catalog so the site works
 * with zero setup.
 */
export async function getWorks(): Promise<WorkView[]> {
  if (!isMongoConfigured()) return seedWorks.map((w) => workToView(w));

  try {
    const { Work } = await import("@/lib/models");
    const docs = await Work.find({ published: true }).sort({ featured: -1, createdAt: -1 }).lean();
    return docs.map((d) => workToView(d as unknown as WorkSeed));
  } catch (err) {
    console.error("[works] falling back to seed data:", err);
    return seedWorks.map((w) => workToView(w));
  }
}

export async function getWorkBySlug(slug: string): Promise<WorkView | null> {
  const all = await getWorks();
  return all.find((w) => w.slug === slug) ?? null;
}

export function formatPrice(price?: number): string {
  if (price == null) return "Custom Pricing";
  return `From $${price.toLocaleString("en-US")}`;
}

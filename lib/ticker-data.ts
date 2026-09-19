import { isMongoConfigured } from "@/lib/mongodb";

export interface TrustedLogoView {
  id: string;
  name: string;
  image: string;
  url?: string;
  order: number;
}

/**
 * Demo-mode logos. Point `image` at files in /public (e.g. /images/logos/*.svg)
 * or any absolute URL once real client logos are ready.
 */
export const seedTrustedLogos: TrustedLogoView[] = [
  { id: "acme", name: "Acme Studio", image: "/images/logos/acme.svg", order: 1 },
  { id: "northwind", name: "Northwind Labs", image: "/images/logos/northwind.svg", order: 2 },
  { id: "vertex", name: "Vertex Group", image: "/images/logos/vertex.svg", order: 3 },
  { id: "lumen", name: "Lumen Media", image: "/images/logos/lumen.svg", order: 4 },
  { id: "orbit", name: "Orbit Fintech", image: "/images/logos/orbit.svg", order: 5 },
  { id: "halcyon", name: "Halcyon Co.", image: "/images/logos/halcyon.svg", order: 6 },
];

/** Reads ticker logos from Mongo when configured, else seed data. */
export async function getTrustedLogos(): Promise<TrustedLogoView[]> {
  if (!isMongoConfigured()) return seedTrustedLogos;

  try {
    const { TrustedLogo } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();
    const docs = await TrustedLogo.find({ published: true }).sort({ order: 1, createdAt: 1 }).lean();
    if (docs.length === 0) return seedTrustedLogos;
    return docs.map((d) => ({
      id: String(d._id),
      name: d.name,
      image: d.image,
      url: d.url || undefined,
      order: d.order,
    }));
  } catch (err) {
    console.error("[ticker] falling back to seed data:", err);
    return seedTrustedLogos;
  }
}

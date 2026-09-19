import { NextResponse } from "next/server";
import { guard, readJson, badRequest, serverError, str, num, bool, slugify } from "@/lib/admin-api";
import type { WorkSeed, WorkMediaSeed } from "@/lib/works-data";

interface AdminWork extends WorkSeed {
  _id: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
}

/** GET /api/admin/works — list all works (incl. unpublished). */
export async function GET() {
  const g = await guard();
  if (!g.ok) return g.response;

  try {
    const { Work } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();
    const docs = await Work.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ ok: true, works: docs });
  } catch (err) {
    console.error("[admin/works] list failed:", err);
    return serverError("Could not load works.");
  }
}

function mediaPayload(raw: unknown): WorkMediaSeed[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((m) => {
    const item = (m ?? {}) as Record<string, unknown>;
    return {
      src: str(item.src).trim(),
      kind: item.kind === "video" ? ("video" as const) : ("image" as const),
      alt: str(item.alt).trim(),
    };
  });
}

function workPayload(body: Record<string, unknown>) {
  const title = str(body.title).trim();
  return {
    slug: slugify(str(body.slug).trim() || title),
    title,
    category: str(body.category).trim(),
    summary: str(body.summary).trim(),
    description: str(body.description).trim(),
    features: Array.isArray(body.features)
      ? body.features.map((f) => str(f).trim()).filter(Boolean)
      : str(body.features)
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
    tags: Array.isArray(body.tags)
      ? body.tags.map((t) => str(t).trim()).filter(Boolean)
      : str(body.tags)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
    media: mediaPayload(body.media),
    priceFrom: num(body.priceFrom),
    deliveryWeeks: num(body.deliveryWeeks),
    featured: bool(body.featured, false),
    published: bool(body.published, true),
  };
}

/** POST /api/admin/works — create. */
export async function POST(request: Request) {
  const g = await guard();
  if (!g.ok) return g.response;

  const body = await readJson(request);
  if (!body) return badRequest("Invalid JSON body");

  const payload = workPayload(body);
  if (!payload.title || !payload.category || !payload.summary || !payload.description) {
    return badRequest("Title, category, summary, and description are required.");
  }

  try {
    const { Work } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();
    const doc = await Work.create(payload);
    return NextResponse.json({ ok: true, work: doc }, { status: 201 });
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      return badRequest("A work with this slug already exists.");
    }
    console.error("[admin/works] create failed:", err);
    return serverError("Could not create the work.");
  }
}

/** PUT /api/admin/works — update by id. */
export async function PUT(request: Request) {
  const g = await guard();
  if (!g.ok) return g.response;

  const body = await readJson(request);
  if (!body) return badRequest("Invalid JSON body");
  const id = str(body.id);
  if (!id) return badRequest("Work id is required.");

  const payload = workPayload(body);
  if (!payload.title || !payload.category || !payload.summary || !payload.description) {
    return badRequest("Title, category, summary, and description are required.");
  }

  try {
    const { Work } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();
    const doc = await Work.findByIdAndUpdate(id, payload, { new: true }).lean();
    if (!doc) return badRequest("Work not found.");
    return NextResponse.json({ ok: true, work: doc });
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      return badRequest("A work with this slug already exists.");
    }
    console.error("[admin/works] update failed:", err);
    return serverError("Could not update the work.");
  }
}

/** DELETE /api/admin/works?id=... — remove. */
export async function DELETE(request: Request) {
  const g = await guard();
  if (!g.ok) return g.response;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return badRequest("Work id is required.");

  try {
    const { Work } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();
    await Work.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/works] delete failed:", err);
    return serverError("Could not delete the work.");
  }
}

export type { AdminWork };

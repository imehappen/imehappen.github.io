import { NextResponse } from "next/server";
import { guard, readJson, badRequest, serverError, str, num, bool } from "@/lib/admin-api";

/**
 * Sliders API — both sliders in one route:
 *   ?type=hero    → homepage hero carousel (full slide fields + CTAs)
 *   ?type=marquee → infinite work-showcase strip (src + alt)
 */

type SliderType = "hero" | "marquee";

function getType(request: Request): SliderType | null {
  const t = new URL(request.url).searchParams.get("type");
  return t === "hero" || t === "marquee" ? t : null;
}

function idFrom(request: Request, body: Record<string, unknown> | null): string {
  return new URL(request.url).searchParams.get("id") || str(body?.id);
}

/** GET /api/admin/sliders?type=hero|marquee */
export async function GET(request: Request) {
  const g = await guard();
  if (!g.ok) return g.response;

  const type = getType(request);
  if (!type) return badRequest("Unknown slider type. Use hero or marquee.");

  try {
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();

    if (type === "hero") {
      const { HomeSlide } = await import("@/lib/models");
      const docs = await HomeSlide.find().sort({ order: 1, createdAt: 1 }).lean();
      return NextResponse.json({ ok: true, type, items: docs });
    }
    const { MarqueeSlide } = await import("@/lib/models");
    const docs = await MarqueeSlide.find().sort({ order: 1, createdAt: 1 }).lean();
    return NextResponse.json({ ok: true, type, items: docs });
  } catch (err) {
    console.error("[admin/sliders] list failed:", err);
    return serverError("Could not load slides.");
  }
}

function heroPayload(body: Record<string, unknown>) {
  return {
    image: str(body.image).trim(),
    alt: str(body.alt).trim(),
    eyebrow: str(body.eyebrow).trim(),
    title: str(body.title).trim(),
    subtitle: str(body.subtitle).trim(),
    ctaLabel: str(body.ctaLabel).trim(),
    ctaHref: str(body.ctaHref).trim() || "/works",
    secondaryLabel: str(body.secondaryLabel).trim(),
    secondaryHref: str(body.secondaryHref).trim(),
    order: num(body.order) ?? 0,
    published: bool(body.published, true),
  };
}

function marqueePayload(body: Record<string, unknown>) {
  return {
    src: str(body.src).trim(),
    alt: str(body.alt).trim(),
    order: num(body.order) ?? 0,
    published: bool(body.published, true),
  };
}

function validate(type: SliderType, payload: Record<string, unknown>): string | null {
  if (type === "hero") {
    if (!payload.image || !payload.title) return "Image and title are required.";
    return null;
  }
  if (!payload.src) return "Image is required.";
  return null;
}

/** POST /api/admin/sliders?type=hero|marquee — create a slide. */
export async function POST(request: Request) {
  const g = await guard();
  if (!g.ok) return g.response;

  const type = getType(request);
  if (!type) return badRequest("Unknown slider type. Use hero or marquee.");

  const body = await readJson(request);
  if (!body) return badRequest("Invalid JSON body");

  const payload = type === "hero" ? heroPayload(body) : marqueePayload(body);
  const invalid = validate(type, payload);
  if (invalid) return badRequest(invalid);

  try {
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();

    if (type === "hero") {
      const { HomeSlide } = await import("@/lib/models");
      const doc = await HomeSlide.create(payload);
      return NextResponse.json({ ok: true, item: doc }, { status: 201 });
    }
    const { MarqueeSlide } = await import("@/lib/models");
    const doc = await MarqueeSlide.create(payload);
    return NextResponse.json({ ok: true, item: doc }, { status: 201 });
  } catch (err) {
    console.error("[admin/sliders] create failed:", err);
    return serverError("Could not create the slide.");
  }
}

/** PUT /api/admin/sliders?type=hero|marquee — update a slide (id in body or ?id=). */
export async function PUT(request: Request) {
  const g = await guard();
  if (!g.ok) return g.response;

  const type = getType(request);
  if (!type) return badRequest("Unknown slider type. Use hero or marquee.");

  const body = await readJson(request);
  if (!body) return badRequest("Invalid JSON body");

  const id = idFrom(request, body);
  if (!id) return badRequest("Slide id is required.");

  const payload = type === "hero" ? heroPayload(body) : marqueePayload(body);
  const invalid = validate(type, payload);
  if (invalid) return badRequest(invalid);

  try {
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();

    if (type === "hero") {
      const { HomeSlide } = await import("@/lib/models");
      const doc = await HomeSlide.findByIdAndUpdate(id, payload, { new: true }).lean();
      if (!doc) return badRequest("Slide not found.");
      return NextResponse.json({ ok: true, item: doc });
    }
    const { MarqueeSlide } = await import("@/lib/models");
    const doc = await MarqueeSlide.findByIdAndUpdate(id, payload, { new: true }).lean();
    if (!doc) return badRequest("Slide not found.");
    return NextResponse.json({ ok: true, item: doc });
  } catch (err) {
    console.error("[admin/sliders] update failed:", err);
    return serverError("Could not update the slide.");
  }
}

/** DELETE /api/admin/sliders?type=hero|marquee&id=... */
export async function DELETE(request: Request) {
  const g = await guard();
  if (!g.ok) return g.response;

  const type = getType(request);
  if (!type) return badRequest("Unknown slider type. Use hero or marquee.");

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return badRequest("Slide id is required.");

  try {
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();

    if (type === "hero") {
      const { HomeSlide } = await import("@/lib/models");
      await HomeSlide.findByIdAndDelete(id);
    } else {
      const { MarqueeSlide } = await import("@/lib/models");
      await MarqueeSlide.findByIdAndDelete(id);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/sliders] delete failed:", err);
    return serverError("Could not delete the slide.");
  }
}

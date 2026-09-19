import { NextResponse } from "next/server";
import { guard, readJson, badRequest, serverError, str, num, bool } from "@/lib/admin-api";

/** GET /api/admin/ticker — list all logos (incl. unpublished). */
export async function GET() {
  const g = await guard();
  if (!g.ok) return g.response;

  try {
    const { TrustedLogo } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();
    const docs = await TrustedLogo.find().sort({ order: 1, createdAt: 1 }).lean();
    return NextResponse.json({ ok: true, logos: docs });
  } catch (err) {
    console.error("[admin/ticker] list failed:", err);
    return serverError("Could not load logos.");
  }
}

function logoPayload(body: Record<string, unknown>) {
  return {
    name: str(body.name).trim(),
    image: str(body.image).trim(),
    url: str(body.url).trim(),
    order: num(body.order) ?? 0,
    published: bool(body.published, true),
  };
}

/** POST /api/admin/ticker — create a logo. */
export async function POST(request: Request) {
  const g = await guard();
  if (!g.ok) return g.response;

  const body = await readJson(request);
  if (!body) return badRequest("Invalid JSON body");

  const payload = logoPayload(body);
  if (!payload.name || !payload.image) return badRequest("Name and image are required.");

  try {
    const { TrustedLogo } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();
    const doc = await TrustedLogo.create(payload);
    return NextResponse.json({ ok: true, logo: doc }, { status: 201 });
  } catch (err) {
    console.error("[admin/ticker] create failed:", err);
    return serverError("Could not create the logo.");
  }
}

/** PUT /api/admin/ticker — update a logo by id. */
export async function PUT(request: Request) {
  const g = await guard();
  if (!g.ok) return g.response;

  const body = await readJson(request);
  if (!body) return badRequest("Invalid JSON body");
  const id = str(body.id);
  if (!id) return badRequest("Logo id is required.");

  const payload = logoPayload(body);
  if (!payload.name || !payload.image) return badRequest("Name and image are required.");

  try {
    const { TrustedLogo } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();
    const doc = await TrustedLogo.findByIdAndUpdate(id, payload, { new: true }).lean();
    if (!doc) return badRequest("Logo not found.");
    return NextResponse.json({ ok: true, logo: doc });
  } catch (err) {
    console.error("[admin/ticker] update failed:", err);
    return serverError("Could not update the logo.");
  }
}

/** DELETE /api/admin/ticker?id=... — remove a logo. */
export async function DELETE(request: Request) {
  const g = await guard();
  if (!g.ok) return g.response;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return badRequest("Logo id is required.");

  try {
    const { TrustedLogo } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();
    await TrustedLogo.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/ticker] delete failed:", err);
    return serverError("Could not delete the logo.");
  }
}

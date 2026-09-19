import { NextResponse } from "next/server";
import { guard, readJson, badRequest, serverError, str, num, bool } from "@/lib/admin-api";

/** GET /api/admin/services — list all (incl. unpublished). */
export async function GET() {
  const g = await guard();
  if (!g.ok) return g.response;

  try {
    const { Service } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();
    const docs = await Service.find().sort({ order: 1, createdAt: 1 }).lean();
    return NextResponse.json({ ok: true, services: docs });
  } catch (err) {
    console.error("[admin/services] list failed:", err);
    return serverError("Could not load services.");
  }
}

function servicePayload(body: Record<string, unknown>) {
  return {
    title: str(body.title).trim(),
    description: str(body.description).trim(),
    iconPath: str(body.iconPath).trim(),
    image: str(body.image).trim(),
    order: num(body.order) ?? 0,
    published: bool(body.published, true),
  };
}

/** POST /api/admin/services — create. */
export async function POST(request: Request) {
  const g = await guard();
  if (!g.ok) return g.response;

  const body = await readJson(request);
  if (!body) return badRequest("Invalid JSON body");

  const payload = servicePayload(body);
  if (!payload.title || !payload.description) {
    return badRequest("Title and description are required.");
  }

  try {
    const { Service } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();
    const doc = await Service.create(payload);
    return NextResponse.json({ ok: true, service: doc }, { status: 201 });
  } catch (err) {
    console.error("[admin/services] create failed:", err);
    return serverError("Could not create the service.");
  }
}

/** PUT /api/admin/services — update by id. */
export async function PUT(request: Request) {
  const g = await guard();
  if (!g.ok) return g.response;

  const body = await readJson(request);
  if (!body) return badRequest("Invalid JSON body");
  const id = str(body.id);
  if (!id) return badRequest("Service id is required.");

  const payload = servicePayload(body);
  if (!payload.title || !payload.description) {
    return badRequest("Title and description are required.");
  }

  try {
    const { Service } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();
    const doc = await Service.findByIdAndUpdate(id, payload, { new: true }).lean();
    if (!doc) return badRequest("Service not found.");
    return NextResponse.json({ ok: true, service: doc });
  } catch (err) {
    console.error("[admin/services] update failed:", err);
    return serverError("Could not update the service.");
  }
}

/** DELETE /api/admin/services?id=... — remove. */
export async function DELETE(request: Request) {
  const g = await guard();
  if (!g.ok) return g.response;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return badRequest("Service id is required.");

  try {
    const { Service } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();
    await Service.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/services] delete failed:", err);
    return serverError("Could not delete the service.");
  }
}

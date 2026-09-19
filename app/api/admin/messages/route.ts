import { NextResponse } from "next/server";
import { guard, readJson, badRequest, serverError, str } from "@/lib/admin-api";

const STATUSES = ["new", "read", "archived"] as const;
type Status = (typeof STATUSES)[number];

/** GET /api/admin/messages — list all contact messages, newest first. */
export async function GET() {
  const g = await guard();
  if (!g.ok) return g.response;

  try {
    const { Message } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();
    const docs = await Message.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ ok: true, messages: docs });
  } catch (err) {
    console.error("[admin/messages] list failed:", err);
    return serverError("Could not load messages.");
  }
}

/** PUT /api/admin/messages — update status. Body: { id, status } */
export async function PUT(request: Request) {
  const g = await guard();
  if (!g.ok) return g.response;

  const body = await readJson(request);
  if (!body) return badRequest("Invalid JSON body");
  const id = str(body.id);
  const status = str(body.status) as Status;
  if (!id) return badRequest("Message id is required.");
  if (!STATUSES.includes(status)) return badRequest("Invalid status.");

  try {
    const { Message } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();
    const doc = await Message.findByIdAndUpdate(id, { status }, { new: true }).lean();
    if (!doc) return badRequest("Message not found.");
    return NextResponse.json({ ok: true, message: doc });
  } catch (err) {
    console.error("[admin/messages] update failed:", err);
    return serverError("Could not update the message.");
  }
}

/** DELETE /api/admin/messages?id=... */
export async function DELETE(request: Request) {
  const g = await guard();
  if (!g.ok) return g.response;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return badRequest("Message id is required.");

  try {
    const { Message } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();
    await Message.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/messages] delete failed:", err);
    return serverError("Could not delete the message.");
  }
}

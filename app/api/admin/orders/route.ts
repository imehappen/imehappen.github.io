import { NextResponse } from "next/server";
import { guard, readJson, badRequest, serverError, str } from "@/lib/admin-api";

const STATUSES = ["new", "in_review", "in_progress", "delivered", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

/** GET /api/admin/orders — list all orders, newest first. */
export async function GET() {
  const g = await guard();
  if (!g.ok) return g.response;

  try {
    const { Order } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();
    const docs = await Order.find()
      .sort({ createdAt: -1 })
      .populate("work", "title slug")
      .lean();
    return NextResponse.json({ ok: true, orders: docs });
  } catch (err) {
    console.error("[admin/orders] list failed:", err);
    return serverError("Could not load orders.");
  }
}

/** PUT /api/admin/orders — update status. Body: { id, status } */
export async function PUT(request: Request) {
  const g = await guard();
  if (!g.ok) return g.response;

  const body = await readJson(request);
  if (!body) return badRequest("Invalid JSON body");
  const id = str(body.id);
  const status = str(body.status) as Status;
  if (!id) return badRequest("Order id is required.");
  if (!STATUSES.includes(status)) return badRequest("Invalid status.");

  try {
    const { Order } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();
    const doc = await Order.findByIdAndUpdate(id, { status }, { new: true })
      .populate("work", "title slug")
      .lean();
    if (!doc) return badRequest("Order not found.");
    return NextResponse.json({ ok: true, order: doc });
  } catch (err) {
    console.error("[admin/orders] update failed:", err);
    return serverError("Could not update the order.");
  }
}

/** DELETE /api/admin/orders?id=... */
export async function DELETE(request: Request) {
  const g = await guard();
  if (!g.ok) return g.response;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return badRequest("Order id is required.");

  try {
    const { Order } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();
    await Order.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/orders] delete failed:", err);
    return serverError("Could not delete the order.");
  }
}

import { NextResponse } from "next/server";
import { isMongoConfigured } from "@/lib/mongodb";
import { getWorkBySlug } from "@/lib/works-data";

/**
 * POST /api/orders — create an order for a work/service.
 *
 * - With MongoDB configured: persists to the Order collection.
 * - Without: validates and returns a demo order number (static/demo mode),
 *   so the full UX can be exercised before the DB is enabled.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const workSlug = String(body.workSlug ?? "").trim();
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const company = String(body.company ?? "").trim();
  const budgetRaw = String(body.budget ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!workSlug || !name || !email) {
    return NextResponse.json(
      { ok: false, error: "Service, name, and email are required." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  }

  const work = await getWorkBySlug(workSlug);
  if (!work) {
    return NextResponse.json({ ok: false, error: "Unknown service selected." }, { status: 400 });
  }

  const budget = budgetRaw ? Number(budgetRaw) : undefined;
  if (budget != null && (!Number.isFinite(budget) || budget < 0)) {
    return NextResponse.json({ ok: false, error: "Budget must be a positive number." }, { status: 400 });
  }

  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

  // ── Real persistence path (dormant until MongoDB is enabled) ──────────
  if (isMongoConfigured()) {
    try {
      const { Order } = await import("@/lib/models");
      const { getMongoConnection } = await import("@/lib/mongodb");
      await getMongoConnection();
      await Order.create({ orderNumber, work: work.id, name, email, phone, company, budget, message });
    } catch (err) {
      console.error("[orders] persist failed:", err);
      return NextResponse.json(
        { ok: false, error: "Could not save your order right now. Please try again." },
        { status: 500 }
      );
    }
  } else {
    console.log(`[orders] demo mode — order ${orderNumber} for "${work.title}" (${email})`);
  }

  // Reserved: real-time fanout via Socket.IO once enabled:
  // globalThis.__io?.io?.emit("order:created", { orderNumber });

  return NextResponse.json({ ok: true, orderNumber }, { status: 201 });
}

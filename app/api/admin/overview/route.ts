import { NextResponse } from "next/server";
import { guard, serverError } from "@/lib/admin-api";

/** GET /api/admin/overview — counts for the dashboard cards. */
export async function GET() {
  const g = await guard();
  if (!g.ok) return g.response;

  try {
    const { Work, Order, Message, User, TrustedLogo } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();

    const [works, orders, newOrders, messages, newMessages, users, logos] = await Promise.all([
      Work.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: "new" }),
      Message.countDocuments(),
      Message.countDocuments({ status: "new" }),
      User.countDocuments(),
      TrustedLogo.countDocuments(),
    ]);

    return NextResponse.json({ ok: true, counts: { works, orders, newOrders, messages, newMessages, users, logos } });
  } catch (err) {
    console.error("[admin/overview] failed:", err);
    return serverError("Could not load dashboard stats.");
  }
}

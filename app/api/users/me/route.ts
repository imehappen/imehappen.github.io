import { NextResponse } from "next/server";
import { getSession, isAuthConfigured } from "@/lib/auth";

/** GET /api/users/me — current session (null-safe in demo mode). */
export async function GET() {
  if (!isAuthConfigured()) {
    return NextResponse.json({ ok: true, user: null, demo: true });
  }

  const session = await getSession();
  return NextResponse.json({ ok: true, user: session });
}

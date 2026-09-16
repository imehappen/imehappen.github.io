import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

/** POST /api/users/logout — clear the session cookie. */
export async function POST() {
  await destroySession();
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { isMongoConfigured } from "@/lib/mongodb";
import { isAuthConfigured, createSession } from "@/lib/auth";

/** POST /api/users/login — authenticate and set the session cookie. */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Email and password are required." }, { status: 400 });
  }

  if (!isMongoConfigured() || !isAuthConfigured()) {
    return NextResponse.json(
      {
        ok: true,
        demo: true,
        message: "Demo mode: sessions require MONGODB_URI + AUTH_SECRET (see README).",
      },
      { status: 202 }
    );
  }

  try {
    const { User } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();

    const user = await User.findOne({ email }).select("+passwordHash").lean();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 });
    }

    await createSession({ userId: String(user._id), email: user.email, name: user.name, role: user.role });
    return NextResponse.json({
      ok: true,
      user: { id: String(user._id), name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("[users] login failed:", err);
    return NextResponse.json({ ok: false, error: "Could not sign in right now." }, { status: 500 });
  }
}

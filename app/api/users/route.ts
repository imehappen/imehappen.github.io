import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { isMongoConfigured } from "@/lib/mongodb";
import { isAuthConfigured, requireStaffSession } from "@/lib/auth";

/**
 * User routes.
 *
 * POST /api/users — public register. The FIRST account becomes superadmin;
 *                   everyone else is a client. In demo mode (no DB/auth env)
 *                   it acknowledges the request without storing anything.
 * GET  /api/users — staff-only listing (requires DB + AUTH_SECRET).
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const company = String(body.company ?? "").trim();
  const phone = String(body.phone ?? "").trim();

  if (!name || !email || !password) {
    return NextResponse.json({ ok: false, error: "Name, email, and password are required." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ ok: false, error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  if (!isMongoConfigured() || !isAuthConfigured()) {
    return NextResponse.json(
      {
        ok: true,
        demo: true,
        message:
          "Valid request. Demo mode: nothing stored. Set MONGODB_URI + AUTH_SECRET (see README) to enable accounts.",
      },
      { status: 202 }
    );
  }

  try {
    const { User } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return NextResponse.json({ ok: false, error: "An account with this email already exists." }, { status: 409 });
    }

    // First registered user becomes SUPERADMIN ("me"); everyone else is a client.
    const count = await User.estimatedDocumentCount();
    const effectiveRole = count === 0 ? "superadmin" : "client";

    const user = await User.create({ name, email, passwordHash, role: effectiveRole, company, phone });
    return NextResponse.json(
      { ok: true, user: { id: String(user._id), name: user.name, email: user.email, role: user.role } },
      { status: 201 }
    );
  } catch (err) {
    console.error("[users] register failed:", err);
    return NextResponse.json({ ok: false, error: "Could not create the account right now." }, { status: 500 });
  }
}

export async function GET() {
  if (!isMongoConfigured() || !isAuthConfigured()) {
    return NextResponse.json(
      { ok: false, error: "User management requires MONGODB_URI and AUTH_SECRET." },
      { status: 501 }
    );
  }

  const session = await requireStaffSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Staff access required." }, { status: 403 });
  }

  try {
    const { User } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();
    const users = await User.find().select("-passwordHash").sort({ createdAt: -1 }).lean();
    return NextResponse.json({ ok: true, users });
  } catch (err) {
    console.error("[users] list failed:", err);
    return NextResponse.json({ ok: false, error: "Could not load users." }, { status: 500 });
  }
}

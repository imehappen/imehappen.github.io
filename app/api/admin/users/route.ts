import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { guard, readJson, badRequest, serverError, str } from "@/lib/admin-api";

const ROLES = ["superadmin", "admin", "client"] as const;
type Role = (typeof ROLES)[number];

function isStaffRole(role: string): boolean {
  return role === "superadmin" || role === "admin";
}

/** GET /api/admin/users — list all users without password hashes. */
export async function GET() {
  const g = await guard();
  if (!g.ok) return g.response;

  try {
    const { User } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();
    const docs = await User.find().select("-passwordHash").sort({ createdAt: -1 }).lean();
    return NextResponse.json({ ok: true, users: docs });
  } catch (err) {
    console.error("[admin/users] list failed:", err);
    return serverError("Could not load users.");
  }
}

/** POST /api/admin/users — create a user with any role. */
export async function POST(request: Request) {
  const g = await guard();
  if (!g.ok) return g.response;

  const body = await readJson(request);
  if (!body) return badRequest("Invalid JSON body");

  const name = str(body.name).trim();
  const email = str(body.email).trim().toLowerCase();
  const password = str(body.password);
  const role = str(body.role, "client") as Role;
  const company = str(body.company).trim();
  const phone = str(body.phone).trim();

  if (!name || !email || !password) return badRequest("Name, email, and password are required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return badRequest("Invalid email address.");
  if (password.length < 8) return badRequest("Password must be at least 8 characters.");
  if (!ROLES.includes(role)) return badRequest("Invalid role.");

  try {
    const { User } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();

    const existing = await User.findOne({ email }).lean();
    if (existing) return badRequest("An account with this email already exists.");

    const passwordHash = await bcrypt.hash(password, 12);
    const doc = await User.create({ name, email, passwordHash, role, company, phone });
    return NextResponse.json(
      { ok: true, user: { id: String(doc._id), name: doc.name, email: doc.email, role: doc.role } },
      { status: 201 }
    );
  } catch (err) {
    console.error("[admin/users] create failed:", err);
    return serverError("Could not create the user.");
  }
}

/** PUT /api/admin/users — update role/details/password. Body: { id, ... } */
export async function PUT(request: Request) {
  const g = await guard();
  if (!g.ok) return g.response;

  const body = await readJson(request);
  if (!body) return badRequest("Invalid JSON body");
  const id = str(body.id);
  if (!id) return badRequest("User id is required.");

  try {
    const { User } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();

    const target = await User.findById(id).lean();
    if (!target) return badRequest("User not found.");

    const update: Record<string, unknown> = {};

    // Role change — superadmin required to promote to superadmin; never demote the last staff member.
    if (body.role != null) {
      const role = str(body.role) as Role;
      if (!ROLES.includes(role)) return badRequest("Invalid role.");
      if (role === "superadmin" && g.session.role !== "superadmin") {
        return NextResponse.json(
          { ok: false, error: "Only a superadmin can grant the superadmin role." },
          { status: 403 }
        );
      }
      if (isStaffRole(target.role) && !isStaffRole(role)) {
        const staffCount = await User.countDocuments({ role: { $in: ["superadmin", "admin"] } });
        if (staffCount <= 1) {
          return badRequest("Cannot demote the last staff member.");
        }
      }
      update.role = role;
    }

    if (body.name != null) update.name = str(body.name).trim();
    if (body.company != null) update.company = str(body.company).trim();
    if (body.phone != null) update.phone = str(body.phone).trim();

    if (body.password != null && str(body.password).length > 0) {
      const password = str(body.password);
      if (password.length < 8) return badRequest("Password must be at least 8 characters.");
      update.passwordHash = await bcrypt.hash(password, 12);
    }

    if (Object.keys(update).length === 0) return badRequest("Nothing to update.");

    const doc = await User.findByIdAndUpdate(id, update, { new: true }).select("-passwordHash").lean();
    return NextResponse.json({ ok: true, user: doc });
  } catch (err) {
    console.error("[admin/users] update failed:", err);
    return serverError("Could not update the user.");
  }
}

/** DELETE /api/admin/users?id=... — with self/last-staff protections. */
export async function DELETE(request: Request) {
  const g = await guard();
  if (!g.ok) return g.response;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return badRequest("User id is required.");

  try {
    const { User } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();

    if (id === g.session.userId) return badRequest("You cannot delete your own account.");

    const target = await User.findById(id).lean();
    if (!target) return badRequest("User not found.");

    if (isStaffRole(target.role)) {
      const staffCount = await User.countDocuments({ role: { $in: ["superadmin", "admin"] } });
      if (staffCount <= 1) return badRequest("Cannot delete the last staff member.");
      if (target.role === "superadmin" && g.session.role !== "superadmin") {
        return NextResponse.json(
          { ok: false, error: "Only a superadmin can delete a superadmin." },
          { status: 403 }
        );
      }
    }

    await User.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/users] delete failed:", err);
    return serverError("Could not delete the user.");
  }
}

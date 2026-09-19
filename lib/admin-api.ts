import { NextResponse } from "next/server";
import { isMongoConfigured } from "@/lib/mongodb";
import { requireStaffSession, type SessionPayload } from "@/lib/auth";

/**
 * Shared plumbing for /api/admin routes.
 *
 * Returns either a NextResponse to send immediately (guard failed / demo mode),
 * or the verified staff session to proceed with.
 */
export async function guard(): Promise<
  { ok: true; session: SessionPayload } | { ok: false; response: NextResponse }
> {
  const session = await requireStaffSession();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, error: "Staff access required." }, { status: 403 }),
    };
  }
  if (!isMongoConfigured()) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "The admin panel requires MONGODB_URI. See README → Enabling MongoDB." },
        { status: 501 }
      ),
    };
  }
  return { ok: true, session };
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function badRequest(message: string): NextResponse {
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}

export function serverError(message: string): NextResponse {
  return NextResponse.json({ ok: false, error: message }, { status: 500 });
}

export function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : v == null ? fallback : String(v);
}

export function num(v: unknown): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function bool(v: unknown, fallback = false): boolean {
  if (typeof v === "boolean") return v;
  if (v === "true") return true;
  if (v === "false") return false;
  return fallback;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

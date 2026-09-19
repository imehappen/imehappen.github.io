import { NextResponse } from "next/server";
import { isMongoConfigured } from "@/lib/mongodb";

/**
 * POST /api/contact — accept a contact-form message.
 * Persists to the Message collection when MongoDB is configured; in demo mode
 * it validates and acknowledges without storing.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const subject = String(body.subject ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name || !email || !message) {
    return NextResponse.json({ ok: false, error: "Name, email, and message are required." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  }
  if (message.length > 2000) {
    return NextResponse.json({ ok: false, error: "Message is too long (2000 characters max)." }, { status: 400 });
  }

  if (!isMongoConfigured()) {
    console.log(`[contact] demo mode — message from "${name}" <${email}>: ${subject || "(no subject)"}`);
    return NextResponse.json({ ok: true, demo: true }, { status: 202 });
  }

  try {
    const { Message } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();
    await Message.create({ name, email, subject, message });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[contact] persist failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not send your message right now. Please try again." },
      { status: 500 }
    );
  }
}

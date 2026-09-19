import { NextResponse } from "next/server";
import { guard, readJson, badRequest, serverError, str } from "@/lib/admin-api";
import {
  contentSchemas,
  defaultAbout,
  defaultContact,
  defaultSettings,
  type ContentKey,
} from "@/lib/site-content";
import { roleSatisfies, settingsFieldMinRole } from "@/lib/settings-schema";

const defaultsBySection: Record<ContentKey, Record<string, unknown>> = {
  about: defaultAbout as unknown as Record<string, unknown>,
  contact: defaultContact as unknown as Record<string, unknown>,
  settings: defaultSettings as unknown as Record<string, unknown>,
};

/** GET /api/admin/content?section=about|contact|settings */
export async function GET(request: Request) {
  const g = await guard();
  if (!g.ok) return g.response;

  const section = new URL(request.url).searchParams.get("section") as ContentKey | null;
  if (!section || !(section in contentSchemas)) {
    return badRequest("Unknown section. Use about, contact, or settings.");
  }

  try {
    const { Content } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();
    const doc = await Content.findOne({ key: section }).lean();
    const data = { ...defaultsBySection[section], ...(doc?.data ?? {}) };
    return NextResponse.json({
      ok: true,
      section,
      data,
      fields: contentSchemas[section],
      role: g.session.role,
    });
  } catch (err) {
    console.error("[admin/content] read failed:", err);
    return serverError("Could not load the section.");
  }
}

/** PUT /api/admin/content — body: { section, data: { field: value } } */
export async function PUT(request: Request) {
  const g = await guard();
  if (!g.ok) return g.response;

  const body = await readJson(request);
  if (!body) return badRequest("Invalid JSON body");

  const section = str(body.section) as ContentKey;
  if (!(section in contentSchemas)) {
    return badRequest("Unknown section. Use about, contact, or settings.");
  }

  const raw = (body.data ?? {}) as Record<string, unknown>;
  const allowed = contentSchemas[section] as readonly string[];
  const data: Record<string, string> = {};
  for (const field of allowed) {
    if (raw[field] != null) data[field] = str(raw[field]);
  }
  if (Object.keys(data).length === 0) return badRequest("No editable fields supplied.");

  // Site settings are grouped; some groups (system folders) are superadmin-only.
  if (section === "settings") {
    const denied = Object.keys(data).filter(
      (field) => !roleSatisfies(g.session.role, settingsFieldMinRole(field))
    );
    if (denied.length > 0) {
      return NextResponse.json(
        { ok: false, error: `Your role cannot change: ${denied.join(", ")}.` },
        { status: 403 }
      );
    }
  }

  try {
    const { Content } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();
    // Merge field-by-field so a group can be saved on its own without wiping
    // the other fields of the section.
    const $set: Record<string, string> = {};
    for (const [field, value] of Object.entries(data)) $set[`data.${field}`] = value;
    await Content.updateOne({ key: section }, { $set }, { upsert: true });
    return NextResponse.json({ ok: true, section, data });
  } catch (err) {
    console.error("[admin/content] write failed:", err);
    return serverError("Could not save the section.");
  }
}

import { NextResponse } from "next/server";
import { guard, readJson, badRequest, serverError, str } from "@/lib/admin-api";
import {
  DEFAULT_MEDIA_DIR,
  DEFAULT_SAMPLE_DIR,
  copySampleToMedia,
  deleteMediaFile,
  listMediaDir,
  type MediaFile,
} from "@/lib/media";
import { getSettingsContent } from "@/lib/site-content";

async function mediaDirs(): Promise<{ mediaDir: string; sampleDir: string }> {
  const settings = await getSettingsContent();
  return {
    mediaDir: settings.mediaDir || DEFAULT_MEDIA_DIR,
    sampleDir: settings.sampleDir || DEFAULT_SAMPLE_DIR,
  };
}

/** GET /api/admin/media — list uploaded media and sample images. */
export async function GET() {
  const g = await guard();
  if (!g.ok) return g.response;

  const { mediaDir, sampleDir } = await mediaDirs();
  try {
    const [media, samples] = await Promise.all([listMediaDir(mediaDir), listMediaDir(sampleDir)]);
    return NextResponse.json({ ok: true, mediaDir, sampleDir, media, samples });
  } catch (err) {
    console.error("[admin/media] list failed:", err);
    return serverError("Could not list media.");
  }
}

/** POST /api/admin/media — import a sample image into the media folder. Body: { src } */
export async function POST(request: Request) {
  const g = await guard();
  if (!g.ok) return g.response;

  const body = await readJson(request);
  if (!body) return badRequest("Invalid JSON body");
  const src = str(body.src);
  if (!src) return badRequest("Sample src is required.");

  const { mediaDir } = await mediaDirs();
  const result = await copySampleToMedia(src, mediaDir);
  if (!result.ok) return badRequest(result.error);
  return NextResponse.json({ ok: true, src: result.src }, { status: 201 });
}

/** DELETE /api/admin/media?src=/images/uploads/foo.jpg — delete an uploaded file. */
export async function DELETE(request: Request) {
  const g = await guard();
  if (!g.ok) return g.response;

  const src = new URL(request.url).searchParams.get("src");
  if (!src) return badRequest("Media src is required.");

  const { mediaDir, sampleDir } = await mediaDirs();
  if (src.startsWith(`/${sampleDir.split("/")[0]}/samples/`) || src.includes("/samples/")) {
    return badRequest("Sample images cannot be deleted — they ship with the app.");
  }

  const result = await deleteMediaFile(src, mediaDir);
  if (!result.ok) return badRequest(result.error);

  const media: MediaFile[] = await listMediaDir(mediaDir);
  return NextResponse.json({ ok: true, media });
}

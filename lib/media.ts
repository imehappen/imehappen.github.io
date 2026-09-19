import fs from "node:fs/promises";
import path from "node:path";

/**
 * Media library for the admin panel.
 *
 * - User media lives in  public/<MEDIA_DIR>  (default public/images/uploads)
 * - Sample (free placeholder) images live in public/<SAMPLE_DIR> (default
 *   public/images/samples) and can be copied into the user folder for use.
 * - Both folders are configurable in /admin/settings (keys mediaDir and
 *   sampleDir in the "settings" Content document).
 *
 * The folders are scanned at request time, so anything dropped in via git,
 * FTP, or the admin UI shows up immediately.
 */

export const DEFAULT_MEDIA_DIR = "images/uploads";
export const DEFAULT_SAMPLE_DIR = "images/samples";

export interface MediaFile {
  /** Public URL path, e.g. /images/uploads/photo.jpg */
  src: string;
  /** File name only */
  name: string;
  /** Bytes */
  size: number;
  /** Last modified (ISO string) */
  modified: string;
}

function safeSegments(dir: string): string[] | null {
  const segments = dir.split(/[\\/]+/).filter(Boolean);
  if (dir.startsWith("/") || dir.includes("..") || segments.length === 0) return null;
  return segments;
}

function resolvePublicDir(dir: string): string | null {
  const segments = safeSegments(dir);
  if (!segments) return null;
  // turbopackIgnore keeps Turbopack from tracing the whole project for these
  // runtime-configured filesystem accesses (see build warnings).
  return path.join(/* turbopackIgnore: true */ process.cwd(), "public", ...segments);
}

function toPublicUrl(dir: string, file: string): string {
  const segments = safeSegments(dir) ?? [];
  return "/" + [...segments, file].join("/");
}

export function isConfiguredDir(dir: string | undefined, fallback: string): boolean {
  return Boolean(dir && safeSegments(dir));
}

export async function listMediaDir(dir: string): Promise<MediaFile[]> {
  const abs = resolvePublicDir(dir);
  if (!abs) return [];
  try {
    const entries = await fs.readdir(/* turbopackIgnore: true */ abs, { withFileTypes: true });
    const files: MediaFile[] = [];
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (!/\.(jpe?g|png|gif|webp|avif|svg)$/i.test(entry.name)) continue;
      const stat = await fs.stat(path.join(/* turbopackIgnore: true */ abs, entry.name));
      files.push({
        src: toPublicUrl(dir, entry.name),
        name: entry.name,
        size: stat.size,
        modified: stat.mtime.toISOString(),
      });
    }
    return files.sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return []; // Folder missing — treated as empty.
  }
}

/** Copies a sample image into the user media folder and returns its new URL. */
export async function copySampleToMedia(
  sampleSrc: string,
  mediaDir: string
): Promise<{ ok: true; src: string } | { ok: false; error: string }> {
  const sampleAbs = resolvePublicDir(sampleSrc.replace(/^\//, ""));
  if (!sampleAbs) return { ok: false, error: "Invalid sample path." };

  const mediaAbs = resolvePublicDir(mediaDir);
  if (!mediaAbs) return { ok: false, error: "Invalid media folder configured." };

  // The sample must live inside the samples folder (which itself is fixed —
  // only the USER media folder is admin-configurable, never the sample source).
  const sampleDirAbs = resolvePublicDir(DEFAULT_SAMPLE_DIR);
  if (
    !sampleDirAbs ||
    !path.resolve(/* turbopackIgnore: true */ sampleAbs).startsWith(
      path.resolve(/* turbopackIgnore: true */ sampleDirAbs) + path.sep
    )
  ) {
    return { ok: false, error: "Only files in the samples folder can be imported." };
  }

  // Never copy into the samples folder itself, whatever the settings say.
  if (
    path.resolve(/* turbopackIgnore: true */ mediaAbs).startsWith(
      path.resolve(/* turbopackIgnore: true */ sampleDirAbs!)
    )
  ) {
    return { ok: false, error: "The media folder cannot be the samples folder." };
  }

  try {
    await fs.mkdir(/* turbopackIgnore: true */ mediaAbs, { recursive: true });
    const fileName = path.basename(sampleAbs);
    let target = path.join(/* turbopackIgnore: true */ mediaAbs, fileName);
    let stem = path.basename(fileName, path.extname(fileName));
    const ext = path.extname(fileName);
    let n = 1;
    while (true) {
      try {
        await fs.access(target);
        target = path.join(mediaAbs, `${stem}-${n++}${ext}`);
      } catch {
        break;
      }
    }
    await fs.copyFile(sampleAbs, target);
    return { ok: true, src: toPublicUrl(mediaDir, path.basename(target)) };
  } catch (err) {
    console.error("[media] copy failed:", err);
    return { ok: false, error: "Could not copy the sample image." };
  }
}

/** Deletes a file from the user media folder (never from samples). */
export async function deleteMediaFile(
  src: string,
  mediaDir: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const rel = src.replace(/^\//, "");
  const abs = resolvePublicDir(rel);
  const mediaAbs = resolvePublicDir(mediaDir);
  if (!abs || !mediaAbs) return { ok: false, error: "Invalid path." };

  // Must be strictly inside the media folder — also blocks path traversal
  // (../) and deleting the folder itself.
  const relResolved = path.resolve(/* turbopackIgnore: true */ abs);
  const mediaResolved = path.resolve(/* turbopackIgnore: true */ mediaAbs);
  if (!relResolved.startsWith(mediaResolved + path.sep)) {
    return { ok: false, error: "Only files in the media folder can be deleted." };
  }
  try {
    await fs.unlink(abs);
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not delete the file (already gone?)." };
  }
}

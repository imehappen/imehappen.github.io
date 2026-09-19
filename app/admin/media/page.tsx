"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DemoModeBanner,
  ErrorBanner,
  SectionCard,
  GhostButton,
  useApiOperation,
} from "@/components/admin/admin-ui";

interface MediaFile {
  src: string;
  name: string;
  size: number;
  modified: string;
}

interface MediaPayload {
  ok?: boolean;
  mediaDir?: string;
  sampleDir?: string;
  media?: MediaFile[];
  samples?: MediaFile[];
  error?: string;
}

function kb(size: number): string {
  return size > 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(size / 1024))} KB`;
}

export default function AdminMediaPage() {
  const [data, setData] = useState<MediaPayload | null>(null);
  const [demo, setDemo] = useState(false);
  const { call, setError, error, success } = useApiOperation();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/media");
      const d = (await res.json()) as MediaPayload;
      if (d.error?.includes("MONGODB_URI")) {
        setDemo(true);
        setData({ media: [], samples: [] });
        return;
      }
      if (!res.ok || !d.ok) throw new Error(d.error || "Failed to load media");
      setData(d);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load media");
      setData({ media: [], samples: [] });
    }
  }, [setError]);

  useEffect(() => {
    load();
  }, [load]);

  async function importSample(src: string) {
    const ok = await call("/api/admin/media", { method: "POST", body: JSON.stringify({ src }) }, "Sample imported into your media folder.");
    if (ok) load();
  }

  async function removeMedia(src: string) {
    const ok = await call(`/api/admin/media?src=${encodeURIComponent(src)}`, { method: "DELETE" }, "File deleted.");
    if (ok) load();
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight text-fg">Media Library</h1>
        <p className="mt-2 text-fg-muted">
          Images available across sliders, works, services, and the ticker. Import the bundled free samples, or drop
          files straight into the media folder on the server.
        </p>
      </header>

      {demo && <DemoModeBanner />}

      <ErrorBanner message={error} />
      <SectionCard
        title="Your media"
        description={`Folder: /${data?.mediaDir ?? "images/uploads"} (change in Site Settings)`}
      >
        {!data ? (
          <p className="text-fg-muted" aria-busy="true">Loading…</p>
        ) : (data.media ?? []).length === 0 ? (
          <p className="text-fg-muted">
            Nothing uploaded yet. Import a sample below, or add files to <code>public/{data?.mediaDir ?? "images/uploads"}</code>.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {(data.media ?? []).map((f) => (
              <li key={f.src} className="overflow-hidden rounded-xl border border-border bg-surface">
                <div className="relative aspect-[4/3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.src} alt={f.name} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-fg" title={f.src}>{f.name}</p>
                  <p className="text-xs text-fg-faint">{kb(f.size)}</p>
                  <div className="mt-2">
                    <DangerInline onClick={() => removeMedia(f.src)} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard
        title="Free sample images"
        description={`Folder: /${data?.sampleDir ?? "images/samples"} — click Import to copy into your media folder, then use it anywhere.`}
      >
        {!data ? (
          <p className="text-fg-muted" aria-busy="true">Loading…</p>
        ) : (data.samples ?? []).length === 0 ? (
          <p className="text-fg-muted">No samples found in <code>public/{data?.sampleDir ?? "images/samples"}</code>.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {(data.samples ?? []).map((f) => (
              <li key={f.src} className="overflow-hidden rounded-xl border border-border bg-surface">
                <div className="relative aspect-[4/3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.src} alt={f.name} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-fg">{f.name}</p>
                  <p className="text-xs text-fg-faint">{kb(f.size)}</p>
                  <div className="mt-2">
                    <GhostButton onClick={() => importSample(f.src)}>Import</GhostButton>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {success && (
        <p role="status" className="rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {success}
        </p>
      )}
    </div>
  );
}

function DangerInline({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/10"
    >
      Delete
    </button>
  );
}

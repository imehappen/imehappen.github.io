"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

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

/**
 * MediaPicker — image field for admin forms.
 *
 * Type/paste a path or URL, or open the library:
 *  - "Media" tab: files in the configurable uploads folder (delete supported)
 *  - "Samples" tab: free placeholder images shipped in public/images/samples;
 *    clicking one imports it into the uploads folder and selects it.
 */
export function MediaPicker({
  label,
  name,
  value,
  onChange,
  onValueChange,
}: {
  label: string;
  name: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Controlled variant used by most admin forms. */
  onValueChange?: (v: string) => void;
}) {
  const controlled = Boolean(onValueChange);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"media" | "samples">("media");
  const [data, setData] = useState<MediaPayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // Uncontrolled mode has no prop that updates on selection, so the picker
  // tracks its own copy purely for the input value + thumbnail preview.
  const [uncontrolledValue, setUncontrolledValue] = useState(value ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  const currentValue = controlled ? (value ?? "") : undefined;

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/media");
      const d = (await res.json()) as MediaPayload;
      if (!res.ok || !d.ok) throw new Error(d.error || "Failed to load media");
      setData(d);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load media");
      setData({ media: [], samples: [] });
    }
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  function select(src: string) {
    if (controlled) {
      onValueChange?.(src);
    } else {
      // Uncontrolled: the <input> owns its own DOM value via defaultValue,
      // so update it directly, then fire onChange so the parent form still
      // sees the new value the same way a manual edit would report it.
      if (inputRef.current) inputRef.current.value = src;
      setUncontrolledValue(src);
      onChange?.({ target: { value: src } } as React.ChangeEvent<HTMLInputElement>);
    }
    setOpen(false);
  }

  async function importSample(src: string) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ src }),
      });
      const d = (await res.json()) as { ok?: boolean; src?: string; error?: string };
      if (!res.ok || !d.ok) throw new Error(d.error || "Import failed");
      select(d.src!);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }

  async function deleteMedia(src: string) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/media?src=${encodeURIComponent(src)}`, { method: "DELETE" });
      const d = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !d.ok) throw new Error(d.error || "Delete failed");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  const current = controlled ? currentValue : uncontrolledValue;

  return (
    <div>
      <label htmlFor={`mp-${name}`} className="mb-1.5 block text-sm font-medium text-fg">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={`mp-${name}`}
          name={name}
          type="text"
          ref={inputRef}
          value={controlled ? currentValue : undefined}
          defaultValue={controlled ? undefined : value}
          onChange={controlled ? (e) => onValueChange?.(e.target.value) : onChange}
          placeholder="/images/... or https://..."
          className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-fg focus:border-accent"
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 cursor-pointer rounded-lg border border-border-strong px-4 py-2.5 text-sm font-semibold text-fg transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent"
        >
          Browse
        </button>
      </div>

      {current ? (
        <div className="mt-2 flex items-center gap-3">
          <div className="relative h-10 w-16 overflow-hidden rounded border border-border">
            <Image src={current} alt="" fill sizes="64px" className="object-cover" />
          </div>
          <p className="truncate text-xs text-fg-faint">{current}</p>
        </div>
      ) : null}

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Media library"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex gap-2">
                {(["media", "samples"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={`cursor-pointer rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                      tab === t ? "bg-accent-soft text-accent" : "text-fg-muted hover:text-fg"
                    }`}
                  >
                    {t === "media" ? "Media uploads" : "Sample images"}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close media library"
                className="cursor-pointer rounded-lg px-3 py-2 text-sm text-fg-muted transition-colors hover:text-fg"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[calc(80vh-64px)] overflow-y-auto p-5">
              <p className="mb-3 text-xs text-fg-faint">
                {tab === "media"
                  ? `Files in /${data?.mediaDir ?? "images/uploads"} — click to select.`
                  : "Free sample photos shipped with the app — clicking one copies it into your media folder and selects it."}
              </p>

              {error && (
                <p role="alert" className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-400">
                  {error}
                </p>
              )}

              {!data ? (
                <p className="text-fg-muted" aria-busy="true">Loading…</p>
              ) : (tab === "media" ? data.media ?? [] : data.samples ?? []).length === 0 ? (
                <p className="text-fg-muted">
                  {tab === "media"
                    ? "No uploads yet — paste a path above, or pick a sample image to get started."
                    : "No sample images found."}
                </p>
              ) : (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {(tab === "media" ? data.media ?? [] : data.samples ?? []).map((f) => (
                    <li key={f.src} className="overflow-hidden rounded-xl border border-border bg-surface">
                      <button
                        type="button"
                        onClick={() => (tab === "media" ? select(f.src) : importSample(f.src))}
                        disabled={busy}
                        className="block w-full cursor-pointer text-left"
                        title={tab === "media" ? "Select" : "Import into media folder"}
                      >
                        <div className="relative aspect-[4/3]">
                          <Image src={f.src} alt={f.name} fill sizes="200px" className="object-cover" />
                        </div>
                        <p className="truncate px-2 py-1.5 text-xs text-fg-muted">{f.name}</p>
                      </button>
                      {tab === "media" && (
                        <div className="px-2 pb-2">
                          <button
                            type="button"
                            onClick={() => deleteMedia(f.src)}
                            disabled={busy}
                            className="cursor-pointer text-xs text-red-400 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

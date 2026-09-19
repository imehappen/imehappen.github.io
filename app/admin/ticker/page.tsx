"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DemoModeBanner,
  ErrorBanner,
  SuccessBanner,
  SectionCard,
  Field,
  Toggle,
  PrimaryButton,
  GhostButton,
  DangerButton,
  useApiOperation,
} from "@/components/admin/admin-ui";
import { MediaPicker } from "@/components/admin/media-picker";

interface Logo {
  _id: string;
  name: string;
  image: string;
  url?: string;
  order: number;
  published: boolean;
}

const emptyForm = { id: "", name: "", image: "", url: "", order: 0, published: true };

export default function AdminTickerPage() {
  const [logos, setLogos] = useState<Logo[] | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [editing, setEditing] = useState(false);
  const { loading, error, success, call, setError } = useApiOperation();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/ticker");
      const d = (await res.json()) as { ok?: boolean; logos?: Logo[]; error?: string };
      if (d.error?.includes("MONGODB_URI")) {
        setLogos([]);
        return;
      }
      if (!res.ok || !d.ok) throw new Error(d.error || "Failed to load");
      setLogos(d.logos ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load logos");
      setLogos([]);
    }
  }, [setError]);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      id: form.id,
      name: String(fd.get("name") || ""),
      image: form.image || String(fd.get("image") || ""),
      url: String(fd.get("url") || ""),
      order: Number(fd.get("order") || 0),
      published: fd.get("published") === "on",
    };
    const ok = await call("/api/admin/ticker", { method: editing ? "PUT" : "POST", body: JSON.stringify(payload) }, editing ? "Logo updated." : "Logo created.");
    if (ok) {
      setForm({ ...emptyForm });
      setEditing(false);
      load();
    }
  }

  async function remove(id: string) {
    const ok = await call(`/api/admin/ticker?id=${encodeURIComponent(id)}`, { method: "DELETE" }, "Logo deleted.");
    if (ok) load();
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight text-fg">Trusted-By Ticker</h1>
        <p className="mt-2 text-fg-muted">
          Client logos shown under the hero — grayscale until hovered. Toggle the whole strip in{" "}
          <a href="/admin/settings" className="cursor-pointer text-accent hover:underline">Site Settings</a>.
        </p>
      </header>

      {logos?.length === 0 && <DemoModeBanner />}

      <SectionCard title={editing ? "Edit logo" : "Add logo"}>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company name" name="name" defaultValue={form.name} required />
            <Field label="Link (optional)" name="url" defaultValue={form.url} placeholder="https://client.com" />
          </div>
          <MediaPicker
            label="Logo image (SVG or PNG recommended)"
            name="image"
            value={form.image}
            onValueChange={(v) => setForm((f) => ({ ...f, image: v }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Order" name="order" type="number" defaultValue={form.order} />
            <div className="flex items-end pb-1">
              <Toggle label="Published" name="published" defaultChecked={form.published} />
            </div>
          </div>

          <ErrorBanner message={error} />
          <SuccessBanner message={success} />

          <div className="flex gap-3">
            <PrimaryButton disabled={loading}>{editing ? "Save changes" : "Add logo"}</PrimaryButton>
            {editing && (
              <GhostButton
                onClick={() => {
                  setEditing(false);
                  setForm({ ...emptyForm });
                }}
              >
                Cancel
              </GhostButton>
            )}
          </div>
        </form>
      </SectionCard>

      <SectionCard title={`Logos ${logos ? `(${logos.length})` : ""}`}>
        {logos === null ? (
          <p className="text-fg-muted" aria-busy="true">Loading…</p>
        ) : logos.length === 0 ? (
          <p className="text-fg-muted">No logos stored yet — the site shows bundled demo logos.</p>
        ) : (
          <ul className="space-y-3">
            {logos.map((l) => (
              <li key={l._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative h-10 w-20 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={l.image} alt={l.name} className="h-full w-full object-contain" loading="lazy" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-fg">
                      <span className="mr-2 text-xs text-fg-faint">#{l.order}</span>
                      {l.name}
                    </p>
                    <p className="truncate text-sm text-fg-muted">{l.image}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs ${l.published ? "bg-green-500/10 text-green-400" : "bg-fg/10 text-fg-muted"}`}>
                    {l.published ? "Live" : "Hidden"}
                  </span>
                  <GhostButton
                    onClick={() => {
                      setEditing(true);
                      setForm({ id: l._id, name: l.name, image: l.image, url: l.url ?? "", order: l.order, published: l.published });
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    Edit
                  </GhostButton>
                  <DangerButton onClick={() => remove(l._id)}>Delete</DangerButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

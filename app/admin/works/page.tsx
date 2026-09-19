"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DemoModeBanner,
  ErrorBanner,
  SuccessBanner,
  SectionCard,
  Field,
  TextArea,
  Toggle,
  PrimaryButton,
  GhostButton,
  DangerButton,
  useApiOperation,
} from "@/components/admin/admin-ui";
import { MediaPicker } from "@/components/admin/media-picker";

interface WorkMedia {
  src: string;
  kind: "image" | "video";
  alt: string;
}

interface Work {
  _id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  features: string[];
  tags: string[];
  media: WorkMedia[];
  priceFrom?: number;
  deliveryWeeks?: number;
  featured: boolean;
  published: boolean;
}

const emptyForm = {
  id: "",
  slug: "",
  title: "",
  category: "",
  summary: "",
  description: "",
  features: "",
  tags: "",
  media: "",
  priceFrom: "",
  deliveryWeeks: "",
  featured: false,
  published: true,
};

/** Media lines: `src | image|video | alt` per line. */
function parseMedia(text: string): WorkMedia[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [src, kind, alt] = line.split("|").map((p) => p.trim());
      return { src: src || "", kind: kind === "video" ? ("video" as const) : ("image" as const), alt: alt || "" };
    })
    .filter((m) => m.src);
}

function mediaToText(media: WorkMedia[]): string {
  return media.map((m) => `${m.src} | ${m.kind} | ${m.alt}`).join("\n");
}

export default function AdminWorksPage() {
  const [works, setWorks] = useState<Work[] | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [cover, setCover] = useState("");
  const [editing, setEditing] = useState(false);
  const { loading, error, success, call, setError } = useApiOperation();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/works");
      const d = (await res.json()) as { ok?: boolean; works?: Work[]; error?: string };
      if (d.error?.includes("MONGODB_URI")) {
        setWorks([]);
        return;
      }
      if (!res.ok || !d.ok) throw new Error(d.error || "Failed to load");
      setWorks(d.works ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load works");
      setWorks([]);
    }
  }, [setError]);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // Cover image comes from the MediaPicker; further media lines stay editable as text.
    const mediaLines = String(fd.get("media") || "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const media = cover ? [{ src: cover, kind: "image" as const, alt: String(fd.get("title") || "") }, ...parseMedia(mediaLines.join("\n"))] : parseMedia(mediaLines.join("\n"));
    const payload = {
      id: form.id,
      slug: String(fd.get("slug") || ""),
      title: String(fd.get("title") || ""),
      category: String(fd.get("category") || ""),
      summary: String(fd.get("summary") || ""),
      description: String(fd.get("description") || ""),
      features: String(fd.get("features") || "").split("\n").map((f) => f.trim()).filter(Boolean),
      tags: String(fd.get("tags") || "").split(",").map((t) => t.trim()).filter(Boolean),
      media,
      priceFrom: String(fd.get("priceFrom") || "") || undefined,
      deliveryWeeks: String(fd.get("deliveryWeeks") || "") || undefined,
      featured: fd.get("featured") === "on",
      published: fd.get("published") === "on",
    };
    const ok = await call("/api/admin/works", { method: editing ? "PUT" : "POST", body: JSON.stringify(payload) }, editing ? "Work updated." : "Work created.");
    if (ok) {
      setForm({ ...emptyForm });
      setCover("");
      setEditing(false);
      load();
    }
  }

  async function remove(id: string) {
    const ok = await call(`/api/admin/works?id=${encodeURIComponent(id)}`, { method: "DELETE" }, "Work deleted.");
    if (ok) load();
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight text-fg">Works</h1>
        <p className="mt-2 text-fg-muted">
          The portfolio catalog at <a href="/works" className="cursor-pointer text-accent hover:underline">/works</a>. Unpublished
          items are hidden from the public site but stay listed here.
        </p>
      </header>

      {works?.length === 0 && <DemoModeBanner />}

      <SectionCard title={editing ? "Edit work" : "New work"}>
        <form onSubmit={submit} className="space-y-4">
          <MediaPicker
            label="Cover image (first gallery item)"
            name="cover"
            value={cover}
            onValueChange={setCover}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" name="title" defaultValue={form.title} required />
            <Field label="Slug (auto from title if empty)" name="slug" defaultValue={form.slug} />
            <Field label="Category" name="category" defaultValue={form.category} required placeholder="Web Design" />
            <Field label="Tags (comma-separated)" name="tags" defaultValue={form.tags} placeholder="Next.js, TypeScript" />
            <Field label="Price from (USD)" name="priceFrom" type="number" defaultValue={form.priceFrom} />
            <Field label="Delivery (weeks)" name="deliveryWeeks" type="number" defaultValue={form.deliveryWeeks} />
          </div>
          <TextArea label="Summary (card text)" name="summary" defaultValue={form.summary} required rows={2} />
          <TextArea label="Description (detail page)" name="description" defaultValue={form.description} required rows={4} />
          <TextArea label="Features (one per line)" name="features" defaultValue={form.features} rows={4} />
          <TextArea
            label="More media (one per line: src | image|video | alt) — cover above is added first"
            name="media"
            defaultValue={form.media}
            rows={4}
            hint={'e.g. /images/uploads/shot-2.jpg | video | Demo reel'}
          />
          <div className="flex flex-wrap gap-6">
            <Toggle label="Featured (home page)" name="featured" defaultChecked={form.featured} />
            <Toggle label="Published" name="published" defaultChecked={form.published} />
          </div>

          <ErrorBanner message={error} />
          <SuccessBanner message={success} />

          <div className="flex gap-3">
            <PrimaryButton disabled={loading}>{editing ? "Save changes" : "Create work"}</PrimaryButton>
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

      <SectionCard title={`Catalog ${works ? `(${works.length})` : ""}`}>
        {works === null ? (
          <p className="text-fg-muted" aria-busy="true">Loading…</p>
        ) : works.length === 0 ? (
          <p className="text-fg-muted">No works stored yet — the site shows the bundled demo catalog.</p>
        ) : (
          <ul className="space-y-3">
            {works.map((w) => (
              <li key={w._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4">
                <div className="min-w-0">
                  <p className="font-semibold text-fg">{w.title}</p>
                  <p className="truncate text-sm text-fg-muted">
                    {w.category} · /works/{w.slug}
                    {w.featured ? " · featured" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs ${w.published ? "bg-green-500/10 text-green-400" : "bg-fg/10 text-fg-muted"}`}>
                    {w.published ? "Live" : "Hidden"}
                  </span>
                  <GhostButton
                    onClick={() => {
                      setEditing(true);
                      setForm({
                        id: w._id,
                        slug: w.slug,
                        title: w.title,
                        category: w.category,
                        summary: w.summary,
                        description: w.description,
                        features: (w.features ?? []).join("\n"),
                        tags: (w.tags ?? []).join(", "),
                        media: "",
                        priceFrom: w.priceFrom != null ? String(w.priceFrom) : "",
                        deliveryWeeks: w.deliveryWeeks != null ? String(w.deliveryWeeks) : "",
                        featured: w.featured,
                        published: w.published,
                      });
                      setCover(w.media?.[0]?.src ?? "");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    Edit
                  </GhostButton>
                  <DangerButton onClick={() => remove(w._id)}>Delete</DangerButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

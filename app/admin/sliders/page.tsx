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

type Tab = "hero" | "marquee";

interface HeroItem {
  _id: string;
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  order: number;
  published: boolean;
}

interface MarqueeItem {
  _id: string;
  src: string;
  alt: string;
  order: number;
  published: boolean;
}

const emptyHero = {
  id: "",
  image: "",
  alt: "",
  eyebrow: "",
  title: "",
  subtitle: "",
  ctaLabel: "View My Work",
  ctaHref: "/works",
  secondaryLabel: "",
  secondaryHref: "",
  order: 0,
  published: true,
};

const emptyMarquee = { id: "", src: "", alt: "", order: 0, published: true };

/** Quick links are allowed; anything else should be a path like /works. */
function isSafeHref(href: string): boolean {
  return href.startsWith("/") || href === "#" || /^(https?:)?\/\//.test(href) || href.startsWith("mailto:");
}

export default function AdminSlidersPage() {
  const [tab, setTab] = useState<Tab>("hero");
  const [hero, setHero] = useState<HeroItem[] | null>(null);
  const [marquee, setMarquee] = useState<MarqueeItem[] | null>(null);
  const [hForm, setHForm] = useState({ ...emptyHero });
  const [hEditing, setHEditing] = useState(false);
  const [mForm, setMForm] = useState({ ...emptyMarquee });
  const [mEditing, setMEditing] = useState(false);
  const { loading, error, success, call, setError } = useApiOperation();

  const load = useCallback(async () => {
    setError("");
    try {
      const [hRes, mRes] = await Promise.all([
        fetch("/api/admin/sliders?type=hero"),
        fetch("/api/admin/sliders?type=marquee"),
      ]);
      const h = (await hRes.json()) as { ok?: boolean; items?: HeroItem[]; error?: string };
      const m = (await mRes.json()) as { ok?: boolean; items?: MarqueeItem[]; error?: string };
      if (h.error?.includes("MONGODB_URI") || m.error?.includes("MONGODB_URI")) {
        setHero([]);
        setMarquee([]);
        return;
      }
      if (!hRes.ok || !h.ok) throw new Error(h.error || "Failed to load hero slides");
      if (!mRes.ok || !m.ok) throw new Error(m.error || "Failed to load marquee slides");
      setHero(h.items ?? []);
      setMarquee(m.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sliders");
      setHero([]);
      setMarquee([]);
    }
  }, [setError]);

  useEffect(() => {
    load();
  }, [load]);

  /* ── Hero ─────────────────────────────────────────────── */

  async function submitHero(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      id: hForm.id,
      image: hForm.image || String(fd.get("image") || ""),
      alt: String(fd.get("alt") || ""),
      eyebrow: String(fd.get("eyebrow") || ""),
      title: String(fd.get("title") || ""),
      subtitle: String(fd.get("subtitle") || ""),
      ctaLabel: String(fd.get("ctaLabel") || ""),
      ctaHref: String(fd.get("ctaHref") || ""),
      secondaryLabel: String(fd.get("secondaryLabel") || ""),
      secondaryHref: String(fd.get("secondaryHref") || ""),
      order: Number(fd.get("order") || 0),
      published: fd.get("published") === "on",
    };
    const ok = await call(
      "/api/admin/sliders?type=hero",
      { method: hEditing ? "PUT" : "POST", body: JSON.stringify(payload) },
      hEditing ? "Slide updated." : "Slide created."
    );
    if (ok) {
      setHForm({ ...emptyHero });
      setHEditing(false);
      load();
    }
  }

  async function removeHero(id: string) {
    const ok = await call(`/api/admin/sliders?type=hero&id=${encodeURIComponent(id)}`, { method: "DELETE" }, "Slide deleted.");
    if (ok) load();
  }

  /* ── Marquee ──────────────────────────────────────────── */

  async function submitMarquee(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      id: mForm.id,
      src: mForm.src || String(fd.get("src") || ""),
      alt: String(fd.get("alt") || ""),
      order: Number(fd.get("order") || 0),
      published: fd.get("published") === "on",
    };
    const ok = await call(
      "/api/admin/sliders?type=marquee",
      { method: mEditing ? "PUT" : "POST", body: JSON.stringify(payload) },
      mEditing ? "Slide updated." : "Slide created."
    );
    if (ok) {
      setMForm({ ...emptyMarquee });
      setMEditing(false);
      load();
    }
  }

  async function removeMarquee(id: string) {
    const ok = await call(`/api/admin/sliders?type=marquee&id=${encodeURIComponent(id)}`, { method: "DELETE" }, "Slide deleted.");
    if (ok) load();
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight text-fg">Sliders</h1>
        <p className="mt-2 text-fg-muted">
          The homepage hero carousel and the full-width work marquee. Every slide, image, and CTA is editable here.
        </p>
      </header>

      {hero?.length === 0 && marquee?.length === 0 && <DemoModeBanner />}

      <div className="flex gap-2" role="tablist" aria-label="Slider type">
        {(
          [
            ["hero", "Hero carousel"],
            ["marquee", "Work marquee"],
          ] as const
        ).map(([t, label]) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === t ? "bg-accent-soft text-accent" : "border border-border text-fg-muted hover:text-fg"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <ErrorBanner message={error} />}

      {tab === "hero" ? (
        <>
          <SectionCard title={hEditing ? "Edit hero slide" : "New hero slide"}>
            <form onSubmit={submitHero} className="space-y-4">
              <MediaPicker
                label="Slide image"
                name="image"
                value={hForm.image}
                onValueChange={(v) => setHForm((f) => ({ ...f, image: v }))}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Alt text" name="alt" defaultValue={hForm.alt} />
                <Field label="Eyebrow" name="eyebrow" defaultValue={hForm.eyebrow} placeholder="Systems Developer" />
                <Field label="Title" name="title" defaultValue={hForm.title} required />
                <Field label="Order" name="order" type="number" defaultValue={hForm.order} />
              </div>
              <TextArea label="Subtitle" name="subtitle" defaultValue={hForm.subtitle} />

              <div className="rounded-xl border border-border bg-surface p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">Primary CTA</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Button label" name="ctaLabel" defaultValue={hForm.ctaLabel} />
                  <Field label="Button link" name="ctaHref" defaultValue={hForm.ctaHref} hint="e.g. /works, /order, https://…" />
                </div>
                <p className="mb-3 mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-accent">Secondary CTA (optional)</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Button label" name="secondaryLabel" defaultValue={hForm.secondaryLabel} />
                  <Field label="Button link" name="secondaryHref" defaultValue={hForm.secondaryHref} />
                </div>
                {!isSafeHref(hForm.ctaHref) && hForm.ctaHref ? (
                  <p className="mt-3 text-xs text-red-400">Primary CTA link should start with / or https://</p>
                ) : null}
              </div>

              <Toggle label="Published" name="published" defaultChecked={hForm.published} />

              <SuccessBanner message={success} />

              <div className="flex gap-3">
                <PrimaryButton disabled={loading}>{hEditing ? "Save changes" : "Create slide"}</PrimaryButton>
                {hEditing && (
                  <GhostButton
                    onClick={() => {
                      setHEditing(false);
                      setHForm({ ...emptyHero });
                    }}
                  >
                    Cancel
                  </GhostButton>
                )}
              </div>
            </form>
          </SectionCard>

          <SectionCard title={`Hero slides ${hero ? `(${hero.length})` : ""}`}>
            {hero === null ? (
              <p className="text-fg-muted" aria-busy="true">Loading…</p>
            ) : hero.length === 0 ? (
              <p className="text-fg-muted">No slides stored yet — the site shows bundled demo slides.</p>
            ) : (
              <ul className="space-y-3">
                {hero.map((s) => (
                  <li key={s._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded border border-border">
                        {s.image && <ImageThumb src={s.image} alt={s.title} />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-fg">
                          <span className="mr-2 text-xs text-fg-faint">#{s.order}</span>
                          {s.title}
                        </p>
                        <p className="truncate text-sm text-fg-muted">
                          CTA: {s.ctaLabel} → {s.ctaHref}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs ${s.published ? "bg-green-500/10 text-green-400" : "bg-fg/10 text-fg-muted"}`}>
                        {s.published ? "Live" : "Hidden"}
                      </span>
                      <GhostButton
                        onClick={() => {
                          setHEditing(true);
                          setHForm({
                            id: s._id,
                            image: s.image,
                            alt: s.alt,
                            eyebrow: s.eyebrow,
                            title: s.title,
                            subtitle: s.subtitle,
                            ctaLabel: s.ctaLabel,
                            ctaHref: s.ctaHref,
                            secondaryLabel: s.secondaryLabel ?? "",
                            secondaryHref: s.secondaryHref ?? "",
                            order: s.order,
                            published: s.published,
                          });
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        Edit
                      </GhostButton>
                      <DangerButton onClick={() => removeHero(s._id)}>Delete</DangerButton>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </>
      ) : (
        <>
          <SectionCard title={mEditing ? "Edit marquee slide" : "New marquee slide"}>
            <form onSubmit={submitMarquee} className="space-y-4">
              <MediaPicker
                label="Image"
                name="src"
                value={mForm.src}
                onValueChange={(v) => setMForm((f) => ({ ...f, src: v }))}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Alt text" name="alt" defaultValue={mForm.alt} />
                <Field label="Order" name="order" type="number" defaultValue={mForm.order} />
              </div>
              <Toggle label="Published" name="published" defaultChecked={mForm.published} />

              <SuccessBanner message={success} />

              <div className="flex gap-3">
                <PrimaryButton disabled={loading}>{mEditing ? "Save changes" : "Create slide"}</PrimaryButton>
                {mEditing && (
                  <GhostButton
                    onClick={() => {
                      setMEditing(false);
                      setMForm({ ...emptyMarquee });
                    }}
                  >
                    Cancel
                  </GhostButton>
                )}
              </div>
            </form>
          </SectionCard>

          <SectionCard
            title={`Marquee slides ${marquee ? `(${marquee.length})` : ""}`}
            description="When empty, the strip automatically shows each published work's first image."
          >
            {marquee === null ? (
              <p className="text-fg-muted" aria-busy="true">Loading…</p>
            ) : marquee.length === 0 ? (
              <p className="text-fg-muted">No custom slides — the strip currently derives from your works.</p>
            ) : (
              <ul className="space-y-3">
                {marquee.map((s) => (
                  <li key={s._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded border border-border">
                        {s.src && <ImageThumb src={s.src} alt={s.alt} />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-fg">
                          <span className="mr-2 text-xs text-fg-faint">#{s.order}</span>
                          {s.alt || s.src}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs ${s.published ? "bg-green-500/10 text-green-400" : "bg-fg/10 text-fg-muted"}`}>
                        {s.published ? "Live" : "Hidden"}
                      </span>
                      <GhostButton
                        onClick={() => {
                          setMEditing(true);
                          setMForm({ id: s._id, src: s.src, alt: s.alt, order: s.order, published: s.published });
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        Edit
                      </GhostButton>
                      <DangerButton onClick={() => removeMarquee(s._id)}>Delete</DangerButton>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}

function ImageThumb({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
  );
}

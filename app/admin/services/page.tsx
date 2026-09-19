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

interface Service {
  _id: string;
  title: string;
  description: string;
  iconPath: string;
  order: number;
  published: boolean;
}

const emptyForm = { id: "", title: "", description: "", iconPath: "", image: "", order: 0, published: true };

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [editing, setEditing] = useState(false);
  const { loading, error, success, call, setError } = useApiOperation();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/services");
      const d = (await res.json()) as { ok?: boolean; services?: Service[]; error?: string };
      if (d.error?.includes("MONGODB_URI")) {
        setServices([]);
        return;
      }
      if (!res.ok || !d.ok) throw new Error(d.error || "Failed to load");
      setServices(d.services ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load services");
      setServices([]);
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
      title: String(fd.get("title") || ""),
      description: String(fd.get("description") || ""),
      iconPath: String(fd.get("iconPath") || ""),
      image: form.image,
      order: Number(fd.get("order") || 0),
      published: fd.get("published") === "on",
    };
    const ok = await call("/api/admin/services", { method: editing ? "PUT" : "POST", body: JSON.stringify(payload) }, editing ? "Service updated." : "Service created.");
    if (ok) {
      setForm({ ...emptyForm });
      setEditing(false);
      load();
    }
  }

  async function remove(id: string) {
    const ok = await call(`/api/admin/services?id=${encodeURIComponent(id)}`, { method: "DELETE" }, "Service deleted.");
    if (ok) load();
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight text-fg">Services</h1>
        <p className="mt-2 text-fg-muted">
          Cards shown on the home page grid and the <a href="/services" className="cursor-pointer text-accent hover:underline">/services</a> page.
        </p>
      </header>

      {services?.length === 0 && <DemoModeBanner />}

      <SectionCard title={editing ? "Edit service" : "New service"}>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" name="title" defaultValue={form.title} required />
            <Field label="Order" name="order" type="number" defaultValue={form.order} />
          </div>
          <TextArea label="Description" name="description" defaultValue={form.description} required />
          <MediaPicker
            label="Card image (optional — shown instead of the icon)"
            name="image"
            value={form.image}
            onValueChange={(v) => setForm((f) => ({ ...f, image: v }))}
          />
          <TextArea
            label="Icon SVG path (optional)"
            name="iconPath"
            rows={3}
            defaultValue={form.iconPath}
            hint="Body of a 24×24 SVG path, e.g. M12 2L2 7V9C2… — ignored when a card image is set."
          />
          <Toggle label="Published" name="published" defaultChecked={form.published} />

          <ErrorBanner message={error} />
          <SuccessBanner message={success} />

          <div className="flex gap-3">
            <PrimaryButton disabled={loading}>{editing ? "Save changes" : "Create service"}</PrimaryButton>
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

      <SectionCard title={`Services ${services ? `(${services.length})` : ""}`}>
        {services === null ? (
          <p className="text-fg-muted" aria-busy="true">Loading…</p>
        ) : services.length === 0 ? (
          <p className="text-fg-muted">No services stored yet — the site shows bundled demo services.</p>
        ) : (
          <ul className="space-y-3">
            {services.map((s) => (
              <li key={s._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4">
                <div className="min-w-0">
                  <p className="font-semibold text-fg">
                    <span className="mr-2 text-xs text-fg-faint">#{s.order}</span>
                    {s.title}
                  </p>
                  <p className="truncate text-sm text-fg-muted">{s.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs ${s.published ? "bg-green-500/10 text-green-400" : "bg-fg/10 text-fg-muted"}`}>
                    {s.published ? "Live" : "Hidden"}
                  </span>
                  <GhostButton
                    onClick={() => {
                      setEditing(true);
                      setForm({ id: s._id, title: s.title, description: s.description, iconPath: s.iconPath, image: (s as { image?: string }).image ?? "", order: s.order, published: s.published });
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    Edit
                  </GhostButton>
                  <DangerButton onClick={() => remove(s._id)}>Delete</DangerButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DemoModeBanner,
  ErrorBanner,
  SuccessBanner,
  SectionCard,
  PrimaryButton,
  useApiOperation,
} from "@/components/admin/admin-ui";

export interface ContentFieldSpec {
  name: string;
  label: string;
  type?: "text" | "textarea" | "toggle";
  hint?: string;
  rows?: number;
}

/**
 * Generic editor for singleton content sections.
 * `fields` maps model fields to labeled inputs; values load from
 * GET /api/admin/content?section=… and save via PUT.
 */
export function ContentSection({
  title,
  description,
  section,
  fields,
}: {
  title: string;
  description: string;
  section: "about" | "contact" | "settings";
  fields: ContentFieldSpec[];
}) {
  const [values, setValues] = useState<Record<string, string> | null>(null);
  const [demo, setDemo] = useState(false);
  const { loading, error, success, call, setError } = useApiOperation();

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/content?section=${section}`);
      const d = (await res.json()) as { ok?: boolean; data?: Record<string, string>; error?: string };
      if (d.error?.includes("MONGODB_URI")) {
        setDemo(true);
        setValues({});
        return;
      }
      if (!res.ok || !d.ok) throw new Error(d.error || "Failed to load");
      setValues(d.data ?? {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load section");
      setValues({});
    }
  }, [section, setError]);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    for (const f of fields) {
      if (f.type === "toggle") data[f.name] = fd.get(f.name) === "on" ? "true" : "false";
      else data[f.name] = String(fd.get(f.name) || "");
    }
    const ok = await call(
      "/api/admin/content",
      { method: "PUT", body: JSON.stringify({ section, data }) },
      "Saved. Changes are live on the site."
    );
    if (ok) load();
  }

  if (demo) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="font-display text-3xl font-bold tracking-tight text-fg">{title}</h1>
          <p className="mt-2 text-fg-muted">{description}</p>
        </header>
        <DemoModeBanner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight text-fg">{title}</h1>
        <p className="mt-2 text-fg-muted">{description}</p>
      </header>

      <SectionCard title={`Edit: ${title}`}>
        {values === null ? (
          <p className="text-fg-muted" aria-busy="true">Loading…</p>
        ) : (
          <form key={JSON.stringify(values)} onSubmit={submit} className="space-y-4">
            {fields.map((f) => {
              const id = `content-${f.name}`;
              if (f.type === "textarea") {
                return (
                  <div key={f.name}>
                    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-fg">
                      {f.label}
                    </label>
                    <textarea
                      id={id}
                      name={f.name}
                      rows={f.rows ?? 3}
                      defaultValue={values[f.name] ?? ""}
                      className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-fg focus:border-accent"
                    />
                    {f.hint && <p className="mt-1 text-xs text-fg-faint">{f.hint}</p>}
                  </div>
                );
              }
              if (f.type === "toggle") {
                return (
                  <label key={f.name} htmlFor={id} className="flex cursor-pointer items-center gap-2.5 text-sm text-fg">
                    <input
                      id={id}
                      type="checkbox"
                      name={f.name}
                      defaultChecked={(values[f.name] ?? "true") === "true"}
                      className="h-4 w-4 accent-[#ed2c27]"
                    />
                    {f.label}
                  </label>
                );
              }
              return (
                <div key={f.name}>
                  <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-fg">
                    {f.label}
                  </label>
                  <input
                    id={id}
                    name={f.name}
                    type="text"
                    defaultValue={values[f.name] ?? ""}
                    className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-fg focus:border-accent"
                  />
                  {f.hint && <p className="mt-1 text-xs text-fg-faint">{f.hint}</p>}
                </div>
              );
            })}

            <ErrorBanner message={error} />
            <SuccessBanner message={success} />

            <PrimaryButton disabled={loading}>Save Changes</PrimaryButton>
          </form>
        )}
      </SectionCard>
    </div>
  );
}

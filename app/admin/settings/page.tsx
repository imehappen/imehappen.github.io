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
import {
  settingsGroups,
  roleSatisfies,
  type SettingsFieldSpec,
  type SettingsGroup,
} from "@/lib/settings-schema";

type Values = Record<string, string>;

/**
 * Site Settings — every global switch on the site, grouped by section.
 * Each group is its own form and saves only its fields (the API merges
 * field-by-field). Groups above the viewer's role are shown read-only.
 */
export default function AdminSettingsPage() {
  const [values, setValues] = useState<Values | null>(null);
  // Empty until the GET resolves so "Locked" badges don't flash for superadmins.
  const [role, setRole] = useState<string>("");
  const [demo, setDemo] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [active, setActive] = useState(settingsGroups[0].id);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/content?section=settings");
      const d = (await res.json()) as { ok?: boolean; data?: Values; role?: string; error?: string };
      if (d.error?.includes("MONGODB_URI")) {
        setDemo(true);
        setValues({});
        return;
      }
      if (!res.ok || !d.ok) throw new Error(d.error || "Failed to load");
      setValues(d.data ?? {});
      if (d.role) setRole(d.role);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load settings");
      setValues({});
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const header = (
    <header>
      <h1 className="font-display text-3xl font-bold tracking-tight text-fg">Site Settings</h1>
      <p className="mt-2 text-fg-muted">
        Global behaviour of every section — identity &amp; SEO, home sections, sliders, motion, footer and
        system folders. Each card saves on its own.
      </p>
    </header>
  );

  if (demo) {
    return (
      <div className="space-y-6">
        {header}
        <DemoModeBanner />
      </div>
    );
  }

  const current = settingsGroups.find((g) => g.id === active) ?? settingsGroups[0];

  return (
    <div className="space-y-6">
      {header}
      <ErrorBanner message={loadError} />

      {values === null ? (
        <p className="text-fg-muted" aria-busy="true">
          Loading…
        </p>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Group navigation */}
          <nav aria-label="Settings sections" className="lg:w-56 lg:shrink-0">
            <ul className="flex flex-wrap gap-1.5 lg:flex-col">
              {settingsGroups.map((g) => {
                const locked = role !== "" && !roleSatisfies(role, g.minRole);
                const isActive = g.id === current.id;
                return (
                  <li key={g.id}>
                    <button
                      type="button"
                      onClick={() => setActive(g.id)}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
                        isActive ? "bg-accent-soft text-accent" : "text-fg-muted hover:bg-elevated hover:text-fg"
                      }`}
                    >
                      <span>{g.title}</span>
                      {locked && (
                        <span
                          className="rounded-full border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-fg-faint"
                          title="Super-admin only"
                        >
                          Locked
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="min-w-0 flex-1">
            {/* Keyed on the group only: inputs are uncontrolled and already hold
                the just-saved values, so no remount (which would drop the
                success banner) is needed after a save. */}
            <GroupForm
              key={current.id}
              group={current}
              values={values}
              canEdit={role !== "" && roleSatisfies(role, current.minRole)}
              onSaved={load}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function GroupForm({
  group,
  values,
  canEdit,
  onSaved,
}: {
  group: SettingsGroup;
  values: Values;
  canEdit: boolean;
  onSaved: () => void;
}) {
  const { loading, error, success, call } = useApiOperation();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Values = {};
    for (const f of group.fields) {
      if (f.type === "toggle") data[f.name] = fd.get(f.name) === "on" ? "true" : "false";
      else data[f.name] = String(fd.get(f.name) ?? "");
    }
    const ok = await call(
      "/api/admin/content",
      { method: "PUT", body: JSON.stringify({ section: "settings", data }) },
      `${group.title} saved. Changes are live on the site.`
    );
    if (ok) onSaved();
  }

  return (
    <SectionCard
      title={group.title}
      description={group.description}
      actions={
        !canEdit ? (
          <span className="rounded-full border border-border px-2.5 py-1 text-xs text-fg-faint">
            Read-only · requires {group.minRole}
          </span>
        ) : undefined
      }
    >
      <form onSubmit={submit} className="space-y-5">
        <fieldset disabled={!canEdit} className="space-y-4 disabled:opacity-70">
          {group.fields.map((f) => (
            <SettingField key={f.name} spec={f} value={values[f.name]} />
          ))}
        </fieldset>

        <ErrorBanner message={error} />
        <SuccessBanner message={success} />

        {canEdit && <PrimaryButton disabled={loading}>Save {group.title}</PrimaryButton>}
      </form>
    </SectionCard>
  );
}

function SettingField({ spec: f, value }: { spec: SettingsFieldSpec; value: string | undefined }) {
  const id = `setting-${f.name}`;
  const inputClass =
    "w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-fg focus:border-accent";

  if (f.type === "toggle") {
    return (
      <label htmlFor={id} className="flex cursor-pointer items-start gap-2.5 text-sm text-fg">
        <input
          id={id}
          type="checkbox"
          name={f.name}
          defaultChecked={(value ?? "true") === "true"}
          className="mt-0.5 h-4 w-4 accent-[#ed2c27]"
        />
        <span>
          {f.label}
          {f.hint && <span className="mt-0.5 block text-xs text-fg-faint">{f.hint}</span>}
        </span>
      </label>
    );
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-fg">
        {f.label}
        {f.unit && <span className="ml-1 text-xs font-normal text-fg-faint">({f.unit})</span>}
      </label>

      {f.type === "textarea" ? (
        <textarea id={id} name={f.name} rows={f.rows ?? 3} defaultValue={value ?? ""} className={inputClass} />
      ) : f.type === "select" ? (
        <select id={id} name={f.name} defaultValue={value ?? f.options?.[0]?.value ?? ""} className={inputClass}>
          {f.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : f.type === "number" ? (
        <input
          id={id}
          name={f.name}
          type="number"
          inputMode="numeric"
          min={f.min}
          max={f.max}
          step={f.step}
          defaultValue={value ?? ""}
          className={`${inputClass} max-w-[14rem]`}
        />
      ) : (
        <input id={id} name={f.name} type="text" defaultValue={value ?? ""} className={inputClass} />
      )}

      {f.hint && <p className="mt-1 text-xs text-fg-faint">{f.hint}</p>}
    </div>
  );
}

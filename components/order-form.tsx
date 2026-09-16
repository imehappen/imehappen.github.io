"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

interface WorkOption {
  slug: string;
  title: string;
  priceFrom?: number;
  deliveryWeeks?: number;
}

type Status = "idle" | "submitting" | "success" | "error";

export function OrderForm({ works, preselected }: { works: WorkOption[]; preselected?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");

  const selected = useMemo(() => works.find((w) => w.slug === preselected), [works, preselected]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");

    const fd = new FormData(e.currentTarget);
    const payload = {
      workSlug: String(fd.get("workSlug") || ""),
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      company: String(fd.get("company") || ""),
      budget: String(fd.get("budget") || ""),
      message: String(fd.get("message") || ""),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok: boolean; orderNumber?: string; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || `Request failed (${res.status})`);

      setOrderNumber(data.orderNumber ?? "");
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-accent/40 bg-card p-8 text-center sm:p-12">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft">
          <svg viewBox="0 0 24 24" className="h-8 w-8 fill-accent" aria-hidden="true">
            <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-bold text-fg">Order received!</h2>
        <p className="mt-3 text-fg-muted">
          Your reference is{" "}
          <strong className="font-semibold text-accent">{orderNumber || "being generated"}</strong>. A confirmation and
          scoped quote will land in your inbox within one business day.
        </p>
        <Link
          href="/works"
          className="mt-8 inline-block cursor-pointer rounded-lg border border-border-strong px-7 py-3 text-sm font-semibold uppercase tracking-wider text-fg transition-all duration-200 hover:border-accent hover:bg-accent-soft hover:text-accent"
        >
          Keep Browsing Work
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate={false}>
      {/* Service selection */}
      <fieldset>
        <label htmlFor="workSlug" className="mb-2 block text-sm font-medium text-fg">
          Which service do you need? <span aria-hidden="true" className="text-accent">*</span>
        </label>
        <select
          id="workSlug"
          name="workSlug"
          required
          defaultValue={preselected}
          className="w-full cursor-pointer rounded-lg border border-border bg-card px-4 py-3 text-fg transition-colors focus:border-accent"
        >
          <option value="" disabled>
            Select a service…
          </option>
          {works.map((w) => (
            <option key={w.slug} value={w.slug}>
              {w.title}
              {w.priceFrom != null ? ` — from $${w.priceFrom.toLocaleString("en-US")}` : ""}
            </option>
          ))}
        </select>
        {selected && (
          <p className="mt-2 text-sm text-fg-muted">
            {selected.deliveryWeeks ? `Typical delivery: ${selected.deliveryWeeks} weeks. ` : ""}
            Final quote is scoped to your requirements.
          </p>
        )}
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <fieldset>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-fg">
            Full name <span aria-hidden="true" className="text-accent">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-fg transition-colors focus:border-accent"
          />
        </fieldset>
        <fieldset>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-fg">
            Email <span aria-hidden="true" className="text-accent">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-fg transition-colors focus:border-accent"
          />
        </fieldset>
        <fieldset>
          <label htmlFor="phone" className="mb-2 block text-sm font-medium text-fg">
            Phone <span className="text-fg-faint">(optional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-fg transition-colors focus:border-accent"
          />
        </fieldset>
        <fieldset>
          <label htmlFor="company" className="mb-2 block text-sm font-medium text-fg">
            Company <span className="text-fg-faint">(optional)</span>
          </label>
          <input
            id="company"
            name="company"
            type="text"
            autoComplete="organization"
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-fg transition-colors focus:border-accent"
          />
        </fieldset>
      </div>

      <fieldset>
        <label htmlFor="budget" className="mb-2 block text-sm font-medium text-fg">
          Budget <span className="text-fg-faint">(USD, optional)</span>
        </label>
        <input
          id="budget"
          name="budget"
          type="number"
          min={0}
          step={50}
          className="w-full rounded-lg border border-border bg-card px-4 py-3 text-fg transition-colors focus:border-accent"
        />
      </fieldset>

      <fieldset>
        <label htmlFor="message" className="mb-2 block text-sm font-medium text-fg">
          Project details <span className="text-fg-faint">(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          maxLength={2000}
          className="w-full rounded-lg border border-border bg-card px-4 py-3 text-fg transition-colors focus:border-accent"
        />
      </fieldset>

      {status === "error" && (
        <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full cursor-pointer rounded-lg bg-accent px-8 py-4 text-sm font-semibold uppercase tracking-wider text-on-accent transition-all duration-200 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Placing order…" : "Place Order"}
      </button>
      <p className="text-center text-xs text-fg-faint">
        No payment is taken now — you&apos;ll receive a scoped quote first.
      </p>
    </form>
  );
}

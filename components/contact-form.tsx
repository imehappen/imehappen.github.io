"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      subject: String(fd.get("subject") || ""),
      message: String(fd.get("message") || ""),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || `Request failed (${res.status})`);
      setStatus("success");
      e.currentTarget.reset();
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
        <h2 className="font-display text-2xl font-bold text-fg">Message sent!</h2>
        <p className="mt-3 text-fg-muted">
          Thanks for reaching out — you&apos;ll hear back within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-7 sm:p-9">
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
            className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-fg transition-colors focus:border-accent"
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
            className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-fg transition-colors focus:border-accent"
          />
        </fieldset>
      </div>

      <fieldset>
        <label htmlFor="subject" className="mb-2 block text-sm font-medium text-fg">
          Subject <span className="text-fg-faint">(optional)</span>
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          maxLength={150}
          className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-fg transition-colors focus:border-accent"
        />
      </fieldset>

      <fieldset>
        <label htmlFor="message" className="mb-2 block text-sm font-medium text-fg">
          Message <span aria-hidden="true" className="text-accent">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          maxLength={2000}
          className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-fg transition-colors focus:border-accent"
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
        className="w-full cursor-pointer rounded-lg bg-accent px-8 py-4 text-sm font-semibold uppercase tracking-wider text-on-accent transition-all duration-fast hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}

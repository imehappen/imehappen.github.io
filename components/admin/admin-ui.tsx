"use client";

import { useState } from "react";

/* ── Form field primitives ─────────────────────────────────── */

export function Field({
  label,
  name,
  defaultValue,
  required,
  type = "text",
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  required?: boolean;
  type?: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={`${name}-${label.replace(/\s+/g, "-").toLowerCase()}`} className="mb-1.5 block text-sm font-medium text-fg">
        {label} {required && <span aria-hidden="true" className="text-accent">*</span>}
      </label>
      <input
        id={`${name}-${label.replace(/\s+/g, "-").toLowerCase()}`}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-fg focus:border-accent"
      />
      {hint && <p className="mt-1 text-xs text-fg-faint">{hint}</p>}
    </div>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  rows = 3,
  required,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={`ta-${name}`} className="mb-1.5 block text-sm font-medium text-fg">
        {label} {required && <span aria-hidden="true" className="text-accent">*</span>}
      </label>
      <textarea
        id={`ta-${name}`}
        name={name}
        rows={rows}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-fg focus:border-accent"
      />
      {hint && <p className="mt-1 text-xs text-fg-faint">{hint}</p>}
    </div>
  );
}

export function Toggle({ label, name, defaultChecked = true }: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-fg">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 accent-[#ed2c27]" />
      {label}
    </label>
  );
}

export function PrimaryButton({
  children,
  disabled,
  onClick,
  type = "submit",
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "submit" | "button";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="cursor-pointer rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-on-accent transition-all duration-fast hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "submit" | "button";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-border-strong px-5 py-2.5 text-sm font-semibold text-fg transition-all duration-fast hover:border-accent hover:bg-accent-soft hover:text-accent"
    >
      {children}
    </button>
  );
}

export function DangerButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label="Delete (click again to confirm)"
        className="cursor-pointer rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/10"
      >
        {children}
      </button>
    );
  }
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        className="cursor-pointer rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white"
      >
        Confirm
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-fg-muted"
      >
        Cancel
      </button>
    </span>
  );
}

/* ── Status banners ────────────────────────────────────────── */

export function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
      {message}
    </p>
  );
}

export function SuccessBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="status" className="rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-400">
      {message}
    </p>
  );
}

export function DemoModeBanner() {
  return (
    <div className="rounded-2xl border border-accent/40 bg-accent-soft p-6">
      <h2 className="font-display text-lg font-bold text-fg">Database not connected</h2>
      <p className="mt-2 text-sm text-fg-muted">
        The admin panel needs <code className="text-accent">MONGODB_URI</code> and{" "}
        <code className="text-accent">AUTH_SECRET</code> to store and edit content. See{" "}
        <span className="text-fg">README → Enabling MongoDB</span> — until then the site renders from bundled demo
        content and API writes are disabled.
      </p>
    </div>
  );
}

/* ── Shared section helpers ────────────────────────────────── */

export function SectionCard({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 sm:p-7">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-fg">{title}</h2>
          {description && <p className="mt-1 text-sm text-fg-muted">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function useApiOperation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function call(url: string, options: RequestInit, successMessage: string): Promise<boolean> {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...options,
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || `Request failed (${res.status})`);
      setSuccess(successMessage);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, success, call, setError, setSuccess };
}

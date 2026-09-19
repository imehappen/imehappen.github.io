"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Mode = "login" | "register";
type Status = "idle" | "submitting" | "error";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = params.get("next") || "";
  const [mode, setMode] = useState<Mode>("login");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");
    setNotice("");

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
    };

    try {
      const res = await fetch(mode === "login" ? "/api/users/login" : "/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        ok: boolean;
        demo?: boolean;
        message?: string;
        error?: string;
        user?: { role?: string };
      };

      if (data.demo) {
        setNotice(data.message || "Demo mode: accounts require MONGODB_URI + AUTH_SECRET.");
        setStatus("idle");
        return;
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      if (mode === "register") {
        setNotice("Account created. You can sign in now.");
        setMode("login");
        setStatus("idle");
        return;
      }

      const dest = nextPath || (data.user?.role === "admin" || data.user?.role === "superadmin" ? "/admin" : "/account");
      router.push(dest);
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-5 pb-24 pt-32 sm:px-8">
      <h1 className="font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">
        {mode === "login" ? "Sign in" : "Create an account"}
      </h1>
      <p className="mt-3 text-fg-muted">
        {mode === "login"
          ? "Access your account, orders, or the admin panel."
          : "Clients can track orders; the first account ever created becomes the superadmin."}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-7 sm:p-8">
        {mode === "register" && (
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
              className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-fg focus:border-accent"
            />
          </fieldset>
        )}

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
            className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-fg focus:border-accent"
          />
        </fieldset>

        <fieldset>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-fg">
            Password <span aria-hidden="true" className="text-accent">*</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-fg focus:border-accent"
          />
          {mode === "register" && (
            <p className="mt-2 text-xs text-fg-faint">At least 8 characters.</p>
          )}
        </fieldset>

        {status === "error" && (
          <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {message}
          </p>
        )}
        {notice && (
          <p role="status" className="rounded-lg border border-border-strong bg-surface px-4 py-3 text-sm text-fg-muted">
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full cursor-pointer rounded-lg bg-accent px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-on-accent transition-all duration-fast hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
        </button>

        <p className="text-center text-sm text-fg-muted">
          {mode === "login" ? "No account yet? " : "Already registered? "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setMessage("");
              setNotice("");
              setStatus("idle");
            }}
            className="cursor-pointer font-semibold text-accent hover:underline"
          >
            {mode === "login" ? "Create one" : "Sign in"}
          </button>
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-5 pb-24 pt-32 sm:px-8" aria-busy="true" />}>
      <LoginInner />
    </Suspense>
  );
}

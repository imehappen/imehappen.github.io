"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Me {
  userId: string;
  name: string;
  email: string;
  role: "superadmin" | "admin" | "client";
}

const roleLabels: Record<Me["role"], string> = {
  superadmin: "Superadmin — full access",
  admin: "Admin — full content management",
  client: "Client",
};

export default function AccountPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((d: { user?: Me | null }) => setMe(d.user ?? null))
      .catch(() => setMe(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await fetch("/api/users/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-5 pb-24 pt-32 sm:px-8" aria-busy="true">
        <p className="text-fg-muted">Loading account…</p>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="mx-auto max-w-3xl px-5 pb-24 pt-32 sm:px-8">
        <h1 className="font-display text-3xl font-bold text-fg">Account</h1>
        <p className="mt-3 text-fg-muted">You are not signed in.</p>
        <Link
          href="/login?next=/account"
          className="mt-6 inline-block cursor-pointer rounded-lg bg-accent px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-on-accent transition-all duration-fast hover:bg-accent-hover"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const isStaff = me.role === "superadmin" || me.role === "admin";

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-32 sm:px-8">
      <h1 className="font-display text-4xl font-bold tracking-tight text-fg sm:text-5xl">My Account</h1>

      <div className="mt-8 rounded-2xl border border-border bg-card p-7 sm:p-8">
        <dl className="space-y-4">
          <div className="flex flex-wrap justify-between gap-2 border-b border-border pb-4">
            <dt className="text-sm text-fg-muted">Name</dt>
            <dd className="text-sm font-medium text-fg">{me.name}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2 border-b border-border pb-4">
            <dt className="text-sm text-fg-muted">Email</dt>
            <dd className="text-sm font-medium text-fg">{me.email}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-sm text-fg-muted">Role</dt>
            <dd className="text-sm font-medium text-accent">{roleLabels[me.role]}</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-4">
          {isStaff && (
            <Link
              href="/admin"
              className="cursor-pointer rounded-lg bg-accent px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-on-accent transition-all duration-medium hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-[0_12px_35px_rgba(237,44,39,0.4)]"
            >
              Open Admin Panel
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="cursor-pointer rounded-lg border border-border-strong px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-fg transition-all duration-fast hover:border-accent hover:bg-accent-soft hover:text-accent"
          >
            Sign Out
          </button>
        </div>
      </div>

      <p className="mt-6 text-sm text-fg-faint">
        Order history and client dashboards arrive with the database rollout — your session and role are live now.
      </p>
    </div>
  );
}

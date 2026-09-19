"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DemoModeBanner,
  ErrorBanner,
  SuccessBanner,
  SectionCard,
  Field,
  PrimaryButton,
  GhostButton,
  DangerButton,
  useApiOperation,
} from "@/components/admin/admin-ui";

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: "superadmin" | "admin" | "client";
  company?: string;
  phone?: string;
  createdAt: string;
}

const ROLES = ["superadmin", "admin", "client"] as const;

const roleBadge: Record<string, string> = {
  superadmin: "bg-accent-soft text-accent",
  admin: "bg-blue-500/10 text-blue-400",
  client: "bg-fg/10 text-fg-muted",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [demo, setDemo] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const { loading, error, success, call, setError } = useApiOperation();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      const d = (await res.json()) as { ok?: boolean; users?: UserRow[]; error?: string };
      if (d.error?.includes("MONGODB_URI")) {
        setDemo(true);
        setUsers([]);
        return;
      }
      if (!res.ok || !d.ok) throw new Error(d.error || "Failed to load");
      setUsers(d.users ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
      setUsers([]);
    }
  }, [setError]);

  useEffect(() => {
    load();
  }, [load]);

  async function createSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
      role: String(fd.get("role") || "client"),
      company: String(fd.get("company") || ""),
      phone: String(fd.get("phone") || ""),
    };
    const ok = await call("/api/admin/users", { method: "POST", body: JSON.stringify(payload) }, "User created.");
    if (ok) {
      setShowCreate(false);
      load();
    }
  }

  async function updateRole(id: string, role: string) {
    const ok = await call("/api/admin/users", { method: "PUT", body: JSON.stringify({ id, role }) }, "Role updated.");
    if (ok) load();
  }

  async function resetPassword(id: string) {
    const password = window.prompt("New password (min 8 characters):");
    if (!password) return;
    const ok = await call("/api/admin/users", { method: "PUT", body: JSON.stringify({ id, password }) }, "Password updated.");
    if (ok) load();
  }

  async function remove(id: string) {
    const ok = await call(`/api/admin/users?id=${encodeURIComponent(id)}`, { method: "DELETE" }, "User deleted.");
    if (ok) load();
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-fg">Users</h1>
          <p className="mt-2 text-fg-muted">
            Roles: <strong className="text-accent">superadmin</strong> and <strong className="text-fg">admin</strong> have
            full CRUD on every section; clients can sign in only.
          </p>
        </div>
        <GhostButton onClick={() => setShowCreate((v) => !v)}>{showCreate ? "Close" : "+ New user"}</GhostButton>
      </header>

      {demo && <DemoModeBanner />}

      {showCreate && (
        <SectionCard title="Create user">
          <form onSubmit={createSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" name="name" required />
              <Field label="Email" name="email" type="email" required />
              <Field label="Password" name="password" type="password" required hint="Min 8 characters" />
              <div>
                <label htmlFor="create-role" className="mb-1.5 block text-sm font-medium text-fg">Role</label>
                <select
                  id="create-role"
                  name="role"
                  defaultValue="client"
                  className="w-full cursor-pointer rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-fg"
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <Field label="Company (optional)" name="company" />
              <Field label="Phone (optional)" name="phone" />
            </div>
            <ErrorBanner message={error} />
            <SuccessBanner message={success} />
            <PrimaryButton disabled={loading}>Create user</PrimaryButton>
          </form>
        </SectionCard>
      )}

      <SectionCard title={`All users ${users ? `(${users.length})` : ""}`}>
        {users === null ? (
          <p className="text-fg-muted" aria-busy="true">Loading…</p>
        ) : users.length === 0 ? (
          <p className="text-fg-muted">No users stored yet.</p>
        ) : (
          <ul className="space-y-3">
            {users.map((u) => (
              <li key={u._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4">
                <div className="min-w-0">
                  <p className="font-semibold text-fg">{u.name}</p>
                  <p className="truncate text-sm text-fg-muted">
                    {u.email}
                    {u.company ? ` · ${u.company}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs ${roleBadge[u.role]}`}>{u.role}</span>
                  <label className="sr-only" htmlFor={`role-${u._id}`}>Role for {u.name}</label>
                  <select
                    id={`role-${u._id}`}
                    value={u.role}
                    onChange={(e) => updateRole(u._id, e.target.value)}
                    className="cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-fg"
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <GhostButton onClick={() => resetPassword(u._id)}>Reset password</GhostButton>
                  <DangerButton onClick={() => remove(u._id)}>Delete</DangerButton>
                </div>
              </li>
            ))}
          </ul>
        )}
        <ErrorBanner message={error} />
        <SuccessBanner message={success} />
      </SectionCard>
    </div>
  );
}

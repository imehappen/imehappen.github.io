"use client";

import { useCallback, useEffect, useState } from "react";
import { DemoModeBanner, SectionCard, useApiOperation, ErrorBanner } from "@/components/admin/admin-ui";

interface OrderRow {
  _id: string;
  orderNumber: string;
  work?: { title?: string; slug?: string } | null;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  budget?: number;
  message?: string;
  status: string;
  createdAt: string;
}

const STATUSES = ["new", "in_review", "in_progress", "delivered", "cancelled"] as const;

const statusStyles: Record<string, string> = {
  new: "bg-accent-soft text-accent",
  in_review: "bg-yellow-500/10 text-yellow-400",
  in_progress: "bg-blue-500/10 text-blue-400",
  delivered: "bg-green-500/10 text-green-400",
  cancelled: "bg-fg/10 text-fg-muted",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [demo, setDemo] = useState(false);
  const { call, setError, error } = useApiOperation();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const d = (await res.json()) as { ok?: boolean; orders?: OrderRow[]; error?: string };
      if (d.error?.includes("MONGODB_URI")) {
        setDemo(true);
        setOrders([]);
        return;
      }
      if (!res.ok || !d.ok) throw new Error(d.error || "Failed to load");
      setOrders(d.orders ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
      setOrders([]);
    }
  }, [setError]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id: string, status: string) {
    const ok = await call("/api/admin/orders", { method: "PUT", body: JSON.stringify({ id, status }) }, "Order updated.");
    if (ok) load();
  }

  async function remove(id: string) {
    const ok = await call(`/api/admin/orders?id=${encodeURIComponent(id)}`, { method: "DELETE" }, "Order deleted.");
    if (ok) load();
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight text-fg">Orders</h1>
        <p className="mt-2 text-fg-muted">Service orders submitted from /order. Update status as projects progress.</p>
      </header>

      {demo && <DemoModeBanner />}

      <SectionCard title={`Orders ${orders ? `(${orders.length})` : ""}`}>
        {orders === null ? (
          <p className="text-fg-muted" aria-busy="true">Loading…</p>
        ) : orders.length === 0 ? (
          <p className="text-fg-muted">No orders yet.</p>
        ) : (
          <ul className="space-y-3">
            {orders.map((o) => (
              <li key={o._id} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-fg">
                      {o.orderNumber} · {o.work?.title ?? "—"}
                    </p>
                    <p className="text-sm text-fg-muted">
                      {o.name} · {o.email}
                      {o.company ? ` · ${o.company}` : ""}
                      {o.budget ? ` · $${o.budget.toLocaleString("en-US")}` : ""}
                    </p>
                    {o.message && <p className="mt-2 max-w-2xl text-sm text-fg-muted">{o.message}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs ${statusStyles[o.status] ?? "bg-fg/10 text-fg-muted"}`}>
                      {o.status.replace("_", " ")}
                    </span>
                    <label className="sr-only" htmlFor={`status-${o._id}`}>Order status</label>
                    <select
                      id={`status-${o._id}`}
                      value={o.status}
                      onChange={(e) => setStatus(o._id, e.target.value)}
                      className="cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-fg"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s.replace("_", " ")}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => remove(o._id)}
                      className="cursor-pointer rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-xs text-fg-faint">{new Date(o.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
        <ErrorBanner message={error} />
      </SectionCard>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { DemoModeBanner, SectionCard, useApiOperation, ErrorBanner } from "@/components/admin/admin-ui";

interface MessageRow {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<MessageRow[] | null>(null);
  const [demo, setDemo] = useState(false);
  const { call, setError, error } = useApiOperation();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/messages");
      const d = (await res.json()) as { ok?: boolean; messages?: MessageRow[]; error?: string };
      if (d.error?.includes("MONGODB_URI")) {
        setDemo(true);
        setMessages([]);
        return;
      }
      if (!res.ok || !d.ok) throw new Error(d.error || "Failed to load");
      setMessages(d.messages ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
      setMessages([]);
    }
  }, [setError]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id: string, status: string) {
    const ok = await call("/api/admin/messages", { method: "PUT", body: JSON.stringify({ id, status }) }, "Message updated.");
    if (ok) load();
  }

  async function remove(id: string) {
    const ok = await call(`/api/admin/messages?id=${encodeURIComponent(id)}`, { method: "DELETE" }, "Message deleted.");
    if (ok) load();
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight text-fg">Messages</h1>
        <p className="mt-2 text-fg-muted">Submissions from the /contact form.</p>
      </header>

      {demo && <DemoModeBanner />}

      <SectionCard title={`Inbox ${messages ? `(${messages.length})` : ""}`}>
        {messages === null ? (
          <p className="text-fg-muted" aria-busy="true">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="text-fg-muted">No messages yet.</p>
        ) : (
          <ul className="space-y-3">
            {messages.map((m) => (
              <li key={m._id} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-fg">
                      {m.subject || "(no subject)"}
                      {m.status === "new" && (
                        <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">new</span>
                      )}
                    </p>
                    <p className="text-sm text-fg-muted">
                      {m.name} · <a href={`mailto:${m.email}`} className="cursor-pointer hover:text-accent">{m.email}</a>
                    </p>
                    <p className="mt-2 max-w-2xl text-sm text-fg-muted">{m.message}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      aria-label={`Status for message from ${m.name}`}
                      value={m.status}
                      onChange={(e) => setStatus(m._id, e.target.value)}
                      className="cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-fg"
                    >
                      <option value="new">new</option>
                      <option value="read">read</option>
                      <option value="archived">archived</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => remove(m._id)}
                      className="cursor-pointer rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-xs text-fg-faint">{new Date(m.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
        <ErrorBanner message={error} />
      </SectionCard>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DemoModeBanner } from "@/components/admin/admin-ui";

interface Counts {
  works: number;
  orders: number;
  newOrders: number;
  messages: number;
  newMessages: number;
  users: number;
  logos: number;
}

const quickLinks = [
  { href: "/admin/sliders", label: "Edit sliders & CTAs", desc: "Hero carousel + work marquee, every slide and button" },
  { href: "/admin/media", label: "Media library", desc: "Uploads + free sample images, import with one click" },
  { href: "/admin/services", label: "Edit services", desc: "Services grid shown on home & /services" },
  { href: "/admin/works", label: "Edit works", desc: "Full catalog CRUD incl. media and pricing" },
  { href: "/admin/ticker", label: "Edit trusted-by ticker", desc: "Grayscale client logos, colorize on hover" },
  { href: "/admin/about", label: "Edit about", desc: "Heading, story, stats, portrait" },
  { href: "/admin/contact", label: "Edit contact", desc: "Contact info + form page copy" },
  { href: "/admin/settings", label: "Edit settings", desc: "Site name, folders, ticker/marquee toggles" },
  { href: "/admin/orders", label: "Manage orders", desc: "Status pipeline: new → delivered" },
  { href: "/admin/messages", label: "Read messages", desc: "Contact-form submissions" },
  { href: "/admin/users", label: "Manage users", desc: "Roles: superadmin / admin / client" },
];

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/overview")
      .then(async (r) => {
        const d = (await r.json()) as { ok?: boolean; counts?: Counts; error?: string };
        if (!r.ok || !d.ok) throw new Error(d.error || `Request failed (${r.status})`);
        setCounts(d.counts ?? null);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Failed to load";
        if (message.includes("MONGODB_URI")) setDemo(true);
        else setError(message);
      });
  }, []);

  const cards = counts
    ? [
        { label: "Works", value: counts.works, href: "/admin/works" },
        { label: "Orders", value: counts.orders, href: "/admin/orders", highlight: counts.newOrders },
        { label: "Messages", value: counts.messages, href: "/admin/messages", highlight: counts.newMessages },
        { label: "Users", value: counts.users, href: "/admin/users" },
        { label: "Ticker logos", value: counts.logos, href: "/admin/ticker" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight text-fg">Dashboard</h1>
        <p className="mt-2 text-fg-muted">Every public section of the site is editable from here.</p>
      </header>

      {demo && <DemoModeBanner />}
      {error && (
        <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {counts && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="cursor-pointer rounded-2xl border border-border bg-card p-5 transition-all duration-medium hover:-translate-y-0.5 hover:border-accent/40"
            >
              <p className="font-display text-3xl font-bold text-accent">{c.value}</p>
              <p className="mt-1 text-sm text-fg-muted">
                {c.label}
                {c.highlight ? ` · ${c.highlight} new` : ""}
              </p>
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {quickLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="group cursor-pointer rounded-2xl border border-border bg-card p-5 transition-all duration-medium hover:-translate-y-0.5 hover:border-accent/40"
          >
            <p className="font-display font-bold text-fg group-hover:text-accent">{l.label}</p>
            <p className="mt-1 text-sm text-fg-muted">{l.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

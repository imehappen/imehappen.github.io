"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const sections = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/sliders", label: "Sliders & CTAs" },
  { href: "/admin/media", label: "Media Library" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/works", label: "Works" },
  { href: "/admin/ticker", label: "Trusted-By Ticker" },
  { href: "/admin/about", label: "About" },
  { href: "/admin/contact", label: "Contact" },
  { href: "/admin/settings", label: "Site Settings" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/users", label: "Users" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((d: { user?: { name: string; role: string } | null }) => setMe(d.user ?? null))
      .catch(() => setMe(null));
  }, []);

  async function signOut() {
    await fetch("/api/users/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  // Stable hook for site-wide fixed widgets (scroll progress bar, back-to-top
  // in the root layout): hides them on /admin so they never overlap the panel's
  // own chrome. Decorative elements only — admin functionality is unaffected.
  useEffect(() => {
    document.documentElement.dataset.adminUi = "true";
    return () => {
      delete document.documentElement.dataset.adminUi;
    };
  }, []);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 pb-24 pt-28 sm:px-8 lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-64 lg:shrink-0">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Admin Panel</p>
          {me && (
            <p className="mt-2 text-sm text-fg-muted">
              {me.name} · <span className="text-fg">{me.role}</span>
            </p>
          )}
          <nav aria-label="Admin sections" className="mt-5">
            <ul className="flex flex-wrap gap-1.5 lg:flex-col">
              {sections.map((s) => {
                const active = s.exact ? pathname === s.href : pathname.startsWith(s.href);
                return (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      className={`block cursor-pointer rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? "bg-accent-soft text-accent"
                          : "text-fg-muted hover:bg-elevated hover:text-fg"
                      }`}
                    >
                      {s.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="mt-6 space-y-2 border-t border-border pt-5">
            <Link
              href="/"
              className="block cursor-pointer rounded-lg px-3.5 py-2 text-sm text-fg-muted transition-colors hover:text-fg"
            >
              ← Back to site
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="block w-full cursor-pointer rounded-lg px-3.5 py-2 text-left text-sm text-fg-muted transition-colors hover:text-accent"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Section content */}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

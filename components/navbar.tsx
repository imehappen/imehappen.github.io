"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";

const links = [
  { href: "/", label: "Home", icon: (c: string) => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4a1 1 0 00-1-1h-2a1 1 0 00-1 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/></svg>
  )},
  { href: "/works", label: "Work", icon: (c: string) => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
  )},
  { href: "/services", label: "Services", icon: (c: string) => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
  )},
  { href: "/about", label: "About", icon: (c: string) => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  )},
  { href: "/contact", label: "Contact", icon: (c: string) => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/></svg>
  )},
  { href: "/order", label: "Order", icon: (c: string) => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
  )},
];

interface Me {
  name: string;
  role: "superadmin" | "admin" | "client";
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [me, setMe] = useState<Me | null>(null);
  const [checked, setChecked] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((d: { user?: Me | null }) => {
        if (!cancelled) {
          setMe(d.user ?? null);
          setChecked(true);
        }
      })
      .catch(() => {
        if (!cancelled) setChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const isStaff = me?.role === "superadmin" || me?.role === "admin";

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Ctrl+K / Cmd+K → focus the global search input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.querySelector<HTMLInputElement>("[data-global-search]")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-fast ${
        scrolled
          ? "border-b border-border bg-bg/85 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-fg/80 transition-colors hover:text-fg"
          onClick={() => setOpen(false)}
        >
          <Logo className="h-8 w-8" />
          <span className="hidden sm:inline">Designs by imehappen</span>
          <span className="sm:hidden">imehappen</span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            const color = isActive ? "var(--color-accent)" : "currentColor";
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-fast ${
                    isActive
                      ? "text-accent nav-link-active"
                      : "text-fg-muted hover:bg-accent-soft hover:text-fg"
                  }`}
                >
                  {link.icon(color)}
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Desktop CTA + session menu */}
        <div className="hidden items-center gap-3 lg:flex">
          {checked && me ? (
            isStaff ? (
              <Link
                href="/admin"
                className="cursor-pointer rounded-lg border border-border-strong px-4 py-2.5 text-sm font-semibold text-fg transition-all duration-fast hover:border-accent hover:bg-accent-soft hover:text-accent"
              >
                Admin Panel
              </Link>
            ) : (
              <Link
                href="/account"
                className="cursor-pointer rounded-lg border border-border-strong px-4 py-2.5 text-sm font-semibold text-fg transition-all duration-fast hover:border-accent hover:bg-accent-soft hover:text-accent"
              >
                My Account
              </Link>
            )
          ) : null}
          {!me ? (
            <Link
              href="/login"
              className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-fg-muted transition-colors hover:text-fg"
            >
              Sign in
            </Link>
          ) : null}
          <Link
            href="/order"
            className="cursor-pointer rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent transition-all duration-medium hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-[0_10px_30px_rgba(237,44,39,0.35)]"
          >
            Start a Project
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg text-fg lg:hidden"
        >
          <span
            className={`h-0.5 w-6 bg-current transition-transform duration-fast ${open ? "translate-y-2 rotate-45" : ""}`}
          />
          <span className={`h-0.5 w-6 bg-current transition-opacity duration-fast ${open ? "opacity-0" : ""}`} />
          <span
            className={`h-0.5 w-6 bg-current transition-transform duration-fast ${open ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-x-0 top-16 z-40 border-b border-border bg-bg/95 backdrop-blur-xl transition-all duration-fast lg:hidden ${
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-3 opacity-0"
        }`}
      >
        <ul className="space-y-1 px-5 py-4">
          {links.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            const color = isActive ? "var(--color-accent)" : "currentColor";
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                    isActive
                      ? "bg-accent-soft text-accent"
                      : "text-fg-muted hover:bg-accent-soft hover:text-fg"
                  }`}
                >
                  {link.icon(color)}
                  {link.label}
                </Link>
              </li>
            );
          })}
          {checked && me ? (
            isStaff ? (
              <li>
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="block cursor-pointer rounded-lg px-4 py-3 text-base font-medium text-fg-muted transition-colors hover:bg-accent-soft hover:text-fg"
                >
                  Admin Panel
                </Link>
              </li>
            ) : (
              <li>
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="block cursor-pointer rounded-lg px-4 py-3 text-base font-medium text-fg-muted transition-colors hover:bg-accent-soft hover:text-fg"
                >
                  My Account
                </Link>
              </li>
            )
          ) : null}
          {!me ? (
            <li>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block cursor-pointer rounded-lg px-4 py-3 text-base font-medium text-fg-muted transition-colors hover:bg-accent-soft hover:text-fg"
              >
                Sign in
              </Link>
            </li>
          ) : null}
          <li className="pt-2">
            <Link
              href="/order"
              onClick={() => setOpen(false)}
              className="block cursor-pointer rounded-lg bg-accent px-4 py-3 text-center text-base font-semibold text-on-accent transition-colors hover:bg-accent-hover"
            >
              Start a Project
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}

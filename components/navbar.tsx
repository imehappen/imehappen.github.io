"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/works", label: "Work" },
  { href: "/#services", label: "Services" },
  { href: "/#about", label: "About" },
  { href: "/order", label: "Order" },
  { href: "/#contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);

      // Active-section highlighting for hash links on this page
      const sections = ["home", "services", "about", "contact"];
      let current = "";
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 200) current = id;
      }
      setActive(current);
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

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
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
            const isActive =
              (link.href.startsWith("/#") && active === link.href.slice(2)) ||
              (link.href === "/" && active === "home" && !open);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`cursor-pointer rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent-soft hover:text-fg ${
                    isActive ? "text-accent" : "text-fg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden lg:block">
          <Link
            href="/order"
            className="cursor-pointer rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-[0_10px_30px_rgba(237,44,39,0.35)]"
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
            className={`h-0.5 w-6 bg-current transition-transform duration-300 ${open ? "translate-y-2 rotate-45" : ""}`}
          />
          <span className={`h-0.5 w-6 bg-current transition-opacity duration-300 ${open ? "opacity-0" : ""}`} />
          <span
            className={`h-0.5 w-6 bg-current transition-transform duration-300 ${open ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-x-0 top-16 z-40 border-b border-border bg-bg/95 backdrop-blur-xl transition-all duration-300 lg:hidden ${
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-3 opacity-0"
        }`}
      >
        <ul className="space-y-1 px-5 py-4">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="block cursor-pointer rounded-lg px-4 py-3 text-base font-medium text-fg-muted transition-colors hover:bg-accent-soft hover:text-fg"
              >
                {link.label}
              </Link>
            </li>
          ))}
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

import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getServices } from "@/lib/services-data";
import { TwoToneHeading } from "@/components/typed-heading";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services",
  description: "Web systems, branding, and conversion engineering services by Designs by imehappen.",
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 sm:px-8">
      <Reveal>
      <header className="mb-12 max-w-2xl">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          <TwoToneHeading text="Services built to dominate" />
        </h1>
        <p className="mt-3 text-fg-muted">
          High-performance platforms and unstoppable visuals designed to command your market.
        </p>
      </header>
      </Reveal>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => (
          <Reveal key={service.id} delay={(i % 3) * 70} className="h-full">
          <article
            className="lift-card flex h-full flex-col rounded-2xl border border-border bg-card p-7 hover:-translate-y-1.5 hover:border-accent/40"
          >
            {service.image ? (
              <div className="relative mb-5 aspect-[16/9] overflow-hidden rounded-xl">
                <Image
                  src={service.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            ) : service.iconPath ? (
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-accent" aria-hidden="true">
                  <path d={service.iconPath} />
                </svg>
              </div>
            ) : null}
            <h2 className="font-display text-xl font-bold text-fg">{service.title}</h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-fg-muted">{service.description}</p>
            <div className="mt-6 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Custom Pricing</p>
              <Link
                href="/order"
                className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-fg-muted transition-colors hover:text-accent"
              >
                Order →
              </Link>
            </div>
          </article>
          </Reveal>
        ))}
      </div>

      <Reveal>
      <div className="mt-14 rounded-2xl border border-border bg-surface p-8 text-center sm:p-12">
        <h2 className="font-display text-2xl font-bold text-fg">Not sure what you need?</h2>
        <p className="mx-auto mt-3 max-w-xl text-fg-muted">
          Send a short brief and you&apos;ll get a scoped recommendation within one business day.
        </p>
        <Link
          href="/contact"
          className="mt-8 inline-block cursor-pointer rounded-lg bg-accent px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-on-accent transition-all duration-medium hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-[0_12px_35px_rgba(237,44,39,0.4)]"
        >
          Ask a Question
        </Link>
      </div>
      </Reveal>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getAboutContent } from "@/lib/site-content";
import { TwoToneHeading } from "@/components/typed-heading";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description: "About Musa Gabriel (imehappen) — systems developer and designer in Nairobi.",
};

export default async function AboutPage() {
  const about = await getAboutContent();

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 sm:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
      <div className="relative overflow-hidden rounded-2xl border border-border">
          <Image
            src={about.image}
            alt={about.imageAlt}
            width={640}
            height={800}
            priority
            className="h-auto w-full object-cover grayscale transition-all duration-slow hover:grayscale-0"
          />        </div>
      </Reveal>
      <Reveal>
      <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">About</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            <TwoToneHeading text={about.heading} />
          </h1>
          <p className="mt-6 leading-relaxed text-fg-muted">{about.paragraph1}</p>
          <p className="mt-4 leading-relaxed text-fg-muted">{about.paragraph2}</p>

          <dl className="mt-10 grid grid-cols-3 gap-6">
            {[
              [about.stat1Value, about.stat1Label],
              [about.stat2Value, about.stat2Label],
              [about.stat3Value, about.stat3Label],
            ].map(([value, label]) => (
              <div key={label} className="text-center">
                <dt className="sr-only">{label}</dt>
                <dd className="font-display text-3xl font-bold text-accent sm:text-4xl">{value}</dd>
                <dd className="mt-1 text-xs uppercase tracking-[0.2em] text-fg-muted">{label}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/works"
              className="cursor-pointer rounded-lg bg-accent px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-on-accent transition-all duration-medium hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-[0_12px_35px_rgba(237,44,39,0.4)]"
            >
              See My Work
            </Link>
            <Link
              href="/contact"
              className="cursor-pointer rounded-lg border border-border-strong px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-fg transition-all duration-fast hover:border-accent hover:bg-accent-soft hover:text-accent"
            >
              Get In Touch
            </Link>
          </div>
      </div>
      </Reveal>
      </div>
    </div>
  );
}

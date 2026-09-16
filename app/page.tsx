import Image from "next/image";
import Link from "next/link";
import { HeroSlider } from "@/components/hero-slider";
import { InfiniteSlider } from "@/components/infinite-slider";
import { getHomeSlides } from "@/lib/home-slides-data";
import { getWorks, formatPrice } from "@/lib/works-data";

export const dynamic = "force-dynamic";

const services = [
  {
    title: "Authority Frameworks",
    description:
      "Stop losing revenue to slower, amateur builds. Flawless, high-speed architectures that command industry trust and force user action.",
    icon: (
      <path d="M12 2L2 7V9C2 14.55 5.84 19.74 11 21C16.16 19.74 20 14.55 20 9V7L12 2ZM12 11.5L9 8.5L10.41 7.09L12 8.67L15.59 5.09L17 6.5L12 11.5Z" />
    ),
  },
  {
    title: "Conversion Machines",
    description:
      "An online store shouldn't just look good; it must sell. Immersive checkout mechanics that eliminate second-guessing and drive purchases.",
    icon: (
      <path d="M12 6.5C12 5.67 11.33 5 10.5 5S9 5.67 9 6.5 9.67 8 10.5 8 12 7.33 12 6.5M13.5 5C12.67 5 12 5.67 12 6.5S12.67 8 13.5 8 15 7.33 15 6.5 14.33 5 13.5 5M12 21.35L5.35 14.7C3.58 12.93 2.61 10.54 2.61 8.04C2.61 3.74 6.05 0.25 10.36 0.21C14.72 0.17 18.29 3.69 18.29 8C18.29 10.53 17.34 12.88 15.58 14.65L12 21.35Z" />
    ),
  },
  {
    title: "Traffic Extraction",
    description:
      "Every second of delay is a customer choosing a rival. Complete backend overhauls that grab top rankings and hold attention instantly.",
    icon: (
      <path d="M19 3H14.82C14.4 1.84 13.3 1 12 1S9.6 1.84 9.18 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM12 3C12.55 3 13 3.45 13 4S12.55 5 12 5 11 4.55 11 4 11.45 3 12 3ZM12 18L8 14H11V9H13V14H16L12 18Z" />
    ),
  },
  {
    title: "Premium Elite",
    description:
      "Cheap design attracts cheap buyers. Elite, high-status branding structures that automatically justify premium pricing models.",
    icon: (
      <path d="M20.5 11H19V7C19 5.9 18.1 5 17 5H13V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4C2.9 5 2 5.9 2 7V10.8H3.5C4.99 10.8 6.2 12.01 6.2 13.5S4.99 16.2 3.5 16.2H2V20C2 21.1 2.9 22 4 22H7.8V20.5C7.8 19.01 9.01 17.8 10.5 17.8S13.2 19.01 13.2 20.5V22H17C18.1 22 19 21.1 19 20V16H20.5C21.88 16 23 14.88 23 13.5S21.88 11 20.5 11Z" />
    ),
  },
  {
    title: "Behavioral UI",
    description:
      "We don't build layouts for casual browsing. Visual pathways funnel user eye movements directly into your most profitable links.",
    icon: (
      <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM11 17L6 12L7.41 10.59L11 14.17L16.59 8.59L18 10L11 17Z" />
    ),
  },
  {
    title: "Visual Dominance",
    description:
      "Cut through the digital noise. Hyper-aggressive marketing collateral engineered to trigger intense FOMO and immediate action.",
    icon: (
      <path d="M12 2C10.34 2 9 3.34 9 5C9 6.66 10.34 8 12 8C13.66 8 15 6.66 15 5C15 3.34 13.66 2 12 2ZM12 9C8.69 9 6 11.69 6 15C6 16.66 6.56 18.17 7.5 19.32V22L12 20L16.5 22V19.32C17.44 18.17 18 16.66 18 15C18 11.69 15.31 9 12 9Z" />
    ),
  },
];

export default async function HomePage() {
  const [slides, works] = await Promise.all([getHomeSlides(), getWorks()]);
  const featured = works.filter((w) => w.featured).slice(0, 6);
  const marqueeItems = works.map((w) => ({
    src: w.media[0]?.src ?? "/images/templatemo-amber-folio-01.jpg",
    alt: w.title,
  }));

  return (
    <>
      <HeroSlider slides={slides} />

      {/* Full-width infinite slider — replaces the old coverflow */}
      <InfiniteSlider items={marqueeItems} />

      {/* Featured works */}
      <section id="portfolio" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <header className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">Featured Work</h2>
          <p className="mt-3 text-fg-muted">
            Selected projects across web systems, branding, and conversion engineering.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((work) => (
            <Link
              key={work.id}
              href={`/works/${work.slug}`}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-border-strong hover:shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={work.media[0]?.src ?? "/images/templatemo-amber-folio-01.jpg"}
                  alt={work.media[0]?.alt ?? work.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-bg/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent backdrop-blur">
                  {work.category}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-bold text-fg group-hover:text-accent">{work.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-fg-muted">{work.summary}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-accent">{formatPrice(work.priceFrom)}</span>
                  <span className="text-xs uppercase tracking-wider text-fg-faint">View →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/works"
            className="inline-block cursor-pointer rounded-lg border border-border-strong px-7 py-3 text-sm font-semibold uppercase tracking-wider text-fg transition-all duration-200 hover:border-accent hover:bg-accent-soft hover:text-accent"
          >
            View All Work
          </Link>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="border-y border-border bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <header className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">Market Authority</h2>
            <p className="mt-3 text-fg-muted">
              High-performance platforms and unstoppable visuals designed to command your market.
            </p>
          </header>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.title}
                className="rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-accent" aria-hidden="true">
                    {service.icon}
                  </svg>
                </div>
                <h3 className="font-display text-xl font-bold text-fg">{service.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">{service.description}</p>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-accent">Custom Pricing</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-border">
            <Image
              src="/images/templatemo-about-artist.jpg"
              alt="Portrait of the developer"
              width={640}
              height={800}
              className="h-auto w-full object-cover grayscale transition-all duration-500 hover:grayscale-0"
            />
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">Tech Expert for You</h2>
            <p className="mt-5 leading-relaxed text-fg-muted">
              As a full-stack web developer and graphic designer, I bridge robust technical engineering with compelling
              visual storytelling — building digital solutions that look stunning and perform flawlessly.
            </p>
            <p className="mt-4 leading-relaxed text-fg-muted">
              From scalable backends and responsive web apps to high-impact branding, every project is engineered to
              optimize engagement and bring a cohesive brand vision to life.
            </p>
            <dl className="mt-10 grid grid-cols-3 gap-6">
              {[
                ["300+", "Projects"],
                ["7+", "Years"],
                ["50+", "Businesses"],
              ].map(([value, label]) => (
                <div key={label} className="text-center">
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-display text-3xl font-bold text-accent sm:text-4xl">{value}</dd>
                  <dd className="mt-1 text-xs uppercase tracking-[0.2em] text-fg-muted">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="border-t border-border bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 text-center sm:px-8">
          <h2 className="font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">Get In Touch</h2>
          <p className="mx-auto mt-3 max-w-xl text-fg-muted">Let&apos;s create something beautiful together.</p>

          <div className="mx-auto mt-12 grid max-w-3xl gap-5 sm:grid-cols-3">
            <a
              href="mailto:imehappen@gmail.com"
              className="cursor-pointer rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Email</p>
              <p className="mt-2 break-words text-sm text-fg">imehappen@gmail.com</p>
            </a>
            <a
              href="tel:+254702483879"
              className="cursor-pointer rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Phone</p>
              <p className="mt-2 text-sm text-fg">+254 (7) 02 483-879</p>
            </a>
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Studio</p>
              <p className="mt-2 text-sm text-fg">Nairobi, Kenya</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

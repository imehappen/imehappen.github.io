import Image from "next/image";
import Link from "next/link";
import { HeroSlider } from "@/components/hero-slider";
import { InfiniteSlider } from "@/components/infinite-slider";
import { TrustedTicker } from "@/components/trusted-ticker";
import { TypedHeading } from "@/components/typed-heading";
import { Reveal } from "@/components/reveal";
import { getHomeSlides } from "@/lib/home-slides-data";
import { getWorks, formatPrice } from "@/lib/works-data";
import { getServices } from "@/lib/services-data";
import { getTrustedLogos } from "@/lib/ticker-data";
import { getMarqueeSlides } from "@/lib/marquee-data";
import { getAboutContent, getContactContent, getSiteSettings } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [slides, works, services, logos, marqueeCustom, about, contact, settings] = await Promise.all([
    getHomeSlides(),
    getWorks(),
    getServices(),
    getTrustedLogos(),
    getMarqueeSlides(),
    getAboutContent(),
    getContactContent(),
    getSiteSettings(),
  ]);
  const featured = works.filter((w) => w.featured).slice(0, 6);
  // Admin-curated marquee slides win; otherwise derive from published works.
  const marqueeItems = marqueeCustom.length > 0
    ? marqueeCustom
    : works.map((w) => ({
        src: w.media[0]?.src ?? "/images/templatemo-amber-folio-01.jpg",
        alt: w.title,
      }));

  const { hero, ticker, marquee, motion } = settings;

  return (
    <>
      <HeroSlider
        slides={slides}
        autoplayMs={hero.autoplayMs}
        pauseOnHover={hero.pauseOnHover}
        heightBoost={hero.heightBoost}
        respectReducedMotion={motion.respectReducedMotion}
      />

      {/* "Trusted by" grayscale logo ticker — logos in /admin/ticker, behaviour in /admin/settings */}
      {ticker.enabled && (
        <TrustedTicker
          logos={logos}
          label={ticker.label}
          speed={ticker.speed}
          direction={ticker.direction}
          pauseOnHover={ticker.pauseOnHover}
          draggable={ticker.draggable}
          respectReducedMotion={motion.respectReducedMotion}
        />
      )}

      {/* Full-width infinite slider — admin-curated, or derived from works */}
      {marquee.enabled && (
        <InfiniteSlider
          items={marqueeItems}
          speed={marquee.speed}
          direction={marquee.direction}
          pauseOnHover={marquee.pauseOnHover}
          draggable={marquee.draggable}
          respectReducedMotion={motion.respectReducedMotion}
        />
      )}

      {/* Featured works */}
      {settings.showFeaturedWorks && (
      <section id="portfolio" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <Reveal>
        <header className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-fg">Featured</span> <span className="heading-accent-clip">Work</span>
          </h2>
          <p className="mt-3 text-fg-muted">
            Selected projects across web systems, branding, and conversion engineering.
          </p>
        </header>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((work, i) => (
            <Reveal key={work.id} delay={(i % 3) * 70} className="h-full">
            <Link
              href={`/works/${work.slug}`}
              className="group lift-card flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card hover:-translate-y-0.5 hover:border-border-strong"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={work.media[0]?.src ?? "/images/templatemo-amber-folio-01.jpg"}
                  alt={work.media[0]?.alt ?? work.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="lift-zoom object-cover"
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
            </Reveal>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/works"
            className="inline-block cursor-pointer rounded-lg border border-border-strong px-7 py-3 text-sm font-semibold uppercase tracking-wider text-fg transition-all duration-fast hover:border-accent hover:bg-accent-soft hover:text-accent"
          >
            View All Work
          </Link>
        </div>
      </section>
      )}

      {/* Services */}
      {settings.showServices && (
      <section id="services" className="border-y border-border bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
          <header className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              <span className="text-fg">Market</span> <span className="heading-accent-clip">Authority</span>
            </h2>
            <p className="mt-3 text-fg-muted">
              High-performance platforms and unstoppable visuals designed to command your market.
            </p>
          </header>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <Reveal key={service.id} delay={(i % 3) * 70} className="h-full">
              <article
                className="lift-card flex h-full flex-col rounded-2xl border border-border bg-card p-7 hover:-translate-y-0.5 hover:border-accent/40"
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
                <h3 className="font-display text-xl font-bold text-fg">{service.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">{service.description}</p>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-accent">Custom Pricing</p>
              </article>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/services"
              className="inline-block cursor-pointer rounded-lg border border-border-strong px-7 py-3 text-sm font-semibold uppercase tracking-wider text-fg transition-all duration-fast hover:border-accent hover:bg-accent-soft hover:text-accent"
            >
              All Services
            </Link>
          </div>
        </div>
      </section>
      )}

      {/* About */}
      {settings.showAbout && (
      <section id="about" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-border">
            <Image
              src={about.image}
              alt={about.imageAlt}
              width={640}
              height={800}
              className="h-auto w-full object-cover grayscale transition-all duration-slow hover:grayscale-0"
            />
          </div>
          </Reveal>
          <Reveal>
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              <TypedHeading text={about.heading} typewriter={false} />
            </h2>
            <p className="mt-5 leading-relaxed text-fg-muted">{about.paragraph1}</p>
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
          </div>
          </Reveal>
        </div>
      </section>
      )}

      {/* Contact */}
      {settings.showContact && (
      <section id="contact" className="border-t border-border bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 text-center sm:px-8">
          <Reveal>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            <TypedHeading text={contact.heading} typewriter={false} />
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-fg-muted">{contact.intro}</p>
          </Reveal>

          <Reveal className="h-full">
          <div className="mx-auto mt-12 grid max-w-3xl gap-5 sm:grid-cols-3">
            <a
              href={`mailto:${contact.email}`}
              className="lift-card cursor-pointer rounded-2xl border border-border bg-card p-6 hover:-translate-y-1 hover:border-accent/40"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Email</p>
              <p className="mt-2 break-words text-sm text-fg">{contact.email}</p>
            </a>
            <a
              href={`tel:${contact.phone}`}
              className="lift-card cursor-pointer rounded-2xl border border-border bg-card p-6 hover:-translate-y-1 hover:border-accent/40"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Phone</p>
              <p className="mt-2 text-sm text-fg">{contact.phoneDisplay}</p>
            </a>
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Studio</p>
              <p className="mt-2 text-sm text-fg">{contact.location}</p>
            </div>
          </div>
          </Reveal>

          <Link
            href="/contact"
            className="mt-10 inline-block cursor-pointer rounded-lg border border-border-strong px-7 py-3 text-sm font-semibold uppercase tracking-wider text-fg transition-all duration-fast hover:border-accent hover:bg-accent-soft hover:text-accent"
          >
            Send a Message
          </Link>
        </div>
      </section>
      )}
    </>
  );
}

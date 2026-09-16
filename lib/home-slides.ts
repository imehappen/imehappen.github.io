export interface HomeSlide {
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

/**
 * Hero slides for the 50/50 split slider.
 * On large screens: image left / text right, alternating direction per slide.
 * On small screens: stacked vertically — image on top, text below.
 */
export const homeSlides: HomeSlide[] = [
  {
    image: "/images/templatemo-amber-folio-01.jpg",
    alt: "Selected portrait design work",
    eyebrow: "Systems Developer",
    title: "Bringing your business systems online",
    subtitle:
      "Full-stack engineering and design that commands trust — from architecture to the final pixel.",
    ctaLabel: "View My Work",
    ctaHref: "/works",
    secondaryLabel: "Order a Service",
    secondaryHref: "/order",
  },
  {
    image: "/images/templatemo-amber-folio-05.jpg",
    alt: "Editorial design composition",
    eyebrow: "Design + Engineering",
    title: "Built to convert. Designed to last.",
    subtitle:
      "High-performance platforms and unstoppable visuals, engineered to leave competitors irrelevant.",
    ctaLabel: "Explore Services",
    ctaHref: "/#services",
    secondaryLabel: "About Me",
    secondaryHref: "/#about",
  },
  {
    image: "/images/templatemo-amber-folio-08.jpg",
    alt: "Brand collateral flat lay",
    eyebrow: "300+ Projects",
    title: "Seven years of shipping real outcomes",
    subtitle:
      "Trusted by 50+ businesses for identities, storefronts, and systems that perform under pressure.",
    ctaLabel: "Start a Project",
    ctaHref: "/order",
    secondaryLabel: "See Featured Work",
    secondaryHref: "/works",
  },
];

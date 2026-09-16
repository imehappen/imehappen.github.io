import { homeSlides } from "@/lib/home-slides";
import type { WorkSeed } from "@/lib/works-data";

export { homeSlides as seedHomeSlides };

const works: WorkSeed[] = [
  {
    slug: "amber-folio-photography-site",
    title: "Amber Folio — Photography Portfolio",
    category: "Web Design",
    summary: "A 3D coverflow photography portfolio with buttery autoplay and touch support.",
    description:
      "A dark, cinematic portfolio site for a Nairobi-based photographer. Built around a 3D coverflow gallery with reflection effects, keyboard navigation, and swipe gestures. Fully responsive with a custom loading screen and scroll-reveal storytelling sections.",
    features: [
      "3D coverflow gallery with reflections",
      "Touch swipe + keyboard navigation",
      "Scroll-reveal animations",
      "Custom preloader",
    ],
    tags: ["HTML", "CSS", "JavaScript"],
    media: [
      { src: "/images/templatemo-amber-folio-01.jpg", kind: "image", alt: "Portrait photography cover" },
      { src: "/images/templatemo-amber-folio-02.jpg", kind: "image", alt: "Landscape cover" },
      { src: "/images/templatemo-amber-folio-03.jpg", kind: "image", alt: "Street photography cover" },
      { src: "/images/templatemo-amber-folio-04.jpg", kind: "image", alt: "Architecture cover" },
    ],
    priceFrom: 450,
    deliveryWeeks: 2,
    featured: true,
    published: true,
  },
  {
    slug: "commerce-checkout-system",
    title: "Commerce Checkout System",
    category: "Development",
    summary: "Conversion-first storefront with immersive checkout mechanics and analytics hooks.",
    description:
      "An online store shouldn't just look good; it must sell. This build pairs a fast catalogue with a two-step checkout, optimistic cart updates, and post-purchase email triggers. Shipped with Lighthouse 95+ across the board.",
    features: [
      "Two-step frictionless checkout",
      "Optimistic cart state",
      "Stripe-ready payment abstraction",
      "Analytics event pipeline",
    ],
    tags: ["Next.js", "TypeScript", "Stripe"],
    media: [
      { src: "/images/templatemo-amber-folio-05.jpg", kind: "image", alt: "Storefront hero" },
      { src: "/images/templatemo-amber-folio-06.jpg", kind: "image", alt: "Product grid" },
    ],
    priceFrom: 1800,
    deliveryWeeks: 6,
    featured: true,
    published: true,
  },
  {
    slug: "brand-identity-premium-elite",
    title: "Premium Elite — Brand Identity",
    category: "Branding",
    summary: "High-status branding system engineered to justify premium pricing models.",
    description:
      "Cheap design attracts cheap buyers. This identity package covers logo system, type scale, color architecture, and marketing collateral for a consultancy that moved upmarket — with a brand book their whole team actually uses.",
    features: [
      "Logo system + variants",
      "Brand book & usage rules",
      "Social + print collateral",
      "Color & type architecture",
    ],
    tags: ["Identity", "Print", "Art Direction"],
    media: [
      { src: "/images/templatemo-amber-folio-07.jpg", kind: "image", alt: "Brand monochrome set" },
      { src: "/images/templatemo-amber-folio-08.jpg", kind: "image", alt: "Collateral mockups" },
    ],
    priceFrom: 900,
    deliveryWeeks: 3,
    featured: true,
    published: true,
  },
  {
    slug: "traffic-extraction-performance",
    title: "Traffic Extraction — Performance Overhaul",
    category: "Development",
    summary: "Core Web Vitals rescue mission: from red to green and up the rankings.",
    description:
      "Every second of delay is a customer choosing a rival. We took a legacy agency site from a 34 Lighthouse score to 97, cut LCP by 71%, and rebuilt the deployment pipeline with image pipelines and edge caching.",
    features: [
      "Core Web Vitals rescue",
      "Edge caching strategy",
      "Image/AVIF pipeline",
      "SEO restructure",
    ],
    tags: ["Performance", "SEO", "CDN"],
    media: [
      { src: "/images/templatemo-amber-folio-09.jpg", kind: "image", alt: "Abstract performance art" },
      { src: "/images/templatemo-amber-folio-01.jpg", kind: "image", alt: "Detail shot" },
    ],
    priceFrom: 750,
    deliveryWeeks: 2,
    featured: false,
    published: true,
  },
  {
    slug: "behavioral-ui-funnel",
    title: "Behavioral UI — Conversion Funnel",
    category: "UI/UX",
    summary: "Eye-tracking-informed pathways that funnel attention into profitable clicks.",
    description:
      "We don't build layouts for casual browsing. This engagement rebuilt a SaaS marketing site around behavioral triggers: contrast mapping, CTA spacing systems, and social proof placement — lifting trial signups 38% in A/B tests.",
    features: [
      "Behavioral contrast mapping",
      "A/B tested CTA system",
      "Social proof architecture",
      "38% signup lift",
    ],
    tags: ["UI/UX", "CRO", "Testing"],
    media: [
      { src: "/images/templatemo-amber-folio-02.jpg", kind: "image", alt: "Funnel visualization" },
      { src: "/images/templatemo-amber-folio-03.jpg", kind: "image", alt: "Heatmap study" },
    ],
    priceFrom: 1200,
    deliveryWeeks: 4,
    featured: true,
    published: true,
  },
  {
    slug: "visual-dominance-campaign",
    title: "Visual Dominance — Campaign Kit",
    category: "Branding",
    summary: "Hyper-aggressive marketing collateral engineered to trigger immediate action.",
    description:
      "Cut through the digital noise. A launch campaign kit for a fintech entrant: bold motion ads, scroll-stopping social sets, and out-of-home layouts that made the brand look ten years older than it was.",
    features: [
      "Motion ad set",
      "Social media kit",
      "OOH + poster layouts",
      "Launch guidelines",
    ],
    tags: ["Campaign", "Motion", "Social"],
    media: [
      { src: "/images/templatemo-amber-folio-04.jpg", kind: "image", alt: "Campaign poster" },
      { src: "/images/templatemo-amber-folio-05.jpg", kind: "image", alt: "Social set" },
    ],
    priceFrom: 650,
    deliveryWeeks: 2,
    featured: false,
    published: true,
  },
];

export const seedWorks: WorkSeed[] = works;

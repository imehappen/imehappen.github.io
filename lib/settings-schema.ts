/**
 * Site settings schema — the single source of truth shared by:
 *   - lib/site-content.ts      (defaults + typed reader for server components)
 *   - app/api/admin/content    (allowed fields + per-group role enforcement)
 *   - app/admin/settings       (grouped editor UI)
 *
 * Values are stored as strings (the Content collection is a string map);
 * `parseSiteSettings()` turns them into booleans/numbers for the site.
 *
 * This file must stay free of server-only imports — it is bundled into the
 * admin client.
 */

export type SettingsRole = "admin" | "superadmin";

export interface SettingsContent {
  /* Identity & SEO */
  siteName: string;
  tagline: string;
  seoTitle: string;
  seoDescription: string;

  /* Home page sections */
  showFeaturedWorks: string;
  showServices: string;
  showAbout: string;
  showContact: string;

  /* Hero slider */
  heroAutoplay: string;
  heroAutoplayMs: string;
  heroPauseOnHover: string;
  heroHeightBoost: string; // % taller on large screens, e.g. "30"

  /* Trusted-by ticker */
  tickerEnabled: string;
  tickerLabel: string;
  tickerSpeed: string; // px per second
  tickerDirection: string; // "left" | "right"
  tickerPauseOnHover: string;
  tickerDraggable: string;

  /* Work marquee */
  marqueeEnabled: string;
  marqueeSpeed: string;
  marqueeDirection: string;
  marqueePauseOnHover: string;
  marqueeDraggable: string;

  /* Motion & transitions */
  respectReducedMotion: string;
  pageTransitions: string;
  scrollReveals: string;

  /* Media folders (system) */
  mediaDir: string;
  sampleDir: string;

  /* Footer contact */
  contactEmail: string;
  contactPhone: string;
  contactPhoneDisplay: string;
  contactLocation: string;
}

export const defaultSettings: SettingsContent = {
  siteName: "Designs by imehappen",
  tagline: "Systems developer bringing business systems online — full-stack engineering with premium design.",
  seoTitle: "Designs by imehappen — Systems Developer",
  seoDescription:
    "Full-stack developer & designer in Nairobi. Web systems, branding, and conversion-focused digital products.",

  showFeaturedWorks: "true",
  showServices: "true",
  showAbout: "true",
  showContact: "true",

  heroAutoplay: "true",
  heroAutoplayMs: "5000",
  heroPauseOnHover: "false",
  heroHeightBoost: "30",

  tickerEnabled: "true",
  tickerLabel: "Trusted by",
  tickerSpeed: "40",
  tickerDirection: "left",
  tickerPauseOnHover: "true",
  tickerDraggable: "true",

  marqueeEnabled: "true",
  marqueeSpeed: "45",
  marqueeDirection: "left",
  marqueePauseOnHover: "true",
  marqueeDraggable: "true",

  respectReducedMotion: "false",
  pageTransitions: "true",
  scrollReveals: "true",

  mediaDir: "images/uploads",
  sampleDir: "images/samples",

  contactEmail: "imehappen@gmail.com",
  contactPhone: "+254702483879",
  contactPhoneDisplay: "+254 (7) 02 483-879",
  contactLocation: "Nairobi, Kenya",
};

export type SettingsKey = keyof SettingsContent;

export interface SettingsFieldSpec {
  name: SettingsKey;
  label: string;
  type?: "text" | "textarea" | "toggle" | "number" | "select";
  hint?: string;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: { value: string; label: string }[];
}

export interface SettingsGroup {
  id: string;
  title: string;
  description: string;
  /** Minimum role allowed to edit this group (viewing needs staff access). */
  minRole: SettingsRole;
  fields: SettingsFieldSpec[];
}

export const settingsGroups: SettingsGroup[] = [
  {
    id: "identity",
    title: "Identity & SEO",
    description: "Site name, footer tagline and the default title/description search engines see.",
    minRole: "admin",
    fields: [
      { name: "siteName", label: "Site name" },
      { name: "tagline", label: "Tagline (footer)", type: "textarea", rows: 2 },
      { name: "seoTitle", label: "Default page title", hint: "Used for the home page and as the fallback <title>." },
      { name: "seoDescription", label: "Default meta description", type: "textarea", rows: 2 },
    ],
  },
  {
    id: "home",
    title: "Home page sections",
    description: "Turn whole sections of the home page on or off without touching content.",
    minRole: "admin",
    fields: [
      { name: "tickerEnabled", label: "Show trusted-by ticker", type: "toggle" },
      { name: "marqueeEnabled", label: "Show work marquee slider", type: "toggle" },
      { name: "showFeaturedWorks", label: "Show featured works", type: "toggle" },
      { name: "showServices", label: "Show services", type: "toggle" },
      { name: "showAbout", label: "Show about", type: "toggle" },
      { name: "showContact", label: "Show contact", type: "toggle" },
    ],
  },
  {
    id: "hero",
    title: "Hero slider",
    description: "The main drag-momentum carousel at the top of the home page. Slides themselves are managed under “Sliders & CTAs”.",
    minRole: "admin",
    fields: [
      { name: "heroAutoplay", label: "Auto-advance slides", type: "toggle" },
      {
        name: "heroAutoplayMs",
        label: "Time per slide",
        type: "number",
        min: 1500,
        max: 30000,
        step: 250,
        unit: "ms",
        hint: "How long each slide stays before auto-advancing (1500–30000).",
      },
      {
        name: "heroPauseOnHover",
        label: "Pause auto-advance while the mouse is over the image track",
        type: "toggle",
      },
      {
        name: "heroHeightBoost",
        label: "Extra height on large screens",
        type: "number",
        min: 0,
        max: 60,
        step: 5,
        unit: "%",
        hint: "Applies from 1024px wide. 0 = original size, 30 = 30% taller (default).",
      },
    ],
  },
  {
    id: "ticker",
    title: "Trusted-by ticker",
    description: "The infinite logo strip. Logos are managed under “Trusted-By Ticker”.",
    minRole: "admin",
    fields: [
      { name: "tickerLabel", label: "Label above the strip", hint: 'e.g. "Trusted by"' },
      {
        name: "tickerSpeed",
        label: "Scroll speed",
        type: "number",
        min: 0,
        max: 300,
        step: 5,
        unit: "px/s",
        hint: "0 stops automatic movement.",
      },
      {
        name: "tickerDirection",
        label: "Direction",
        type: "select",
        options: [
          { value: "left", label: "Move left" },
          { value: "right", label: "Move right" },
        ],
      },
      { name: "tickerPauseOnHover", label: "Pause while hovered", type: "toggle" },
      { name: "tickerDraggable", label: "Allow drag / swipe", type: "toggle" },
    ],
  },
  {
    id: "marquee",
    title: "Work marquee",
    description: "The full-width infinite strip of work images below the ticker.",
    minRole: "admin",
    fields: [
      {
        name: "marqueeSpeed",
        label: "Scroll speed",
        type: "number",
        min: 0,
        max: 300,
        step: 5,
        unit: "px/s",
        hint: "0 stops automatic movement.",
      },
      {
        name: "marqueeDirection",
        label: "Direction",
        type: "select",
        options: [
          { value: "left", label: "Move left" },
          { value: "right", label: "Move right" },
        ],
      },
      { name: "marqueePauseOnHover", label: "Pause while hovered", type: "toggle" },
      { name: "marqueeDraggable", label: "Allow drag / swipe", type: "toggle" },
    ],
  },
  {
    id: "motion",
    title: "Motion & transitions",
    description: "Site-wide animation behaviour.",
    minRole: "admin",
    fields: [
      { name: "pageTransitions", label: "Fade pages in on navigation", type: "toggle" },
      { name: "scrollReveals", label: "Reveal sections as they scroll into view", type: "toggle" },
      {
        name: "respectReducedMotion",
        label: "Honour the visitor's OS “reduce motion” preference",
        type: "toggle",
        hint:
          "When on, visitors with reduced motion enabled (e.g. Windows “Animation effects” off) get no autoplay, transitions or reveals. Turn off to always animate.",
      },
    ],
  },
  {
    id: "footer",
    title: "Footer contact",
    description: "Contact details shown in the site footer.",
    minRole: "admin",
    fields: [
      { name: "contactEmail", label: "Email" },
      { name: "contactPhone", label: "Phone (tel: link)", hint: "Digits only, e.g. +254702483879" },
      { name: "contactPhoneDisplay", label: "Phone (display format)" },
      { name: "contactLocation", label: "Location" },
    ],
  },
  {
    id: "system",
    title: "Media folders",
    description: "Where uploads and sample images live under /public. Super-admin only — wrong values break the media library.",
    minRole: "superadmin",
    fields: [
      {
        name: "mediaDir",
        label: "Media uploads folder",
        hint: "e.g. images/uploads (created automatically on sample import)",
      },
      { name: "sampleDir", label: "Sample images folder", hint: "e.g. images/samples" },
    ],
  },
];

/** Minimum role needed to edit a given settings field. */
export function settingsFieldMinRole(field: string): SettingsRole {
  for (const group of settingsGroups) {
    if (group.fields.some((f) => f.name === field)) return group.minRole;
  }
  return "admin";
}

export function roleSatisfies(role: string | undefined | null, min: SettingsRole): boolean {
  if (min === "superadmin") return role === "superadmin";
  return role === "superadmin" || role === "admin";
}

/* ── Typed view used by the public site ─────────────────────────────── */

export type StripDirection = "left" | "right";

export interface SiteSettings {
  siteName: string;
  tagline: string;
  seoTitle: string;
  seoDescription: string;
  showFeaturedWorks: boolean;
  showServices: boolean;
  showAbout: boolean;
  showContact: boolean;
  hero: { autoplayMs: number; pauseOnHover: boolean; heightBoost: number };
  ticker: {
    enabled: boolean;
    label: string;
    speed: number;
    direction: StripDirection;
    pauseOnHover: boolean;
    draggable: boolean;
  };
  marquee: {
    enabled: boolean;
    speed: number;
    direction: StripDirection;
    pauseOnHover: boolean;
    draggable: boolean;
  };
  motion: { respectReducedMotion: boolean; pageTransitions: boolean; scrollReveals: boolean };
  mediaDir: string;
  sampleDir: string;
  contact: { email: string; phone: string; phoneDisplay: string; location: string };
}

function flag(value: string | undefined, fallback: boolean): boolean {
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function int(value: string | undefined, fallback: number, min: number, max: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function direction(value: string | undefined): StripDirection {
  return value === "right" ? "right" : "left";
}

export function parseSiteSettings(s: SettingsContent): SiteSettings {
  const d = defaultSettings;
  return {
    siteName: s.siteName || d.siteName,
    tagline: s.tagline || d.tagline,
    seoTitle: s.seoTitle || d.seoTitle,
    seoDescription: s.seoDescription || d.seoDescription,
    showFeaturedWorks: flag(s.showFeaturedWorks, true),
    showServices: flag(s.showServices, true),
    showAbout: flag(s.showAbout, true),
    showContact: flag(s.showContact, true),
    hero: {
      autoplayMs: flag(s.heroAutoplay, true) ? int(s.heroAutoplayMs, 5000, 1500, 30000) : 0,
      pauseOnHover: flag(s.heroPauseOnHover, false),
      heightBoost: int(s.heroHeightBoost, 30, 0, 60),
    },
    ticker: {
      enabled: flag(s.tickerEnabled, true),
      label: s.tickerLabel || d.tickerLabel,
      speed: int(s.tickerSpeed, 40, 0, 300),
      direction: direction(s.tickerDirection),
      pauseOnHover: flag(s.tickerPauseOnHover, true),
      draggable: flag(s.tickerDraggable, true),
    },
    marquee: {
      enabled: flag(s.marqueeEnabled, true),
      speed: int(s.marqueeSpeed, 45, 0, 300),
      direction: direction(s.marqueeDirection),
      pauseOnHover: flag(s.marqueePauseOnHover, true),
      draggable: flag(s.marqueeDraggable, true),
    },
    motion: {
      respectReducedMotion: flag(s.respectReducedMotion, false),
      pageTransitions: flag(s.pageTransitions, true),
      scrollReveals: flag(s.scrollReveals, true),
    },
    mediaDir: s.mediaDir || d.mediaDir,
    sampleDir: s.sampleDir || d.sampleDir,
    contact: {
      email: s.contactEmail || d.contactEmail,
      phone: s.contactPhone || d.contactPhone,
      phoneDisplay: s.contactPhoneDisplay || d.contactPhoneDisplay,
      location: s.contactLocation || d.contactLocation,
    },
  };
}

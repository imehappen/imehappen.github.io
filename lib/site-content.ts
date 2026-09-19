import { cache } from "react";
import { isMongoConfigured } from "@/lib/mongodb";
import {
  defaultSettings,
  parseSiteSettings,
  type SettingsContent,
  type SiteSettings,
} from "@/lib/settings-schema";

// Settings schema lives in lib/settings-schema.ts (client-safe, shared with the
// admin editor and the API); re-exported here so existing imports keep working.
export { defaultSettings, parseSiteSettings };
export type { SettingsContent, SiteSettings };

/**
 * Editable page content, stored as singleton documents keyed by section
 * ("about", "contact", "settings"). Falls back to the defaults below when
 * MongoDB is off (demo mode) or the document does not exist yet.
 */

export interface AboutContent {
  heading: string;
  paragraph1: string;
  paragraph2: string;
  image: string;
  imageAlt: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
}

export interface ContactContent {
  heading: string;
  intro: string;
  email: string;
  phone: string;
  phoneDisplay: string;
  location: string;
}

export const defaultAbout: AboutContent = {
  heading: "Tech Expert for You",
  paragraph1:
    "As a full-stack web developer and graphic designer, I bridge robust technical engineering with compelling visual storytelling — building digital solutions that look stunning and perform flawlessly.",
  paragraph2:
    "From scalable backends and responsive web apps to high-impact branding, every project is engineered to optimize engagement and bring a cohesive brand vision to life.",
  image: "/images/templatemo-about-artist.jpg",
  imageAlt: "Portrait of the developer",
  stat1Value: "300+",
  stat1Label: "Projects",
  stat2Value: "7+",
  stat2Label: "Years",
  stat3Value: "50+",
  stat3Label: "Businesses",
};

export const defaultContact: ContactContent = {
  heading: "Get In Touch",
  intro: "Let's create something beautiful together.",
  email: "imehappen@gmail.com",
  phone: "+254702483879",
  phoneDisplay: "+254 (7) 02 483-879",
  location: "Nairobi, Kenya",
};

export const contentSchemas = {
  about: Object.keys(defaultAbout) as (keyof AboutContent)[],
  contact: Object.keys(defaultContact) as (keyof ContactContent)[],
  settings: Object.keys(defaultSettings) as (keyof SettingsContent)[],
} as const;

export type ContentKey = keyof typeof contentSchemas;

async function readSection<T extends object>(key: ContentKey, defaults: T): Promise<T> {
  if (!isMongoConfigured()) return { ...defaults };

  try {
    const { Content } = await import("@/lib/models");
    const { getMongoConnection } = await import("@/lib/mongodb");
    await getMongoConnection();
    const doc = await (Content as unknown as {
      findOne(filter: { key: string }): { lean(): Promise<{ data?: Record<string, string> } | null> };
    }).findOne({ key: key as string }).lean();
    if (!doc?.data) return { ...defaults };

    const merged = { ...defaults } as Record<string, unknown>;
    for (const field of Object.keys(defaults)) {
      const value = doc.data[field];
      if (typeof value === "string" && value.length > 0) merged[field] = value;
    }
    return merged as T;
  } catch (err) {
    console.error(`[content:${key}] falling back to defaults:`, err);
    return { ...defaults };
  }
}

export async function getAboutContent(): Promise<AboutContent> {
  return readSection("about", defaultAbout);
}

export async function getContactContent(): Promise<ContactContent> {
  return readSection("contact", defaultContact);
}

/** Deduped per request (layout metadata, layout, footer and page all read it). */
export const getSettingsContent = cache(async (): Promise<SettingsContent> => {
  return readSection("settings", defaultSettings);
});

/** Typed (booleans/numbers) settings for the public site. */
export async function getSiteSettings(): Promise<SiteSettings> {
  return parseSiteSettings(await getSettingsContent());
}

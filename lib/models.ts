import mongoose, { Schema, models, model, type Model, type Types } from "mongoose";

/* ────────────────────────────────────────────────────────────
 * User — superadmin + admin (staff) + clients
 * ──────────────────────────────────────────────────────────── */
export type UserRole = "superadmin" | "admin" | "client";

export interface UserDoc {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  company?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["superadmin", "admin", "client"],
      default: "client",
      index: true,
    },
    company: { type: String, trim: true, maxlength: 120 },
    phone: { type: String, trim: true, maxlength: 40 },
  },
  { timestamps: true }
);

/* ────────────────────────────────────────────────────────────
 * Work — portfolio showcase entries (Amazon-style product cards)
 * ──────────────────────────────────────────────────────────── */
export type WorkKind = "image" | "video";

export interface WorkMediaDoc {
  _id: Types.ObjectId;
  src: string;
  kind: WorkKind;
  alt: string;
}

export interface WorkDoc {
  _id: Types.ObjectId;
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  features: string[];
  tags: string[];
  media: WorkMediaDoc[];
  priceFrom?: number;
  deliveryWeeks?: number;
  featured: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema<WorkMediaDoc>(
  {
    src: { type: String, required: true },
    kind: { type: String, enum: ["image", "video"], default: "image" },
    alt: { type: String, default: "" },
  },
  { _id: true }
);

const WorkSchema = new Schema<WorkDoc>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    category: { type: String, required: true, trim: true, maxlength: 60, index: true },
    summary: { type: String, required: true, maxlength: 220 },
    description: { type: String, required: true },
    features: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    media: { type: [MediaSchema], default: [] },
    priceFrom: { type: Number, min: 0 },
    deliveryWeeks: { type: Number, min: 1, max: 52 },
    featured: { type: Boolean, default: false, index: true },
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

/* ────────────────────────────────────────────────────────────
 * Order — a request to buy one of the Works/services
 * ──────────────────────────────────────────────────────────── */
export type OrderStatus = "new" | "in_review" | "in_progress" | "delivered" | "cancelled";

export interface OrderDoc {
  _id: Types.ObjectId;
  orderNumber: string;
  work: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  budget?: number;
  message?: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<OrderDoc>(
  {
    orderNumber: { type: String, required: true, unique: true },
    work: { type: Schema.Types.ObjectId, ref: "Work", required: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    phone: { type: String, trim: true, maxlength: 40 },
    company: { type: String, trim: true, maxlength: 120 },
    budget: { type: Number, min: 0 },
    message: { type: String, maxlength: 2000 },
    status: {
      type: String,
      enum: ["new", "in_review", "in_progress", "delivered", "cancelled"],
      default: "new",
      index: true,
    },
  },
  { timestamps: true }
);

/* ────────────────────────────────────────────────────────────
 * HomeSlide — hero carousel slides (editable in /admin/hero)
 * ──────────────────────────────────────────────────────────── */
export interface HomeSlideDoc {
  _id: Types.ObjectId;
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  order: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HomeSlideSchema = new Schema<HomeSlideDoc>(
  {
    image: { type: String, required: true },
    alt: { type: String, default: "" },
    eyebrow: { type: String, default: "", maxlength: 60 },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    subtitle: { type: String, default: "", maxlength: 300 },
    ctaLabel: { type: String, default: "", maxlength: 60 },
    ctaHref: { type: String, default: "/works", maxlength: 300 },
    secondaryLabel: { type: String, maxlength: 60 },
    secondaryHref: { type: String, maxlength: 300 },
    order: { type: Number, default: 0, index: true },
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

/* ────────────────────────────────────────────────────────────
 * TrustedLogo — "Trusted by" ticker strip (editable in /admin/ticker)
 * ──────────────────────────────────────────────────────────── */
export interface TrustedLogoDoc {
  _id: Types.ObjectId;
  name: string;
  image: string;
  url?: string;
  order: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TrustedLogoSchema = new Schema<TrustedLogoDoc>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    image: { type: String, required: true },
    url: { type: String, maxlength: 500 },
    order: { type: Number, default: 0, index: true },
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

/* ────────────────────────────────────────────────────────────
 * Service — home services grid + /services page (editable in /admin/services)
 * ──────────────────────────────────────────────────────────── */
export interface ServiceDoc {
  _id: Types.ObjectId;
  title: string;
  description: string;
  iconPath: string;
  /** Optional card image — shown instead of the SVG icon when set. */
  image?: string;
  order: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<ServiceDoc>(
  {
    title: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, required: true, maxlength: 400 },
    /** Body of a 24×24 SVG path (Heroicons/Material style), drawn with fill-accent. */
    iconPath: { type: String, default: "", maxlength: 2000 },
    image: { type: String, default: "", maxlength: 500 },
    order: { type: Number, default: 0, index: true },
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

/* ────────────────────────────────────────────────────────────
 * Content — singleton key/value sections for pages
 * (about, contact, site settings) editable in /admin
 * ──────────────────────────────────────────────────────────── */
export interface ContentDoc {
  _id: Types.ObjectId;
  key: string;
  data: Record<string, string>;
  updatedAt: Date;
}

const ContentSchema = new Schema<ContentDoc>(
  {
    key: { type: String, required: true, unique: true, maxlength: 60 },
    data: { type: Map, of: String, default: {} },
  },
  { timestamps: true }
);

/* ────────────────────────────────────────────────────────────
 * Message — contact-form submissions (viewable in /admin/messages)
 * ──────────────────────────────────────────────────────────── */
export type MessageStatus = "new" | "read" | "archived";

export interface MessageDoc {
  _id: Types.ObjectId;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<MessageDoc>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    subject: { type: String, default: "", maxlength: 150 },
    message: { type: String, required: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ["new", "read", "archived"],
      default: "new",
      index: true,
    },
  },
  { timestamps: true }
);

/* ────────────────────────────────────────────────────────────
 * MarqueeSlide — infinite work-showcase strip (editable in /admin/sliders)
 * When empty, the strip derives from published works.
 * ──────────────────────────────────────────────────────────── */
export interface MarqueeSlideDoc {
  _id: Types.ObjectId;
  src: string;
  alt: string;
  order: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MarqueeSlideSchema = new Schema<MarqueeSlideDoc>(
  {
    src: { type: String, required: true },
    alt: { type: String, default: "" },
    order: { type: Number, default: 0, index: true },
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

/* Lazily registered models — safe to import anywhere, no DB connection needed. */
export const User: Model<UserDoc> = models.User ?? model<UserDoc>("User", UserSchema);
export const Work: Model<WorkDoc> = models.Work ?? model<WorkDoc>("Work", WorkSchema);
export const Order: Model<OrderDoc> = models.Order ?? model<OrderDoc>("Order", OrderSchema);
export const HomeSlide: Model<HomeSlideDoc> =
  models.HomeSlide ?? model<HomeSlideDoc>("HomeSlide", HomeSlideSchema);
export const TrustedLogo: Model<TrustedLogoDoc> =
  models.TrustedLogo ?? model<TrustedLogoDoc>("TrustedLogo", TrustedLogoSchema);
export const Service: Model<ServiceDoc> =
  models.Service ?? model<ServiceDoc>("Service", ServiceSchema);
export const Content: Model<ContentDoc> = models.Content ?? model<ContentDoc>("Content", ContentSchema);
export const Message: Model<MessageDoc> = models.Message ?? model<MessageDoc>("Message", MessageSchema);
export const MarqueeSlide: Model<MarqueeSlideDoc> =
  models.MarqueeSlide ?? model<MarqueeSlideDoc>("MarqueeSlide", MarqueeSlideSchema);

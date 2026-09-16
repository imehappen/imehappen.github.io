import mongoose, { Schema, models, model, type Model, type Types } from "mongoose";

/* ────────────────────────────────────────────────────────────
 * User — "me" (admin) + "my clients"
 * ──────────────────────────────────────────────────────────── */
export type UserRole = "admin" | "client";

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
    role: { type: String, enum: ["admin", "client"], default: "client", index: true },
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

/* Lazily registered models — safe to import anywhere, no DB connection needed. */
export const User: Model<UserDoc> = models.User ?? model<UserDoc>("User", UserSchema);
export const Work: Model<WorkDoc> = models.Work ?? model<WorkDoc>("Work", WorkSchema);
export const Order: Model<OrderDoc> = models.Order ?? model<OrderDoc>("Order", OrderSchema);

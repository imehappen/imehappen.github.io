/**
 * Seed script — `pnpm run seed`
 *
 * Loads the demo catalog (lib/seed-data.ts), services, and trusted-by logos
 * into MongoDB when you enable it. Requires MONGODB_URI.
 *
 * Optional flag: --with-admin "Name,email,password" creates your staff
 * account ("me") as SUPERADMIN in the same run.
 *
 * Usage:
 *   MONGODB_URI=... pnpm run seed
 *   MONGODB_URI=... pnpm run seed --with-admin "Musa Gabriel,imehappen@gmail.com,s3cretpass"
 */
import "dotenv/config";
import mongoose from "mongoose";
import { seedWorks } from "../lib/seed-data.ts";
import { seedServices } from "../lib/services-data.ts";
import { seedTrustedLogos } from "../lib/ticker-data.ts";
import {
  defaultAbout,
  defaultContact,
  defaultSettings,
} from "../lib/site-content.ts";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("✖ MONGODB_URI is not set. Copy .env.example to .env.local first.");
  process.exit(1);
}

async function main() {
  console.log("→ Connecting to MongoDB…");
  await mongoose.connect(uri, { bufferCommands: false });
  console.log("✓ Connected");

  const workSchema = new mongoose.Schema(
    {
      slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
      title: String,
      category: String,
      summary: String,
      description: String,
      features: [String],
      tags: [String],
      media: [{ src: String, kind: { type: String, enum: ["image", "video"] }, alt: String }],
      priceFrom: Number,
      deliveryWeeks: Number,
      featured: Boolean,
      published: Boolean,
    },
    { timestamps: true }
  );

  const homeSlideSchema = new mongoose.Schema(
    {
      image: String,
      alt: String,
      eyebrow: String,
      title: { type: String, required: true },
      subtitle: String,
      ctaLabel: String,
      ctaHref: String,
      secondaryLabel: String,
      secondaryHref: String,
      order: { type: Number, default: 0 },
      published: { type: Boolean, default: true },
    },
    { timestamps: true }
  );

  const trustedLogoSchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      image: { type: String, required: true },
      url: String,
      order: { type: Number, default: 0 },
      published: { type: Boolean, default: true },
    },
    { timestamps: true }
  );

  const serviceSchema = new mongoose.Schema(
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
      iconPath: { type: String, default: "" },
      order: { type: Number, default: 0 },
      published: { type: Boolean, default: true },
    },
    { timestamps: true }
  );

  const contentSchema = new mongoose.Schema(
    {
      key: { type: String, required: true, unique: true },
      data: { type: Map, of: String, default: {} },
    },
    { timestamps: true }
  );

  const userSchema = new mongoose.Schema(
    {
      name: String,
      email: { type: String, unique: true, lowercase: true, trim: true },
      passwordHash: String,
      role: { type: String, enum: ["superadmin", "admin", "client"], default: "client" },
      company: String,
      phone: String,
    },
    { timestamps: true }
  );

  const Work = mongoose.models.Work || mongoose.model("Work", workSchema);
  const HomeSlide = mongoose.models.HomeSlide || mongoose.model("HomeSlide", homeSlideSchema);
  const TrustedLogo = mongoose.models.TrustedLogo || mongoose.model("TrustedLogo", trustedLogoSchema);
  const Service = mongoose.models.Service || mongoose.model("Service", serviceSchema);
  const Content = mongoose.models.Content || mongoose.model("Content", contentSchema);
  const User = mongoose.models.User || mongoose.model("User", userSchema);

  // Works
  let upserted = 0;
  for (const work of seedWorks) {
    await Work.updateOne({ slug: work.slug }, { $set: work }, { upsert: true });
    upserted += 1;
  }
  console.log(`✓ Seeded ${upserted} works`);

  // Hero slides (only if the collection is empty)
  const { homeSlides } = await import("../lib/home-slides.ts");
  if ((await HomeSlide.estimatedDocumentCount()) === 0) {
    const orderOffset = await HomeSlide.countDocuments();
    await HomeSlide.insertMany(
      homeSlides.map((s, i) => ({ ...s, order: i + 1 + orderOffset, published: true }))
    );
    console.log(`✓ Seeded ${homeSlides.length} hero slides`);
  }

  // Trusted-by logos
  if ((await TrustedLogo.estimatedDocumentCount()) === 0) {
    await TrustedLogo.insertMany(seedTrustedLogos.map((l) => ({ ...l, published: true })));
    console.log(`✓ Seeded ${seedTrustedLogos.length} trusted-by logos`);
  }

  // Services
  if ((await Service.estimatedDocumentCount()) === 0) {
    await Service.insertMany(seedServices.map((s) => ({ ...s, published: true })));
    console.log(`✓ Seeded ${seedServices.length} services`);
  }

  // Content sections (about/contact/settings defaults — only if missing)
  const contentDefaults = [
    ["about", defaultAbout],
    ["contact", defaultContact],
    ["settings", defaultSettings],
  ] as const;
  for (const [key, data] of contentDefaults) {
    const exists = await Content.findOne({ key }).lean();
    if (!exists) {
      await Content.create({ key, data });
      console.log(`✓ Seeded content section: ${key}`);
    }
  }

  // Optional staff account
  const withAdmin = process.argv.find((a) => a.startsWith("--with-admin"));
  if (withAdmin) {
    const bcrypt = (await import("bcryptjs")).default;
    const payload = withAdmin.split("=")[1] ?? "";
    const [name, email, password] = payload.split(",").map((s) => s.trim());
    if (!name || !email || !password) {
      console.error("✖ --with-admin expects \"Name,email,password\"");
      process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await User.updateOne(
      { email },
      { $set: { name, email, passwordHash, role: "superadmin" } },
      { upsert: true }
    );
    console.log(`✓ Superadmin ready: ${email}`);
  }

  await mongoose.disconnect();
  console.log("✓ Done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Seed script — `npm run seed`
 *
 * Loads the demo catalog (lib/seed-data.ts) into MongoDB when you enable it.
 * Requires MONGODB_URI. Optional flag: --with-admin "Name,email,password"
 * creates your admin account ("me") in the same run.
 *
 * Usage:
 *   MONGODB_URI=... npm run seed
 *   MONGODB_URI=... npm run seed -- --with-admin "Musa Gabriel,imehappen@gmail.com,s3cretpass"
 */
import "dotenv/config";
import mongoose from "mongoose";
import { seedWorks } from "../lib/seed-data.ts";

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

  const Work = mongoose.models.Work || mongoose.model("Work", workSchema);

  let upserted = 0;
  for (const work of seedWorks) {
    await Work.updateOne({ slug: work.slug }, { $set: work }, { upsert: true });
    upserted += 1;
  }
  console.log(`✓ Seeded ${upserted} works`);

  const withAdmin = process.argv.find((a) => a.startsWith("--with-admin"));
  if (withAdmin) {
    const bcrypt = (await import("bcryptjs")).default;
    const payload = withAdmin.split("=")[1] ?? "";
    const [name, email, password] = payload.split(",").map((s) => s.trim());
    if (!name || !email || !password) {
      console.error("✖ --with-admin expects \"Name,email,password\"");
      process.exit(1);
    }
    const userSchema = new mongoose.Schema(
      {
        name: String,
        email: { type: String, unique: true, lowercase: true, trim: true },
        passwordHash: String,
        role: { type: String, enum: ["admin", "client"], default: "client" },
        company: String,
        phone: String,
      },
      { timestamps: true }
    );
    const User = mongoose.models.User || mongoose.model("User", userSchema);

    const passwordHash = await bcrypt.hash(password, 12);
    await User.updateOne(
      { email },
      { $set: { name, email, passwordHash, role: "admin" } },
      { upsert: true }
    );
    console.log(`✓ Admin ready: ${email}`);
  }

  await mongoose.disconnect();
  console.log("✓ Done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

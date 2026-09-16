import mongoose from "mongoose";

/**
 * Lazy, cached Mongoose connection.
 *
 * IMPORTANT: this module NEVER opens a connection on import. It only connects
 * when `getMongoConnection()` is called AND `MONGODB_URI` is set. That means
 * the whole app boots and renders fine with zero database until you flip the
 * switch (see README → "Enabling MongoDB").
 */
declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

const cache = (globalThis.__mongooseCache ??= { conn: null, promise: null });

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI);
}

/** Connects (once) and returns the mongoose instance, or null when unconfigured. */
export async function getMongoConnection(): Promise<typeof mongoose | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null; // DB intentionally not enabled yet.

  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, {
      bufferCommands: false,
      maxPoolSize: 10,
    });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}

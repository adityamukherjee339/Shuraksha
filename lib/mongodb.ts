import mongoose from "mongoose";
import dns from "dns";

// Force Node.js to use public DNS resolvers for ALL lookups in development
// This fixes "querySrv ECONNREFUSED" errors on networks that block DNS
if (process.env.NODE_ENV !== "production") {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Resolves a mongodb+srv:// URI to a standard mongodb:// URI
 * by manually performing the SRV DNS lookup using our custom DNS servers.
 * This bypasses issues where the OS-level DNS blocks SRV queries.
 */
async function resolveSrvUri(srvUri: string): Promise<string> {
  const url = new URL(srvUri);
  const hostname = url.hostname;
  const credentials = url.username ? `${url.username}:${url.password}@` : "";
  const searchParams = url.search;
  const dbName = url.pathname.slice(1); // remove leading "/"

  return new Promise((resolve, reject) => {
    const resolver = new dns.Resolver();
    resolver.setServers(["8.8.8.8", "1.1.1.1"]);

    resolver.resolveSrv(`_mongodb._tcp.${hostname}`, (err, addresses) => {
      if (err) {
        reject(new Error(`SRV lookup failed for ${hostname}: ${err.message}`));
        return;
      }

      if (!addresses || addresses.length === 0) {
        reject(new Error(`No SRV records found for ${hostname}`));
        return;
      }

      const hosts = addresses.map((a) => `${a.name}:${a.priority || 27017}`).join(",");
      // Rebuild as standard mongodb:// URI
      const directUri = `mongodb://${credentials}${hosts}/${dbName}${searchParams}&ssl=true&authSource=admin`;
      resolve(directUri);
    });
  });
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    let uri = MONGODB_URI;

    // If using SRV and in development, resolve it manually with our DNS servers
    // Vercel/Production environments usually handle SRV correctly and might block custom DNS.
    if (uri.startsWith("mongodb+srv://") && process.env.NODE_ENV !== "production") {
      try {
        uri = await resolveSrvUri(uri);
        console.log("✅ SRV resolved manually for development");
      } catch (srvErr) {
        console.error("❌ SRV resolution failed, trying direct URI:", (srvErr as Error).message);
        uri = MONGODB_URI;
      }
    }

    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000,
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log("✅ MongoDB connected successfully");
  } catch (e) {
    cached.promise = null;
    console.error("❌ MongoDB connection failed:", (e as Error).message);
    throw e;
  }

  return cached.conn;
}

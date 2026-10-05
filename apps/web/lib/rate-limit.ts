import Redis from "ioredis";

const localBuckets = new Map<string, { count: number; expiresAt: number }>();
let redis: Redis | undefined;
let connection: Promise<Redis | null> | undefined;

async function redisClient() {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  connection ??= (async () => {
    const client = new Redis(url, { lazyConnect: true, enableOfflineQueue: false, maxRetriesPerRequest: 1, retryStrategy: () => null });
    try {
      await client.connect();
      redis = client;
      return client;
    } catch {
      client.disconnect();
      return null;
    }
  })();
  const client = await connection;
  if (!client) connection = undefined;
  return client;
}

export async function isRateLimited(key: string, maximum = 8, windowSeconds = 60) {
  const client = await redisClient();
  if (client) {
    try {
      const count = await client.incr(`streamflix:rate:${key}`);
      if (count === 1) await client.expire(`streamflix:rate:${key}`, windowSeconds);
      return count > maximum;
    } catch {
      redis?.disconnect();
      redis = undefined;
      connection = undefined;
      return process.env.NODE_ENV === "production";
    }
  }
  if (process.env.NODE_ENV === "production") return true;

  const now = Date.now();
  const bucket = localBuckets.get(key);
  if (!bucket || bucket.expiresAt <= now) {
    localBuckets.set(key, { count: 1, expiresAt: now + windowSeconds * 1000 });
    return false;
  }
  bucket.count += 1;
  return bucket.count > maximum;
}

export function requestAddress(request: Request) {
  return request.headers.get("x-real-ip") ?? "unknown";
}
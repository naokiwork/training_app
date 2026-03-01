type Bucket = {
  count: number;
  startedAt: number;
};

const hits = new Map<string, Bucket>();

export function allowRequest(key: string, limit = 60, windowMs = 60_000) {
  const now = Date.now();
  const bucket = hits.get(key);

  if (!bucket || now - bucket.startedAt > windowMs) {
    hits.set(key, { count: 1, startedAt: now });
    return true;
  }

  if (bucket.count >= limit) {
    return false;
  }

  bucket.count += 1;
  return true;
}

export function getRateLimitKeyFromRequestLike(request: Request & { headers: Headers }) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

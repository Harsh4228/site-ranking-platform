import crypto from "crypto";
import mongoose from "mongoose";

const MAX_BODY_BYTES = 16 * 1024;

function getStore() {
  if (!global._rateLimitStore) {
    global._rateLimitStore = new Map();
  }
  return global._rateLimitStore;
}

export function getClientIp(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

export function hashValue(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

export function getIpHash(req) {
  return hashValue(getClientIp(req));
}

export function checkRateLimit(key, { windowMs, limit }) {
  const now = Date.now();
  const store = getStore();
  const current = store.get(key);

  if (!current || current.expiresAt <= now) {
    store.set(key, { count: 1, expiresAt: now + windowMs });
    return { ok: true };
  }

  if (current.count >= limit) {
    return {
      ok: false,
      retryAfterMs: Math.max(current.expiresAt - now, 0),
    };
  }

  current.count += 1;
  store.set(key, current);
  return { ok: true };
}

export async function readJson(req) {
  const contentLength = Number(req.headers.get("content-length") || "0");
  if (contentLength > MAX_BODY_BYTES) {
    return { error: "Request body too large", status: 413 };
  }

  try {
    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return { error: "Invalid JSON body", status: 400 };
    }
    return { body };
  } catch {
    return { error: "Invalid JSON body", status: 400 };
  }
}

export function normalizeText(value, { maxLen = 200, fallback = "" } = {}) {
  if (value == null) return fallback;
  return String(value).trim().slice(0, maxLen);
}

export function normalizeInteger(value, { fallback = 0, min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const n = Number(value);
  if (!Number.isInteger(n)) return fallback;
  if (n < min || n > max) return fallback;
  return n;
}

export function normalizeNumber(value, { fallback = 0, min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  if (n < min || n > max) return fallback;
  return n;
}

export function isObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

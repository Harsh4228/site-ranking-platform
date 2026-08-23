import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Index from "@/models/Index";
import Message from "@/models/Message";
import {
  checkRateLimit,
  getIpHash,
  isObjectId,
  normalizeText,
  readJson,
} from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/indexes/[slug]/chat — fetch recent messages
export async function GET(req, { params }) {
  const slug = normalizeText(params.slug, { maxLen: 120 });

  try {
    await connectDB();
    const index = await Index.findOne({ slug }).lean();
    if (!index) {
      return NextResponse.json({ error: "Index not found" }, { status: 404 });
    }

    const messages = await Message.find({ indexId: index._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ messages: messages.reverse() });
  } catch (error) {
    console.error("GET /api/indexes/[slug]/chat failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/indexes/[slug]/chat — send a message
export async function POST(req, { params }) {
  const ipHash = getIpHash(req);
  const limit = checkRateLimit(`chat:send:${ipHash}`, { windowMs: 10 * 1000, limit: 5 });
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many messages, slow down" }, { status: 429 });
  }

  const slug = normalizeText(params.slug, { maxLen: 120 });

  const parsed = await readJson(req);
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  const author = normalizeText(parsed.body.author, { maxLen: 60 });
  const body = normalizeText(parsed.body.body, { maxLen: 500 });

  if (!author || !body) {
    return NextResponse.json({ error: "author and body are required" }, { status: 400 });
  }

  try {
    await connectDB();
    const index = await Index.findOne({ slug }).lean();
    if (!index) {
      return NextResponse.json({ error: "Index not found" }, { status: 404 });
    }

    const message = await Message.create({
      indexId: index._id,
      author,
      body,
      ipHash,
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("POST /api/indexes/[slug]/chat failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

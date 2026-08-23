import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { readJson, normalizeText, checkRateLimit, getIpHash } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/setup — check if setup is needed
export async function GET() {
  try {
    await connectDB();
    const adminExists = await User.findOne({ role: "admin" }).lean();
    return NextResponse.json({ setupNeeded: !adminExists });
  } catch {
    return NextResponse.json({ setupNeeded: true });
  }
}

// POST /api/setup — create the first admin account (only works if no admin exists)
export async function POST(req) {
  const ipHash = getIpHash(req);
  const limit = checkRateLimit(`setup:${ipHash}`, { windowMs: 60 * 1000, limit: 3 });
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  const parsed = await readJson(req);
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  const name = normalizeText(parsed.body.name, { maxLen: 60 });
  const email = normalizeText(parsed.body.email, { maxLen: 120 });
  const password = parsed.body.password;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  try {
    await connectDB();

    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      return NextResponse.json({ error: "Setup already completed" }, { status: 409 });
    }

    await User.create({ name, email, password, role: "admin" });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/setup failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

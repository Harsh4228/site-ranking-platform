import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { checkRateLimit, getIpHash, normalizeText, readJson } from "@/lib/api";

export const dynamic = "force-dynamic";

// POST /api/auth/register — create a new account
export async function POST(req) {
  const ipHash = getIpHash(req);
  const limit = checkRateLimit(`register:${ipHash}`, { windowMs: 60 * 1000, limit: 3 });
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
    return NextResponse.json({ error: "name, email, and password are required" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  try {
    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const user = await User.create({ name, email, password });
    return NextResponse.json(
      { user: { id: user._id, name: user.name, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/auth/register failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PageView from "@/models/PageView";

export const dynamic = "force-dynamic";

// POST /api/track — lightweight page view tracker
export async function POST(req) {
  try {
    const { path } = await req.json();
    if (!path) return NextResponse.json({ ok: true });

    await connectDB();
    const date = new Date().toISOString().split("T")[0];

    await PageView.updateOne(
      { path, date },
      { $inc: { count: 1 } },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

// GET /api/track — get today's total views (admin only)
export async function GET() {
  try {
    await connectDB();
    const today = new Date().toISOString().split("T")[0];
    const views = await PageView.find({ date: today }).lean();
    const total = views.reduce((s, v) => s + v.count, 0);
    return NextResponse.json({ today: total, pages: views });
  } catch {
    return NextResponse.json({ today: 0, pages: [] });
  }
}

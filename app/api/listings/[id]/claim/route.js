import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";

export const dynamic = "force-dynamic";

// POST /api/listings/[id]/claim — logged-in user claims an unclaimed listing
export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Sign in to claim a listing" }, { status: 401 });
  }

  try {
    await connectDB();
    const listing = await Listing.findById(params.id);
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }
    if (listing.ownerId) {
      return NextResponse.json({ error: "This listing is already claimed" }, { status: 409 });
    }

    listing.ownerId = session.user.id;
    await listing.save();

    return NextResponse.json({ listing });
  } catch (error) {
    console.error("POST /api/listings/[id]/claim failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

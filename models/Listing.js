import mongoose from "mongoose";

const ListingSchema = new mongoose.Schema(
  {
    indexId: { type: mongoose.Schema.Types.ObjectId, ref: "Index", required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    website: { type: String, default: "" },
    address: { type: String, default: "" },
    hours: { type: String, default: "" },

    // Trust inputs (earned)
    verified: { type: Boolean, default: false },
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    // Visibility inputs (paid)
    subscriptionActive: { type: Boolean, default: false },
    subscriptionTier: { type: Number, default: 0 }, // 0 = none, 1-4 = tier
    subscriptionExpiresAt: { type: Date, default: null },
    recentLeadSpend: { type: Number, default: 0 }, // rolling 30-day lead spend

    // Computed scores (never set directly by a client request)
    trustScore: { type: Number, default: 0 },
    visibilityScore: { type: Number, default: 0 },
    rankScore: { type: Number, default: 0 },

    // Analytics
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ListingSchema.index({ indexId: 1, rankScore: -1 });

export default mongoose.models.Listing || mongoose.model("Listing", ListingSchema);

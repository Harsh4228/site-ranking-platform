import mongoose from "mongoose";

const RankHistorySchema = new mongoose.Schema(
  {
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    rankScore: { type: Number, required: true },
    trustScore: { type: Number, required: true },
    visibilityScore: { type: Number, required: true },
    position: { type: Number, required: true },
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

RankHistorySchema.index({ listingId: 1, createdAt: -1 });

export default mongoose.models.RankHistory || mongoose.model("RankHistory", RankHistorySchema);

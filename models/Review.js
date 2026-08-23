import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
    ipHash: { type: String, required: true },
  },
  { timestamps: true }
);

ReviewSchema.index({ listingId: 1, ipHash: 1 }, { unique: true });

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);

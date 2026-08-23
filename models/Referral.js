import mongoose from "mongoose";

const ReferralSchema = new mongoose.Schema(
  {
    referrerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    referredListingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", default: null },
    rewardGranted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ReferralSchema.index({ referrerId: 1 });
ReferralSchema.index({ referredUserId: 1 }, { unique: true });

export default mongoose.models.Referral || mongoose.model("Referral", ReferralSchema);
